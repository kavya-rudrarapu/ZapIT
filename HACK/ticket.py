from flask import Blueprint, request, jsonify
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
import base64
import os
from email.mime.text import MIMEText
from phi.agent import Agent
from phi.tools.duckduckgo import DuckDuckGo
from phi.model.google import Gemini
from db import SessionLocal, get_tickets_by_user_id
from models import LLMResponse, Ticket, User
from tokengen import token_required
from datetime import datetime, timezone

 
ticket_bp = Blueprint('ticket', __name__)
 
SCOPES = ['https://www.googleapis.com/auth/gmail.send', 'https://www.googleapis.com/auth/gmail.readonly']
web_search_agent = Agent(
    name="web search agent",
    description="Agent that crawls websites, checks relevant content, and writes the best article",
    tools=[DuckDuckGo()],
    instructions=[
        "Always use the DuckDuckGo tool to search for relevant information. "
        "If the issue is clearly related to granting internal access, physical tools, or admin-only capabilities, then respond with 'I am unable to find the answer'. "
        "Otherwise, try to resolve the issue based on search results or your general knowledge."
    ],
    model=Gemini(model="gemini-1.5-flash"),
    markdown=True,
)
 
# Gmail setup
def get_gmail_service():
    if not os.path.exists('token.json'):
        raise Exception("token.json not found — generate Gmail token using Google API flow.")
    creds = Credentials.from_authorized_user_file('token.json', SCOPES)
    return build('gmail', 'v1', credentials=creds)
 
def create_message(sender, to, subject, body):
    msg = MIMEText(body)
    msg['to'] = to
    msg['from'] = sender
    msg['subject'] = subject
    return {'raw': base64.urlsafe_b64encode(msg.as_bytes()).decode()}
 
def send_email(service, sender, to, subject, body):
    message = create_message(sender, to, subject, body)
    service.users().messages().send(userId='me', body=message).execute()
    
@ticket_bp.route('/api/raise-ticket', methods=['POST'])
@token_required
def raise_ticket(user_id, email):
    data = request.get_json()
    issue_title = data.get('issue_title')
 
    if not issue_title:
        return jsonify({"error": "Missing issue_title"}), 400
 
    try:
        agent_response = web_search_agent.run(issue_title)
        reply = agent_response.content.strip()
 
        session_db = SessionLocal()
 
        if "I am unable to find the answer" in reply:
            service = get_gmail_service()
            sender = service.users().getProfile(userId='me').execute()['emailAddress']
            admin_email = os.getenv("ADMIN_EMAIL")
 
            if not admin_email:
                session_db.close()
                return jsonify({"error": "ADMIN_EMAIL not set in environment"}), 500
 
            new_ticket = Ticket(user_id=user_id, description="Issue redirected to admin", issue_title=issue_title,status="open",created_at=datetime.now(timezone.utc) )
            session_db.add(new_ticket)
            session_db.commit()
 
            ticket_id = new_ticket.ticket_id  
 
            subject_user = f"Ticket Raised (ID: {ticket_id})"
            subject_admin = f"New Ticket Raised: {ticket_id}"
 
            body_user = f"Your ticket has been raised with ID {ticket_id}.\nIssue: {issue_title}"
            body_admin = f"New ticket from {email}\nTicket ID: {ticket_id}\nIssue: {issue_title}"
 
            send_email(service, sender, email, subject_user, body_user)
            send_email(service, sender, admin_email, subject_admin, body_admin)
 
            session_db.close()
 
            return jsonify({
                "ticket_id": ticket_id,
                "message": "Ticket raised and forwarded to admin due to unresolvable query."
            }), 200
 
        new_ticket = Ticket(
            user_id=user_id,
            description=reply,
            issue_title=issue_title,
            status="resolved",
            created_at=datetime.now(timezone.utc) 
        )
        session_db.add(new_ticket)
        session_db.commit()
 
        ticket_id = new_ticket.ticket_id
 
        llm_response = LLMResponse(
            ticket_id=ticket_id,
            agent_response=reply
        )
        session_db.add(llm_response)
        session_db.commit()
        session_db.close()
 
        return jsonify({
            "ticket_id": ticket_id,
            "agent_reply": reply,
            "message": "Ticket resolved by AI agent and stored"
        }), 200
 
    except HttpError as e:
        return jsonify({"error": f"Gmail API error: {e}"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500
 
 
 
@ticket_bp.route('/api/tickets/<int:user_id>', methods=['GET'])
def get_tickets_by_user(user_id):
    try:
        tickets = get_tickets_by_user_id(user_id)
        return jsonify({
            "user_id": user_id,
            "tickets": tickets
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
 


@ticket_bp.route('/api/tickets', methods=['GET'])
def get_all_tickets_with_responses():
    session = SessionLocal()
    try:
        tickets = session.query(Ticket).all()
        result = []

        for ticket in tickets:
            user = session.query(User).filter(User.user_id == ticket.user_id).first()
            responses = session.query(LLMResponse).filter(LLMResponse.ticket_id == ticket.ticket_id).all()
            agent_responses = [resp.agent_response for resp in responses]
            result.append({
                "ticket_id": ticket.ticket_id,
                "user_id": ticket.user_id,
                "user_name": user.name if user else "Unknown",  # ✅ safe access
                "issue_title": ticket.issue_title,
                "description": ticket.description,
                "status": ticket.status,
                "priority": ticket.priority,
                "created_at": ticket.created_at.isoformat() if ticket.created_at else None  # ✅ safe
            })

        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        session.close()
    
@ticket_bp.route('/api/update-ticket-status/<int:ticket_id>', methods=['PATCH'])
@token_required
def update_ticket_status(user_id, email, ticket_id):
    session = SessionLocal()
    try:
        data = request.get_json()
        new_status = data.get('status', '').lower()
 
        if new_status not in ['open', 'close', 'reopen','resolved']:
            return jsonify({"error": "Invalid status"}), 400
 
        ticket = session.query(Ticket).filter_by(ticket_id=ticket_id, user_id=user_id).first()
        if not ticket:
            return jsonify({"error": "Ticket not found or unauthorized"}), 404
 
       
        if new_status == 'reopened':
            ticket.status = 'reopened'
            session.commit()
 
           
            try:
                service = get_gmail_service()
                sender = service.users().getProfile(userId='me').execute()['emailAddress']
                admin_email = os.getenv("ADMIN_EMAIL")
 
                if not admin_email:
                    return jsonify({"error": "ADMIN_EMAIL not set in environment"}), 500
 
                subject_admin = f"Ticket Reopened: {ticket.ticket_id}"
                body_admin = (
                    f"User {email} has reopened ticket #{ticket.ticket_id}.\n"
                    f"Issue: {ticket.issue_title}"
                )
 
                send_email(service, sender, admin_email, subject_admin, body_admin)
 
            except Exception as email_error:
                return jsonify({"error": f"Failed to notify admin: {str(email_error)}"}), 500
 
            return jsonify({
                "message": f"Ticket {ticket.ticket_id} reopened and admin notified.",
                "ticket_id": ticket.ticket_id,
                "new_status": "reopened"
            }), 200
 
       
        ticket.status = new_status
        session.commit()
        return jsonify({
            "message": "Ticket status updated",
            "ticket_id": ticket.ticket_id,
            "new_status": ticket.status
        }), 200
 
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        session.close()

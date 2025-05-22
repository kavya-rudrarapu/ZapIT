from phi.agent import Agent
from phi.model.google import Gemini
from ticket import ticket_bp
from models import Ticket, User
from flask import Blueprint, request, jsonify
from db import SessionLocal
priority_bp = Blueprint('priority', __name__)
priority_agent = Agent(
    name="Ticket Priority Agent",
    description="Assigns priority (critical, high, medium, low) to user issues",
    instructions=[
        "You are an AI that classifies ticket priority as one of: critical, high, medium, low.",
        "Consider how severe or blocking the issue is.",
        "compare all the tickets and provide different set of priorities to different tickets without having same for more than 2 tickets consider urgency"
        "Only respond with one of the four words: critical, high, medium, low."
    ],
    model=Gemini(model="gemini-1.5-pro"),
    markdown=False,
)
@ticket_bp.route('/api/prioritize-unsolved-tickets', methods=['POST'])
def prioritize_unsolved_tickets():
    session = SessionLocal()
    try:
        unsolved_tickets = session.query(Ticket).filter(Ticket.description == "Issue redirected to admin").all()
        updated = []
 
        for ticket in unsolved_tickets:
            prompt = f"""
    You are an AI that classifies the urgency of support tickets.
    Classify the priority as one of: critical, high, medium, low.
    compare all the tickets and provide different set of priorities to different tickets without having same for more than 2 tickets consider urgency
 
   
 
    Ticket: "{ticket.issue_title}"
    Priority:
    """
            response = priority_agent.run(prompt)
            priority = response.content.strip().lower()
 
            if priority not in ["critical", "high", "medium", "low"]:
                priority = "unassigned"
 
            ticket.priority = priority
            updated.append({
                "ticket_id": ticket.ticket_id,
                "issue_description": ticket.issue_description,
                "assigned_priority": priority
            })
 
        session.commit()
        return jsonify({
            "updated_tickets": updated,
            "message": "Priorities assigned to unsolved tickets."
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        session.close()
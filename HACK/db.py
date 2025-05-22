
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os
from models import Ticket
from models import Base, User

load_dotenv()

DATABASE_URL = f"postgresql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

def init_db():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    print("Database session created")
    try:
        yield db
    finally:
        db.close()

def add_user(email, name):
    from models import User
    session = SessionLocal()
    user = session.query(User).filter_by(email=email).first()
    if not user:
        user = User(email=email, name=name)
        session.add(user)
        session.commit()
        session.refresh(user)  
    session.close()
    return user

def is_user_registered(email):
    session = SessionLocal()
    user = session.query(User).filter_by(email=email).first()
    session.close()
    return user is not None

def get_tickets_by_user_id(user_id):
    session = SessionLocal()
    try:
        tickets = session.query(Ticket).filter(Ticket.user_id == user_id).all()
        return [
            {
                "ticket_id": ticket.ticket_id,
                "issue_title": ticket.issue_title,  
                "created_at": ticket.created_at.isoformat() if ticket.created_at else None,
                "status": ticket.status,
                "priority": ticket.priority,
            }
            for ticket in tickets
        ]
    finally:
        session.close()
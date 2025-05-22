from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import declarative_base, relationship
from datetime import datetime
 
Base = declarative_base()
class LLMResponse(Base):
    __tablename__ = 'llm_responses'
 
    response_id = Column(Integer, primary_key=True)
    ticket_id = Column(Integer, ForeignKey('tickets.ticket_id'))
    agent_response = Column(Text)
    ticket = relationship("Ticket", back_populates="llm_responses")


class User(Base):
    __tablename__ = 'users'
    user_id = Column(Integer, primary_key=True)
    name = Column(String(100))
    email = Column(String(100), unique=True, nullable=False)
    role = Column(String(20), nullable=False, default='user')
    created_at = Column(DateTime)
    tickets = relationship("Ticket", back_populates="user")
 
class Ticket(Base):
    __tablename__ = 'tickets'
    ticket_id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.user_id'))
    issue_title = Column(String, nullable=False)
    description = Column(Text)
    status=Column(String(20), default='open')
    priority = Column(String, default="low")
    created_at = Column(DateTime)
 
    user = relationship("User", back_populates="tickets")
    llm_responses = relationship("LLMResponse", back_populates="ticket", cascade="all, delete-orphan")  
 
 
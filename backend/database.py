from sqlalchemy import create_engine, Column, Boolean, Text, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID
import os
from dotenv import load_dotenv

load_dotenv() 

DATABASE_URL = os.getenv("SUPABASE_DB_URL")
Base = declarative_base()

class Message(Base):
    __tablename__ = "messages"
    id = Column(UUID(as_uuid=True), primary_key=True)
    content = Column(Text, nullable=False)
    is_user = Column(Boolean, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

# Create engine AFTER loading environment variables
engine = create_engine(DATABASE_URL)

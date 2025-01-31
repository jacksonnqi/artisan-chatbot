from sqlalchemy.orm import Session
from database import SessionLocal, Message
from typing import List, Optional

class MessagesModel:
    @staticmethod
    def get_all(db: Session) -> List[Message]:
        """Get all messages in db, ordered by created_at"""
        return db.query(Message).order_by(Message.created_at).all()

    @staticmethod
    def create(db: Session, content: str, is_user: bool) -> Message:
        message = Message(content=content, is_user=is_user)
        db.add(message)
        db.commit()
        db.refresh(message)
        return message

    @staticmethod
    def update(db: Session, message_id: str, new_content: str) -> Optional[Message]:
        message = db.query(Message).filter(Message.id == message_id).first()
        if not message:
            return None
        
        message.content = new_content
        db.commit()
        db.refresh(message)
        return message

    @staticmethod
    def delete(db: Session, message_id: str) -> bool:
        message = db.query(Message).filter(Message.id == message_id).first()
        if not message:
            return False
        
        db.delete(message)
        db.commit()
        return True

    @staticmethod
    def get_db() -> Session:
        """dependency injection"""
        return SessionLocal()

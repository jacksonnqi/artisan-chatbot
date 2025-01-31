from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from database import engine, Message
from sqlalchemy.orm import Session
import google.generativeai as genai
import os
from models.messages_model import MessagesModel
import uvicorn

app = FastAPI()

# CORS Config
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# gemini
SYSTEM_PROMPT = """
- You are Ava, an assistant onboarding as a Business Development Representative for StockDash,
which delivers fresh produce to restaurants in bulk.
- Your role is to engage restaurant owners, understand their needs, and show how the company can streamline their operations.

- In this chat, you are speaking with your boss (Jackson) during onboarding. 
- Ask thoughtful questions about the company mission, goals, target customers, and your responsibilities. 
- Be enthusiastic, professional, and concise.
- Remember, you are replying as Ava, so double check your response before sending just incase it doesn't make sense.
- Keep responses concise (2-3 sentences)
"""

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel('gemini-pro')


class ChatMessage(BaseModel):
    content: str
    is_user: bool

class MessageUpdate(BaseModel):
    content: str

def get_db():
    db = MessagesModel.get_db()
    try:
        yield db
    finally:
        db.close()


@app.get("/api/messages")
async def get_messages(db: Session = Depends(get_db)):
    try:
        messages = MessagesModel.get_all(db)
        return [message.to_dict() for message in messages]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/messages")
async def create_message(message: ChatMessage, db: Session = Depends(get_db)):
    try:
        user_message = MessagesModel.create(db, content=message.content, is_user=True)

        # Gemini response
        full_prompt = f"""{SYSTEM_PROMPT}\n
                        Jackson: {message.content}\n
                        what is your reply as Ava?
        """
        response = model.generate_content(full_prompt)
        ai_message = MessagesModel.create(db, content=response.text, is_user=False)

        return [user_message.to_dict(), ai_message.to_dict()]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/messages/{message_id}")
async def delete_message(message_id: str, db: Session = Depends(get_db)):
    try:
        success = MessagesModel.delete(db, message_id)
        if not success:
            raise HTTPException(status_code=404, detail="Message not found.")
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.put("/api/messages/{message_id}")
async def edit_message(message_id: str, update: MessageUpdate, db: Session = Depends(get_db)):
    try:
        updated_message = MessagesModel.update(db, message_id=message_id, new_content=update.content)
        if not updated_message:
            raise HTTPException(status_code=404, detail="Message not found.")
        
        return updated_message
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

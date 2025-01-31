import { useState } from 'react';

interface MessageProps {
    message: {
      id: string;
      content: string;
      is_user: boolean;
      created_at: string;
    };
    onEdit: (id: string, newContent: string) => void;
    onDelete: (id: string) => void;
  }

export default function Message({message, onEdit, onDelete}: MessageProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState(message.content);

    const handleSave = () => {
        onEdit(message.id, editedContent);
        setIsEditing(false);
    };
    
    return (
        <div className={`message ${message.is_user ? 'user' : 'bot'}`}>
          <div className="message-content">
            {isEditing ? (
              <input
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
              />
            ) : (
              <p>{message.content}</p>
            )}
            <span className="timestamp">
              {new Date(message.created_at).toLocaleTimeString()}
            </span>
          </div>
          {message.is_user && (
            <div className="message-actions">
              {isEditing ? (
                <button onClick={handleSave}>Save</button>
              ) : (
                <button onClick={() => setIsEditing(true)}>Edit</button>
              )}
              <button onClick={() => onDelete(message.id)}>Delete</button>
            </div>
          )}
        </div>
      );
}

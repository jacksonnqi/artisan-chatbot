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

export default function Message({ message, onEdit, onDelete }: MessageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSave = () => {
    onEdit(message.id, editedContent);
    setIsEditing(false);
    setMenuOpen(false); // close menu after saving
  };

  return (
    <div className={`message ${message.is_user ? 'user' : 'bot'}`}>
      <div className="message-wrapper">
        <div className="avatar">
          <img
            src={
              message.is_user
                ? 'https://media.licdn.com/dms/image/v2/D5603AQGpS4r0L23osA/profile-displayphoto-shrink_400_400/B56ZNzaAMtGkAg-/0/1732808019871?e=1743638400&v=beta&t=AgGedT8KtQ8astwDPPz23oKEg8p-EUuA2GOF5ZDcxxE' // Replace with user avatar URL
                : 'https://www.artisan.co/assets/ava.webp' // Ava
            }
            alt={message.is_user ? 'User Avatar' : 'Bot Avatar'}
          />
        </div>
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

        {/* Three-dot menu */}
        {message.is_user && (
          <div className="menu-container">
            <button
              className="menu-button"
              onClick={() => setMenuOpen((prev) => !prev)}
            >
              ⋮
            </button>
            {menuOpen && (
              <div className="dropdown-menu">
                {!isEditing ? (
                  <>
                    <button onClick={() => setIsEditing(true)}>Edit</button>
                    <button onClick={() => onDelete(message.id)}>Delete</button>
                  </>
                ) : (
                  <>
                    <button onClick={handleSave}>Save</button>
                    <button onClick={() => setIsEditing(false)}>Cancel</button>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

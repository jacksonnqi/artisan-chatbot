import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Message from './Message';

interface MessageType {
    id: string;
    content: string;
    is_user: boolean;
    created_at: string;
}

export default function Chat() {
    const [messages, setMessages] = useState<MessageType[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Scroll to the bottom when messages change
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const { data } = await axios.get('/api/messages');
                setMessages(data);
            } catch (err) {
                setError('Failed to load messages from /api/messages');
            }
        };

        fetchMessages();
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);
  
    const handleSend = async () => {
        if (!input.trim() || isLoading) return;
        
        setIsLoading(true);
        setError('');
        const tempId = Date.now().toString();
        
        try {
            setMessages((prev) => [
                ...prev,
                {
                    id: tempId,
                    content: input,
                    is_user: true,
                    created_at: new Date().toISOString(),
                },
            ]);
            setInput('');
        
            // Simulate Ava typing with a delay
            setIsTyping(true);

            const randomDelay = Math.floor(Math.random() * (6000 - 3000 + 1)) + 3000;

            setTimeout(async () => {
            try {
                const { data } = await axios.post('/api/messages', {
                content: input,
                is_user: true,
                });
        
                // Add Ava's reply after typing delay
                setMessages((prev) => [
                    ...prev.filter((m) => m.id !== tempId), // Remove temporary message
                    ...data,
                ]);
            } catch (err) {
                setError('Failed to send message');
            } finally {
                setIsTyping(false); // Stop typing indicator
                setIsLoading(false);
            }
            }, randomDelay);
        } catch (err) {
            setError('Failed to send message');
            setMessages((prev) => prev.filter((m) => m.id !== tempId));
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await axios.delete(`/api/messages/${id}`);
            setMessages((prev) => prev.filter((msg) => msg.id !== id));
        } catch (err) {
            setError('Failed to delete message');
        }
    };

    const handleEdit = async (id: string, newContent: string) => {
    try {
        await axios.put(`/api/messages/${id}`, { content: newContent });
        setMessages((prev) =>
        prev.map((msg) =>
            msg.id === id ? { ...msg, content: newContent } : msg
        )
        );
    } catch (err) {
        setError('Failed to edit message');
    }
    };

  return (
    <div className="chat-container">
        <div className="chat-header">
            <div className="header-avatar">
                <img
                    src="https://www.artisan.co/assets/ava.webp"
                    alt="Ava's Avatar"
                />
            </div>
            <div className="chat-header-text">
                <h1>Hey 👋, I'm Ava</h1>
                <p>Ask me anything or pick a place to start</p>
            </div>
        </div>

        {error && <div className="error">{error}</div>}

        <div className="messages">
            {messages.map((msg) => (
                <Message
                key={msg.id}
                message={msg}
                onEdit={handleEdit}
                onDelete={handleDelete}
                />
            ))}

            {isTyping && (
                <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>

        <div className="input-area">
            <div className="input-avatar">
                <img
                    src="https://media.licdn.com/dms/image/v2/D5603AQGpS4r0L23osA/profile-displayphoto-shrink_400_400/B56ZNzaAMtGkAg-/0/1732808019871?e=1743638400&v=beta&t=AgGedT8KtQ8astwDPPz23oKEg8p-EUuA2GOF5ZDcxxE" /* Replace with your actual photo URL */
                    alt="Your Avatar"
                />
            </div>
            <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyUp={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Your question"
                disabled={isLoading}
            />
            <button onClick={handleSend} disabled={isLoading}>
                {isLoading ? '...' : 'Send'}
            </button>
        </div>
    </div>
  );
}

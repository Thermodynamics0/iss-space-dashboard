import { useState, useRef, useEffect } from 'react';
import { useChat } from '../hooks/useChat';

const SUGGESTIONS = [
  'Where is the ISS right now?',
  'How fast is the ISS moving?',
  'Who is currently in space?',
  'Show me the latest news headlines',
];

export default function Chatbot({ issData, newsData }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const { messages, loading, sendMessage, clearChat } = useChat();
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input, issData, newsData);
    setInput('');
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleSuggestion = (s) => {
    sendMessage(s, issData, newsData);
  };

  return (
    <>
      {/* Floating Button */}
      <button className="chatbot-btn" onClick={() => setOpen(o => !o)} aria-label="Open AI Chat">
        {open ? '✕' : '🤖'}
        {messages.length > 0 && !open && <span className="chatbot-badge">{messages.length}</span>}
      </button>

      {/* Chat Window */}
      {open && (
        <div className="chat-window">
          <div className="chat-header">
            <div className="chat-header-info">
              <div className="chat-avatar">🤖</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>ISS Assistant</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mistral-7B · Dashboard data only</div>
              </div>
            </div>
            <div className="chat-header-actions">
              <button className="btn btn-ghost btn-sm" onClick={clearChat} title="Clear chat">🗑️</button>
              <button className="btn btn-ghost btn-sm" onClick={() => setOpen(false)}>✕</button>
            </div>
          </div>

          <div className="chat-messages">
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', padding: '1rem' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🛸</div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  Ask me anything about the ISS position, speed, crew, or news!
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {SUGGESTIONS.map(s => (
                    <button
                      key={s}
                      onClick={() => handleSuggestion(s)}
                      className="btn btn-ghost btn-sm"
                      style={{ textAlign: 'left', fontSize: '0.8rem' }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map(msg => (
              <div key={msg.id} className={`chat-msg ${msg.role}`}>
                {msg.role === 'assistant' && (
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.8rem' }}>
                    🤖
                  </div>
                )}
                <div className="msg-bubble">
                  {msg.content.split('\n').map((line, i) => (
                    <span key={i}>{line}{i < msg.content.split('\n').length - 1 && <br />}</span>
                  ))}
                </div>
              </div>
            ))}

            {loading && (
              <div className="chat-msg assistant">
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.8rem' }}>
                  🤖
                </div>
                <div className="typing-indicator">
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                  <div className="typing-dot" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="chat-input-row">
            <input
              type="text"
              placeholder="Ask about ISS or news..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              disabled={loading}
            />
            <button
              className="btn btn-primary"
              onClick={handleSend}
              disabled={loading || !input.trim()}
              style={{ padding: '0.6rem 0.9rem' }}
            >
              {loading ? '⏳' : '➤'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

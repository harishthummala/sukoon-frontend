import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { sendMessage, getChatHistory, endChat } from '../services/api';

function Chat() {
  const { chatId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messagesRemaining, setMessagesRemaining] = useState(20);
  const [chatEnded, setChatEnded] = useState(false);
  const [summary, setSummary] = useState('');
  const messagesEndRef = useRef(null);

  const mood = location.state?.mood || 'Neutral';

  // Load chat history on mount
  useEffect(() => {
    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadHistory = async () => {
    try {
      const response = await getChatHistory(chatId);
      const history = response.data;
      
      // Convert history to message format
      const formattedMessages = [];
      history.forEach(entry => {
        formattedMessages.push({
          role: 'user',
          content: entry.message,
          timestamp: entry.timestamp,
        });
        if(entry.aiResponse) {
          formattedMessages.push({
            role: 'assistant',
            content: entry.aiResponse,
            timestamp: entry.timestamp,
          });
        }
      });
      setMessages(formattedMessages);
      setMessagesRemaining(20 - history.length);
    } catch(err) {
      console.error('Failed to load history');
    }
  };

  const handleSend = async () => {
    if(!input.trim() || loading || chatEnded) return;

    const userMessage = input.trim();
    setInput('');
    setLoading(true);

    // Add user message immediately
    setMessages(prev => [...prev, {
      role: 'user',
      content: userMessage,
    }]);

    try {
      const response = await sendMessage(chatId, { message: userMessage });
      const data = response.data;

      // Add AI response
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.aiResponse || data.message?.aiResponse,
      }]);

      setMessagesRemaining(data.messagesRemaining || 0);

      // Check if chat ended
      if(data.chatEnded) {
        setChatEnded(true);
        setSummary(data.summary || '');
      }

    } catch(err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, something went wrong. Please try again.',
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleEndChat = async () => {
    try {
      const response = await endChat(chatId);
      setChatEnded(true);
      setSummary(response.data.summary || '');
    } catch(err) {
      console.error('Failed to end chat');
    }
  };

  const handleKeyPress = (e) => {
    if(e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button onClick={() => navigate('/dashboard')} style={styles.backBtn}>
          ← Back
        </button>
        <div style={styles.headerCenter}>
          <h2 style={styles.headerTitle}>🌿 Sukoon Chat</h2>
          <span style={styles.moodBadge}>Feeling: {mood}</span>
        </div>
        <div style={styles.headerRight}>
          <span style={{
            ...styles.msgCount,
            color: messagesRemaining <= 5 ? '#ff6b6b' : '#6c63ff'
          }}>
            {messagesRemaining} msgs left
          </span>
          {!chatEnded && (
            <button onClick={handleEndChat} style={styles.endBtn}>
              End Chat
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div style={styles.messagesContainer}>
        {/* Welcome message */}
        {messages.length === 0 && (
          <div style={styles.welcomeMsg}>
            <p>Hi! I'm Sukoon, your wellness companion. 🌿</p>
            <p>I see you're feeling <strong>{mood}</strong> today.</p>
            <p>Tell me what's on your mind...</p>
          </div>
        )}

        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              ...styles.messageRow,
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            {msg.role === 'assistant' && (
              <div style={styles.avatar}>🌿</div>
            )}
            <div style={{
              ...styles.bubble,
              background: msg.role === 'user'
                ? 'linear-gradient(135deg, #6c63ff, #a855f7)'
                : '#16213e',
              borderRadius: msg.role === 'user'
                ? '18px 18px 4px 18px'
                : '18px 18px 18px 4px',
            }}>
              {msg.content}
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {loading && (
          <div style={styles.messageRow}>
            <div style={styles.avatar}>🌿</div>
            <div style={styles.typing}>
              <span>●</span><span>●</span><span>●</span>
            </div>
          </div>
        )}

        {/* Chat ended summary */}
        {chatEnded && summary && (
          <div style={styles.summaryCard}>
            <h3>📋 Session Summary</h3>
            <p>{summary}</p>
            <button
              onClick={() => navigate('/dashboard')}
              style={styles.newChatBtn}
            >
              Start New Chat
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {!chatEnded && (
        <div style={styles.inputContainer}>
          <textarea
            style={styles.input}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message... (Enter to send)"
            rows={2}
            disabled={loading}
          />
          <button
            onClick={handleSend}
            style={{
              ...styles.sendBtn,
              opacity: input.trim() && !loading ? 1 : 0.5,
            }}
            disabled={!input.trim() || loading}
          >
            Send
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    background: '#0f0f1a',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 24px',
    background: '#16213e',
    boxShadow: '0 2px 20px rgba(0,0,0,0.3)',
  },
  backBtn: {
    background: 'transparent',
    border: '1px solid #2a2a4a',
    color: '#fff',
    padding: '8px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  headerCenter: {
    textAlign: 'center',
  },
  headerTitle: {
    color: '#6c63ff',
    fontSize: '20px',
    marginBottom: '4px',
  },
  moodBadge: {
    background: '#0f0f1a',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    color: '#a855f7',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  msgCount: {
    fontSize: '14px',
    fontWeight: 'bold',
  },
  endBtn: {
    background: 'transparent',
    border: '1px solid #ff6b6b',
    color: '#ff6b6b',
    padding: '8px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  messagesContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  welcomeMsg: {
    textAlign: 'center',
    color: '#888',
    padding: '40px 20px',
    lineHeight: '2',
    fontSize: '16px',
  },
  messageRow: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '8px',
  },
  avatar: {
    fontSize: '24px',
    marginBottom: '4px',
  },
  bubble: {
    maxWidth: '70%',
    padding: '12px 16px',
    color: '#fff',
    fontSize: '15px',
    lineHeight: '1.5',
  },
  typing: {
    background: '#16213e',
    padding: '12px 20px',
    borderRadius: '18px 18px 18px 4px',
    display: 'flex',
    gap: '4px',
    fontSize: '20px',
    color: '#6c63ff',
  },
  summaryCard: {
    background: '#16213e',
    border: '1px solid #6c63ff',
    borderRadius: '16px',
    padding: '24px',
    margin: '16px 0',
    textAlign: 'center',
  },
  newChatBtn: {
    marginTop: '16px',
    padding: '12px 32px',
    borderRadius: '8px',
    border: 'none',
    background: 'linear-gradient(135deg, #6c63ff, #a855f7)',
    color: '#fff',
    fontSize: '16px',
    cursor: 'pointer',
  },
  inputContainer: {
    display: 'flex',
    gap: '12px',
    padding: '16px 24px',
    background: '#16213e',
    borderTop: '1px solid #2a2a4a',
  },
  input: {
    flex: 1,
    padding: '12px 16px',
    borderRadius: '12px',
    border: '1px solid #2a2a4a',
    background: '#0f0f1a',
    color: '#fff',
    fontSize: '15px',
    resize: 'none',
    outline: 'none',
  },
  sendBtn: {
    padding: '12px 24px',
    borderRadius: '12px',
    border: 'none',
    background: 'linear-gradient(135deg, #6c63ff, #a855f7)',
    color: '#fff',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    alignSelf: 'flex-end',
  },
};

export default Chat;
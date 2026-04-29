import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createChat, logMood, getUserChats } from '../services/api';

const MOODS = ['Happy', 'Calm', 'Neutral', 'Sad', 'Anxious', 'Stressed', 'Angry', 'Tired'];

const MOOD_COLORS = {
  Happy: '#f7d794', Calm: '#78e08f', Neutral: '#aaa',
  Sad: '#74b9ff', Anxious: '#fd79a8', Stressed: '#e17055',
  Angry: '#d63031', Tired: '#a29bfe',
};

const MOOD_EMOJIS = {
  Happy: '😊', Calm: '😌', Neutral: '😐', Sad: '😢',
  Anxious: '😰', Stressed: '😤', Angry: '😠', Tired: '😴',
};

function Dashboard() {
  const [selectedMood, setSelectedMood] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [previousChats, setPreviousChats] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const name = localStorage.getItem('name');
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    loadPreviousChats();
  }, []);

  const loadPreviousChats = async () => {
    try {
      const response = await getUserChats(userId);
      setPreviousChats(response.data);
    } catch(err) {
      console.error('Failed to load chats');
    }
  };

  const handleStartChat = async () => {
    if(!selectedMood) {
      alert('Please select your mood first');
      return;
    }
    setLoading(true);
    try {
      const chatResponse = await createChat(userId);
      const chatId = chatResponse.data.id;
      await logMood(chatId, { mood: selectedMood, notes });
      navigate(`/chat/${chatId}`, {
        state: { mood: selectedMood, notes }
      });
    } catch(err) {
      alert('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <div style={{
        ...styles.sidebar,
        width: sidebarOpen ? '260px' : '0px',
        overflow: sidebarOpen ? 'visible' : 'hidden',
      }}>
        {/* Sidebar Header */}
        <div style={styles.sidebarHeader}>
          <h2 style={styles.sidebarLogo}>🌿 Sukoon</h2>
          <button onClick={handleStartChat} style={styles.newChatBtn}>
            + New Chat
          </button>
        </div>

        {/* Previous Chats */}
        <div style={styles.chatList}>
          <p style={styles.chatListLabel}>Previous Sessions</p>
          {previousChats.length === 0 ? (
            <p style={styles.noChats}>No previous chats yet</p>
          ) : (
            previousChats.map(chat => (
              <div
                key={chat.id}
                onClick={() => navigate(`/chat/${chat.id}`, {
                  state: { mood: 'Previous' }
                })}
                style={styles.chatItem}
              >
                <div style={styles.chatItemTop}>
                  <span style={styles.chatItemIcon}>💬</span>
                  <span style={styles.chatItemId}>
                    Session #{chat.id}
                  </span>
                  {chat.ended && (
                    <span style={styles.endedBadge}>Ended</span>
                  )}
                </div>
                <p style={styles.chatItemDate}>
                  {formatDate(chat.timestamp)}
                </p>
                {chat.summary && (
                  <p style={styles.chatItemSummary}>
                    {chat.summary.substring(0, 60)}...
                  </p>
                )}
              </div>
            ))
          )}
        </div>

        {/* Sidebar Footer */}
        <div style={styles.sidebarFooter}>
          <div style={styles.userInfo}>
            <div style={styles.userAvatar}>
              {name?.charAt(0).toUpperCase()}
            </div>
            <span style={styles.userName}>{name}</span>
          </div>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.main}>
        {/* Top Bar */}
        <div style={styles.topBar}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={styles.toggleBtn}
          >
            ☰
          </button>
          <span style={styles.topBarTitle}>
            How are you feeling today?
          </span>
        </div>

        {/* Mood Selection */}
        <div style={styles.content}>
          <div style={styles.centerCard}>
            <h2 style={styles.question}>
              Hi {name}! 👋 Let's check in.
            </h2>
            <p style={styles.subtitle}>
              Select your current mood to begin your wellness session
            </p>

            {/* Mood Grid */}
            <div style={styles.moodGrid}>
              {MOODS.map(mood => (
                <button
                  key={mood}
                  style={{
                    ...styles.moodBtn,
                    background: selectedMood === mood
                      ? MOOD_COLORS[mood]
                      : '#1a1a2e',
                    color: selectedMood === mood ? '#000' : '#fff',
                    border: `2px solid ${MOOD_COLORS[mood]}`,
                    transform: selectedMood === mood
                      ? 'scale(1.08)'
                      : 'scale(1)',
                  }}
                  onClick={() => setSelectedMood(mood)}
                >
                  <span style={styles.moodEmoji}>
                    {MOOD_EMOJIS[mood]}
                  </span>
                  <span>{mood}</span>
                </button>
              ))}
            </div>

            {/* Notes */}
            {selectedMood && (
              <div style={styles.notesContainer}>
                <p style={styles.notesLabel}>
                  What's on your mind? (optional)
                </p>
                <textarea
                  style={styles.textarea}
                  placeholder={`Tell me more about feeling ${selectedMood.toLowerCase()}...`}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
            )}

            {/* Start Button */}
            <button
              style={{
                ...styles.startBtn,
                opacity: selectedMood ? 1 : 0.4,
                background: selectedMood
                  ? `linear-gradient(135deg, ${MOOD_COLORS[selectedMood] || '#6c63ff'}, #a855f7)`
                  : '#333',
              }}
              onClick={handleStartChat}
              disabled={!selectedMood || loading}
            >
              {loading
                ? 'Starting session...'
                : selectedMood
                  ? `${MOOD_EMOJIS[selectedMood]} Start ${selectedMood} Session`
                  : 'Select a mood to begin'
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    height: '100vh',
    background: '#0f0f1a',
    overflow: 'hidden',
  },
  sidebar: {
    background: '#16213e',
    display: 'flex',
    flexDirection: 'column',
    borderRight: '1px solid #2a2a4a',
    transition: 'width 0.3s ease',
    flexShrink: 0,
  },
  sidebarHeader: {
    padding: '20px 16px',
    borderBottom: '1px solid #2a2a4a',
  },
  sidebarLogo: {
    color: '#6c63ff',
    fontSize: '20px',
    marginBottom: '12px',
  },
  newChatBtn: {
    width: '100%',
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid #6c63ff',
    background: 'transparent',
    color: '#6c63ff',
    fontSize: '14px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  chatList: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px',
  },
  chatListLabel: {
    color: '#555',
    fontSize: '11px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: '12px',
  },
  noChats: {
    color: '#444',
    fontSize: '13px',
    textAlign: 'center',
    marginTop: '20px',
  },
  chatItem: {
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '8px',
    cursor: 'pointer',
    background: '#0f0f1a',
    border: '1px solid #2a2a4a',
    transition: 'background 0.2s',
  },
  chatItemTop: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '4px',
  },
  chatItemIcon: {
    fontSize: '14px',
  },
  chatItemId: {
    color: '#fff',
    fontSize: '13px',
    fontWeight: 'bold',
    flex: 1,
  },
  endedBadge: {
    background: '#2a2a4a',
    color: '#888',
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '10px',
  },
  chatItemDate: {
    color: '#555',
    fontSize: '11px',
    marginBottom: '4px',
  },
  chatItemSummary: {
    color: '#888',
    fontSize: '11px',
    lineHeight: '1.4',
  },
  sidebarFooter: {
    padding: '16px',
    borderTop: '1px solid #2a2a4a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  userAvatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #6c63ff, #a855f7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#fff',
  },
  userName: {
    color: '#fff',
    fontSize: '13px',
    maxWidth: '100px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  logoutBtn: {
    background: 'transparent',
    border: 'none',
    color: '#555',
    cursor: 'pointer',
    fontSize: '13px',
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  topBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px 24px',
    background: '#16213e',
    borderBottom: '1px solid #2a2a4a',
  },
  toggleBtn: {
    background: 'transparent',
    border: 'none',
    color: '#fff',
    fontSize: '20px',
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: '6px',
  },
  topBarTitle: {
    color: '#888',
    fontSize: '14px',
  },
  content: {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
  },
  centerCard: {
    width: '100%',
    maxWidth: '560px',
    textAlign: 'center',
  },
  question: {
    fontSize: '28px',
    color: '#fff',
    marginBottom: '8px',
  },
  subtitle: {
    color: '#888',
    marginBottom: '32px',
    fontSize: '15px',
  },
  moodGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '12px',
    marginBottom: '24px',
  },
  moodBtn: {
    padding: '16px 8px',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 'bold',
    transition: 'all 0.2s ease',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
  },
  moodEmoji: {
    fontSize: '24px',
  },
  notesContainer: {
    marginBottom: '24px',
    textAlign: 'left',
  },
  notesLabel: {
    color: '#888',
    fontSize: '13px',
    marginBottom: '8px',
  },
  textarea: {
    width: '100%',
    padding: '14px',
    borderRadius: '12px',
    border: '1px solid #2a2a4a',
    background: '#16213e',
    color: '#fff',
    fontSize: '15px',
    resize: 'none',
    outline: 'none',
  },
  startBtn: {
    width: '100%',
    padding: '16px',
    borderRadius: '12px',
    border: 'none',
    color: '#fff',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
};

export default Dashboard;
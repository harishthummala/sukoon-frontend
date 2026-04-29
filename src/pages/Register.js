import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../services/api';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await registerUser({ name, email, password });
      navigate('/login');
    } catch(err) {
      setError('Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.logo}>🌿 Sukoon</h1>
        <p style={styles.subtitle}>Create your account</p>

        <form onSubmit={handleRegister} style={styles.form}>
          <input
            style={styles.input}
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            style={styles.input}
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            style={styles.input}
            type="password"
            placeholder="Password (min 8 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <p style={styles.error}>{error}</p>}

          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p style={styles.link}>
          Already have an account? <Link to="/login" style={styles.linkText}>Login</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%)',
  },
  card: {
    background: '#16213e',
    padding: '40px',
    borderRadius: '16px',
    width: '400px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
  },
  logo: {
    fontSize: '32px',
    textAlign: 'center',
    marginBottom: '8px',
    color: '#6c63ff',
  },
  subtitle: {
    textAlign: 'center',
    color: '#888',
    marginBottom: '32px',
    fontSize: '14px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  input: {
    padding: '14px',
    borderRadius: '8px',
    border: '1px solid #2a2a4a',
    background: '#0f0f1a',
    color: '#fff',
    fontSize: '16px',
    outline: 'none',
  },
  button: {
    padding: '14px',
    borderRadius: '8px',
    border: 'none',
    background: 'linear-gradient(135deg, #6c63ff, #a855f7)',
    color: '#fff',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '8px',
  },
  error: {
    color: '#ff6b6b',
    fontSize: '14px',
    textAlign: 'center',
  },
  link: {
    textAlign: 'center',
    marginTop: '24px',
    color: '#888',
    fontSize: '14px',
  },
  linkText: {
    color: '#6c63ff',
    textDecoration: 'none',
  },
};

export default Register;
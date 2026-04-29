import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';

function App() {
  const isLoggedIn = () => {
    return localStorage.getItem('token') !== null;
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route 
          path="/dashboard" 
          element={isLoggedIn() ? <Dashboard /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/chat/:chatId" 
          element={isLoggedIn() ? <Chat /> : <Navigate to="/login" />} 
        />
      </Routes>
    </Router>
  );
}

export default App;
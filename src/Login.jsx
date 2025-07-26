// Example: src/Login.jsx
import React from 'react';
import { EventBus } from './game/EventBus'; // adjust path if needed
const backendURL = import.meta.env.VITE_BACKEND_URL;

let loginPrompted = false;

function Login({ onLogin }) {
  const handlePrompt = async () => {
    if (loginPrompted) return;
    loginPrompted = true;
    const name = window.prompt("Enter your name:");
    if (!name) {
      loginPrompted = false;
      return;
    }
    const email = window.prompt("Enter your email:");
    if (!email) {
      loginPrompted = false;
      return;
    }
    const response = await fetch(`${backendURL}api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email }),
    });
    const data = await response.json();
    if (data.success) {
      localStorage.setItem('currentUser', JSON.stringify(data.user));
      if (onLogin) onLogin(data.user);
      EventBus.emit('login-success');
    } else {
      window.alert(data.message || 'Login failed');
    }
    loginPrompted = false;
  };

  React.useEffect(() => {
    handlePrompt();
    // Only run once when component mounts
    // eslint-disable-next-line
  }, []);

  return null;
}

export default Login;
import React from 'react';
import { EventBus } from './game/EventBus'; // adjust path if needed
const backendURL = import.meta.env.VITE_BACKEND_URL;


let signinPrompted = false;

function Signin({ onSignin }) {
  const handlePrompt = async () => {
    if (signinPrompted) return;
    signinPrompted = true;
    const name = window.prompt("Enter your name:");
    if (!name) {
      signinPrompted = false;
      return;
    }
    const email = window.prompt("Enter your email:");
    if (!email) {
      signinPrompted = false;
      return;
    }
    // Call backend
    const response = await fetch(`${backendURL}api/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email }),
    });
    const data = await response.json();
    if (data.success) {
      localStorage.setItem('currentUser', JSON.stringify(data.user));
      localStorage.setItem('userId', data.user._id);
      window.alert('Signin successful!');
      if (onSignin) onSignin(data.user);
      EventBus.emit('signin-success');
    } else {
      window.alert(data.message || 'Signin failed');
    }
    signinPrompted = false;
  };

  React.useEffect(() => {
    handlePrompt();
    // Only run once when component mounts
    // eslint-disable-next-line
    
  }, []);

  return null;
}

export default Signin;

// ===== App.jsx =====
import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import Phaser from 'phaser';
import { PhaserGame } from './PhaserGame';
import { EventBus } from './game/EventBus';
import Login from './Login';
import Signin from './Signin';
import { io } from 'socket.io-client';
const backendURL = import.meta.env.VITE_BACKEND_URL;


function App() {
  const [canMoveSprite, setCanMoveSprite] = useState(true);
  const [spritePosition, setSpritePosition] = useState({ x: 0, y: 0 });
  const phaserRef = useRef();

  const [users, setUsers] = useState([]);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignin, setShowSignin] = useState(false);

  const user = JSON.parse(localStorage.getItem('currentUser'));

  const socket = useRef(null);

  useEffect(() => {
    axios.get('${backendURL}users')
      .then((res) => setUsers(res.data))
      .catch((err) => console.error('Failed to load users:', err));
  }, []);

  useEffect(() => {
    if (user) {
      socket.current = io('import.meta.env.VITE_BACKEND_URL');

      socket.current.emit('registerUser', user.name);

      // const role = prompt("Choose your role: guesser or hinter");
      // socket.current.emit('setRole', role === 'hinter' ? 'hinter' : 'guesser');
    }
  }, [user]);

  useEffect(() => {
    const loginHandler = () => setShowLogin(true);
    const signinHandler = () => setShowSignin(true);
    EventBus.on('show-login', loginHandler);
    EventBus.on('show-signin', signinHandler);
    return () => {
      EventBus.off('show-login', loginHandler);
      EventBus.off('show-signin', signinHandler);
    };
  }, []);

  const handleLogin = () => setShowLogin(false);
  const handleSignin = () => setShowSignin(false);

  const currentScene = (scene) => {
    setCanMoveSprite(scene.scene.key !== 'MainMenu');
  };

  return (
    <div id="app">
      <PhaserGame ref={phaserRef} currentActiveScene={currentScene} />
      {showLogin && <Login onLogin={handleLogin} />}
      {showSignin && <Signin onSignin={handleSignin} />}
    </div>
  );
}

export default App;
import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import Chat from './components/Chat';

type View = 'login' | 'register' | 'chat';

interface UserData {
  token: string;
  username: string;
  userId: string;
}

const App: React.FC = () => {
  const [view, setView] = useState<View>('login');
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    // Check if user is already logged in
    const savedToken = localStorage.getItem('token');
    const savedUsername = localStorage.getItem('username');
    const savedUserId = localStorage.getItem('userId');

    if (savedToken && savedUsername && savedUserId) {
      setUserData({
        token: savedToken,
        username: savedUsername,
        userId: savedUserId
      });
      setView('chat');
    }
  }, []);

  const handleAuthSuccess = (authToken: string, authUsername: string, authUserId: string) => {
    const data = {
      token: authToken,
      username: authUsername,
      userId: authUserId
    };
    
    setUserData(data);
    localStorage.setItem('token', authToken);
    localStorage.setItem('username', authUsername);
    localStorage.setItem('userId', authUserId);
    setView('chat');
  };

  const handleLogout = () => {
    setUserData(null);
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('userId');
    setView('login');
  };

  if (view === 'chat' && userData) {
    return (
      <Chat
        token={userData.token}
        username={userData.username}
        userId={userData.userId}
        onLogout={handleLogout}
      />
    );
  }

  if (view === 'register') {
    return (
      <Register
        onRegisterSuccess={handleAuthSuccess}
        onSwitchToLogin={() => setView('login')}
      />
    );
  }

  return (
    <Login
      onLoginSuccess={handleAuthSuccess}
      onSwitchToRegister={() => setView('register')}
    />
  );
};

export default App;
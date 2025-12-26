import React, { useEffect, useState } from 'react';
import Background from './components/Background';
import Foreground from './components/Foreground';
import Footer from './components/Footer';
import Auth from './components/Auth';
import API from './config';
import axios from 'axios';

const App = () => {
  const [data, setData] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (token) {
      localStorage.setItem('authToken', token);
      setIsAuthenticated(true);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (error) {
      console.error('OAuth error:', error);
      alert('Authentication failed. Please try again.');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Verify existing token on mount
  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(API.AUTH.VERIFY, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.data.user) {
          setIsAuthenticated(true);
          localStorage.setItem('userEmail', res.data.user.email);
          localStorage.setItem('userName', res.data.user.name);
        } else {
          localStorage.removeItem('authToken');
        }
      } catch (err) {
        console.error('Token verification failed:', err);
        localStorage.removeItem('authToken');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userName');
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    try {
      const res = await axios.get(API.USERS, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data);
    } catch (err) {
      console.error('Error fetching files:', err);
      if (err.response?.status === 401) {
        handleLogout();
      }
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    setIsAuthenticated(false);
    setData([]);
  };

  if (loading) {
    return (
      <div className="w-screen h-screen relative bg-zinc-800 flex items-center justify-center">
        <div className="text-zinc-400 text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <div className="w-screen h-screen relative bg-zinc-800">
      <Background />
      <Foreground data={data} setData={setData} />
      <Footer fetchData={fetchData} />
      <button
        onClick={handleLogout}
        className="fixed top-5 right-5 z-50 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-semibold"
      >
        Logout
      </button>
    </div>
  );
};

export default App;

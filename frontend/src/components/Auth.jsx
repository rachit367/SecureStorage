import React, { useState, useRef, useEffect } from 'react';
import Background from './Background';
import API from '../config';

const Auth = ({ onLogin }) => {
  const [error, setError] = useState('');
  const [dots, setDots] = useState([]);
  const isDrawing = useRef(false);
  const hue = useRef(0);
  const containerRef = useRef(null);

  const handleMouseDown = () => {
    isDrawing.current = true;
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
  };

  const handleMouseMove = (e) => {
    if (!isDrawing.current || e.target.closest('.auth-form')) return;

    const newDot = {
      x: e.clientX,
      y: e.clientY,
      hue: hue.current,
      id: Date.now() + Math.random(),
    };

    hue.current = (hue.current + 5) % 360;

    setDots((prev) => [...prev, newDot]);

    setTimeout(() => {
      setDots((prev) => prev.filter((dot) => dot.id !== newDot.id));
    }, 2000);
  };

  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);


  const handleGoogleLogin = () => {
    window.location.href = API.AUTH.GOOGLE;
  };

  return (
    <div 
      className="w-screen h-screen relative bg-zinc-800 overflow-hidden"
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
    >
      <Background />
      

      {dots.map((dot) => (
        <div
          key={dot.id}
          className="absolute rounded-full pointer-events-none transition-opacity duration-300"
          style={{
            width: '8px',
            height: '8px',
            backgroundColor: `hsl(${dot.hue}, 100%, 60%)`,
            left: `${dot.x - 4}px`,
            top: `${dot.y - 4}px`,
            opacity: 0.8,
            zIndex: 1
          }}
        />
      ))}

      {/* Auth Form */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[4] auth-form">
        <div className="bg-zinc-900/90 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-zinc-700/50 w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-zinc-100 mb-2">
              Welcome to SecureStorage
            </h2>
            <p className="text-zinc-400 text-sm">
              Sign in with Google to continue
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={handleGoogleLogin}
              className="w-full py-3 bg-white hover:bg-gray-100 text-gray-800 font-semibold rounded-lg transition-colors flex items-center justify-center gap-3 shadow-lg"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign in with Google
            </button>

            <div className="text-center text-xs text-zinc-500 mt-6">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;

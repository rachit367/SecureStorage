import React, { useState, useEffect, useRef } from 'react';
import Card from './Card';
import API from '../config';
import axios from 'axios';

const Foreground = ({data,setData}) => {
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
    if (!isDrawing.current || e.target.closest('.card')) return;

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

  return (
    <div
      ref={containerRef}
      className="fixed top-0 left-0 w-full h-full z-[3] flex flex-wrap gap-10 p-5"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
    >
      
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

      {data.map((item, idx) => (
        <Card key={item._id} data={item} reference={containerRef} setData={setData} />
      ))}
    </div>
  );
};

export default Foreground;

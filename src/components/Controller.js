import React, { useState, useEffect } from 'react';
import { database } from '../firebase';
import { ref, set, onValue } from 'firebase/database';
import './Controller.css';

function Controller() {
  const [color, setColor] = useState(180);
  const [size, setSize] = useState(50);
  const [speed, setSpeed] = useState(5);
  const [isConnected, setIsConnected] = useState(false);

  // Load initial values from Firebase
  useEffect(() => {
    const artworkRef = ref(database, 'artwork');
    
    const unsubscribe = onValue(artworkRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setColor(data.color || 180);
        setSize(data.size || 50);
        setSpeed(data.speed || 5);
        setIsConnected(true);
      }
    }, (error) => {
      console.error('Firebase error:', error);
      setIsConnected(false);
    });

    return () => unsubscribe();
  }, []);

  // Update Firebase when sliders change
  const updateFirebase = (newColor, newSize, newSpeed) => {
    const artworkRef = ref(database, 'artwork');
    set(artworkRef, {
      color: newColor,
      size: newSize,
      speed: newSpeed,
      timestamp: Date.now()
    }).catch((error) => {
      console.error('Error updating Firebase:', error);
    });
  };

  const handleColorChange = (value) => {
    setColor(value);
    updateFirebase(value, size, speed);
  };

  const handleSizeChange = (value) => {
    setSize(value);
    updateFirebase(color, value, speed);
  };

  const handleSpeedChange = (value) => {
    setSpeed(value);
    updateFirebase(color, size, value);
  };

  return (
    <div className="controller">
      <h1>Artwork Controller</h1>
      
      <div className="status-bar">
        {isConnected ? '🟢 Connected' : '🔴 Connecting...'}
      </div>

      <div className="control-group">
        <label>Color: {color}°</label>
        <input
          type="range"
          min="0"
          max="360"
          value={color}
          onChange={(e) => handleColorChange(parseInt(e.target.value))}
          className="slider color-slider"
          style={{ 
            background: `linear-gradient(to right, 
              hsl(0, 70%, 60%), 
              hsl(60, 70%, 60%), 
              hsl(120, 70%, 60%), 
              hsl(180, 70%, 60%), 
              hsl(240, 70%, 60%), 
              hsl(300, 70%, 60%), 
              hsl(360, 70%, 60%)
            )`
          }}
        />
      </div>

      <div className="control-group">
        <label>Size: {size}px</label>
        <input
          type="range"
          min="10"
          max="150"
          value={size}
          onChange={(e) => handleSizeChange(parseInt(e.target.value))}
          className="slider"
        />
      </div>

      <div className="control-group">
        <label>Speed: {speed}</label>
        <input
          type="range"
          min="1"
          max="20"
          value={speed}
          onChange={(e) => handleSpeedChange(parseInt(e.target.value))}
          className="slider"
        />
      </div>

      <div className="preview" style={{
        width: `${size}px`,
        height: `${size}px`,
        background: `hsl(${color}, 70%, 60%)`,
        borderRadius: '50%',
        margin: '30px auto',
        transition: 'all 0.3s ease',
        boxShadow: `0 0 30px hsl(${color}, 70%, 60%)`
      }}></div>
    </div>
  );
}

export default Controller;

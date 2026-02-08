import React, { useEffect, useRef, useState } from 'react';
import { database } from '../firebase';
import { ref, onValue } from 'firebase/database';
import { QRCodeSVG } from 'qrcode.react';
import './ArtworkDisplay.css';

function ArtworkDisplay() {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const [color, setColor] = useState(180);
  const [size, setSize] = useState(50);
  const [speed, setSpeed] = useState(5);
  const [isConnected, setIsConnected] = useState(false);

  // Listen to Firebase for real-time updates
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

  // Canvas animation
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let x = canvas.width / 2;
    let y = canvas.height / 2;
    let angle = 0;

    const animate = () => {
      // Fade effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update position
      angle += speed / 100;
      x = canvas.width / 2 + Math.cos(angle) * 200;
      y = canvas.height / 2 + Math.sin(angle) * 200;

      // Draw circle
      ctx.fillStyle = `hsl(${color}, 70%, 60%)`;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [color, size, speed]);

  return (
    <div className="artwork-display">
      <canvas ref={canvasRef} />
      <div className="status">
        {isConnected ? '🟢 Connected' : '🔴 Connecting...'}
      </div>
      <div className="qr-code">
        <QRCodeSVG 
          value={`${window.location.origin}/controller`}
          size={150}
          bgColor="#ffffff"
          fgColor="#000000"
          level="H"
          includeMargin={true}
        />
        <p>Scan to Control</p>
      </div>
    </div>
  );
}

export default ArtworkDisplay;

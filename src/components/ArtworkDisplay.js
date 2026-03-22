import React, { useEffect, useRef, useState } from 'react';
import { database } from '../firebase';
import { ref, onValue } from 'firebase/database';
import { QRCodeSVG } from 'qrcode.react';
import './ArtworkDisplay.css';

function ArtworkDisplay() {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  // Use refs for animation values so Firebase updates don't restart the animation loop
  const colorRef = useRef(180);
  const sizeRef = useRef(50);
  const speedRef = useRef(5);

  // Listen to Firebase for real-time updates
  useEffect(() => {
    const artworkRef = ref(database, 'artwork');

    const unsubscribe = onValue(artworkRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        colorRef.current = data.color || 180;
        sizeRef.current = data.size || 50;
        speedRef.current = data.speed || 5;
        setIsConnected(true);
      }
    }, (error) => {
      console.error('Firebase error:', error);
      setIsConnected(false);
    });

    return () => unsubscribe();
  }, []);

  // Canvas animation — runs once, reads from refs every frame
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

      // Update position using ref values — no restart needed
      angle += speedRef.current / 100;
      x = canvas.width / 2 + Math.cos(angle) * 200;
      y = canvas.height / 2 + Math.sin(angle) * 200;

      // Draw circle
      ctx.fillStyle = `hsl(${colorRef.current}, 70%, 60%)`;
      ctx.beginPath();
      ctx.arc(x, y, sizeRef.current, 0, Math.PI * 2);
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
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

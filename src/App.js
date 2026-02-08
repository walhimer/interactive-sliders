import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ArtworkDisplay from './components/ArtworkDisplay';
import Controller from './components/Controller';
import './App.css';

function Home() {
  return (
    <div className="home">
      <h1>🎨 Interactive Artwork</h1>
      <div className="links">
        <Link to="/artwork" className="button">
          📺 Artwork Display
          <span className="subtitle">Open this on your laptop/gallery screen</span>
        </Link>
        <Link to="/controller" className="button">
          🎮 Controller
          <span className="subtitle">Open this on your phone</span>
        </Link>
      </div>
      <div className="instructions">
        <p>✨ Control the artwork from anywhere in the world!</p>
        <p>Multiple people can control at the same time.</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/artwork" element={<ArtworkDisplay />} />
        <Route path="/controller" element={<Controller />} />
      </Routes>
    </Router>
  );
}

export default App;

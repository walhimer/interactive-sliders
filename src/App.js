import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ArtworkDisplay from './components/ArtworkDisplay';
import Controller from './components/Controller';
import './App.css';

function Home() {
  return (
    <div className="home">
      <h1>Mark Walhimer — Interactive Works</h1>
      <div className="links">
        <Link to="/poc" className="button">
          Proof of Concept
          <span className="subtitle">Orbiting circle · color · size · speed</span>
        </Link>
        <Link to="/poc/controller" className="button">
          🎮 Controller
          <span className="subtitle">Control any piece from your phone</span>
        </Link>
      </div>
      <div className="instructions">
        <p>Open a piece on the display screen. Scan the QR code to control it.</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/poc" element={<ArtworkDisplay />} />
        <Route path="/poc/controller" element={<Controller />} />
        <Route path="/controller" element={<Controller />} />
      </Routes>
    </Router>
  );
}

export default App;

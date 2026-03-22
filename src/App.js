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
        <Link to="/disc-021" className="button">
          disc (021)
          <span className="subtitle">Coming soon</span>
        </Link>
        <Link to="/disc-019" className="button">
          disc (019)
          <span className="subtitle">Coming soon</span>
        </Link>
      </div>
      <div className="instructions">
        <p>Open a piece on the display screen. Scan the QR code to control it.</p>
      </div>
    </div>
  );
}

function ComingSoon({ title }) {
  return (
    <div className="home">
      <h1>{title}</h1>
      <div className="instructions">
        <p>Coming soon.</p>
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
        <Route path="/disc-021" element={<ComingSoon title="disc (021)" />} />
        <Route path="/disc-021/controller" element={<ComingSoon title="disc (021) controller" />} />
        <Route path="/disc-019" element={<ComingSoon title="disc (019)" />} />
        <Route path="/disc-019/controller" element={<ComingSoon title="disc (019) controller" />} />
      </Routes>
    </Router>
  );
}

export default App;

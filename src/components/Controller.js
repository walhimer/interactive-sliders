import React, { useState, useEffect } from 'react';
import { database } from '../firebase';
import { ref, set, onValue } from 'firebase/database';
import './Controller.css';

// ── disc (021) parameter definitions ────────────────────────────────────
// Each param maps directly to the variable name used in the artwork
const PARAMS = [
  {
    key:     'morphSpeed',
    label:   'Speed',
    hint:    'Animation pulse rate',
    min:     0.07,
    max:     0.21,
    step:    0.002,
    default: 0.14,
    format:  v => v.toFixed(3),
  },
  {
    key:     'morphDepth',
    label:   'Depth',
    hint:    'Surface deformation amount',
    min:     1.4,
    max:     2.8,
    step:    0.05,
    default: 2.1,
    format:  v => v.toFixed(2),
  },
  {
    key:     'slowSpin',
    label:   'Spin',
    hint:    'Rotation direction + speed',
    min:     -0.005,
    max:     0.005,
    step:    0.0002,
    default: 0.001,
    format:  v => (v >= 0 ? '+' : '') + v.toFixed(4),
  },
  {
    key:     'discRadius',
    label:   'Size',
    hint:    'Disc radius',
    min:     1.4,
    max:     2.3,
    step:    0.05,
    default: 1.8,
    format:  v => v.toFixed(2),
  },
  {
    key:     'colorR',
    label:   'Warm',
    hint:    'Red channel',
    min:     0.70,
    max:     0.90,
    step:    0.01,
    default: 0.80,
    format:  v => v.toFixed(2),
    color:   '#c0504d',
  },
  {
    key:     'colorG',
    label:   'Mid',
    hint:    'Green channel',
    min:     0.63,
    max:     0.78,
    step:    0.01,
    default: 0.70,
    format:  v => v.toFixed(2),
    color:   '#9bbb59',
  },
  {
    key:     'colorB',
    label:   'Cool',
    hint:    'Blue channel',
    min:     0.52,
    max:     0.68,
    step:    0.01,
    default: 0.60,
    format:  v => v.toFixed(2),
    color:   '#4bacc6',
  },
];

// Build initial state from defaults
const initialValues = () =>
  PARAMS.reduce((acc, p) => ({ ...acc, [p.key]: p.default }), {});

function Controller() {
  const [values, setValues]         = useState(initialValues);
  const [isConnected, setIsConnected] = useState(false);

  // Load current Firebase values on mount so controller syncs to display
  useEffect(() => {
    const artworkRef = ref(database, 'artwork');
    const unsubscribe = onValue(artworkRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;
      setIsConnected(true);
      // Only sync keys we own — don't overwrite with undefined
      setValues(prev => {
        const next = { ...prev };
        PARAMS.forEach(p => {
          if (data[p.key] !== undefined) next[p.key] = data[p.key];
        });
        return next;
      });
    }, () => setIsConnected(false));
    return () => unsubscribe();
  }, []);

  // Write a single key to Firebase immediately on change
  const handleChange = (key, rawValue) => {
    const value = parseFloat(rawValue);
    setValues(prev => ({ ...prev, [key]: value }));
    set(ref(database, `artwork/${key}`), value).catch(console.error);
  };

  // New Seed — writes a random seed + triggerSeed flag
  const handleNewSeed = () => {
    const seed = Math.floor(Math.random() * 999999) + 1;
    set(ref(database, 'artwork/seed'), seed).catch(console.error);
    set(ref(database, 'artwork/triggerSeed'), true).catch(console.error);
  };

  // Reset all params to defaults
  const handleReset = () => {
    const defaults = initialValues();
    setValues(defaults);
    const updates = {};
    PARAMS.forEach(p => { updates[p.key] = p.default; });
    set(ref(database, 'artwork'), updates).catch(console.error);
  };

  // Disc preview color from current RGB values
  const previewColor = `rgb(${Math.round(values.colorR * 255)}, ${Math.round(values.colorG * 255)}, ${Math.round(values.colorB * 255)})`;

  return (
    <div className="controller">
      <div className="controller-header">
        <h1>disc <span className="piece-num">(021)</span></h1>
        <div className={`status-badge ${isConnected ? 'connected' : 'disconnected'}`}>
          {isConnected ? '● live' : '○ connecting'}
        </div>
      </div>

      {/* Color preview disc */}
      <div className="disc-preview">
        <div
          className="disc-preview-circle"
          style={{ background: previewColor }}
        />
      </div>

      {/* Parameter sliders */}
      <div className="controls">
        {PARAMS.map(p => (
          <div className="control-group" key={p.key}>
            <div className="control-label">
              <span className="label-name">{p.label}</span>
              <span className="label-value">{p.format(values[p.key])}</span>
            </div>
            <input
              type="range"
              min={p.min}
              max={p.max}
              step={p.step}
              value={values[p.key]}
              onChange={e => handleChange(p.key, e.target.value)}
              className="slider"
              style={p.color ? { '--accent': p.color } : {}}
            />
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div className="actions">
        <button className="btn btn-seed" onClick={handleNewSeed}>
          NEW SEED
        </button>
        <button className="btn btn-reset" onClick={handleReset}>
          RESET
        </button>
      </div>
    </div>
  );
}

export default Controller;

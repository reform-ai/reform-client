// 1. Get user input on exercise type (squat, lift their leg/PT exercise, etc.), without needing to know. 
// 2. Front end starts capturing frames from the camera.
// 3. Frames are streamed to the Reform backend, along with the user input on exercise type.
// 4. <Wait for this> Backend processes the frames and outputs, to start, text feedback. TODO Add audio feedback.
// 5. Text feedback is sent to the frontend and displayed to the user. TODO Add audio feedback.

import React, { useState } from 'react';

function App() {
  const [backendStatus, setBackendStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const testBackendConnection = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/health');
      const data = await response.json();
      setBackendStatus(data);
    } catch (error) {
      setBackendStatus({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testBackendRoot = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/');
      const data = await response.json();
      setBackendStatus(data);
    } catch (error) {
      setBackendStatus({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <h1>Reform - Exercise Analyzer</h1>
      
      <div style={{ margin: '20px 0' }}>
        <button 
          onClick={testBackendConnection}
          disabled={loading}
          style={{ marginRight: '10px', padding: '10px 20px' }}
        >
          {loading ? 'Loading...' : 'Test Backend Health'}
        </button>
        
        <button 
          onClick={testBackendRoot}
          disabled={loading}
          style={{ padding: '10px 20px' }}
        >
          {loading ? 'Loading...' : 'Test Backend Root'}
        </button>
      </div>

      {backendStatus && (
        <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
          <h3>Backend Response:</h3>
          <pre>{JSON.stringify(backendStatus, null, 2)}</pre>
        </div>
      )}

      {/* TODO: Add one button to upload a video file from the user's device. */}
    </div>
  );
}

export default App;


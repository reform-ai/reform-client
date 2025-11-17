// 1. Get user input on exercise type (squat, lift their leg/PT exercise, etc.), without needing to know. 
// 2. Front end starts capturing frames from the camera.
// 3. Frames are streamed to the Reform backend, along with the user input on exercise type.
// 4. <Wait for this> Backend processes the frames and outputs, to start, text feedback. TODO Add audio feedback.
// 5. Text feedback is sent to the frontend and displayed to the user. TODO Add audio feedback.

import React, { useState } from 'react';
import UploadVideo from './camera/uploadVideo/uploadVideo';
import { API_ENDPOINTS } from './config/api';

function App() {
  const [backendStatus, setBackendStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const testBackendConnection = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.HEALTH);
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
      const response = await fetch(API_ENDPOINTS.ROOT);
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
      
      <div style={{ margin: '20px 0', display: 'none' }}>
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
        <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '5px', display: 'none' }}>
          <h3>Backend Response:</h3>
          <pre>{JSON.stringify(backendStatus, null, 2)}</pre>
        </div>
      )}

      <div style={{ marginTop: '30px', borderTop: '1px solid #ccc', paddingTop: '20px' }}>
        <h2>Video Upload</h2>
        <UploadVideo />
      </div>
    </div>
  );
}

export default App;


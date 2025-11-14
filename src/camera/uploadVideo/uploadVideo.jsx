// Video upload handler for iPhone - React component
// Handles user input when upload button is clicked

import React, { useState, useRef } from 'react';

function UploadVideo() {
  const [videoFile, setVideoFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('video/')) {
      const videoObject = {
        file: file,
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified
      };
      setVideoFile(videoObject);
      console.log('✅ Video file selected and stored:', videoObject);
      console.log('📹 Full File object:', file);
    } else {
      alert('Please select a valid video file');
    }
  };

  const handleSendToBackend = async () => {
    if (!videoFile || !videoFile.file) {
      alert('Please select a video file first');
      return;
    }

    setUploading(true);
    setUploadStatus(null);

    try {
      const formData = new FormData();
      formData.append('video', videoFile.file);

      console.log('📤 Sending video to backend...', {
        name: videoFile.name,
        size: videoFile.size,
        type: videoFile.type
      });

      const response = await fetch('http://127.0.0.1:8000/upload-video', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      
      if (response.ok) {
        setUploadStatus({ success: true, data });
        console.log('✅ Video uploaded successfully:', data);
      } else {
        setUploadStatus({ success: false, error: data.message || 'Upload failed' });
        console.error('❌ Upload failed:', data);
      }
    } catch (error) {
      setUploadStatus({ success: false, error: error.message });
      console.error('❌ Error uploading video:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="video/*"
        style={{ display: 'none' }}
      />
      <button
        onClick={handleUploadClick}
        style={{ padding: '10px 20px', margin: '10px 0', marginRight: '10px' }}
      >
        Select Video
      </button>
      {videoFile && (
        <button
          onClick={handleSendToBackend}
          disabled={uploading}
          style={{ 
            padding: '10px 20px', 
            margin: '10px 0',
            backgroundColor: uploading ? '#ccc' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: uploading ? 'not-allowed' : 'pointer'
          }}
        >
          {uploading ? 'Uploading...' : 'Send to Backend'}
        </button>
      )}
      {videoFile && (
        <div style={{ marginTop: '10px', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
          <p><strong>Video Selected:</strong> {videoFile.name}</p>
          <p><strong>Size:</strong> {(videoFile.size / 1024 / 1024).toFixed(2)} MB</p>
          <p><strong>Type:</strong> {videoFile.type}</p>
          <details style={{ marginTop: '10px' }}>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>🔍 View Full videoFile Object (Click to Expand)</summary>
            <pre style={{ 
              marginTop: '10px', 
              padding: '10px', 
              background: '#f5f5f5', 
              border: '1px solid #ddd', 
              borderRadius: '4px',
              overflow: 'auto',
              maxHeight: '300px'
            }}>
              {JSON.stringify(videoFile, (key, value) => {
                // Handle File object - show its properties but not the actual binary data
                if (value instanceof File) {
                  return {
                    name: value.name,
                    size: value.size,
                    type: value.type,
                    lastModified: value.lastModified,
                    _type: 'File object (binary data not shown)'
                  };
                }
                return value;
              }, 2)}
            </pre>
          </details>
          {uploadStatus && (
            <div style={{ 
              marginTop: '15px', 
              padding: '10px', 
              backgroundColor: uploadStatus.success ? '#d4edda' : '#f8d7da',
              border: `1px solid ${uploadStatus.success ? '#c3e6cb' : '#f5c6cb'}`,
              borderRadius: '4px'
            }}>
              {uploadStatus.success ? (
                <div>
                  <p style={{ color: '#155724', fontWeight: 'bold' }}>✅ Upload Successful!</p>
                  <pre style={{ marginTop: '5px', fontSize: '12px' }}>
                    {JSON.stringify(uploadStatus.data, null, 2)}
                  </pre>
                  {uploadStatus.data.visualization_url && (
                    <div style={{ marginTop: '15px' }}>
                      <h4 style={{ marginBottom: '10px', color: '#155724' }}>Visualization Video:</h4>
                      <video 
                        src={uploadStatus.data.visualization_url}
                        controls
                        style={{
                          width: '100%',
                          maxWidth: '800px',
                          borderRadius: '4px',
                          border: '1px solid #ccc'
                        }}
                      >
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  )}
                </div>
              ) : (
                <p style={{ color: '#721c24' }}>❌ Error: {uploadStatus.error}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default UploadVideo;

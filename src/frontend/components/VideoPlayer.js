import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Text } from 'react-native';
import { Video } from 'expo-av';
import { PoseOverlay } from './PoseOverlay';

const VideoPlayer = ({ 
  videoUri, 
  poseData, 
  onFrameUpdate, 
  onVideoEnd,
  style 
}) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [videoDimensions, setVideoDimensions] = useState(null);

  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;

  useEffect(() => {
    if (videoUri) {
      setIsLoading(true);
      setIsPlaying(false);
      setPosition(0);
    }
  }, [videoUri]);

  const handlePlayPause = async () => {
    if (!videoRef.current) return;

    try {
      if (isPlaying) {
        await videoRef.current.pauseAsync();
        setIsPlaying(false);
      } else {
        await videoRef.current.playAsync();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('🎬 [VIDEO] Play/pause error:', error);
    }
  };

  const handleSeek = async (time) => {
    if (!videoRef.current) return;

    try {
      await videoRef.current.setPositionAsync(time * 1000); // Convert to milliseconds
      setPosition(time);
    } catch (error) {
      console.error('🎬 [VIDEO] Seek error:', error);
    }
  };

  const handleVideoLoad = (status) => {
    if (status.isLoaded) {
      setDuration(status.durationMillis / 1000); // Convert to seconds
      setIsLoading(false);
      
      // Get video dimensions
      if (status.naturalSize) {
        const { width, height } = status.naturalSize;
        setVideoDimensions({ width, height });
        console.log('🎬 [VIDEO] Video loaded:', { width, height, duration: status.durationMillis / 1000 });
      }
    }
  };

  const handlePlaybackStatusUpdate = (status) => {
    if (status.isLoaded) {
      const currentTime = status.positionMillis / 1000;
      setPosition(currentTime);
      
      // Notify parent component about frame update
      if (onFrameUpdate) {
        onFrameUpdate(currentTime, status.positionMillis);
      }

      // Check if video ended
      if (status.didJustFinish && onVideoEnd) {
        onVideoEnd();
        setIsPlaying(false);
      }
    }
  };

  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    return duration > 0 ? (position / duration) * 100 : 0;
  };

  if (!videoUri) {
    return (
      <View style={[styles.container, style]}>
        <Text style={styles.placeholderText}>No video selected</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <View style={styles.videoContainer}>
        <Video
          ref={videoRef}
          source={{ uri: videoUri }}
          style={styles.video}
          resizeMode="contain"
          shouldPlay={false}
          isLooping={false}
          onLoad={handleVideoLoad}
          onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
        />
        
        {/* Pose Overlay */}
        {poseData && videoDimensions && (
          <PoseOverlay 
            poseData={poseData} 
            cameraDimensions={videoDimensions}
            style={styles.poseOverlay}
          />
        )}
        
        {/* Loading Overlay */}
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <Text style={styles.loadingText}>Loading video...</Text>
          </View>
        )}
      </View>

      {/* Video Controls */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity style={styles.playButton} onPress={handlePlayPause}>
          <Text style={styles.playButtonText}>
            {isPlaying ? '⏸️' : '▶️'}
          </Text>
        </TouchableOpacity>
        
        <View style={styles.progressContainer}>
          <Text style={styles.timeText}>{formatTime(position)}</Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${getProgressPercentage()}%` }
              ]} 
            />
          </View>
          <Text style={styles.timeText}>{formatTime(duration)}</Text>
        </View>
      </View>

      {/* Video Info */}
      {videoDimensions && (
        <Text style={styles.videoInfo}>
          {videoDimensions.width}×{videoDimensions.height} • {formatTime(duration)}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoContainer: {
    flex: 1,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  poseOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  playButton: {
    marginRight: 15,
    padding: 10,
  },
  playButtonText: {
    fontSize: 24,
    color: 'white',
  },
  progressContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    color: 'white',
    fontSize: 12,
    minWidth: 40,
    textAlign: 'center',
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 10,
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF6B35',
    borderRadius: 2,
  },
  videoInfo: {
    color: '#ccc',
    fontSize: 12,
    textAlign: 'center',
    padding: 5,
    backgroundColor: 'rgba(0,0,0,0.8)',
  },
  placeholderText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default VideoPlayer;

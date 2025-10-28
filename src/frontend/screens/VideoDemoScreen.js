import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  Dimensions 
} from 'react-native';
import VideoUploader from '../components/VideoUploader';
import VideoPlayer from '../components/VideoPlayer';
import VideoAnalyzer from '../../core/video/videoAnalyzer';
import PersonalTrainer from '../../core/audio/personalTrainer';
import styles from '../styles/appStyles';

const VideoDemoScreen = () => {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [currentPoseData, setCurrentPoseData] = useState(null);
  const [analysisResults, setAnalysisResults] = useState([]);
  const [trainerStats, setTrainerStats] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const videoAnalyzer = useRef(null);
  const personalTrainer = useRef(null);

  useEffect(() => {
    // Initialize components
    videoAnalyzer.current = new VideoAnalyzer();
    personalTrainer.current = new PersonalTrainer();

    // Set up callbacks
    videoAnalyzer.current.setOnFrameProcessed(handleFrameProcessed);
    videoAnalyzer.current.setOnAnalysisComplete(handleAnalysisComplete);
    videoAnalyzer.current.setOnError(handleAnalysisError);

    // Initialize video analyzer
    initializeAnalyzer();

    return () => {
      // Cleanup
      if (videoAnalyzer.current) {
        videoAnalyzer.current.dispose();
      }
    };
  }, []);

  const initializeAnalyzer = async () => {
    try {
      console.log('🎬 [DEMO] Initializing video analyzer...');
      const success = await videoAnalyzer.current.initialize();
      if (success) {
        console.log('🎬 [DEMO] Video analyzer ready!');
      } else {
        Alert.alert('Error', 'Failed to initialize video analyzer');
      }
    } catch (error) {
      console.error('🎬 [DEMO] Initialization error:', error);
      Alert.alert('Error', 'Failed to initialize video analyzer');
    }
  };

  const handleVideoSelected = (video) => {
    console.log('🎬 [DEMO] Video selected:', video.name);
    setSelectedVideo(video);
    setAnalysisResults([]);
    setCurrentPoseData(null);
    setAnalysisProgress(0);
  };

  const handleStartAnalysis = async () => {
    if (!selectedVideo) {
      Alert.alert('No Video', 'Please select a video first');
      return;
    }

    try {
      setIsAnalyzing(true);
      setAnalysisProgress(0);
      setAnalysisResults([]);
      
      console.log('🎬 [DEMO] Starting video analysis...');
      
      // Start analysis
      await videoAnalyzer.current.analyzeVideo(selectedVideo.uri, {
        enableAudioFeedback: true,
        analysisType: 'basketball_shooting'
      });
      
    } catch (error) {
      console.error('🎬 [DEMO] Analysis failed:', error);
      Alert.alert('Analysis Failed', 'Failed to analyze video. Please try again.');
      setIsAnalyzing(false);
    }
  };

  const handleFrameProcessed = (result, currentFrame, totalFrames) => {
    console.log(`🎬 [DEMO] Frame ${currentFrame}/${totalFrames} processed`);
    
    // Update progress
    const progress = (currentFrame / totalFrames) * 100;
    setAnalysisProgress(progress);
    
    // Update current pose data for overlay
    setCurrentPoseData(result.poseData);
    
    // Give real-time feedback
    if (personalTrainer.current && result.aiFeedback) {
      personalTrainer.current.giveFeedback(
        result.poseData,
        result.techniqueScore,
        result.movementType,
        currentFrame
      );
    }
    
    // Update results
    setAnalysisResults(prev => [...prev, result]);
  };

  const handleAnalysisComplete = (results) => {
    console.log('🎬 [DEMO] Analysis complete!', results.length, 'frames analyzed');
    setIsAnalyzing(false);
    setAnalysisProgress(100);
    
    // Calculate overall stats
    const avgScore = results.reduce((sum, r) => sum + r.techniqueScore, 0) / results.length;
    const trainerStats = personalTrainer.current.getStats();
    
    setTrainerStats({
      ...trainerStats,
      averageTechniqueScore: Math.round(avgScore),
      totalFrames: results.length
    });
    
    Alert.alert(
      'Analysis Complete! 🎉',
      `Analyzed ${results.length} frames\nAverage technique score: ${Math.round(avgScore)}/100`,
      [{ text: 'OK' }]
    );
  };

  const handleAnalysisError = (error) => {
    console.error('🎬 [DEMO] Analysis error:', error);
    setIsAnalyzing(false);
    Alert.alert('Analysis Error', error.message || 'Unknown error occurred');
  };

  const handleVideoPlay = () => {
    setIsPlaying(true);
  };

  const handleVideoPause = () => {
    setIsPlaying(false);
  };

  const handleVideoEnd = () => {
    setIsPlaying(false);
    console.log('🎬 [DEMO] Video playback ended');
  };

  const handleFrameUpdate = (currentTime, positionMillis) => {
    // Find the corresponding analysis result for this timestamp
    const frameNumber = Math.floor(currentTime * 30); // Assuming 30fps
    const result = analysisResults[frameNumber];
    
    if (result) {
      setCurrentPoseData(result.poseData);
    }
  };

  const resetDemo = () => {
    setSelectedVideo(null);
    setAnalysisResults([]);
    setCurrentPoseData(null);
    setAnalysisProgress(0);
    setIsAnalyzing(false);
    setIsPlaying(false);
    if (personalTrainer.current) {
      personalTrainer.current.clearHistory();
    }
  };

  const getProgressColor = () => {
    if (analysisProgress < 30) return '#ff4444';
    if (analysisProgress < 70) return '#ffaa00';
    return '#44ff44';
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.title}>🎬 Video Demo - AI Personal Trainer</Text>
      <Text style={styles.subtitle}>
        Upload a video and watch the AI analyze your form in real-time!
      </Text>

      {/* Video Upload Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>1. Upload Your Video</Text>
        <VideoUploader 
          onVideoSelected={handleVideoSelected}
          style={styles.uploader}
        />
        
        {selectedVideo && (
          <View style={styles.videoInfo}>
            <Text style={styles.videoInfoText}>
              📹 {selectedVideo.name}
            </Text>
            <Text style={styles.videoInfoSubtext}>
              {(selectedVideo.size / (1024 * 1024)).toFixed(1)} MB
            </Text>
          </View>
        )}
      </View>

      {/* Analysis Controls */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>2. Start Analysis</Text>
        
        <TouchableOpacity
          style={[
            styles.analysisButton,
            (!selectedVideo || isAnalyzing) && styles.disabledButton
          ]}
          onPress={handleStartAnalysis}
          disabled={!selectedVideo || isAnalyzing}
        >
          <Text style={styles.analysisButtonText}>
            {isAnalyzing ? '🔄 Analyzing...' : '🚀 Start AI Analysis'}
          </Text>
        </TouchableOpacity>

        {isAnalyzing && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${analysisProgress}%`,
                    backgroundColor: getProgressColor()
                  }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {Math.round(analysisProgress)}% Complete
            </Text>
          </View>
        )}
      </View>

      {/* Video Player with Pose Overlay */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>3. Watch with AI Analysis</Text>
        
        {selectedVideo ? (
          <View style={styles.videoPlayerContainer}>
            <VideoPlayer
              videoUri={selectedVideo.uri}
              poseData={currentPoseData}
              onFrameUpdate={handleFrameUpdate}
              onVideoEnd={handleVideoEnd}
              style={styles.videoPlayer}
            />
            
            {currentPoseData && (
              <View style={styles.poseInfo}>
                <Text style={styles.poseInfoText}>
                  🤖 Pose detected: {currentPoseData.summary?.highConfidenceKeypoints || 0} keypoints
                </Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>
              Upload a video to see the AI analysis in action!
            </Text>
          </View>
        )}
      </View>

      {/* Analysis Results */}
      {analysisResults.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Analysis Results</Text>
          
          <View style={styles.resultsContainer}>
            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>Frames Analyzed:</Text>
              <Text style={styles.resultValue}>{analysisResults.length}</Text>
            </View>
            
            <View style={styles.resultItem}>
              <Text style={styles.resultLabel}>Average Score:</Text>
              <Text style={styles.resultValue}>
                {Math.round(analysisResults.reduce((sum, r) => sum + r.techniqueScore, 0) / analysisResults.length)}/100
              </Text>
            </View>
            
            {trainerStats && (
              <View style={styles.resultItem}>
                <Text style={styles.resultLabel}>AI Feedback Given:</Text>
                <Text style={styles.resultValue}>{trainerStats.totalFeedback}</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Trainer Stats */}
      {trainerStats && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Personal Trainer Stats</Text>
          
          <View style={styles.trainerStats}>
            <Text style={styles.trainerText}>
              🎤 Trainer Status: {trainerStats.isSpeaking ? 'Speaking' : 'Ready'}
            </Text>
            <Text style={styles.trainerText}>
              📊 Feedback Given: {trainerStats.totalFeedback} tips
            </Text>
            <Text style={styles.trainerText}>
              🎯 Average Score: {trainerStats.averageScore}/100
            </Text>
            <Text style={styles.trainerText}>
              🎭 Style: {trainerStats.personality?.style || 'motivational'}
            </Text>
          </View>
        </View>
      )}

      {/* Reset Button */}
      <TouchableOpacity style={styles.resetButton} onPress={resetDemo}>
        <Text style={styles.resetButtonText}>🔄 Reset Demo</Text>
      </TouchableOpacity>

      {/* Instructions */}
      <View style={styles.instructions}>
        <Text style={styles.instructionsTitle}>How it works:</Text>
        <Text style={styles.instructionText}>
          1. 📹 Upload a video of yourself working out
        </Text>
        <Text style={styles.instructionText}>
          2. 🚀 Start AI analysis to process your form
        </Text>
        <Text style={styles.instructionText}>
          3. 👀 Watch with real-time pose detection overlay
        </Text>
        <Text style={styles.instructionText}>
          4. 🎤 Listen to your AI personal trainer's feedback
        </Text>
        <Text style={styles.instructionText}>
          5. 📊 Review detailed analysis results
        </Text>
      </View>
    </ScrollView>
  );
};

const demoStyles = StyleSheet.create({
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  uploader: {
    marginBottom: 10,
  },
  videoInfo: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  videoInfoText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  videoInfoSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  analysisButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 15,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  analysisButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressContainer: {
    marginTop: 10,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  videoPlayerContainer: {
    backgroundColor: '#000',
    borderRadius: 10,
    overflow: 'hidden',
    height: 300,
  },
  videoPlayer: {
    flex: 1,
  },
  poseInfo: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 8,
    borderRadius: 5,
  },
  poseInfoText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  placeholder: {
    height: 200,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
  },
  resultsContainer: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  resultLabel: {
    fontSize: 14,
    color: '#666',
  },
  resultValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  trainerStats: {
    backgroundColor: '#e8f5e8',
    padding: 15,
    borderRadius: 10,
  },
  trainerText: {
    fontSize: 14,
    color: '#2d5a2d',
    marginBottom: 5,
  },
  resetButton: {
    backgroundColor: '#6c757d',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
  },
  resetButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  instructions: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 10,
    marginTop: 20,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
});

// Merge with existing styles
const combinedStyles = StyleSheet.flatten([styles, demoStyles]);

export default VideoDemoScreen;

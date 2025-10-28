import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';

const VideoUploader = ({ onVideoSelected, style }) => {
  const [isUploading, setIsUploading] = useState(false);

  const pickVideo = async () => {
    try {
      setIsUploading(true);
      
      const result = await DocumentPicker.getDocumentAsync({
        type: 'video/*',
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const video = result.assets[0];
        
        // Validate video file
        if (!video.mimeType?.startsWith('video/')) {
          Alert.alert('Invalid File', 'Please select a video file.');
          return;
        }

        // Check file size (limit to 100MB for demo)
        const fileSizeMB = video.size / (1024 * 1024);
        if (fileSizeMB > 100) {
          Alert.alert('File Too Large', 'Please select a video smaller than 100MB.');
          return;
        }

        // Copy to app's document directory for processing
        const fileName = `video_${Date.now()}.${video.name.split('.').pop()}`;
        const destinationUri = `${FileSystem.documentDirectory}${fileName}`;
        
        await FileSystem.copyAsync({
          from: video.uri,
          to: destinationUri,
        });

        console.log('📹 [VIDEO] Video selected:', {
          name: video.name,
          size: fileSizeMB.toFixed(2) + 'MB',
          uri: destinationUri,
          mimeType: video.mimeType
        });

        onVideoSelected({
          uri: destinationUri,
          name: video.name,
          size: video.size,
          mimeType: video.mimeType,
          duration: video.duration || 0
        });

      } else {
        console.log('📹 [VIDEO] Video selection cancelled');
      }
    } catch (error) {
      console.error('📹 [VIDEO] Error picking video:', error);
      Alert.alert('Error', 'Failed to select video. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={[styles.uploadButton, isUploading && styles.uploadButtonDisabled]}
        onPress={pickVideo}
        disabled={isUploading}
      >
        <Text style={styles.uploadButtonText}>
          {isUploading ? '📤 Uploading...' : '📹 Upload Video'}
        </Text>
      </TouchableOpacity>
      
      <Text style={styles.helpText}>
        Select a video to analyze your form
      </Text>
      <Text style={styles.helpSubtext}>
        Supported: MP4, MOV, AVI (max 100MB)
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 20,
  },
  uploadButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  uploadButtonDisabled: {
    backgroundColor: '#ccc',
  },
  uploadButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  helpText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 5,
  },
  helpSubtext: {
    color: '#999',
    fontSize: 12,
    textAlign: 'center',
  },
});

export default VideoUploader;

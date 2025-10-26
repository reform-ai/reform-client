import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

// Pose overlay component that renders skeleton on camera view using simple View components
export function PoseOverlay({ poseData, cameraDimensions }) {
  if (!poseData || !poseData.keypoints || !cameraDimensions) {
    return null;
  }

  const { width, height } = cameraDimensions;
  const keypoints = poseData.keypoints;

  // Convert normalized coordinates to screen coordinates
  const getScreenCoords = (keypoint) => {
    return {
      x: keypoint.x * width,
      y: keypoint.y * height
    };
  };

  // Find keypoint by name
  const findKeypoint = (name) => {
    return keypoints.find(kp => kp.name === name);
  };

  // Get color based on confidence
  const getConfidenceColor = (confidence) => {
    if (confidence > 0.8) return '#00FF00'; // Green - high confidence
    if (confidence > 0.5) return '#FFFF00'; // Yellow - medium confidence
    return '#FF0000'; // Red - low confidence
  };

  // Get joint size based on confidence
  const getJointSize = (confidence) => {
    if (confidence > 0.8) return 12;
    if (confidence > 0.5) return 8;
    return 6;
  };

  // Key joints to highlight (focus on shooting arm)
  const importantJoints = [
    'right_shoulder', 'right_elbow', 'right_wrist', // Shooting arm
    'left_shoulder', 'left_elbow', 'left_wrist',   // Support arm
    'nose', 'left_eye', 'right_eye'                // Head for reference
  ];

  return (
    <View style={[styles.overlay, { width, height }]} pointerEvents="none">
      {/* Draw joint points */}
      {keypoints.map((keypoint, index) => {
        if (keypoint.confidence < 0.3) return null;
        
        const coords = getScreenCoords(keypoint);
        const isShootingArmJoint = keypoint.name.includes('right_');
        const isImportantJoint = importantJoints.includes(keypoint.name);
        
        if (!isImportantJoint) return null; // Only show important joints
        
        return (
          <View
            key={`joint-${index}`}
            style={[
              styles.joint,
              {
                left: coords.x - getJointSize(keypoint.confidence) / 2,
                top: coords.y - getJointSize(keypoint.confidence) / 2,
                width: getJointSize(keypoint.confidence),
                height: getJointSize(keypoint.confidence),
                backgroundColor: isShootingArmJoint ? '#FF6B35' : getConfidenceColor(keypoint.confidence),
                borderColor: isShootingArmJoint ? '#FFFFFF' : '#000000',
              }
            ]}
          />
        );
      })}
      
      {/* Draw shooting arm connection lines using positioned Views */}
      {(() => {
        const rightShoulder = findKeypoint('right_shoulder');
        const rightElbow = findKeypoint('right_elbow');
        const rightWrist = findKeypoint('right_wrist');
        
        const connections = [];
        
        // Shoulder to Elbow
        if (rightShoulder && rightElbow && rightShoulder.confidence > 0.3 && rightElbow.confidence > 0.3) {
          const shoulderCoords = getScreenCoords(rightShoulder);
          const elbowCoords = getScreenCoords(rightElbow);
          
          const angle = Math.atan2(elbowCoords.y - shoulderCoords.y, elbowCoords.x - shoulderCoords.x) * 180 / Math.PI;
          const distance = Math.sqrt(Math.pow(elbowCoords.x - shoulderCoords.x, 2) + Math.pow(elbowCoords.y - shoulderCoords.y, 2));
          
          connections.push(
            <View
              key="shoulder-elbow"
              style={[
                styles.connectionLine,
                {
                  left: shoulderCoords.x,
                  top: shoulderCoords.y,
                  width: distance,
                  transform: [{ rotate: `${angle}deg` }],
                  backgroundColor: '#FF6B35',
                }
              ]}
            />
          );
        }
        
        // Elbow to Wrist
        if (rightElbow && rightWrist && rightElbow.confidence > 0.3 && rightWrist.confidence > 0.3) {
          const elbowCoords = getScreenCoords(rightElbow);
          const wristCoords = getScreenCoords(rightWrist);
          
          const angle = Math.atan2(wristCoords.y - elbowCoords.y, wristCoords.x - elbowCoords.x) * 180 / Math.PI;
          const distance = Math.sqrt(Math.pow(wristCoords.x - elbowCoords.x, 2) + Math.pow(wristCoords.y - elbowCoords.y, 2));
          
          connections.push(
            <View
              key="elbow-wrist"
              style={[
                styles.connectionLine,
                {
                  left: elbowCoords.x,
                  top: elbowCoords.y,
                  width: distance,
                  transform: [{ rotate: `${angle}deg` }],
                  backgroundColor: '#FF6B35',
                }
              ]}
            />
          );
        }
        
        return connections;
      })()}
    </View>
  );
}

// Shooting phase indicator component
export function ShootingPhaseIndicator({ poseData }) {
  if (!poseData || !poseData.summary) {
    return null;
  }

  const { shootingPhase, armAngle, elbowAngle } = poseData.summary;
  
  let phaseText = 'Setup';
  let phaseColor = '#FF6B35';
  
  if (shootingPhase > 0.8) {
    phaseText = 'Follow-through';
    phaseColor = '#00FF00';
  } else if (shootingPhase > 0.6) {
    phaseText = 'Release';
    phaseColor = '#FFFF00';
  } else if (shootingPhase > 0.3) {
    phaseText = 'Preparation';
    phaseColor = '#FFA500';
  }

  return (
    <View style={[styles.phaseIndicator, { backgroundColor: phaseColor }]}>
      <Text style={styles.phaseText}>{phaseText}</Text>
      <Text style={styles.angleText}>Arm: {armAngle?.toFixed(0)}° | Elbow: {elbowAngle?.toFixed(0)}°</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 1,
  },
  joint: {
    position: 'absolute',
    borderRadius: 50,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5,
  },
  connectionLine: {
    position: 'absolute',
    height: 3,
    borderRadius: 2,
    opacity: 0.8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 3,
  },
  phaseIndicator: {
    position: 'absolute',
    top: 50,
    left: 20,
    padding: 10,
    borderRadius: 8,
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5,
  },
  phaseText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  angleText: {
    color: '#FFFFFF',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 2,
  },
});

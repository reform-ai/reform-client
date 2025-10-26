/**
 * Input Validation for Basketball Form Analyzer
 * Validates all inputs before processing
 */

import { ValidationError } from '../errors/ErrorHandler.js';

export class InputValidator {
  /**
   * Validate pose data structure
   */
  static validatePoseData(poseData) {
    if (!poseData) {
      throw new ValidationError('Pose data is required', 'poseData');
    }

    if (!poseData.keypoints || !Array.isArray(poseData.keypoints)) {
      throw new ValidationError('Pose data must contain keypoints array', 'poseData.keypoints');
    }

    if (poseData.keypoints.length === 0) {
      throw new ValidationError('Pose data must contain at least one keypoint', 'poseData.keypoints');
    }

    // Validate each keypoint
    poseData.keypoints.forEach((keypoint, index) => {
      this.validateKeypoint(keypoint, index);
    });

    return true;
  }

  /**
   * Validate individual keypoint
   */
  static validateKeypoint(keypoint, index) {
    if (!keypoint) {
      throw new ValidationError(`Keypoint at index ${index} is required`, `keypoint[${index}]`);
    }

    if (!keypoint.name || typeof keypoint.name !== 'string') {
      throw new ValidationError(`Keypoint at index ${index} must have a valid name`, `keypoint[${index}].name`);
    }

    if (typeof keypoint.x !== 'number' || keypoint.x < 0 || keypoint.x > 1) {
      throw new ValidationError(`Keypoint at index ${index} must have valid x coordinate (0-1)`, `keypoint[${index}].x`);
    }

    if (typeof keypoint.y !== 'number' || keypoint.y < 0 || keypoint.y > 1) {
      throw new ValidationError(`Keypoint at index ${index} must have valid y coordinate (0-1)`, `keypoint[${index}].y`);
    }

    if (typeof keypoint.confidence !== 'number' || keypoint.confidence < 0 || keypoint.confidence > 1) {
      throw new ValidationError(`Keypoint at index ${index} must have valid confidence (0-1)`, `keypoint[${index}].confidence`);
    }
  }

  /**
   * Validate movement data
   */
  static validateMovementData(movementData) {
    if (!movementData) {
      throw new ValidationError('Movement data is required', 'movementData');
    }

    if (typeof movementData.intensity !== 'number' || movementData.intensity < 0) {
      throw new ValidationError('Movement intensity must be a non-negative number', 'movementData.intensity');
    }

    if (typeof movementData.direction !== 'string') {
      throw new ValidationError('Movement direction must be a string', 'movementData.direction');
    }

    if (typeof movementData.timestamp !== 'number' || movementData.timestamp <= 0) {
      throw new ValidationError('Movement timestamp must be a positive number', 'movementData.timestamp');
    }

    return true;
  }

  /**
   * Validate LLM configuration
   */
  static validateLLMConfig(config) {
    if (!config) {
      throw new ValidationError('LLM configuration is required', 'config');
    }

    if (!config.apiKey || typeof config.apiKey !== 'string') {
      throw new ValidationError('LLM API key is required', 'config.apiKey');
    }

    if (!config.model || typeof config.model !== 'string') {
      throw new ValidationError('LLM model is required', 'config.model');
    }

    if (config.maxTokens && (typeof config.maxTokens !== 'number' || config.maxTokens <= 0)) {
      throw new ValidationError('Max tokens must be a positive number', 'config.maxTokens');
    }

    if (config.temperature && (typeof config.temperature !== 'number' || config.temperature < 0 || config.temperature > 2)) {
      throw new ValidationError('Temperature must be between 0 and 2', 'config.temperature');
    }

    return true;
  }

  /**
   * Validate audio configuration
   */
  static validateAudioConfig(config) {
    if (!config) {
      throw new ValidationError('Audio configuration is required', 'config');
    }

    if (typeof config.volume !== 'number' || config.volume < 0 || config.volume > 1) {
      throw new ValidationError('Audio volume must be between 0 and 1', 'config.volume');
    }

    if (typeof config.rate !== 'number' || config.rate <= 0 || config.rate > 3) {
      throw new ValidationError('Audio rate must be between 0 and 3', 'config.rate');
    }

    if (typeof config.pitch !== 'number' || config.pitch < 0 || config.pitch > 2) {
      throw new ValidationError('Audio pitch must be between 0 and 2', 'config.pitch');
    }

    return true;
  }

  /**
   * Validate camera dimensions
   */
  static validateCameraDimensions(dimensions) {
    if (!dimensions) {
      throw new ValidationError('Camera dimensions are required', 'dimensions');
    }

    if (typeof dimensions.width !== 'number' || dimensions.width <= 0) {
      throw new ValidationError('Camera width must be a positive number', 'dimensions.width');
    }

    if (typeof dimensions.height !== 'number' || dimensions.height <= 0) {
      throw new ValidationError('Camera height must be a positive number', 'dimensions.height');
    }

    return true;
  }

  /**
   * Validate shooting technique data
   */
  static validateShootingTechniqueData(data) {
    if (!data) {
      throw new ValidationError('Shooting technique data is required', 'data');
    }

    if (typeof data.techniqueScore !== 'number' || data.techniqueScore < 0 || data.techniqueScore > 100) {
      throw new ValidationError('Technique score must be between 0 and 100', 'data.techniqueScore');
    }

    if (!data.armPosition || typeof data.armPosition !== 'string') {
      throw new ValidationError('Arm position is required', 'data.armPosition');
    }

    if (!data.elbowAngle || typeof data.elbowAngle !== 'string') {
      throw new ValidationError('Elbow angle is required', 'data.elbowAngle');
    }

    if (!Array.isArray(data.feedback)) {
      throw new ValidationError('Feedback must be an array', 'data.feedback');
    }

    if (!Array.isArray(data.recommendations)) {
      throw new ValidationError('Recommendations must be an array', 'data.recommendations');
    }

    return true;
  }

  /**
   * Sanitize string input
   */
  static sanitizeString(input, fieldName) {
    if (typeof input !== 'string') {
      throw new ValidationError(`${fieldName} must be a string`, fieldName);
    }

    return input.trim().replace(/[<>]/g, '');
  }

  /**
   * Validate email format
   */
  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ValidationError('Invalid email format', 'email');
    }
    return true;
  }

  /**
   * Validate URL format
   */
  static validateURL(url) {
    try {
      new URL(url);
      return true;
    } catch {
      throw new ValidationError('Invalid URL format', 'url');
    }
  }
}

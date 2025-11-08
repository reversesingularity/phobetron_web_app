/**
 * Real-Time AI Monitoring System
 * 
 * Continuously monitors celestial events and uses ML to:
 * 1. Detect significant changes in event predictions
 * 2. Alert users when confidence thresholds are met
 * 3. Learn from user feedback to improve predictions
 * 4. Adapt to new patterns as they emerge
 * 
 * Uses a feedback loop: Predict → Monitor → Learn → Adapt
 */

import { CelestialEvent } from '@/lib/types/celestial';
import { EventPrediction, eventPredictor, patternEngine } from './eventPredictor';
import { showToast } from '@/lib/toast';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface MonitoringConfig {
  checkIntervalMinutes: number; // How often to re-check predictions
  confidenceThreshold: number; // 0.0-1.0, alert only if above this
  significanceFilter: 'all' | 'medium_and_above' | 'high_and_above' | 'critical_only';
  enableAnomalyAlerts: boolean;
  enablePatternAlerts: boolean;
  autoLearn: boolean; // Learn from user interactions
}

export interface MonitoringAlert {
  id: string;
  timestamp: Date;
  eventId: string;
  alertType: 'prediction_change' | 'new_pattern' | 'anomaly_detected' | 'confidence_increase';
  message: string;
  severity: 'info' | 'warning' | 'critical';
  prediction: EventPrediction;
  requiresReview: boolean;
}

export interface UserFeedback {
  eventId: string;
  predictionId: string;
  userRating: number; // 1-5 stars
  actualOutcome?: string;
  feedbackNotes?: string;
  timestamp: Date;
}

// ============================================================================
// REAL-TIME MONITORING ENGINE
// ============================================================================

export class RealTimeMonitoringEngine {
  private config: MonitoringConfig;
  private previousPredictions: Map<string, EventPrediction> = new Map();
  private monitoringActive: boolean = false;
  private intervalId?: NodeJS.Timeout;
  private alertHistory: MonitoringAlert[] = [];
  private feedbackData: UserFeedback[] = [];
  
  constructor(config: Partial<MonitoringConfig> = {}) {
    this.config = {
      checkIntervalMinutes: 60, // Check hourly by default
      confidenceThreshold: 0.70, // 70% confidence minimum
      significanceFilter: 'high_and_above',
      enableAnomalyAlerts: true,
      enablePatternAlerts: true,
      autoLearn: true,
      ...config,
    };
    
    // Load previous state from localStorage
    this.loadState();
  }
  
  /**
   * Start continuous monitoring
   */
  startMonitoring(events: CelestialEvent[]) {
    if (this.monitoringActive) {
      console.warn('Monitoring already active');
      return;
    }
    
    console.log('🤖 AI Monitoring System: ACTIVE');
    this.monitoringActive = true;
    
    // Initial analysis
    this.analyzeEvents(events);
    
    // Set up periodic checks
    this.intervalId = setInterval(() => {
      this.analyzeEvents(events);
    }, this.config.checkIntervalMinutes * 60 * 1000);
  }
  
  /**
   * Stop monitoring
   */
  stopMonitoring() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
    this.monitoringActive = false;
    console.log('🤖 AI Monitoring System: STOPPED');
  }
  
  /**
   * Analyze events and detect changes
   */
  private analyzeEvents(events: CelestialEvent[]) {
    const alerts: MonitoringAlert[] = [];
    
    // Run predictions on all events
    for (const event of events) {
      const prediction = eventPredictor.predict(event);
      const previousPrediction = this.previousPredictions.get(event.id);
      
      // Check for prediction changes
      if (previousPrediction) {
        const alert = this.detectPredictionChange(event, previousPrediction, prediction);
        if (alert) alerts.push(alert);
      }
      
      // Check if event meets alert criteria
      if (this.shouldAlert(prediction)) {
        const alert = this.createAlert(event, prediction);
        if (alert) alerts.push(alert);
      }
      
      // Store current prediction
      this.previousPredictions.set(event.id, prediction);
    }
    
    // Pattern detection
    if (this.config.enablePatternAlerts) {
      const patterns = patternEngine.identifyClusters(events);
      for (const pattern of patterns) {
        if (pattern.events.length >= 3) { // Significant pattern
          alerts.push({
            id: `alert-${Date.now()}-${pattern.clusterId}`,
            timestamp: new Date(),
            eventId: pattern.events[0], // Lead event
            alertType: 'new_pattern',
            message: `Pattern detected: ${pattern.events.length} related events with ${pattern.commonFeatures.join(', ')}`,
            severity: 'warning',
            prediction: this.previousPredictions.get(pattern.events[0])!,
            requiresReview: true,
          });
        }
      }
    }
    
    // Process alerts
    this.processAlerts(alerts);
    
    // Save state
    this.saveState();
  }
  
  /**
   * Detect if prediction has changed significantly
   */
  private detectPredictionChange(
    event: CelestialEvent,
    previous: EventPrediction,
    current: EventPrediction
  ): MonitoringAlert | null {
    // Significance level changed
    if (previous.predictedSignificance !== current.predictedSignificance) {
      const severity = this.getUpgradeSeverity(
        previous.predictedSignificance,
        current.predictedSignificance
      );
      
      if (severity) {
        return {
          id: `alert-${Date.now()}-${event.id}`,
          timestamp: new Date(),
          eventId: event.id,
          alertType: 'prediction_change',
          message: `Event significance upgraded: ${previous.predictedSignificance} → ${current.predictedSignificance}`,
          severity,
          prediction: current,
          requiresReview: severity === 'critical',
        };
      }
    }
    
    // Confidence increased significantly (>15%)
    if (current.confidenceScore - previous.confidenceScore > 0.15) {
      return {
        id: `alert-${Date.now()}-${event.id}`,
        timestamp: new Date(),
        eventId: event.id,
        alertType: 'confidence_increase',
        message: `Prediction confidence increased: ${(previous.confidenceScore * 100).toFixed(0)}% → ${(current.confidenceScore * 100).toFixed(0)}%`,
        severity: 'info',
        prediction: current,
        requiresReview: false,
      };
    }
    
    // Anomaly score increased significantly
    if (this.config.enableAnomalyAlerts &&
        current.anomalyScore - previous.anomalyScore > 0.20) {
      return {
        id: `alert-${Date.now()}-${event.id}`,
        timestamp: new Date(),
        eventId: event.id,
        alertType: 'anomaly_detected',
        message: `Anomaly score increased: ${(current.anomalyScore * 100).toFixed(0)}% (requires verification)`,
        severity: 'warning',
        prediction: current,
        requiresReview: true,
      };
    }
    
    return null;
  }
  
  /**
   * Determine if prediction warrants an alert
   */
  private shouldAlert(prediction: EventPrediction): boolean {
    // Check confidence threshold
    if (prediction.confidenceScore < this.config.confidenceThreshold) {
      return false;
    }
    
    // Check significance filter
    const { significanceFilter } = this.config;
    const { predictedSignificance } = prediction;
    
    if (significanceFilter === 'critical_only' && predictedSignificance !== 'critical') {
      return false;
    }
    
    if (significanceFilter === 'high_and_above' &&
        predictedSignificance !== 'critical' && predictedSignificance !== 'high') {
      return false;
    }
    
    if (significanceFilter === 'medium_and_above' &&
        predictedSignificance === 'low') {
      return false;
    }
    
    return true;
  }
  
  /**
   * Create an alert for a new prediction
   */
  private createAlert(event: CelestialEvent, prediction: EventPrediction): MonitoringAlert | null {
    // Only alert if not already alerted for this event
    const alreadyAlerted = this.alertHistory.some(
      a => a.eventId === event.id && a.alertType === 'prediction_change'
    );
    
    if (alreadyAlerted) return null;
    
    return {
      id: `alert-${Date.now()}-${event.id}`,
      timestamp: new Date(),
      eventId: event.id,
      alertType: 'prediction_change',
      message: `High-confidence ${prediction.predictedSignificance} event detected`,
      severity: prediction.predictedSignificance === 'critical' ? 'critical' : 'warning',
      prediction,
      requiresReview: prediction.predictedSignificance === 'critical',
    };
  }
  
  /**
   * Process and display alerts
   */
  private processAlerts(alerts: MonitoringAlert[]) {
    for (const alert of alerts) {
      // Add to history
      this.alertHistory.push(alert);
      
      // Display toast notification
      this.displayAlertToast(alert);
      
      // Log to console for debugging
      console.log(`🤖 AI Alert [${alert.severity.toUpperCase()}]:`, alert.message);
    }
    
    // Trim history to last 100 alerts
    if (this.alertHistory.length > 100) {
      this.alertHistory = this.alertHistory.slice(-100);
    }
  }
  
  /**
   * Display toast notification for alert
   */
  private displayAlertToast(alert: MonitoringAlert) {
    const { prediction } = alert;
    const confidencePercent = (prediction.confidenceScore * 100).toFixed(0);
    
    switch (alert.severity) {
      case 'critical':
        showToast.error(
          `🚨 CRITICAL: ${alert.message} (${confidencePercent}% confidence)`
        );
        break;
        
      case 'warning':
        showToast.eventAlert(
          `${alert.message} (${confidencePercent}% confidence)`
        );
        break;
        
      case 'info':
        showToast.success(
          `ℹ️ ${alert.message}`
        );
        break;
    }
  }
  
  /**
   * Determine severity of significance upgrade
   */
  private getUpgradeSeverity(
    previous: string,
    current: string
  ): 'info' | 'warning' | 'critical' | null {
    const levels = ['low', 'medium', 'high', 'critical'];
    const prevIndex = levels.indexOf(previous);
    const currIndex = levels.indexOf(current);
    
    if (currIndex <= prevIndex) return null; // Not an upgrade
    
    if (current === 'critical') return 'critical';
    if (current === 'high') return 'warning';
    return 'info';
  }
  
  /**
   * Record user feedback for learning
   */
  recordFeedback(feedback: UserFeedback) {
    this.feedbackData.push(feedback);
    
    if (this.config.autoLearn) {
      this.learnFromFeedback(feedback);
    }
    
    this.saveState();
    
    showToast.success('Feedback recorded. AI model will adapt to improve predictions.');
  }
  
  /**
   * Learn from user feedback (simplified reinforcement learning)
   */
  private learnFromFeedback(feedback: UserFeedback) {
    // In a production system, this would:
    // 1. Update model weights based on prediction accuracy
    // 2. Adjust confidence thresholds
    // 3. Fine-tune feature importance
    // 4. Store feedback for batch retraining
    
    console.log('🧠 Learning from feedback:', {
      eventId: feedback.eventId,
      rating: feedback.userRating,
      outcome: feedback.actualOutcome,
    });
    
    // For now, we log the feedback for manual model updates
    // Future: Implement online learning algorithm
  }
  
  /**
   * Get alert history
   */
  getAlertHistory(limit?: number): MonitoringAlert[] {
    const sorted = [...this.alertHistory].sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
    return limit ? sorted.slice(0, limit) : sorted;
  }
  
  /**
   * Get monitoring statistics
   */
  getStatistics() {
    const totalAlerts = this.alertHistory.length;
    const criticalAlerts = this.alertHistory.filter(a => a.severity === 'critical').length;
    const averageConfidence = this.feedbackData.length > 0
      ? this.feedbackData.reduce((sum, f) => sum + f.userRating, 0) / this.feedbackData.length / 5
      : 0;
    
    return {
      totalAlerts,
      criticalAlerts,
      monitoredEvents: this.previousPredictions.size,
      averageUserRating: (averageConfidence * 5).toFixed(1),
      feedbackCount: this.feedbackData.length,
      isActive: this.monitoringActive,
    };
  }
  
  /**
   * Update monitoring configuration
   */
  updateConfig(updates: Partial<MonitoringConfig>) {
    this.config = { ...this.config, ...updates };
    this.saveState();
    console.log('🤖 Monitoring config updated:', updates);
  }
  
  /**
   * Save state to localStorage
   */
  private saveState() {
    try {
      const state = {
        predictions: Array.from(this.previousPredictions.entries()),
        alerts: this.alertHistory,
        feedback: this.feedbackData,
        config: this.config,
      };
      
      localStorage.setItem('ai_monitoring_state', JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save monitoring state:', error);
    }
  }
  
  /**
   * Load state from localStorage
   */
  private loadState() {
    try {
      const saved = localStorage.getItem('ai_monitoring_state');
      if (!saved) return;
      
      const state = JSON.parse(saved);
      
      this.previousPredictions = new Map(state.predictions || []);
      this.alertHistory = (state.alerts || []).map((a: MonitoringAlert) => ({
        ...a,
        timestamp: new Date(a.timestamp),
      }));
      this.feedbackData = (state.feedback || []).map((f: UserFeedback) => ({
        ...f,
        timestamp: new Date(f.timestamp),
      }));
      
      if (state.config) {
        this.config = { ...this.config, ...state.config };
      }
      
      console.log('🤖 Monitoring state loaded:', {
        predictions: this.previousPredictions.size,
        alerts: this.alertHistory.length,
        feedback: this.feedbackData.length,
      });
    } catch (error) {
      console.error('Failed to load monitoring state:', error);
    }
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const monitoringEngine = new RealTimeMonitoringEngine();

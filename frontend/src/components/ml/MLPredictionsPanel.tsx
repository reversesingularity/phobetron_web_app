'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Badge, Button } from '@/components/catalyst';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { 
  CpuChipIcon, 
  ExclamationTriangleIcon,
  ClockIcon,
  ChartBarIcon,
  SparklesIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { mlAPI, MultiHorizonForecast, AnomalyDetection } from '@/lib/api/mlClient';
import { showToast } from '@/lib/toast';

interface MLPredictionsPanelProps {
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
}

export default function MLPredictionsPanel({ 
  autoRefresh = true, 
  refreshInterval = 300000 // 5 minutes default
}: MLPredictionsPanelProps) {
  const [forecast, setForecast] = useState<MultiHorizonForecast | null>(null);
  const [anomalies, setAnomalies] = useState<AnomalyDetection | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchPredictions = async () => {
    setLoading(true);
    try {
      // Fetch multi-horizon forecast
      const forecastData = await mlAPI.getMultiHorizonForecast();
      setForecast(forecastData);

      // Fetch anomaly detection status
      // Using current celestial state as input
      const anomalyData = await mlAPI.detectAnomalies({
        correlation_score: 0.6,
        eclipse_count: 2,
        alignment_count: 3,
        earthquake_magnitude: 5.0,
        solar_activity: 400,
        moon_distance_normalized: 1.0 // Normalized to average lunar distance
      });
      setAnomalies(anomalyData);

      setLastUpdated(new Date());
      showToast.success('🤖 ML predictions updated');
    } catch (error) {
      console.error('Error fetching ML predictions:', error);
      showToast.error('Failed to fetch ML predictions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPredictions();

    if (autoRefresh) {
      const interval = setInterval(fetchPredictions, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel?.toLowerCase()) {
      case 'critical': return 'text-red-600 bg-red-100 dark:bg-red-950';
      case 'high': return 'text-orange-600 bg-orange-100 dark:bg-orange-950';
      case 'moderate': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-950';
      case 'low': return 'text-blue-600 bg-blue-100 dark:bg-blue-950';
      case 'minimal': return 'text-green-600 bg-green-100 dark:bg-green-950';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading && !forecast) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-3">
            <ArrowPathIcon className="h-6 w-6 animate-spin text-indigo-600" />
            <span className="text-gray-600 dark:text-gray-400">Loading ML predictions...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with refresh button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <CpuChipIcon className="h-6 w-6 text-indigo-600" />
          <h3 className="text-lg font-semibold text-gray-200 dark:text-white">
            ML Predictions Engine
          </h3>
        </div>
        <div className="flex items-center space-x-3">
          {lastUpdated && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <Button
            onClick={fetchPredictions}
            disabled={loading}
            className="flex items-center space-x-1 text-sm"
          >
            <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Anomaly Detection Status */}
      {anomalies && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className={`border-l-4 ${
            anomalies.is_anomaly 
              ? 'border-l-red-500 bg-red-50/50 dark:bg-red-200/20' 
              : 'border-l-green-500 bg-green-50/50 dark:bg-green-200/20'
          }`}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2 text-gray-200 dark:text-white">
                    {anomalies.is_anomaly ? (
                      <ExclamationTriangleIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
                    ) : (
                      <SparklesIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                    )}
                    <span>Anomaly Detection</span>
                  </CardTitle>
                  <CardDescription className="text-gray-200 dark:text-gray-300">
                    {anomalies.is_anomaly 
                      ? 'Unusual patterns detected' 
                      : 'Normal celestial patterns'}
                  </CardDescription>
                </div>
                <Badge className={getRiskColor(anomalies.severity)}>
                  {anomalies.severity}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-200">Anomaly Score</span>
                  <span className="text-lg font-semibold text-white">{(anomalies.anomaly_score * 100).toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-200">Confidence</span>
                  <span className="text-lg font-semibold text-white">{(anomalies.confidence * 100).toFixed(1)}%</span>
                </div>
                {anomalies.detected_patterns && anomalies.detected_patterns.length > 0 && (
                  <div className="pt-2">
                    <p className="text-sm font-medium text-white mb-2">
                      Detected Patterns:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {anomalies.detected_patterns.map((pattern, index) => (
                        <Badge key={index} className="text-xs bg-purple-500/30 text-purple-200 border border-purple-400/50">
                          {pattern}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Multi-Horizon Forecast */}
      {forecast && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="space-y-4"
        >
          <h4 className="text-md font-semibold text-white flex items-center space-x-2">
            <ChartBarIcon className="h-5 w-5 text-indigo-400" />
            <span>Seismic Forecast Horizons</span>
          </h4>

          {/* 7-Day Forecast */}
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base text-gray-200 dark:text-white">7-Day Outlook</CardTitle>
                <Badge className={getRiskColor(forecast.horizon_7_days.predicted_magnitude_range[1] > 5.0 ? 'high' : 'low')}>
                  {forecast.horizon_7_days.predicted_magnitude_range[0]}-{forecast.horizon_7_days.predicted_magnitude_range[1]}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-200">Major Event Probability</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 h-2 bg-gray-200 dark:bg-gray-300 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-linear-to-r from-blue-500 to-indigo-600 rounded-full"
                        style={{ width: `${forecast.horizon_7_days.probability_major_event * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-white">
                      {(forecast.horizon_7_days.probability_major_event * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-200">Confidence</span>
                  <span className="text-sm font-semibold text-white">{(forecast.horizon_7_days.confidence * 100).toFixed(0)}%</span>
                </div>
                {forecast.horizon_7_days.peak_risk_date && (
                  <div className="flex items-center space-x-2 pt-2 border-t border-gray-200 dark:border-gray-300">
                    <ClockIcon className="h-4 w-4 text-orange-400" />
                    <span className="text-sm text-white">
                      Peak Risk: <strong>{formatDate(forecast.horizon_7_days.peak_risk_date)}</strong>
                    </span>
                  </div>
                )}
                {forecast.horizon_7_days.key_factors && forecast.horizon_7_days.key_factors.length > 0 && (
                  <div className="pt-2">
                    <p className="text-xs font-medium text-white mb-2">Key Factors:</p>
                    <div className="flex flex-wrap gap-1">
                      {forecast.horizon_7_days.key_factors.slice(0, 3).map((factor, index) => (
                        <Badge key={index} className="text-xs bg-indigo-500/30 text-indigo-200 border border-indigo-400/50">
                          {factor}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 14-Day Forecast */}
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base text-gray-300 dark:text-white">14-Day Outlook</CardTitle>
                <Badge className={getRiskColor(forecast.horizon_14_days.predicted_magnitude_range[1] > 5.0 ? 'moderate' : 'low')}>
                  {forecast.horizon_14_days.predicted_magnitude_range[0]}-{forecast.horizon_14_days.predicted_magnitude_range[1]}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-200">Major Event Probability</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 h-2 bg-gray-200 dark:bg-gray-300 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-linear-to-r from-green-500 to-teal-600 rounded-full"
                        style={{ width: `${forecast.horizon_14_days.probability_major_event * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-white">
                      {(forecast.horizon_14_days.probability_major_event * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-200">Confidence</span>
                  <span className="text-sm font-semibold text-white">{(forecast.horizon_14_days.confidence * 100).toFixed(0)}%</span>
                </div>
                {forecast.horizon_14_days.peak_risk_date && (
                  <div className="flex items-center space-x-2 pt-2 border-t border-gray-200 dark:border-gray-300">
                    <ClockIcon className="h-4 w-4 text-yellow-400" />
                    <span className="text-sm text-white">
                      Peak Risk: <strong>{formatDate(forecast.horizon_14_days.peak_risk_date)}</strong>
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 30-Day Forecast */}
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base text-gray-200 dark:text-white">30-Day Outlook</CardTitle>
                <Badge className={getRiskColor(forecast.horizon_30_days.predicted_magnitude_range[1] > 6.0 ? 'moderate' : 'low')}>
                  {forecast.horizon_30_days.predicted_magnitude_range[0]}-{forecast.horizon_30_days.predicted_magnitude_range[1]}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-200">Major Event Probability</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 h-2 bg-gray-200 dark:bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-linear-to-r from-purple-500 to-pink-600 rounded-full"
                        style={{ width: `${forecast.horizon_30_days.probability_major_event * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-white">
                      {(forecast.horizon_30_days.probability_major_event * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-200">Confidence</span>
                  <span className="text-sm font-semibold text-white">{(forecast.horizon_30_days.confidence * 100).toFixed(0)}%</span>
                </div>
                {forecast.horizon_30_days.peak_risk_date && (
                  <div className="flex items-center space-x-2 pt-2 border-t border-gray-200 dark:border-gray-200">
                    <ClockIcon className="h-4 w-4 text-red-400" />
                    <span className="text-sm text-white">
                      Peak Risk: <strong>{formatDate(forecast.horizon_30_days.peak_risk_date)}</strong>
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Overall Risk Assessment */}
          {forecast.overall_risk_assessment && (
            <Card className="bg-linear-to-br from-indigo-100 to-purple-100 dark:from-indigo-700/30 dark:to-purple-900/30 border-indigo-700 dark:border-indigo-950">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <SparklesIcon className="h-5 w-5 text-indigo-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray">Overall Risk Assessment</p>
                    <p className="text-sm text-gray-700 mt-1">
                      {forecast.overall_risk_assessment}
                    </p>
                    {forecast.confidence_trend && (
                      <p className="text-xs text-gray-700 mt-2">
                        Confidence Trend: <strong className="text-gray">{forecast.confidence_trend}</strong>
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}
    </div>
  );
}

#!/usr/bin/env python3
"""
Comprehensive ML Model Training for Pattern Detection
==================================================

Trains multiple ML models for celestial-terrestrial event correlation:
1. Isolation Forest - Anomaly detection
2. Random Forest - Event type prediction
3. Correlation matrices - Heatmap visualization
4. Statistical tests - Chi-square, ANOVA
5. Time-series models - LSTM/ARIMA (future)

Date Range: 1900 - Future (maximum historical training data)

Usage:
    python scripts/train_ml_models_comprehensive.py
"""

import sys
import os
from pathlib import Path

# Add project root to path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Any
import pickle
import logging
from sklearn.ensemble import IsolationForest, RandomForestClassifier
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import classification_report, confusion_matrix
from scipy import stats
import warnings
warnings.filterwarnings('ignore')

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class ComprehensiveMLTrainer:
    """Train all ML models for pattern detection"""
    
    def __init__(self, db_session):
        self.db = db_session
        self.models = {}
        self.scalers = {}
        self.encoders = {}
        self.statistics = {}
        
        # Model save directory
        self.model_dir = project_root / 'app' / 'ml' / 'trained_models'
        self.model_dir.mkdir(parents=True, exist_ok=True)
        
        logger.info(f"Model directory: {self.model_dir}")
    
    def fetch_historical_data(self, start_year: int = 1900, end_year: int = 2100) -> pd.DataFrame:
        """
        Fetch all historical data from 1900 to future for maximum training data
        
        Returns DataFrame with columns:
        - date, feast_day, feast_type, earthquake_count, earthquake_max_magnitude,
        - volcanic_count, volcanic_max_vei, hurricane_count, hurricane_max_category,
        - tsunami_count, eclipse_count, is_high_correlation_event
        """
        from sqlalchemy import text
        
        logger.info(f"Fetching historical data from {start_year} to {end_year}...")
        
        start_date = f"{start_year}-01-01"
        end_date = f"{end_year}-12-31"
        
        # Fetch feast days
        feast_query = """
        SELECT id, name, gregorian_date, feast_type, significance
        FROM feast_days
        WHERE gregorian_date BETWEEN :start_date AND :end_date
        ORDER BY gregorian_date
        """
        feast_result = self.db.execute(text(feast_query), {"start_date": start_date, "end_date": end_date})
        feast_days = [dict(row._mapping) for row in feast_result]
        logger.info(f"  ✓ {len(feast_days)} feast days")
        
        # Fetch all events
        eq_query = """
        SELECT event_time, magnitude, depth_km, region
        FROM earthquakes
        WHERE event_time BETWEEN :start_date AND :end_date
        """
        eq_result = self.db.execute(text(eq_query), {"start_date": start_date, "end_date": end_date})
        earthquakes = [dict(row._mapping) for row in eq_result]
        logger.info(f"  ✓ {len(earthquakes)} earthquakes")
        
        vol_query = """
        SELECT eruption_start, vei, volcano_name
        FROM volcanic_activity
        WHERE eruption_start BETWEEN :start_date AND :end_date
        """
        vol_result = self.db.execute(text(vol_query), {"start_date": start_date, "end_date": end_date})
        volcanic = [dict(row._mapping) for row in vol_result]
        logger.info(f"  ✓ {len(volcanic)} volcanic events")
        
        hur_query = """
        SELECT formation_date, category, storm_name
        FROM hurricanes
        WHERE formation_date BETWEEN :start_date AND :end_date
        """
        hur_result = self.db.execute(text(hur_query), {"start_date": start_date, "end_date": end_date})
        hurricanes = [dict(row._mapping) for row in hur_result]
        logger.info(f"  ✓ {len(hurricanes)} hurricanes")
        
        tsu_query = """
        SELECT event_date, max_wave_height_m, source_type
        FROM tsunamis
        WHERE event_date BETWEEN :start_date AND :end_date
        """
        tsu_result = self.db.execute(text(tsu_query), {"start_date": start_date, "end_date": end_date})
        tsunamis = [dict(row._mapping) for row in tsu_result]
        logger.info(f"  ✓ {len(tsunamis)} tsunamis")
        
        # Build feature matrix
        logger.info("Building feature matrix...")
        data_rows = []
        
        for feast in feast_days:
            feast_date = datetime.fromisoformat(str(feast['gregorian_date']))
            window_start = feast_date - timedelta(days=7)
            window_end = feast_date + timedelta(days=7)
            
            # Count events in ±7 day window
            eq_in_window = [
                eq for eq in earthquakes
                if window_start <= datetime.fromisoformat(str(eq['event_time'])) <= window_end
            ]
            vol_in_window = [
                vol for vol in volcanic
                if window_start <= datetime.fromisoformat(str(vol['eruption_start'])) <= window_end
            ]
            hur_in_window = [
                hur for hur in hurricanes
                if window_start <= datetime.fromisoformat(str(hur['formation_date'])) <= window_end
            ]
            tsu_in_window = [
                tsu for tsu in tsunamis
                if window_start <= datetime.fromisoformat(str(tsu['event_date'])) <= window_end
            ]
            
            # Calculate features
            earthquake_count = len(eq_in_window)
            earthquake_max_mag = max([eq['magnitude'] for eq in eq_in_window], default=0)
            
            volcanic_count = len(vol_in_window)
            volcanic_max_vei = max([vol['vei'] for vol in vol_in_window if vol['vei']], default=0)
            
            hurricane_count = len(hur_in_window)
            hurricane_max_cat = max([hur['category'] for hur in hur_in_window if hur['category']], default=0)
            
            tsunami_count = len(tsu_in_window)
            
            total_events = earthquake_count + volcanic_count + hurricane_count + tsunami_count
            
            # Label as high correlation if multiple significant events occurred
            is_high_correlation = (
                (earthquake_count >= 2 and earthquake_max_mag >= 5.0) or
                (volcanic_count >= 1 and volcanic_max_vei >= 4) or
                (hurricane_count >= 1 and hurricane_max_cat >= 4) or
                (tsunami_count >= 1) or
                (total_events >= 3)
            )
            
            # Determine dominant event type
            event_counts = {
                'earthquake': earthquake_count,
                'volcanic': volcanic_count,
                'hurricane': hurricane_count,
                'tsunami': tsunami_count,
                'none': 0
            }
            dominant_event_type = max(event_counts, key=event_counts.get) if total_events > 0 else 'none'
            
            data_rows.append({
                'date': feast_date,
                'feast_day': feast['name'],
                'feast_type': feast['feast_type'],
                'significance': feast.get('significance', 0),
                'earthquake_count': earthquake_count,
                'earthquake_max_magnitude': earthquake_max_mag,
                'volcanic_count': volcanic_count,
                'volcanic_max_vei': volcanic_max_vei,
                'hurricane_count': hurricane_count,
                'hurricane_max_category': hurricane_max_cat,
                'tsunami_count': tsunami_count,
                'total_events': total_events,
                'is_high_correlation': int(is_high_correlation),
                'dominant_event_type': dominant_event_type,
                'month': feast_date.month,
                'day_of_year': feast_date.timetuple().tm_yday,
                'season': self._get_season(feast_date.month)
            })
        
        df = pd.DataFrame(data_rows)
        logger.info(f"✓ Created dataset with {len(df)} rows, {len(df.columns)} features")
        logger.info(f"  High correlation events: {df['is_high_correlation'].sum()} ({df['is_high_correlation'].mean()*100:.1f}%)")
        
        return df
    
    def _get_season(self, month: int) -> str:
        """Get season from month (Northern Hemisphere)"""
        if month in [3, 4, 5]:
            return 'Spring'
        elif month in [6, 7, 8]:
            return 'Summer'
        elif month in [9, 10, 11]:
            return 'Fall'
        else:
            return 'Winter'
    
    def train_isolation_forest(self, df: pd.DataFrame) -> Dict[str, Any]:
        """
        Train Isolation Forest for anomaly detection
        
        Identifies feast days with unusually high event correlation
        """
        logger.info("\n=== Training Isolation Forest (Anomaly Detection) ===")
        
        # Select features for anomaly detection
        feature_cols = [
            'earthquake_count', 'earthquake_max_magnitude',
            'volcanic_count', 'volcanic_max_vei',
            'hurricane_count', 'hurricane_max_category',
            'tsunami_count', 'total_events',
            'month'  # Removed 'significance' as it's text-based
        ]
        
        X = df[feature_cols].fillna(0)
        
        # Scale features
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)
        
        # Train Isolation Forest
        # contamination = expected proportion of outliers
        contamination = df['is_high_correlation'].mean()
        
        iso_forest = IsolationForest(
            contamination=contamination,
            random_state=42,
            n_estimators=100,
            max_samples='auto'
        )
        
        iso_forest.fit(X_scaled)
        
        # Predict anomalies
        predictions = iso_forest.predict(X_scaled)
        anomaly_scores = iso_forest.score_samples(X_scaled)
        
        # -1 = anomaly, 1 = normal
        anomaly_count = (predictions == -1).sum()
        
        logger.info(f"  ✓ Model trained on {len(X)} samples")
        logger.info(f"  ✓ Detected {anomaly_count} anomalies ({anomaly_count/len(X)*100:.1f}%)")
        logger.info(f"  ✓ Contamination rate: {contamination:.3f}")
        
        # Save model
        model_path = self.model_dir / 'isolation_forest.pkl'
        with open(model_path, 'wb') as f:
            pickle.dump(iso_forest, f)
        logger.info(f"  ✓ Saved to {model_path}")
        
        scaler_path = self.model_dir / 'isolation_forest_scaler.pkl'
        with open(scaler_path, 'wb') as f:
            pickle.dump(scaler, f)
        
        self.models['isolation_forest'] = iso_forest
        self.scalers['isolation_forest'] = scaler
        
        return {
            'model': iso_forest,
            'scaler': scaler,
            'feature_cols': feature_cols,
            'anomaly_count': int(anomaly_count),
            'contamination': float(contamination),
            'anomaly_scores': anomaly_scores.tolist()
        }
    
    def train_random_forest_classifier(self, df: pd.DataFrame) -> Dict[str, Any]:
        """
        Train Random Forest for event type prediction
        
        Predicts what type of event is most likely for future feast days
        """
        logger.info("\n=== Training Random Forest (Event Type Prediction) ===")
        
        # Filter to only feast days with events
        df_with_events = df[df['total_events'] > 0].copy()
        
        if len(df_with_events) < 10:
            logger.warning("  ⚠ Not enough training samples with events. Skipping Random Forest.")
            return None
        
        # Features
        feature_cols = [
            'feast_type', 'month', 'day_of_year', 'season',
            'earthquake_count', 'volcanic_count', 'hurricane_count', 'tsunami_count'
        ]
        
        # Encode categorical features
        feast_type_encoder = LabelEncoder()
        season_encoder = LabelEncoder()
        event_type_encoder = LabelEncoder()
        
        df_with_events['feast_type_encoded'] = feast_type_encoder.fit_transform(df_with_events['feast_type'])
        df_with_events['season_encoded'] = season_encoder.fit_transform(df_with_events['season'])
        df_with_events['dominant_event_encoded'] = event_type_encoder.fit_transform(df_with_events['dominant_event_type'])
        
        feature_cols_encoded = [
            'feast_type_encoded', 'month', 'day_of_year', 'season_encoded',
            'earthquake_count', 'volcanic_count', 'hurricane_count', 'tsunami_count'
        ]
        
        X = df_with_events[feature_cols_encoded].fillna(0)
        y = df_with_events['dominant_event_encoded']
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        # Train Random Forest
        rf_classifier = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            min_samples_split=5,
            random_state=42,
            class_weight='balanced'
        )
        
        rf_classifier.fit(X_train, y_train)
        
        # Evaluate
        train_score = rf_classifier.score(X_train, y_train)
        test_score = rf_classifier.score(X_test, y_test)
        
        # Cross-validation
        cv_scores = cross_val_score(rf_classifier, X, y, cv=5)
        
        # Feature importance
        feature_importance = dict(zip(
            feature_cols_encoded,
            rf_classifier.feature_importances_
        ))
        
        logger.info(f"  ✓ Model trained on {len(X_train)} samples, tested on {len(X_test)}")
        logger.info(f"  ✓ Train accuracy: {train_score:.3f}")
        logger.info(f"  ✓ Test accuracy: {test_score:.3f}")
        logger.info(f"  ✓ Cross-validation score: {cv_scores.mean():.3f} (+/- {cv_scores.std()*2:.3f})")
        logger.info(f"  ✓ Top features: {sorted(feature_importance.items(), key=lambda x: x[1], reverse=True)[:3]}")
        
        # Save model
        model_path = self.model_dir / 'random_forest_classifier.pkl'
        with open(model_path, 'wb') as f:
            pickle.dump(rf_classifier, f)
        logger.info(f"  ✓ Saved to {model_path}")
        
        # Save encoders
        encoders = {
            'feast_type': feast_type_encoder,
            'season': season_encoder,
            'event_type': event_type_encoder
        }
        encoder_path = self.model_dir / 'label_encoders.pkl'
        with open(encoder_path, 'wb') as f:
            pickle.dump(encoders, f)
        
        self.models['random_forest'] = rf_classifier
        self.encoders = encoders
        
        return {
            'model': rf_classifier,
            'encoders': encoders,
            'train_score': float(train_score),
            'test_score': float(test_score),
            'cv_scores': cv_scores.tolist(),
            'feature_importance': {k: float(v) for k, v in feature_importance.items()},
            'feature_cols': feature_cols_encoded
        }
    
    def compute_correlation_matrices(self, df: pd.DataFrame) -> Dict[str, Any]:
        """
        Compute correlation matrices for heatmap visualization
        
        Returns Pearson and Spearman correlation matrices
        """
        logger.info("\n=== Computing Correlation Matrices ===")
        
        # Select numeric columns
        numeric_cols = [
            'earthquake_count', 'earthquake_max_magnitude',
            'volcanic_count', 'volcanic_max_vei',
            'hurricane_count', 'hurricane_max_category',
            'tsunami_count', 'total_events',
            'is_high_correlation'  # Removed 'significance'
        ]
        
        df_numeric = df[numeric_cols].fillna(0)
        
        # Pearson correlation (linear relationships)
        pearson_corr = df_numeric.corr(method='pearson')
        
        # Spearman correlation (monotonic relationships)
        spearman_corr = df_numeric.corr(method='spearman')
        
        logger.info(f"  ✓ Computed Pearson correlation matrix ({pearson_corr.shape})")
        logger.info(f"  ✓ Computed Spearman correlation matrix ({spearman_corr.shape})")
        
        # Find strongest correlations with is_high_correlation
        target_corr_pearson = pearson_corr['is_high_correlation'].drop('is_high_correlation').sort_values(ascending=False)
        target_corr_spearman = spearman_corr['is_high_correlation'].drop('is_high_correlation').sort_values(ascending=False)
        
        logger.info(f"  ✓ Strongest Pearson correlations: {target_corr_pearson.head(3).to_dict()}")
        logger.info(f"  ✓ Strongest Spearman correlations: {target_corr_spearman.head(3).to_dict()}")
        
        # Save matrices
        matrices = {
            'pearson': pearson_corr.to_dict(),
            'spearman': spearman_corr.to_dict(),
            'columns': numeric_cols
        }
        
        matrix_path = self.model_dir / 'correlation_matrices.pkl'
        with open(matrix_path, 'wb') as f:
            pickle.dump(matrices, f)
        logger.info(f"  ✓ Saved to {matrix_path}")
        
        self.statistics['correlation_matrices'] = matrices
        
        return matrices
    
    def perform_statistical_tests(self, df: pd.DataFrame) -> Dict[str, Any]:
        """
        Perform statistical significance tests
        
        - Chi-square test: Independence between feast types and event occurrence
        - ANOVA: Difference in event counts across seasons
        - T-tests: Comparison of high vs low correlation groups
        """
        logger.info("\n=== Performing Statistical Tests ===")
        
        results = {}
        
        # 1. Chi-square test: Feast type vs High correlation
        if len(df['feast_type'].unique()) > 1:
            contingency_table = pd.crosstab(df['feast_type'], df['is_high_correlation'])
            chi2, p_value, dof, expected = stats.chi2_contingency(contingency_table)
            
            results['chi_square'] = {
                'statistic': float(chi2),
                'p_value': float(p_value),
                'degrees_of_freedom': int(dof),
                'is_significant': p_value < 0.05
            }
            logger.info(f"  ✓ Chi-square test: χ²={chi2:.3f}, p={p_value:.4f} (significant: {p_value < 0.05})")
        
        # 2. ANOVA: Event counts across seasons
        season_groups = [
            df[df['season'] == season]['total_events'].values
            for season in df['season'].unique()
        ]
        
        if len(season_groups) >= 2:
            f_stat, p_value_anova = stats.f_oneway(*season_groups)
            
            results['anova'] = {
                'f_statistic': float(f_stat),
                'p_value': float(p_value_anova),
                'is_significant': p_value_anova < 0.05
            }
            logger.info(f"  ✓ ANOVA (seasons): F={f_stat:.3f}, p={p_value_anova:.4f} (significant: {p_value_anova < 0.05})")
        
        # 3. T-test: High correlation vs normal
        high_corr_events = df[df['is_high_correlation'] == 1]['total_events']
        normal_events = df[df['is_high_correlation'] == 0]['total_events']
        
        if len(high_corr_events) > 0 and len(normal_events) > 0:
            t_stat, p_value_ttest = stats.ttest_ind(high_corr_events, normal_events)
            
            results['t_test'] = {
                't_statistic': float(t_stat),
                'p_value': float(p_value_ttest),
                'is_significant': p_value_ttest < 0.05,
                'high_corr_mean': float(high_corr_events.mean()),
                'normal_mean': float(normal_events.mean())
            }
            logger.info(f"  ✓ T-test: t={t_stat:.3f}, p={p_value_ttest:.4f} (significant: {p_value_ttest < 0.05})")
            logger.info(f"    High correlation mean: {high_corr_events.mean():.2f} events")
            logger.info(f"    Normal mean: {normal_events.mean():.2f} events")
        
        # Save results
        stats_path = self.model_dir / 'statistical_tests.pkl'
        with open(stats_path, 'wb') as f:
            pickle.dump(results, f)
        logger.info(f"  ✓ Saved to {stats_path}")
        
        self.statistics['tests'] = results
        
        return results
    
    def compute_seasonal_patterns(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Compute seasonal aggregation statistics"""
        logger.info("\n=== Computing Seasonal Patterns ===")
        
        seasonal_data = {}
        
        for season in ['Spring', 'Summer', 'Fall', 'Winter']:
            season_df = df[df['season'] == season]
            
            seasonal_data[season] = {
                'count': len(season_df),
                'avg_correlation': float(season_df['is_high_correlation'].mean()),
                'avg_total_events': float(season_df['total_events'].mean()),
                'avg_earthquake_count': float(season_df['earthquake_count'].mean()),
                'avg_volcanic_count': float(season_df['volcanic_count'].mean()),
                'avg_hurricane_count': float(season_df['hurricane_count'].mean()),
                'avg_tsunami_count': float(season_df['tsunami_count'].mean()),
                'high_correlation_count': int(season_df['is_high_correlation'].sum())
            }
            
            logger.info(f"  ✓ {season}: {len(season_df)} feast days, {season_df['is_high_correlation'].mean()*100:.1f}% high correlation")
        
        # Save seasonal patterns
        seasonal_path = self.model_dir / 'seasonal_patterns.pkl'
        with open(seasonal_path, 'wb') as f:
            pickle.dump(seasonal_data, f)
        logger.info(f"  ✓ Saved to {seasonal_path}")
        
        self.statistics['seasonal_patterns'] = seasonal_data
        
        return seasonal_data
    
    def generate_training_summary(self) -> Dict[str, Any]:
        """Generate comprehensive training summary"""
        summary = {
            'training_date': datetime.now().isoformat(),
            'models_trained': list(self.models.keys()),
            'statistics_computed': list(self.statistics.keys()),
            'model_directory': str(self.model_dir),
            'performance_metrics': {}
        }
        
        # Save summary
        summary_path = self.model_dir / 'training_summary.pkl'
        with open(summary_path, 'wb') as f:
            pickle.dump(summary, f)
        
        return summary


def main():
    """Main training pipeline"""
    print("\n" + "="*70)
    print("  COMPREHENSIVE ML MODEL TRAINING - PATTERN DETECTION")
    print("  Date Range: 1900 - Future (Maximum Historical Data)")
    print("="*70 + "\n")
    
    # Database connection
    from app.db.session import SessionLocal
    db = SessionLocal()
    
    try:
        trainer = ComprehensiveMLTrainer(db)
        
        # 1. Fetch historical data (1900-2100)
        print("\n[1/6] Fetching Historical Data...")
        df = trainer.fetch_historical_data(start_year=1900, end_year=2100)
        
        if len(df) == 0:
            logger.error("❌ No data found! Cannot train models.")
            return
        
        # Save raw dataset for analysis
        dataset_path = trainer.model_dir / 'training_dataset.csv'
        df.to_csv(dataset_path, index=False)
        logger.info(f"✓ Saved training dataset to {dataset_path}")
        
        # 2. Train Isolation Forest
        print("\n[2/6] Training Isolation Forest...")
        iso_results = trainer.train_isolation_forest(df)
        
        # 3. Train Random Forest Classifier
        print("\n[3/6] Training Random Forest Classifier...")
        rf_results = trainer.train_random_forest_classifier(df)
        
        # 4. Compute Correlation Matrices
        print("\n[4/6] Computing Correlation Matrices...")
        corr_matrices = trainer.compute_correlation_matrices(df)
        
        # 5. Perform Statistical Tests
        print("\n[5/6] Performing Statistical Tests...")
        stats_results = trainer.perform_statistical_tests(df)
        
        # 6. Compute Seasonal Patterns
        print("\n[6/6] Computing Seasonal Patterns...")
        seasonal_data = trainer.compute_seasonal_patterns(df)
        
        # Generate summary
        summary = trainer.generate_training_summary()
        
        print("\n" + "="*70)
        print("  ✅ TRAINING COMPLETE!")
        print("="*70)
        print(f"\nModels saved to: {trainer.model_dir}")
        print(f"Training dataset: {len(df)} samples")
        print(f"Date range: {df['date'].min()} to {df['date'].max()}")
        print(f"High correlation events: {df['is_high_correlation'].sum()} ({df['is_high_correlation'].mean()*100:.1f}%)")
        print("\nTrained models:")
        for model_name in trainer.models.keys():
            print(f"  ✓ {model_name}")
        print("\nStatistics computed:")
        for stat_name in trainer.statistics.keys():
            print(f"  ✓ {stat_name}")
        print("\n" + "="*70 + "\n")
        
    except Exception as e:
        logger.error(f"❌ Training failed: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()


if __name__ == "__main__":
    main()

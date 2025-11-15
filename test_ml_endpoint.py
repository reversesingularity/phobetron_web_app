"""Test ML endpoint to verify trained models are loaded"""
import requests
import json

# Test advanced pattern analysis endpoint
url = "http://127.0.0.1:8000/api/v1/ml/advanced-pattern-analysis"

# Use query parameters instead of request body
params = {
    "start_date": "2020-01-01",
    "end_date": "2025-12-31",
    "include_predictions": False,
    "forecast_horizon_days": 0
}

try:
    response = requests.post(url, params=params, timeout=30)
    
    if response.status_code == 200:
        data = response.json()
        
        print("✅ API call successful!\n")
        print("="*60)
        print("STATISTICAL ANALYSIS (from trained models):")
        print("="*60)
        
        stats = data.get('statistical_analysis', {})
        print(f"Pearson Correlation: {stats.get('pearson_correlation', 'N/A')}")
        print(f"Spearman Correlation: {stats.get('spearman_correlation', 'N/A')}")
        print(f"P-value: {stats.get('p_value', 'N/A')}")
        print(f"Statistically Significant: {stats.get('is_statistically_significant', 'N/A')}")
        print(f"Sample Size: {stats.get('sample_size', 'N/A')}")
        print(f"Chi-square statistic: {stats.get('chi_square_statistic', 'N/A')}")
        print(f"Chi-square p-value: {stats.get('chi_square_p_value', 'N/A')}")
        print(f"ANOVA F-statistic: {stats.get('anova_f_statistic', 'N/A')}")
        print(f"ANOVA p-value: {stats.get('anova_p_value', 'N/A')}")
        print(f"T-statistic: {stats.get('t_statistic', 'N/A')}")
        
        print("\n" + "="*60)
        print("PATTERNS:")
        print("="*60)
        patterns = data.get('patterns', [])
        print(f"Total patterns: {len(patterns)}")
        
        # Show first 5 patterns with anomaly detection
        for i, p in enumerate(patterns[:5]):
            print(f"\n{i+1}. {p.get('feast_day')} ({p.get('feast_date')})")
            print(f"   Events: {p.get('event_count')}, Correlation: {p.get('correlation_score')}")
            print(f"   Anomaly: {p.get('is_anomaly', 'N/A')}, Score: {p.get('anomaly_score', 'N/A')}")
        
        print("\n" + "="*60)
        print("METADATA:")
        print("="*60)
        metadata = data.get('metadata', {})
        print(f"ML Models Used: {metadata.get('ml_models_used', [])}")
        training_data = metadata.get('training_data', {})
        if training_data:
            print(f"\nTraining Data:")
            print(f"  Samples: {training_data.get('samples', 'N/A')}")
            print(f"  Date Range: {training_data.get('date_range', 'N/A')}")
            print(f"  High Correlation Events: {training_data.get('high_correlation_events', 'N/A')}")
        
        # Check if using real trained data vs mock
        if stats.get('pearson_correlation') == 0.971:
            print("\n" + "="*60)
            print("✅ CONFIRMED: Using REAL trained model data!")
            print("   Pearson correlation = 0.971 (matches training)")
            print("="*60)
        elif stats.get('pearson_correlation') == 0.742:
            print("\n" + "="*60)
            print("⚠️  WARNING: Still using MOCK data!")
            print("   Pearson correlation = 0.742 (mock value)")
            print("="*60)
        
    else:
        print(f"❌ API call failed with status {response.status_code}")
        print(response.text)
        
except Exception as e:
    print(f"❌ Error: {e}")

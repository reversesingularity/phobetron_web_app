"""Test if models are loaded in global LOADED_MODELS"""
from app.ml.model_loader import LOADED_MODELS, get_model

print('=== Global LOADED_MODELS Dictionary ===')
print(f'Keys: {list(LOADED_MODELS.keys())}')
print(f'Total: {len(LOADED_MODELS)} models\n')

print('=== Testing get_model() Function ===')
for model_name in ['isolation_forest', 'isolation_forest_scaler', 'correlation_matrices', 'statistical_tests']:
    model = get_model(model_name)
    status = '✅ Loaded' if model is not None else '❌ None'
    print(f'{model_name}: {status}')

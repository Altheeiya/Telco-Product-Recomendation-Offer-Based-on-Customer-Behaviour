import joblib

# Load model
model = joblib.load('./models/telco_recommendation_model.pkl')

# Print feature names
print("Features expected by model:")
print("-" * 50)
if hasattr(model, 'feature_names_in_'):
    for i, feature in enumerate(model.feature_names_in_, 1):
        print(f"{i}. {feature}")
else:
    print("Model doesn't have feature_names_in_ attribute")
    
print(f"\nTotal features: {len(model.feature_names_in_) if hasattr(model, 'feature_names_in_') else 'Unknown'}")
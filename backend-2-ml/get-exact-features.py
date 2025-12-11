import joblib
import pickle

# Load scaler (yang punya info exact features)
scaler = joblib.load('./models/scaler.pkl')

print("="*60)
print("SCALER INFO")
print("="*60)

# Print semua attribute
print("\nScaler attributes:")
for attr in dir(scaler):
    if not attr.startswith('_'):
        try:
            value = getattr(scaler, attr)
            if not callable(value):
                print(f"  {attr}: {type(value).__name__}")
        except:
            pass

# Print feature count
if hasattr(scaler, 'n_features_in_'):
    print(f"\n✅ Number of features: {scaler.n_features_in_}")
    
    # Try to get feature names
    if hasattr(scaler, 'feature_names_in_'):
        print("\n✅ Feature names:")
        for i, name in enumerate(scaler.feature_names_in_, 1):
            print(f"  {i}. {name}")
    else:
        print("\n⚠️  feature_names_in_ not available")
        print("   Trying to get from mean_ shape...")
        if hasattr(scaler, 'mean_'):
            print(f"   Mean shape: {scaler.mean_.shape}")
            print(f"   This confirms {len(scaler.mean_)} features expected")

# Kalau ada mean dan scale, kita bisa coba inferensi
if hasattr(scaler, 'mean_') and hasattr(scaler, 'scale_'):
    print(f"\n📊 Feature statistics available:")
    print(f"   Mean values: {len(scaler.mean_)} features")
    print(f"   Scale values: {len(scaler.scale_)} features")
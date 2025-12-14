#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Telco ML Prediction Script - FINAL WORKING VERSION
Exact features from scaler: 15 features
"""

import sys
import json
import joblib
import pandas as pd
import numpy as np
import warnings
warnings.filterwarnings('ignore')

def main():
    try:
        # Cek jumlah argumen
        if len(sys.argv) < 5:
            print(json.dumps({
                "status": "error",
                "message": "Missing arguments"
            }))
            sys.exit(1)
        
        # Ambil argumen dari Node.js
        model_path = sys.argv[1]
        scaler_path = sys.argv[2]
        encoder_path = sys.argv[3]
        customer_data_json = sys.argv[4]
        
        # Load models
        model = joblib.load(model_path)
        scaler = joblib.load(scaler_path)
        label_encoder = joblib.load(encoder_path)
        
        # Parse customer data
        customer_data = json.loads(customer_data_json)
        
        # ============================================
        # EXACT FEATURES FROM SCALER (Order matters!)
        # ============================================
        
        # 8 numerik + 1 plan_type + 6 device_brand = 15 features
        exact_feature_order = [
            'avg_data_usage_gb',
            'pct_video_usage',
            'avg_call_duration',
            'sms_freq',
            'monthly_spend',
            'topup_freq',
            'travel_score',
            'complaint_count',
            'plan_type_Prepaid',
            'device_brand_Huawei',
            'device_brand_Oppo',
            'device_brand_Realme',
            'device_brand_Samsung',
            'device_brand_Vivo',
            'device_brand_Xiaomi'
        ]
        
        # ============================================
        # BUILD FEATURE VECTOR
        # ============================================
        
        # Inisialisasi semua features dengan 0
        features = {}
        for col in exact_feature_order:
            features[col] = 0
        
        # Fill numerik values
        features['avg_data_usage_gb'] = customer_data.get('avg_data_usage_gb', 0)
        features['pct_video_usage'] = customer_data.get('pct_video_usage', 0)
        features['avg_call_duration'] = customer_data.get('avg_call_duration', 0)
        features['sms_freq'] = customer_data.get('sms_freq', 0)
        features['monthly_spend'] = customer_data.get('monthly_spend', 0)
        features['topup_freq'] = customer_data.get('topup_freq', 0)
        features['travel_score'] = customer_data.get('travel_score', 0)
        features['complaint_count'] = customer_data.get('complaint_count', 0)
        
        # One-hot encoding for plan_type
        plan_type = customer_data.get('plan_type', 'Postpaid')
        if plan_type == 'Prepaid':
            features['plan_type_Prepaid'] = 1
        # else: tetap 0 (artinya Postpaid)
        
        # One-hot encoding for device_brand
        device_brand = customer_data.get('device_brand', 'Samsung')
        device_brand_col = f'device_brand_{device_brand}'
        if device_brand_col in features:
            features[device_brand_col] = 1
        
        # Buat DataFrame dengan exact order
        df = pd.DataFrame([features], columns=exact_feature_order)
        
        # ============================================
        # SCALING & PREDICTION
        # ============================================
        
        # Scaling
        X = scaler.transform(df)
        
        # Predict
        prediction = model.predict(X)
        prediction_proba = model.predict_proba(X)
        
        # Decode label
        predicted_offer = label_encoder.inverse_transform(prediction)[0]
        
        # Confidence score
        confidence_score = float(np.max(prediction_proba))
        
        # Top 3 recommendations
        top_n = min(3, len(label_encoder.classes_))
        top_indices = np.argsort(prediction_proba[0])[-top_n:][::-1]
        
        recommendations = []
        for idx in top_indices:
            offer_name = label_encoder.classes_[idx]
            score = float(prediction_proba[0][idx])
            
            recommendations.append({
                "offer": offer_name,
                "score": round(score * 100, 2),
                "confidence": "High" if score > 0.7 else "Medium" if score > 0.4 else "Low"
            })
        
        # ============================================
        # OUTPUT
        # ============================================
        
        result = {
            "status": "success",
            "prediction": {
                "primary_offer": predicted_offer,
                "confidence_score": round(confidence_score * 100, 2),
                "recommendations": recommendations
            }
        }
        
        print(json.dumps(result))
        
    except FileNotFoundError as e:
        print(json.dumps({
            "status": "error",
            "message": f"Model file not found: {str(e)}"
        }))
        sys.exit(1)
        
    except json.JSONDecodeError as e:
        print(json.dumps({
            "status": "error",
            "message": f"Invalid JSON input: {str(e)}"
        }))
        sys.exit(1)
        
    except Exception as e:
        print(json.dumps({
            "status": "error",
            "message": f"Prediction error: {str(e)}",
            "error_type": type(e).__name__
        }))
        sys.exit(1)

if __name__ == "__main__":
    main()
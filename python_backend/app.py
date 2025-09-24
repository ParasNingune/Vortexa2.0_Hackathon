from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import numpy as np
from PIL import Image
import os
import io
import base64
import tensorflow as tf
from tensorflow import keras

app = Flask(__name__)
CORS(app, origins=['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'])

# Configure upload folder
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Disease class names
CLASS_NAMES = [
    'Apple___Apple_scab', 'Apple___Black_rot', 'Apple___Cedar_apple_rust', 'Apple___healthy',
    'Cherry_(including_sour)___healthy', 'Cherry_(including_sour)___Powdery_mildew',
    'Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot', 'Corn_(maize)___Common_rust_',
    'Corn_(maize)___healthy', 'Corn_(maize)___Northern_Leaf_Blight', 'Grape___Black_rot',
    'Grape___Esca_(Black_Measles)', 'Grape___healthy', 'Grape___Leaf_blight_(Isariopsis_Leaf_Spot)',
    'Orange___Haunglongbing_(Citrus_greening)', 'Peach___Bacterial_spot', 'Peach___healthy',
    'Pepper,_bell___Bacterial_spot', 'Pepper,_bell___healthy', 'Potato___Early_blight',
    'Potato___healthy', 'Potato___Late_blight', 'Raspberry___healthy', 'Soybean___healthy',
    'Squash___Powdery_mildew', 'Strawberry___healthy', 'Strawberry___Leaf_scorch',
    'Tomato___Bacterial_spot', 'Tomato___Early_blight', 'Tomato___healthy', 'Tomato___Late_blight',
    'Tomato___Leaf_Mold', 'Tomato___Septoria_leaf_spot', 'Tomato___Spider_mites Two-spotted_spider_mite',
    'Tomato___Target_Spot', 'Tomato___Tomato_mosaic_virus', 'Tomato___Tomato_Yellow_Leaf_Curl_Virus'
]

# Load the model once at startup
model = None
model_path = 'trained_plant_disease_model.pkl'

def load_pkl_model():
    """Load the pickled model"""
    global model
    try:
        # First try loading as a pickle file
        with open(model_path, 'rb') as f:
            model = pickle.load(f)
        print(f"✅ Model loaded successfully from {model_path}")
        return True
    except Exception as pickle_error:
        print(f"❌ Error loading as pickle: {str(pickle_error)}")
        
        # If pickle fails, try loading as Keras model
        try:
            # Try different Keras loading methods
            model_h5_path = model_path.replace('.pkl', '.h5')
            if os.path.exists(model_h5_path):
                model = keras.models.load_model(model_h5_path)
                print(f"✅ Keras model loaded from {model_h5_path}")
                return True
            
            # Try loading as SavedModel format
            model_dir = model_path.replace('.pkl', '_saved_model')
            if os.path.exists(model_dir):
                model = keras.models.load_model(model_dir)
                print(f"✅ SavedModel loaded from {model_dir}")
                return True
                
            print(f"❌ Could not load model in any format")
            return False
            
        except Exception as keras_error:
            print(f"❌ Error loading as Keras model: {str(keras_error)}")
            return False

def preprocess_image(image_file, target_size=(128, 128)):
    """Preprocess image for model prediction"""
    try:
        # Open and preprocess image
        image = Image.open(image_file)
        image = image.convert('RGB')
        image = image.resize(target_size)
        
        # Convert to numpy array and normalize
        image_array = np.array(image)
        image_array = image_array / 255.0
        
        # Add batch dimension
        image_array = np.expand_dims(image_array, axis=0)
        
        return image_array
    except Exception as e:
        raise Exception(f"Error preprocessing image: {str(e)}")

def parse_class_name(class_name):
    """Parse class name to get crop and disease"""
    if '___' in class_name:
        crop, disease = class_name.split('___', 1)
        crop = crop.replace('_', ' ').replace(',', '').strip()
        disease = disease.replace('_', ' ').strip()
    else:
        crop = class_name.replace('_', ' ')
        disease = 'Unknown'
    
    return crop, disease

def generate_recommendations(crop, disease, severity):
    """Generate treatment recommendations"""
    recommendations = []
    
    if 'healthy' in disease.lower():
        recommendations = [
            "Your plant appears healthy! Continue with regular care.",
            "Maintain proper watering schedule",
            "Ensure adequate sunlight and ventilation",
            "Regular monitoring for early disease detection"
        ]
    else:
        if severity == 'High':
            recommendations.append("Immediate action required - consult agricultural expert")
            recommendations.append("Isolate affected plants to prevent spread")
        
        # Disease-specific recommendations
        if 'blight' in disease.lower():
            recommendations.extend([
                "Remove affected leaves and dispose properly",
                "Improve air circulation around plants",
                "Apply copper-based fungicide",
                "Avoid overhead watering"
            ])
        elif 'rust' in disease.lower():
            recommendations.extend([
                "Apply fungicide containing propiconazole",
                "Remove infected plant debris",
                "Ensure proper plant spacing for air circulation"
            ])
        elif 'spot' in disease.lower():
            recommendations.extend([
                "Apply bactericide or fungicide as appropriate",
                "Remove affected leaves",
                "Improve drainage and reduce humidity"
            ])
        elif 'mildew' in disease.lower():
            recommendations.extend([
                "Apply sulfur-based fungicide",
                "Improve air circulation",
                "Reduce humidity levels",
                "Remove affected plant parts"
            ])
        elif 'scab' in disease.lower():
            recommendations.extend([
                "Apply preventive fungicide spray",
                "Prune for better air circulation",
                "Remove fallen leaves and debris"
            ])
        else:
            recommendations.extend([
                "Consult local agricultural extension office",
                "Remove affected plant parts",
                "Maintain proper plant hygiene",
                "Monitor regularly for disease progression"
            ])
    
    return recommendations

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'success': True,
        'message': 'Plant Disease Detection Python API is running',
        'model_loaded': model is not None,
        'timestamp': str(np.datetime64('now'))
    })

@app.route('/api/predict', methods=['POST'])
def predict_disease():
    """Predict plant disease from uploaded image"""
    try:
        # Check if model is loaded
        if model is None:
            return jsonify({
                'success': False,
                'error': 'Model not loaded'
            }), 500
        
        # Check if image file is present
        if 'image' not in request.files:
            return jsonify({
                'success': False,
                'error': 'No image file uploaded'
            }), 400
        
        file = request.files['image']
        if file.filename == '':
            return jsonify({
                'success': False,
                'error': 'No image file selected'
            }), 400
        
        # Preprocess image
        try:
            processed_image = preprocess_image(file)
        except Exception as e:
            return jsonify({
                'success': False,
                'error': f'Image preprocessing failed: {str(e)}'
            }), 400
        
        # Make prediction
        try:
            predictions = model.predict(processed_image)
            predicted_class_index = np.argmax(predictions[0])
            confidence = float(predictions[0][predicted_class_index])
            
            # Get class name
            predicted_class = CLASS_NAMES[predicted_class_index] if predicted_class_index < len(CLASS_NAMES) else 'Unknown'
            
            # Parse class name
            crop, disease = parse_class_name(predicted_class)
            
            # Determine severity
            severity = 'Low'
            if confidence > 0.8:
                if 'healthy' not in disease.lower():
                    severity = 'High'
                else:
                    severity = 'Healthy'
            elif confidence > 0.6:
                severity = 'Medium'
            
            # Generate recommendations
            recommendations = generate_recommendations(crop, disease, severity)
            
            # Get top 5 predictions
            top_indices = np.argsort(predictions[0])[::-1][:5]
            all_predictions = []
            for idx in top_indices:
                class_name = CLASS_NAMES[idx] if idx < len(CLASS_NAMES) else f'Class_{idx}'
                all_predictions.append({
                    'class': class_name.replace('___', ' - ').replace('_', ' '),
                    'confidence': round(float(predictions[0][idx]) * 100, 2)
                })
            
            result = {
                'success': True,
                'crop': crop,
                'disease': disease,
                'severity': severity,
                'confidence': round(confidence * 100, 2),
                'recommendations': recommendations,
                'all_predictions': all_predictions,
                'className': predicted_class
            }
            
            return jsonify(result)
            
        except Exception as e:
            return jsonify({
                'success': False,
                'error': f'Prediction failed: {str(e)}'
            }), 500
            
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Server error: {str(e)}'
        }), 500

if __name__ == '__main__':
    print("🌱 Starting Plant Disease Detection API...")
    
    # Load model at startup
    if not load_pkl_model():
        print("❌ Failed to load model. Exiting...")
        exit(1)
    
    print("🚀 Server starting on http://localhost:8000")
    app.run(host='0.0.0.0', port=8000, debug=True)

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
import cv2

app = Flask(__name__)

# Configure CORS for both development and production
allowed_origins = [
    'http://localhost:5173', 
    'http://localhost:5174', 
    'http://localhost:5175',
    'http://localhost:3000',
    'https://vortexa2-0-hackathon.onrender.com',      # Add your actual Netlify URL here
    'vortexa2-0-hackathon-m57z6iaz7-paras-projects-c7b4aa2f.vercel.app',       # Add your actual Vercel URL here
    '*'  # Allow all origins for now - remove in production and specify exact domains
]

CORS(app, origins=allowed_origins)

# Configure upload folder
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Disease class names - will be loaded from validation dataset
class_names = []

def load_class_names():
    """Load class names from validation dataset as shown in notebook"""
    global class_names
    try:
        # Try to load validation dataset to get class names
        if os.path.exists('./Dataset/valid'):
            validation_set = tf.keras.utils.image_dataset_from_directory(
                './Dataset/valid',
                labels="inferred",
                label_mode="categorical",
                class_names=None,
                color_mode="rgb",
                batch_size=32,
                image_size=(128, 128),
                shuffle=True,
                seed=None,
                validation_split=None,
                subset=None,
                interpolation="bilinear",
                follow_links=False,
                crop_to_aspect_ratio=False
            )
            class_names = validation_set.class_names
            print(f"✅ Loaded {len(class_names)} class names from validation dataset")
            print("Class names:", class_names)
            return True
        else:
            # Fallback to hardcoded class names if dataset not available
            class_names = [
                'Apple___Apple_scab', 'Apple___Black_rot', 'Apple___Cedar_apple_rust', 
                'Apple___healthy', 'Blueberry___healthy', 'Cherry_(including_sour)___Powdery_mildew', 
                'Cherry_(including_sour)___healthy', 'Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot', 
                'Corn_(maize)___Common_rust_', 'Corn_(maize)___Northern_Leaf_Blight', 'Corn_(maize)___healthy', 
                'Grape___Black_rot', 'Grape___Esca_(Black_Measles)', 'Grape___Leaf_blight_(Isariopsis_Leaf_Spot)', 
                'Grape___healthy', 'Orange___Haunglongbing_(Citrus_greening)', 'Peach___Bacterial_spot', 
                'Peach___healthy', 'Pepper,_bell___Bacterial_spot', 'Pepper,_bell___healthy', 
                'Potato___Early_blight', 'Potato___Late_blight', 'Potato___healthy', 'Raspberry___healthy', 'Soybean___healthy', 
                'Squash___Powdery_mildew', 'Strawberry___Leaf_scorch', 'Strawberry___healthy', 'Tomato___Bacterial_spot', 
                'Tomato___Early_blight', 'Tomato___Late_blight', 'Tomato___Leaf_Mold', 'Tomato___Septoria_leaf_spot', 
                'Tomato___Spider_mites Two-spotted_spider_mite', 'Tomato___Target_Spot', 'Tomato___Tomato_Yellow_Leaf_Curl_Virus', 
                'Tomato___Tomato_mosaic_virus', 'Tomato___healthy'
            ]
            print("⚠️ Using fallback hardcoded class names")
            return True
    except Exception as e:
        print(f"❌ Error loading class names: {str(e)}")
        return False

# Load the model once at startup
cnn = None
model_path = 'trained_plant_disease_model.keras'

def load_keras_model():
    """Load the Keras model"""
    global cnn
    try:
        # Load the Keras model as shown in the notebook
        cnn = tf.keras.models.load_model(model_path)
        print(f"✅ Keras model loaded successfully from {model_path}")
        return True
    except Exception as e:
        print(f"❌ Error loading Keras model: {str(e)}")
        
        # Try alternative model paths
        try:
            alt_path = 'trained_plant_disease_model-1.pkl'
            if os.path.exists(alt_path):
                with open(alt_path, 'rb') as f:
                    cnn = pickle.load(f)
                print(f"✅ Fallback: Model loaded from {alt_path}")
                return True
        except Exception as fallback_error:
            print(f"❌ Fallback also failed: {str(fallback_error)}")
        
        return False

def preprocess_image(image_file, target_size=(128, 128)):
    """Preprocess image for model prediction - following the notebook approach"""
    try:
        # Save uploaded file temporarily
        temp_path = os.path.join(app.config['UPLOAD_FOLDER'], 'temp_image.jpg')
        image_file.save(temp_path)
        
        # Load and preprocess image exactly as in the notebook
        # Step 1: Load with cv2 and convert color space
        img = cv2.imread(temp_path)
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        
        # Step 2: Load with tf.keras preprocessing for model input
        image = tf.keras.preprocessing.image.load_img(temp_path, target_size=target_size)
        input_arr = tf.keras.preprocessing.image.img_to_array(image)
        input_arr = np.array([input_arr])  # Convert single image to a batch
        
        # Clean up temporary file
        if os.path.exists(temp_path):
            os.remove(temp_path)
        
        return input_arr, img  # Return both processed array and original image for display
    except Exception as e:
        # Clean up temporary file in case of error
        temp_path = os.path.join(app.config['UPLOAD_FOLDER'], 'temp_image.jpg')
        if os.path.exists(temp_path):
            os.remove(temp_path)
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

@app.route('/', methods=['GET'])
def root():
    """Root endpoint - API information"""
    return jsonify({
        'success': True,
        'message': 'Plant Disease Detection API',
        'version': '1.0.0',
        'endpoints': {
            'health': '/api/health',
            'predict': '/api/predict'
        },
        'status': 'online',
        'model_loaded': cnn is not None,
        'num_classes': len(class_names) if class_names else 0
    })

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'success': True,
        'message': 'Plant Disease Detection Python API is running',
        'model_loaded': cnn is not None,
        'class_names_loaded': len(class_names) > 0,
        'num_classes': len(class_names),
        'timestamp': str(np.datetime64('now'))
    })

@app.route('/api/predict', methods=['POST'])
def predict_disease():
    """Predict plant disease from uploaded image - following notebook approach"""
    try:
        # Check if model is loaded
        if cnn is None:
            return jsonify({
                'success': False,
                'error': 'Model not loaded'
            }), 500
        
        # Check if class names are loaded
        if len(class_names) == 0:
            return jsonify({
                'success': False,
                'error': 'Class names not loaded'
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
            input_arr, img = preprocess_image(file)
        except Exception as e:
            return jsonify({
                'success': False,
                'error': f'Image preprocessing failed: {str(e)}'
            }), 400
        
        # Make prediction exactly as in notebook
        try:
            predictions = cnn.predict(input_arr)
            result_index = np.argmax(predictions)  # Return index of max element
            confidence = float(predictions[0][result_index])
            
            # Get predicted class name
            model_prediction = class_names[result_index]
            
            # Parse class name to get crop and disease
            crop, disease = parse_class_name(model_prediction)
            
            # Determine severity based on confidence
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
                class_name = class_names[idx] if idx < len(class_names) else f'Class_{idx}'
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
                'className': model_prediction,
                'predicted_index': int(result_index)
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

# Initialize the application
def create_app():
    """Application factory pattern for deployment"""
    print("🌱 Initializing Plant Disease Detection API...")
    
    # Load model at startup
    if not load_keras_model():
        print("❌ Failed to load model. Exiting...")
        return None
    
    # Load class names
    if not load_class_names():
        print("❌ Failed to load class names. Exiting...")
        return None
    
    print(f"📊 Model loaded with {len(class_names)} classes")
    return app

# Initialize app for production
create_app()

if __name__ == '__main__':
    print("🚀 Server starting on http://localhost:8000")
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 8000)), debug=False)

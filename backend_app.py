from flask import Flask, request, jsonify
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, firestore, auth
import os
from dotenv import load_dotenv
from datetime import datetime
import uuid
from functools import wraps
import json

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Initialize Firebase with Firestore
try:
    # Try to read from environment variable first (for cloud deployment)
    service_account_json = os.getenv('FIREBASE_SERVICE_ACCOUNT')
    
    if service_account_json:
        # Running on cloud (Railway, Render, etc.)
        print("🌐 Loading Firebase from environment variable...")
        service_account = json.loads(service_account_json)
        cred = credentials.Certificate(service_account)
    else:
        # Running locally
        print("💻 Loading Firebase from local file...")
        cred = credentials.Certificate('serviceAccountKey.json')
    
    firebase_admin.initialize_app(cred)
    
    # Initialize Firestore client
    db = firestore.client()
    
    print("✅ Firebase with Firestore initialized successfully")
except Exception as e:
    print(f"⚠️ Firebase initialization error: {e}")
    db = None

# ==================== HELPER FUNCTIONS ====================

def generate_sos_id():
    """Generate unique SOS ID"""
    return f"SOS_{uuid.uuid4().hex[:12]}_{int(datetime.now().timestamp())}"

def verify_firebase_token(f):
    """Decorator to verify Firebase Auth token"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = request.headers.get('Authorization')
        
        if not token:
            return jsonify({"error": "No authorization token provided"}), 401
        
        try:
            # Remove 'Bearer ' prefix if present
            if token.startswith('Bearer '):
                token = token.split('Bearer ')[1]
            
            # Verify the token
            decoded_token = auth.verify_id_token(token)
            request.user_id = decoded_token['uid']
            return f(*args, **kwargs)
        except Exception as e:
            return jsonify({"error": "Invalid token", "details": str(e)}), 401
    
    return decorated_function

# ==================== ROUTES ====================

@app.route('/', methods=['GET'])
def home():
    """API root endpoint"""
    return jsonify({
        "message": "R.A.K.S.H.A Backend API - Firestore Version",
        "version": "0.4.0-firestore",
        "status": "running",
        "database": "Firestore",
        "environment": os.getenv('FLASK_ENV', 'development'),
        "endpoints": {
            "auth_register": "POST /api/auth/register",
            "auth_login": "POST /api/auth/login",
            "user_profile": "GET /api/user/profile",
            "update_profile": "PUT /api/user/profile",
            "update_contacts": "PUT /api/user/contacts",
            "trigger_sos": "POST /api/sos/trigger",
            "get_sos": "GET /api/sos/<sos_id>",
            "deactivate_sos": "POST /api/sos/deactivate",
            "health": "GET /api/health"
        }
    }), 200

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "database": "Firestore",
        "environment": os.getenv('FLASK_ENV', 'development')
    }), 200

# ==================== AUTHENTICATION ROUTES ====================

@app.route('/api/auth/register', methods=['POST'])
def register_user():
    """
    Register new user with Firebase Authentication
    Body: {
        "email": "user@example.com",
        "password": "password123",
        "name": "John Doe",
        "phone": "+919876543210"
    }
    """
    try:
        data = request.get_json()
        
        email = data.get('email')
        password = data.get('password')
        name = data.get('name')
        phone = data.get('phone')
        
        # Validate required fields
        if not all([email, password, name, phone]):
            return jsonify({
                "error": "Missing required fields",
                "required": ["email", "password", "name", "phone"]
            }), 400
        
        # Create user in Firebase Auth
        user = auth.create_user(
            email=email,
            password=password,
            display_name=name,
            phone_number=phone
        )
        
        user_id = user.uid
        
        # Create user profile in Firestore
        user_doc = db.collection('users').document(user_id)
        user_doc.set({
            'profile': {
                'name': name,
                'email': email,
                'phone': phone,
                'created_at': datetime.now()
            },
            'emergency_contacts': [],
            'created_at': datetime.now(),
            'updated_at': datetime.now()
        })
        
        # Generate custom token for immediate login
        custom_token = auth.create_custom_token(user_id)
        
        return jsonify({
            "success": True,
            "message": "User registered successfully",
            "user_id": user_id,
            "token": custom_token.decode('utf-8'),
            "user": {
                "email": email,
                "name": name,
                "phone": phone
            }
        }), 201
        
    except auth.EmailAlreadyExistsError:
        return jsonify({"error": "Email already exists"}), 400
    except auth.PhoneNumberAlreadyExistsError:
        return jsonify({"error": "Phone number already exists"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/auth/login', methods=['POST'])
def login_user():
    """
    Login user (Note: This endpoint generates a custom token)
    In production, use Firebase Auth SDK on client side
    Body: {
        "email": "user@example.com",
        "password": "password123"
    }
    """
    try:
        data = request.get_json()
        
        email = data.get('email')
        password = data.get('password')
        
        if not all([email, password]):
            return jsonify({"error": "Email and password required"}), 400
        
        # Get user by email
        user = auth.get_user_by_email(email)
        user_id = user.uid
        
        # Generate custom token
        custom_token = auth.create_custom_token(user_id)
        
        # Get user profile from Firestore
        user_doc = db.collection('users').document(user_id).get()
        
        if user_doc.exists:
            profile = user_doc.to_dict().get('profile', {})
        else:
            profile = {
                'name': user.display_name,
                'email': user.email,
                'phone': user.phone_number
            }
        
        return jsonify({
            "success": True,
            "message": "Login successful",
            "user_id": user_id,
            "token": custom_token.decode('utf-8'),
            "user": profile
        }), 200
        
    except auth.UserNotFoundError:
        return jsonify({"error": "User not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ==================== USER PROFILE ROUTES ====================

@app.route('/api/user/profile', methods=['GET'])
@verify_firebase_token
def get_user_profile():
    """
    Get user profile (requires authentication)
    Headers: Authorization: Bearer <token>
    """
    try:
        user_id = request.user_id
        
        # Get user document from Firestore
        user_doc = db.collection('users').document(user_id).get()
        
        if not user_doc.exists:
            return jsonify({"error": "User not found"}), 404
        
        user_data = user_doc.to_dict()
        
        # Convert Firestore timestamps to ISO format
        if 'created_at' in user_data:
            user_data['created_at'] = user_data['created_at'].isoformat()
        if 'updated_at' in user_data:
            user_data['updated_at'] = user_data['updated_at'].isoformat()
        if 'profile' in user_data and 'created_at' in user_data['profile']:
            user_data['profile']['created_at'] = user_data['profile']['created_at'].isoformat()
        
        return jsonify({
            "success": True,
            "user_id": user_id,
            "data": user_data
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/user/profile', methods=['PUT'])
@verify_firebase_token
def update_user_profile():
    """
    Update user profile (requires authentication)
    Headers: Authorization: Bearer <token>
    Body: {
        "name": "New Name",
        "phone": "+919876543210",
        "address": "123 Street, City"
    }
    """
    try:
        user_id = request.user_id
        data = request.get_json()
        
        # Get current user document
        user_ref = db.collection('users').document(user_id)
        user_doc = user_ref.get()
        
        if not user_doc.exists:
            return jsonify({"error": "User profile not found"}), 404
        
        user_data = user_doc.to_dict()
        current_profile = user_data.get('profile', {})
        
        # Update allowed fields
        allowed_fields = ['name', 'phone', 'address', 'blood_group', 'medical_info']
        
        for field in allowed_fields:
            if field in data:
                current_profile[field] = data[field]
        
        # Add last updated timestamp
        current_profile['updated_at'] = datetime.now()
        
        # Update in Firestore
        user_ref.update({
            'profile': current_profile,
            'updated_at': datetime.now()
        })
        
        # Update Firebase Auth display name and phone if changed
        update_data = {}
        if 'name' in data:
            update_data['display_name'] = data['name']
        if 'phone' in data:
            update_data['phone_number'] = data['phone']
        
        if update_data:
            auth.update_user(user_id, **update_data)
        
        # Convert timestamp to ISO format for response
        if 'updated_at' in current_profile:
            current_profile['updated_at'] = current_profile['updated_at'].isoformat()
        
        return jsonify({
            "success": True,
            "message": "Profile updated successfully",
            "profile": current_profile
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/user/contacts', methods=['PUT'])
@verify_firebase_token
def update_emergency_contacts():
    """
    Update emergency contacts (requires authentication)
    Headers: Authorization: Bearer <token>
    Body: {
        "contacts": [
            {
                "name": "Mom",
                "phone": "+919876543210",
                "relation": "Mother"
            }
        ]
    }
    """
    try:
        user_id = request.user_id
        data = request.get_json()
        
        contacts = data.get('contacts', [])
        
        # Validate contacts format
        if not isinstance(contacts, list):
            return jsonify({"error": "Contacts must be an array"}), 400
        
        for contact in contacts:
            if not all(k in contact for k in ['name', 'phone']):
                return jsonify({
                    "error": "Each contact must have 'name' and 'phone'"
                }), 400
        
        # Update contacts in Firestore
        user_ref = db.collection('users').document(user_id)
        user_ref.update({
            'emergency_contacts': contacts,
            'updated_at': datetime.now()
        })
        
        return jsonify({
            "success": True,
            "message": "Emergency contacts updated successfully",
            "contacts": contacts,
            "count": len(contacts)
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/user/contacts', methods=['GET'])
@verify_firebase_token
def get_emergency_contacts():
    """
    Get emergency contacts (requires authentication)
    Headers: Authorization: Bearer <token>
    """
    try:
        user_id = request.user_id
        
        # Get user document
        user_doc = db.collection('users').document(user_id).get()
        
        if not user_doc.exists:
            return jsonify({"error": "User not found"}), 404
        
        user_data = user_doc.to_dict()
        contacts = user_data.get('emergency_contacts', [])
        
        return jsonify({
            "success": True,
            "contacts": contacts,
            "count": len(contacts)
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ==================== SOS ROUTES ====================

@app.route('/api/sos/trigger', methods=['POST'])
@verify_firebase_token
def trigger_sos():
    """
    Trigger SOS emergency (requires authentication)
    Headers: Authorization: Bearer <token>
    Body: {
        "location": {
            "latitude": 28.6139,
            "longitude": 77.2090
        },
        "trigger_type": "manual"
    }
    """
    try:
        user_id = request.user_id
        data = request.get_json()
        
        location = data.get('location', {})
        trigger_type = data.get('trigger_type', 'manual')
        
        # Generate SOS ID
        sos_id = generate_sos_id()
        timestamp = datetime.now()
        
        # Create location URL for Google Maps
        lat = location.get('latitude', 0)
        lon = location.get('longitude', 0)
        location_url = f"https://www.google.com/maps?q={lat},{lon}"
        
        # Get user profile for alert message
        user_doc = db.collection('users').document(user_id).get()
        if user_doc.exists:
            profile = user_doc.to_dict().get('profile', {})
            user_name = profile.get('name', 'User')
            emergency_contacts = user_doc.to_dict().get('emergency_contacts', [])
        else:
            user_name = 'User'
            emergency_contacts = []
        
        # Create SOS record
        sos_data = {
            'user_id': user_id,
            'user_name': user_name,
            'timestamp': timestamp,
            'location': location,
            'location_url': location_url,
            'trigger_type': trigger_type,
            'status': 'active',
            'created_at': timestamp
        }
        
        # Store in Firestore - active_sos collection
        db.collection('active_sos').document(sos_id).set(sos_data)
        
        # Add to user's SOS history subcollection
        db.collection('users').document(user_id).collection('sos_history').document(sos_id).set({
            'timestamp': timestamp,
            'location': location,
            'location_url': location_url,
            'status': 'triggered',
            'trigger_type': trigger_type
        })
        
        return jsonify({
            "success": True,
            "sos_id": sos_id,
            "location_url": location_url,
            "message": "SOS triggered successfully",
            "timestamp": timestamp.isoformat(),
            "emergency_contacts": emergency_contacts,
            "alert_message": f"🚨 EMERGENCY! {user_name} needs help immediately! Location: {location_url}"
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/sos/<sos_id>', methods=['GET'])
@verify_firebase_token
def get_sos_details(sos_id):
    """
    Get SOS details (requires authentication)
    Headers: Authorization: Bearer <token>
    """
    try:
        user_id = request.user_id
        
        # Get SOS document
        sos_doc = db.collection('active_sos').document(sos_id).get()
        
        if not sos_doc.exists:
            return jsonify({"error": "SOS not found"}), 404
        
        sos_data = sos_doc.to_dict()
        
        # Verify user owns this SOS
        if sos_data.get('user_id') != user_id:
            return jsonify({"error": "Unauthorized access"}), 403
        
        # Convert timestamps to ISO format
        if 'timestamp' in sos_data:
            sos_data['timestamp'] = sos_data['timestamp'].isoformat()
        if 'created_at' in sos_data:
            sos_data['created_at'] = sos_data['created_at'].isoformat()
        if 'deactivated_at' in sos_data:
            sos_data['deactivated_at'] = sos_data['deactivated_at'].isoformat()
        
        return jsonify({
            "success": True,
            "sos_id": sos_id,
            "data": sos_data
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/sos/deactivate', methods=['POST'])
@verify_firebase_token
def deactivate_sos():
    """
    Deactivate SOS (requires authentication)
    Headers: Authorization: Bearer <token>
    Body: {
        "sos_id": "SOS_abc123_1234567890"
    }
    """
    try:
        user_id = request.user_id
        data = request.get_json()
        
        sos_id = data.get('sos_id')
        
        if not sos_id:
            return jsonify({"error": "sos_id is required"}), 400
        
        # Get SOS document to verify ownership
        sos_ref = db.collection('active_sos').document(sos_id)
        sos_doc = sos_ref.get()
        
        if not sos_doc.exists:
            return jsonify({"error": "SOS not found"}), 404
        
        sos_data = sos_doc.to_dict()
        
        if sos_data.get('user_id') != user_id:
            return jsonify({"error": "Unauthorized access"}), 403
        
        deactivated_time = datetime.now()
        
        # Update status in active_sos
        sos_ref.update({
            'status': 'deactivated',
            'deactivated_at': deactivated_time
        })
        
        # Update in user's history
        db.collection('users').document(user_id).collection('sos_history').document(sos_id).update({
            'status': 'deactivated',
            'deactivated_at': deactivated_time
        })
        
        return jsonify({
            "success": True,
            "message": "SOS deactivated successfully",
            "sos_id": sos_id,
            "deactivated_at": deactivated_time.isoformat()
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/sos/history', methods=['GET'])
@verify_firebase_token
def get_sos_history():
    """
    Get user's SOS history (requires authentication)
    Headers: Authorization: Bearer <token>
    Query params: ?limit=10 (optional)
    """
    try:
        user_id = request.user_id
        limit = request.args.get('limit', 50, type=int)
        
        # Get SOS history from subcollection
        history_ref = db.collection('users').document(user_id).collection('sos_history')
        history_query = history_ref.order_by('timestamp', direction=firestore.Query.DESCENDING).limit(limit)
        
        history_docs = history_query.stream()
        
        history_list = []
        for doc in history_docs:
            sos_data = doc.to_dict()
            
            # Convert timestamps to ISO format
            if 'timestamp' in sos_data:
                sos_data['timestamp'] = sos_data['timestamp'].isoformat()
            if 'deactivated_at' in sos_data:
                sos_data['deactivated_at'] = sos_data['deactivated_at'].isoformat()
            
            history_list.append({
                "sos_id": doc.id,
                **sos_data
            })
        
        return jsonify({
            "success": True,
            "history": history_list,
            "count": len(history_list)
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ==================== ERROR HANDLERS ====================

@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error"}), 500

# ==================== RUN APP ====================

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)

from flask import Flask, request, jsonify
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, db, auth
import os
from dotenv import load_dotenv
from datetime import datetime
import uuid
from functools import wraps

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Initialize Firebase
try:
    cred = credentials.Certificate('serviceAccountKey.json')
    firebase_admin.initialize_app(cred, {
        'databaseURL': os.getenv('FIREBASE_DATABASE_URL')
    })
    print("✅ Firebase initialized successfully")
except Exception as e:
    print(f"⚠️ Firebase initialization error: {e}")

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
        "message": "R.A.K.S.H.A Backend API - Minimal Version",
        "version": "0.4.0",
        "status": "running",
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
        "timestamp": datetime.now().isoformat()
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
        
        # Create user profile in Realtime Database
        user_ref = db.reference(f'users/{user_id}')
        user_ref.set({
            'profile': {
                'name': name,
                'email': email,
                'phone': phone,
                'created_at': datetime.now().isoformat()
            },
            'emergency_contacts': [],
            'sos_history': {}
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
        
        # Get user profile from database
        user_ref = db.reference(f'users/{user_id}/profile')
        profile = user_ref.get()
        
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
        
        # Get user data from database
        user_ref = db.reference(f'users/{user_id}')
        user_data = user_ref.get()
        
        if not user_data:
            return jsonify({"error": "User not found"}), 404
        
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
        
        # Get current profile
        profile_ref = db.reference(f'users/{user_id}/profile')
        current_profile = profile_ref.get()
        
        if not current_profile:
            return jsonify({"error": "User profile not found"}), 404
        
        # Update allowed fields
        allowed_fields = ['name', 'phone', 'address', 'blood_group', 'medical_info']
        
        for field in allowed_fields:
            if field in data:
                current_profile[field] = data[field]
        
        # Add last updated timestamp
        current_profile['updated_at'] = datetime.now().isoformat()
        
        # Save updated profile
        profile_ref.set(current_profile)
        
        # Update Firebase Auth display name and phone if changed
        update_data = {}
        if 'name' in data:
            update_data['display_name'] = data['name']
        if 'phone' in data:
            update_data['phone_number'] = data['phone']
        
        if update_data:
            auth.update_user(user_id, **update_data)
        
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
            },
            {
                "name": "Friend",
                "phone": "+919876543211",
                "relation": "Friend"
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
        
        # Update contacts in database
        contacts_ref = db.reference(f'users/{user_id}/emergency_contacts')
        contacts_ref.set(contacts)
        
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
        
        contacts_ref = db.reference(f'users/{user_id}/emergency_contacts')
        contacts = contacts_ref.get()
        
        return jsonify({
            "success": True,
            "contacts": contacts if contacts else [],
            "count": len(contacts) if contacts else 0
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
        timestamp = datetime.now().isoformat()
        
        # Create location URL for Google Maps
        lat = location.get('latitude', 0)
        lon = location.get('longitude', 0)
        location_url = f"https://www.google.com/maps?q={lat},{lon}"
        
        # Get user profile for alert message
        profile_ref = db.reference(f'users/{user_id}/profile')
        profile = profile_ref.get()
        user_name = profile.get('name', 'User') if profile else 'User'
        
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
        
        # Store in active SOS
        sos_ref = db.reference(f'active_sos/{sos_id}')
        sos_ref.set(sos_data)
        
        # Add to user's SOS history
        user_sos_ref = db.reference(f'users/{user_id}/sos_history/{sos_id}')
        user_sos_ref.set({
            'timestamp': timestamp,
            'location': location,
            'status': 'triggered',
            'trigger_type': trigger_type
        })
        
        # Get emergency contacts
        contacts_ref = db.reference(f'users/{user_id}/emergency_contacts')
        contacts = contacts_ref.get()
        
        return jsonify({
            "success": True,
            "sos_id": sos_id,
            "location_url": location_url,
            "message": "SOS triggered successfully",
            "timestamp": timestamp,
            "emergency_contacts": contacts if contacts else [],
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
        
        # Get SOS data
        sos_ref = db.reference(f'active_sos/{sos_id}')
        sos_data = sos_ref.get()
        
        if not sos_data:
            return jsonify({"error": "SOS not found"}), 404
        
        # Verify user owns this SOS or is authorized
        if sos_data.get('user_id') != user_id:
            return jsonify({"error": "Unauthorized access"}), 403
        
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
        
        # Get SOS data to verify ownership
        sos_ref = db.reference(f'active_sos/{sos_id}')
        sos_data = sos_ref.get()
        
        if not sos_data:
            return jsonify({"error": "SOS not found"}), 404
        
        if sos_data.get('user_id') != user_id:
            return jsonify({"error": "Unauthorized access"}), 403
        
        # Update status
        sos_ref.update({
            'status': 'deactivated',
            'deactivated_at': datetime.now().isoformat()
        })
        
        # Update in user's history
        user_sos_ref = db.reference(f'users/{user_id}/sos_history/{sos_id}')
        user_sos_ref.update({
            'status': 'deactivated',
            'deactivated_at': datetime.now().isoformat()
        })
        
        return jsonify({
            "success": True,
            "message": "SOS deactivated successfully",
            "sos_id": sos_id
        }), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/sos/history', methods=['GET'])
@verify_firebase_token
def get_sos_history():
    """
    Get user's SOS history (requires authentication)
    Headers: Authorization: Bearer <token>
    """
    try:
        user_id = request.user_id
        
        # Get SOS history
        history_ref = db.reference(f'users/{user_id}/sos_history')
        history = history_ref.get()
        
        if not history:
            return jsonify({
                "success": True,
                "history": [],
                "count": 0
            }), 200
        
        # Convert to list format
        history_list = []
        for sos_id, data in history.items():
            history_list.append({
                "sos_id": sos_id,
                **data
            })
        
        # Sort by timestamp (newest first)
        history_list.sort(key=lambda x: x.get('timestamp', ''), reverse=True)
        
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
    app.run(host='0.0.0.0', port=port, debug=True)
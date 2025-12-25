# 🔗 Flask Backend + React Native Frontend Integration Guide

## 📋 Overview

Your backend: **Flask (Python) + Firebase**
Your frontend: **React Native (Expo)**

This guide will connect them together.

---

## 🚀 Quick Start (15 Minutes)

### Step 1: Start Flask Backend (2 min)

```bash
cd your-backend-folder

# Make sure you have Python dependencies
pip install flask flask-cors firebase-admin python-dotenv

# Start the server
python app.py

# You should see:
# * Running on http://0.0.0.0:5000
```

**Note your computer's IP address:**
- Windows: `ipconfig` → Look for IPv4 Address
- Mac: `ifconfig | grep "inet " | grep -v 127.0.0.1`
- Linux: `hostname -I`

Example: `192.168.1.5`

---

### Step 2: Setup Frontend Files (5 min)

Copy these files to your React Native project:

#### File 1: `services/api/config.ts`
```typescript
const BACKEND_IP = '192.168.1.5'; // ⚠️ CHANGE THIS!
const BACKEND_PORT = '5000';

export const API_CONFIG = {
  BASE_URL: `http://${BACKEND_IP}:${BACKEND_PORT}/api`,
  TIMEOUT: 15000,
};

export const API_ENDPOINTS = {
  HEALTH: '/health',
  REGISTER: '/auth/register',
  LOGIN: '/auth/login',
  PROFILE: '/user/profile',
  UPDATE_PROFILE: '/user/profile',
  CONTACTS: '/user/contacts',
  UPDATE_CONTACTS: '/user/contacts',
  TRIGGER_SOS: '/sos/trigger',
  GET_SOS: (sosId: string) => `/sos/${sosId}`,
  DEACTIVATE_SOS: '/sos/deactivate',
  SOS_HISTORY: '/sos/history',
};
```

#### File 2: `services/api/client.ts`
(See the client.ts file I created above)

#### File 3: `services/api/index.ts`
(See the api-services.ts file I created above)

---

### Step 3: Install Required Packages (2 min)

```bash
cd your-react-native-project

# Core dependencies
npx expo install expo-location
npx expo install @react-native-async-storage/async-storage

# HTTP client
npm install axios

# Icons (if not installed)
npx expo install @expo/vector-icons
```

---

### Step 4: Test Connection (3 min)

Create a test file or use the test-backend.tsx I created:

```typescript
// Simple test
import { API_CONFIG } from './services/api/config';
import axios from 'axios';

const testConnection = async () => {
  try {
    const response = await axios.get(`${API_CONFIG.BASE_URL}/health`);
    console.log('✅ Backend connected:', response.data);
    alert('Success! Backend is reachable.');
  } catch (error) {
    console.error('❌ Connection failed:', error);
    alert('Failed! Check your IP address and WiFi.');
  }
};
```

---

### Step 5: Run and Test (3 min)

1. **Terminal 1 - Backend:**
```bash
cd backend
python app.py
```

2. **Terminal 2 - Frontend:**
```bash
cd frontend
npx expo start
```

3. **On your phone:**
   - Open Expo Go
   - Scan QR code
   - Test the connection

---

## 📱 Usage in Your Components

### Register a User

```typescript
import { authAPI } from '../services/api';

const handleRegister = async () => {
  try {
    const response = await authAPI.register({
      email: 'test@example.com',
      password: 'Test123!',
      name: 'Test User',
      phone: '+919876543210'
    });
    
    console.log('Registered:', response.user_id);
    // Token is automatically stored in AsyncStorage
  } catch (error) {
    console.error('Registration failed:', error);
  }
};
```

### Login a User

```typescript
import { authAPI } from '../services/api';

const handleLogin = async () => {
  try {
    const response = await authAPI.login({
      email: 'test@example.com',
      password: 'Test123!'
    });
    
    console.log('Logged in:', response.user_id);
    // Token is automatically stored
  } catch (error) {
    console.error('Login failed:', error);
  }
};
```

### Trigger SOS Emergency

```typescript
import { sosAPI } from '../services/api';
import * as Location from 'expo-location';

const handleEmergency = async () => {
  try {
    // Get current location
    const location = await Location.getCurrentPositionAsync({});
    
    // Trigger SOS
    const response = await sosAPI.triggerSOS({
      location: {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      },
      trigger_type: 'manual'
    });
    
    console.log('SOS triggered:', response.sos_id);
    alert(`Emergency alert sent! SOS ID: ${response.sos_id}`);
  } catch (error) {
    console.error('SOS failed:', error);
  }
};
```

### Add Emergency Contacts

```typescript
import { contactsAPI } from '../services/api';

const addContacts = async () => {
  try {
    const contacts = [
      { name: 'Mom', phone: '+919876543210', relation: 'Mother' },
      { name: 'Friend', phone: '+919876543211', relation: 'Friend' }
    ];
    
    await contactsAPI.updateContacts(contacts);
    console.log('Contacts added successfully');
  } catch (error) {
    console.error('Failed to add contacts:', error);
  }
};
```

### Get SOS History

```typescript
import { sosAPI } from '../services/api';

const loadHistory = async () => {
  try {
    const response = await sosAPI.getHistory();
    console.log('History:', response.history);
    // response.history is an array of SOS records
  } catch (error) {
    console.error('Failed to load history:', error);
  }
};
```

---

## 🔧 Troubleshooting

### ❌ Error: Network Request Failed

**Solution:**
1. Check Backend is Running:
```bash
# In browser or phone, visit:
http://YOUR_IP:5000/api/health
# Should show: {"status": "healthy", ...}
```

2. Check IP Address:
```typescript
// In config.ts, make sure IP is correct
console.log('API URL:', API_CONFIG.BASE_URL);
// Should log: http://192.168.1.5:5000/api
```

3. Check Same WiFi:
   - Phone and computer MUST be on same network
   - Corporate/University WiFi may block connections

---

### ❌ Error: CORS Policy

Your Flask backend already has CORS enabled:
```python
CORS(app)  # This allows all origins
```

If still having issues, make it more explicit:
```python
from flask_cors import CORS

CORS(app, resources={
    r"/api/*": {
        "origins": "*",
        "methods": ["GET", "POST", "PUT", "DELETE"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})
```

---

### ❌ Error: 401 Unauthorized

This means you're not logged in. Solution:

1. Login first:
```typescript
await authAPI.login({ email: '...', password: '...' });
```

2. Check token is stored:
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

const token = await AsyncStorage.getItem('firebaseToken');
console.log('Token:', token); // Should not be null
```

---

### ❌ Error: Firebase initialization error

Make sure your backend has:
1. `serviceAccountKey.json` file in the same directory as `app.py`
2. `.env` file with `FIREBASE_DATABASE_URL`

```env
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
PORT=5000
```

---

## 📊 API Response Formats

### Successful Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "error": "Error message here",
  "details": "Additional details"
}
```

---

## 🧪 Testing Checklist

```bash
☐ Backend running on 0.0.0.0:5000
☐ Can access http://YOUR_IP:5000/api/health from phone browser
☐ Frontend config.ts has correct IP
☐ Phone and computer on same WiFi
☐ Can register a user
☐ Can login
☐ Can trigger SOS
☐ Can add contacts
☐ Backend logs show requests
```

---

## 📁 File Structure

```
your-react-native-project/
├── services/
│   └── api/
│       ├── config.ts         (API configuration)
│       ├── client.ts         (Axios client)
│       └── index.ts          (API functions)
├── app/
│   ├── index.tsx             (Home screen)
│   ├── auth/
│   │   ├── login.tsx         (Login screen)
│   │   └── register.tsx      (Register screen)
│   └── _layout.tsx           (Navigation)
└── package.json
```

---

## 🎯 Next Steps

1. ✅ Get basic connection working
2. ✅ Implement login/register screens
3. ✅ Add emergency button functionality
4. ⏳ Create contacts management screen
5. ⏳ Add SOS history screen
6. ⏳ Implement real-time location tracking
7. ⏳ Add AI detection features

---

## 📞 Quick Commands Reference

### Backend
```bash
# Start backend
python app.py

# Check if running
curl http://localhost:5000/api/health
```

### Frontend
```bash
# Install dependencies
npm install

# Start Expo
npx expo start

# Clear cache
npx expo start -c
```

---

## 🔥 Firebase Token Notes

Your backend uses **Firebase Custom Tokens**. These are:
- Generated on login/register
- Valid for 1 hour
- Stored in AsyncStorage
- Automatically added to requests

The flow:
1. User registers → Backend creates Firebase user → Returns custom token
2. Frontend stores token in AsyncStorage
3. All API calls include: `Authorization: Bearer <token>`
4. Backend verifies token with Firebase Admin SDK

---

## ✅ Final Verification

Test this sequence:

1. **Health Check:**
```bash
curl http://YOUR_IP:5000/api/health
```

2. **Register:**
```bash
curl -X POST http://YOUR_IP:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "name": "Test User",
    "phone": "+919876543210"
  }'
```

3. **Login:**
```bash
curl -X POST http://YOUR_IP:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }'
```

4. **Trigger SOS:** (Use token from login)
```bash
curl -X POST http://YOUR_IP:5000/api/sos/trigger \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "location": {"latitude": 28.6139, "longitude": 77.2090},
    "trigger_type": "manual"
  }'
```

---

Good luck! Your backend is well-structured and ready to go. 🚀

**Remember:** Change the IP address in `config.ts` to match your computer's IP!
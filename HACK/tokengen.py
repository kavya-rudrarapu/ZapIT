import jwt
import datetime
from functools import wraps
from flask import request, jsonify
import os
JWT_SECRET = "supersecretkey"  
JWT_ALGORITHM = "HS256"
JWT_EXP_DELTA_SECONDS = 86400  
 
def generate_jwt(email,user_id):
    payload = {
        "email": email,
        'user_id': user_id,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(seconds=JWT_EXP_DELTA_SECONDS)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
 
def decode_jwt(token):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        print(f"Raw Authorization Header: {auth_header}")
 
        if not auth_header:
            return jsonify({'error': 'Token is missing'}), 401
 
        try:
            if isinstance(auth_header, bytes):
                auth_header = auth_header.decode('utf-8')
 
            if not isinstance(auth_header, str):
                raise ValueError("Authorization header is not a string")
 
            parts = auth_header.split()
            if len(parts) != 2 or parts[0].lower() != "bearer":
                raise ValueError("Authorization header must be in the format: Bearer <token>")
 
            token = parts[1]
 
            if not isinstance(token, str):
                raise ValueError("Token must be a string")
 
            decoded = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
            user_id = decoded.get('user_id')
            email = decoded.get('email')
 
            if not user_id or not email:
                return jsonify({'error': 'Invalid token payload'}), 401
 
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token has expired'}), 401
        except jwt.InvalidTokenError as e:
            return jsonify({'error': f'Invalid token: {str(e)}'}), 401
        except Exception as e:
            return jsonify({'error': f'Unexpected error: {str(e)}'}), 401
 
        return f(user_id=user_id, email=email, *args, **kwargs)
    return decorated
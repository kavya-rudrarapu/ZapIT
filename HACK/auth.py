from flask import Blueprint, session, request, redirect, jsonify
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build
import db
import os
import json
from tokengen import generate_jwt
from flask import make_response
from tokengen import token_required

auth_bp = Blueprint('auth', __name__)
def credentials_to_dict(credentials):
    return {
        'token': credentials.token,
        'refresh_token': credentials.refresh_token,
        'token_uri': credentials.token_uri,
        'client_id': credentials.client_id,
        'client_secret': credentials.client_secret,
        'scopes': credentials.scopes
    }
 
CLIENT_SECRETS_FILE = "credentials.json"
SCOPES = [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.readonly',
    "https://www.googleapis.com/auth/gmail.metadata",
 
    'openid'
]
REDIRECT_URI = "http://localhost:5001/api/callback"
 
@auth_bp.route('/api/login')
def login():
    flow = Flow.from_client_secrets_file(
        CLIENT_SECRETS_FILE,
        scopes=SCOPES,
        redirect_uri=REDIRECT_URI
    )
    auth_url, state = flow.authorization_url(
        prompt='consent',  
        access_type='offline',  
        include_granted_scopes='true'
    )
    session['state'] = state
   
    return jsonify({"auth_url": auth_url})
 
 
 
 
@auth_bp.route('/api/callback')
def callback():
    os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'
    flow = Flow.from_client_secrets_file(
        CLIENT_SECRETS_FILE,
        scopes=SCOPES,
        redirect_uri=REDIRECT_URI
    )
    flow.fetch_token(authorization_response=request.url)
    credentials = flow.credentials
    with open('token.json', 'w') as token_file:
        token_file.write(json.dumps(credentials_to_dict(credentials)))
   
 
    oauth = build('oauth2', 'v2', credentials=credentials)
    user_info = oauth.userinfo().get().execute()
 
    email = user_info.get('email')
    name = user_info.get('name')
    user = db.add_user(email, name)
 
    session['email'] = email
    session['user_id'] = user.user_id
    token = generate_jwt(email,user.user_id)
    
    return redirect(f"http://localhost:3000/auth/callback?name={name}&token={token}&email={email}&user_id={user.user_id}")


@auth_bp.route('/api/logout', methods=['POST'])
@token_required
def logout(user_id, email):
    try:
        if os.path.exists('token.json'):
            os.remove('token.json')
            return jsonify({"message": "Logged out successfully. Gmail token deleted."}), 200
        else:
            return jsonify({"message": "No token file found. Already logged out?"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

 
 
 
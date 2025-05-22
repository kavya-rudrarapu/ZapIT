from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
import auth
import ticket
import db
from ticket import ticket_bp
from priority_api import priority_bp
 
app = Flask(__name__)
app.secret_key = 'your-secret-key'
CORS(app,origins=["http://localhost:3000"], supports_credentials=True)
 
 
load_dotenv()
db.init_db()
 
app.register_blueprint(auth.auth_bp)
 
app.register_blueprint(ticket_bp)
 
app.register_blueprint(priority_bp)
if __name__ == '__main__':
    app.run(port=5001, debug=True)
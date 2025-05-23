#  Full-Stack LLM-Powered Ticketing System
 
This project is a complete Ticket Management System that uses a **Python backend (Flask/)** and a **React frontend**. Theis application enables user to login and raise tickets and get responses with the Agent and if not an automated mails are generated to admin and user along with features like priority and status
 
---
 
##  Features
 
-  User Login & Authentication
-  Raise a new support ticket
-  Set and update ticket priority (Low, Medium, High)
-  Update ticket status (Open, In Progress, Closed)
-  Admin dashboard to manage all user tickets
- Assign priorties to all tickets by an AI Agent
 
---
 
##  Project Structure
 
ticketing-system/
├── backend/
│   ├── __pycache__/
│   ├── venv/
│   ├── .env
│   ├── app.py
│   ├── auth.py
│   ├── credentials.json
│   ├── db.py
│   ├── models.py
│   ├── priority_api.py
│   ├── ticket.py
│   ├── token.json
│   └── tokengen.py
 
├── frontend/
│   ├── node_modules/
│   ├── public/
│   ├── src/
│   │   ├── auth/
│   │   │   └── callback.jsx
│   │   ├── components/
│   │   │   ├── Admin.jsx
│   │   │   ├── AdminLogin.jsx
│   │   │   ├── AdminProtectedRoute.jsx
│   │   │   ├── CreateTicket.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── PastSolutions.jsx
│   │   │   ├── Tickets.jsx
│   │   │   └── UserProtected.jsx
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── index.js
│   │   ├── index.css
│   │   ├── logo.svg
│   │   ├── reportWebVitals.js
│   │   └── setupTests.js
│   ├── package.json
│   ├── package-lock.json
│   └── README.md
 
├── README.md
└── requirements.txt
---
 
## 🛠️ Backend Setup
 
### 📦 Requirements
 
- Python 3.8+
- pip
- (Optional) Virtualenv
 
### ⚙️ Installation
 
```bash
cd backend
python -m venv venv
source venv\bin\activate
pip install -r requirements.txt
python main.py
 
---
 
#  Frontend – Ticket Management System
 
This is the **React.js frontend** for the LLM-Powered Ticketing System. It allows users to log in, raise tickets, and view ticket statuses, while admins can manage and respond to tickets.
 
---
 
##  Tech Stack
 
-  React.js (Hooks + Functional Components)
-  Axios – API Communication
-  React Router – Client-side Routing
-  Material UI – Prebuilt Styled Components
-  .env – Environment Configuration
 
---
 
##  Getting Started
 
###  Prerequisites
 
Make sure you have the following installed:
 
- **Node.js** (v16+)
- **npm** or **yarn**
 
---
 
###  Installation
 
Open your terminal and run:
 
```bash
# Navigate into the frontend folder
cd frontend
 
# Install dependencies
npm install
 
# Start the frontend application
npm start
# Bento POS System

A full-stack Point of Sale (POS) system for a meal prep delivery service, built with React, Node.js, Express, and MySQL.

## 🏗️ Project Structure

```
3380-team-9-pos-system/
├── backend/                    # Node.js/Express backend server
│   ├── config/                 # Configuration files
│   │   └── database.js         # MySQL connection pool
│   ├── controllers/            # Business logic
│   │   └── authController.js   # Authentication logic (register, login)
│   ├── middleware/             # Express middleware
│   │   └── auth.js             # JWT authentication & role-based access
│   ├── routes/                 # API route definitions
│   │   └── authRoutes.js       # Auth endpoints (/register, /login, /me)
│   ├── utils/                  # Helper utilities
│   │   └── roleHelper.js       # User role mapping (customer, staff, admin)
│   ├── server.js               # Main Express server
│   ├── package.json            # Backend dependencies
│   └── .env                    # Environment variables (DB, JWT secret)
│
└── frontend/
    └── pos-system/             # React + Vite frontend
        ├── src/
        │   ├── components/     # React components
        │   │   ├── admin/      # Admin dashboard
        │   │   ├── auth/       # Login & Register forms
        │   │   ├── customer/   # Customer dashboard, cart, checkout
        │   │   ├── staff/      # Staff dashboard
        │   │   ├── shared/     # Reusable components (Navbar, MealCard)
        │   │   └── ui/         # UI component library (buttons, cards, etc.)
        │   ├── contexts/       # React Context providers
        │   │   ├── AuthContext.jsx  # Authentication state management
        │   │   └── CartContext.jsx  # Shopping cart state
        │   ├── services/       # API communication
        │   │   └── api.js      # HTTP client for backend API
        │   └── lib/            # Libraries and utilities
        │       └── mockData.js # Mock data for development
        ├── package.json        # Frontend dependencies
        └── .env                # Frontend environment variables
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher
- **MySQL** 8.0+ (or access to MySQL database)
- **Git** (for version control)

### 1. Clone the Repository

```powershell
git clone https://github.com/carlcodecode/3380-team-9-pos-system.git
cd 3380-team-9-pos-system
```

### 2. Database Setup

The project uses MySQL database hosted on AWS RDS. Make sure you have:

1. **Database Connection Details**:
   - Host: `team-9.c9oog4w20uqy.us-east-2.rds.amazonaws.com`
   - Database: `bento_pos`
   - User: `admin`
   - Password: (provided in backend/.env)

2. **Database Schema**: The database includes 16 tables:
   - `USER_ACCOUNT` - User credentials and authentication
   - `CUSTOMER` - Customer profile information
   - `STAFF` - Staff details
   - `ORDERS` - Order records
   - `MEAL` - Meal items
   - `PAYMENT` - Payment transactions
   - And more...

3. **Seed Data**: Pre-populated test accounts:
   - **Admin**: username `admin`, password `admin` (role: 2)
   - **Staff**: username `staff`, password `staff` (role: 1)
   - **Customer**: username `customer1`, password `customer1` (role: 0)

### 3. Backend Setup

```powershell
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file (if not exists)
# The .env file should contain:
# DB_HOST=team-9.c9oog4w20uqy.us-east-2.rds.amazonaws.com
# DB_USER=admin
# DB_PASSWORD=<your-password>
# DB_NAME=bento_pos
# JWT_SECRET=<your-secret-key>
# PORT=3001
# NODE_ENV=development
# FRONTEND_URL=http://localhost:3000

# Start the backend server
node server.js
```

**Expected Output**:
```
🚀 Server running on http://localhost:3001
📍 Environment: development
🔗 Frontend URL: http://localhost:3000
✅ Database connected successfully
```

### 4. Frontend Setup

Open a **new terminal** (keep backend running):

```powershell
# Navigate to frontend directory
cd frontend/pos-system

# Install dependencies
npm install

# Create .env file (if not exists)
# The .env file should contain:
# VITE_API_URL=http://localhost:3001/api

# Start the frontend development server
npm run dev
```

**Expected Output**:
```
VITE v6.3.5  ready in 854 ms
➜  Local:   http://localhost:3000/
```

### 5. Access the Application

Open your browser and go to: **http://localhost:3000**

## 🔐 Authentication System

### User Roles

The system supports three user roles:

- **Customer (role: 0)**: Can browse meals, add to cart, place orders, view order history
- **Staff (role: 1)**: Can manage orders, view customer information, update order status
- **Admin (role: 2)**: Full system access, user management, reports, and analytics

### API Endpoints

#### Authentication Routes (`/api/auth`)

- `POST /api/auth/register` - Create new customer account
  - Body: `{ email, username, password, firstName, lastName }`
  
- `POST /api/auth/login` - Login and receive JWT token
  - Body: `{ username, password }`
  - Returns: `{ token, user: { id, username, email, role } }`

- `GET /api/auth/me` - Get current user (protected)
  - Headers: `Authorization: Bearer <token>`
  
- `POST /api/auth/logout` - Logout (protected)
  - Headers: `Authorization: Bearer <token>`

### How Authentication Works

1. **Register/Login**: User submits credentials → Backend validates → Returns JWT token
2. **Token Storage**: Frontend stores JWT in `localStorage`
3. **Protected Requests**: Frontend includes token in `Authorization` header
4. **Token Verification**: Backend middleware verifies JWT before accessing protected routes
5. **Role-Based Access**: Middleware checks user role for admin/staff-only endpoints

## 🛠️ Development

### Backend Technologies

- **Express 5.1.0** - Web framework
- **MySQL2** - Database driver with promise support
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT token generation/verification
- **dotenv** - Environment variable management
- **cors** - Cross-Origin Resource Sharing

### Frontend Technologies

- **React 18** - UI library
- **Vite 6.3.5** - Build tool and dev server
- **React Router DOM** - Client-side routing
- **Framer Motion** - Animation library
- **Sonner** - Toast notifications
- **Tailwind CSS** - Utility-first CSS framework

### Project Features

✅ **User Authentication** - Secure registration and login with JWT  
✅ **Role-Based Access Control** - Customer, Staff, and Admin roles  
✅ **Shopping Cart** - Add meals, update quantities, checkout  
✅ **Order Management** - Place orders, track status, view history  
✅ **Responsive Design** - Mobile-friendly UI with Tailwind CSS  
✅ **Real-time Validation** - Form validation and error handling  

## 📝 Common Commands

### Backend Commands

```powershell
# Start server
node server.js

# Generate password hashes (for testing)
node generate-hashes.js

# Test authentication endpoints
node test-auth.js
```

### Frontend Commands

```powershell
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🐛 Troubleshooting

### Backend Won't Start

1. **Check if port 3001 is in use**:
   ```powershell
   netstat -ano | findstr :3001
   ```

2. **Kill existing Node processes**:
   ```powershell
   Get-Process -Name node | Stop-Process -Force
   ```

3. **Verify database connection** in `.env` file

### Frontend Won't Start

1. **Check if port 3000 is in use** - Vite will auto-select next available port
2. **Clear node_modules and reinstall**:
   ```powershell
   Remove-Item -Recurse -Force node_modules
   npm install
   ```

### Login/Register Errors

1. **"Unexpected end of JSON input"** - Backend not running or wrong API URL
2. **"Invalid credentials"** - Check username/password match database
3. **CORS errors** - Verify `FRONTEND_URL` in backend `.env` matches frontend port

### Database Connection Issues

1. **Check AWS RDS security group** allows your IP
2. **Verify credentials** in backend `.env`
3. **Test connection**:
   ```powershell
   mysql -h team-9.c9oog4w20uqy.us-east-2.rds.amazonaws.com -u admin -p bento_pos
   ```

## 🔒 Security Notes

- **Never commit `.env` files** - Contains sensitive credentials
- **JWT tokens expire after 24 hours** - Users must re-login
- **Passwords are hashed with bcrypt** - 10 salt rounds
- **CORS is configured** - Only allowed origins can access API
- **SQL injection protected** - Using parameterized queries

## 📦 Dependencies

### Backend Dependencies

```json
{
  "express": "^5.1.0",
  "mysql2": "^3.12.0",
  "bcryptjs": "^2.4.3",
  "jsonwebtoken": "^9.0.2",
  "dotenv": "^17.2.3",
  "cors": "^2.8.5"
}
```

### Frontend Dependencies

```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "react-router-dom": "^7.1.1",
  "framer-motion": "^11.18.0",
  "sonner": "^1.7.2"
}
```

## 👥 Team

**Team 9 - Database Systems (CS 3380)**

## 📄 License

This project is for educational purposes as part of CS 3380 coursework.

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -m "Add your feature"`
3. Push to branch: `git push origin feature/your-feature`
4. Create a Pull Request

## 📞 Support

For issues or questions, please create an issue in the GitHub repository.

---

**Happy Coding! 🚀**

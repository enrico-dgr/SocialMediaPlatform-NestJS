# 🚀 Development Guide

## Quick Start

### 1. **Start the Backend** (Required First!)
```bash
# In the main project directory
npm run start:dev
```
The backend will run on `http://localhost:3000`

### 2. **Start the Frontend** 
```bash
# In the frontend directory
cd frontend
npm run dev
```
The frontend will run on `http://localhost:5173` (Vite default)

---

## ⚠️ Common Issues & Solutions

### **Login Issues**

#### "Unable to connect to server" / "Network Error"
- ✅ **Solution**: Make sure the backend is running first
- Run: `npm run start:dev` in the main directory
- Check: `http://localhost:3000/health` should return `{"status":"ok"}`

#### "CORS Error" in browser console
- ✅ **Solution**: Backend now supports multiple frontend ports
- Supported ports: 3000, 5173, 4173
- If using a different port, add it to `src/config/app.config.ts`

#### "Invalid credentials" but you're sure they're correct
- ✅ **Solution**: Create a new account first via the register page
- Or check if you have existing users in the database

### **UI Issues**

#### Inputs look like plain rectangles
- ✅ **Fixed**: Enhanced Input component with proper styling
- Uses `variant="outlined"` and `size="lg"` for better appearance
- Added gradients, shadows, and animations

#### Buttons don't look modern
- ✅ **Fixed**: Enhanced Button component with:
  - Gradient backgrounds
  - Hover animations and scaling
  - Loading states with spinners
  - Multiple variants and sizes

---

## 🛠️ Development Workflow

### **Backend Development**
```bash
# Start with hot reload
npm run start:dev

# Run tests
npm run test

# Build for production
npm run build
```

### **Frontend Development**
```bash
cd frontend

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### **Database Setup**
Make sure you have PostgreSQL running or use Docker:
```bash
# Start database with Docker
npm run docker:up

# Stop database
npm run docker:down
```

---

## 🎨 UI Enhancements Applied

### **Enhanced Components**
- ✅ **Input**: Gradients, shadows, animations, better focus states
- ✅ **Button**: Gradient backgrounds, hover effects, loading states
- ✅ **Card**: Glass morphism, backdrop blur, hover transformations
- ✅ **Avatar**: Status indicators, gradient initials, hover effects
- ✅ **Badge**: Notification dots, count display, animations
- ✅ **Skeleton**: Professional loading placeholders

### **Design System**
- ✅ **Colors**: Rich gradient palette with semantic variants
- ✅ **Typography**: Inter font with gradient text for headings
- ✅ **Animations**: Smooth keyframe animations throughout
- ✅ **Shadows**: Layered depth with colored shadows
- ✅ **Layout**: Glass morphism backgrounds with decorative elements

### **Login Page Improvements**
- ✅ **Background**: Gradient mesh with floating orbs
- ✅ **Card**: Glass morphism with backdrop blur
- ✅ **Inputs**: Enhanced styling with proper focus states
- ✅ **Button**: Prominent styling with hover effects
- ✅ **Error Handling**: Detailed error messages for debugging

---

## 🧪 Testing the Login

### **Create a Test Account**
1. Go to the Register page
2. Fill in the form with valid data
3. Use a real email format (validation is strict)
4. Password should be at least 6 characters

### **API Testing**
You can test the backend API directly:
```bash
# Check if backend is running
curl http://localhost:3000/health

# Test registration (adjust data as needed)
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "username": "testuser",
    "firstName": "Test",
    "lastName": "User"
  }'

# Test login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

---

## 📱 Mobile Development

The UI is fully responsive and mobile-friendly:
- Touch targets are properly sized
- Animations work smoothly on mobile
- Layout adapts to different screen sizes
- All interactions are touch-optimized

---

## 🔧 Configuration

### **Backend Ports**
- Default: `3000`
- Health check: `http://localhost:3000/health`
- API docs: `http://localhost:3000/api/docs` (development only)
- GraphQL: `http://localhost:3000/graphql`

### **Frontend Ports**
- Vite dev: `5173` (default)
- Vite preview: `4173` (default)

### **CORS Configuration**
Backend accepts requests from:
- `http://localhost:3000`
- `http://localhost:5173` 
- `http://localhost:4173`

Need a different port? Update `src/config/app.config.ts`

---

## 🎯 Next Steps

Once you have both servers running:
1. Test the registration flow
2. Test the login flow
3. Explore the enhanced UI components
4. Check the responsive design on different screen sizes

The application now has a modern, professional appearance with smooth animations and excellent user experience!

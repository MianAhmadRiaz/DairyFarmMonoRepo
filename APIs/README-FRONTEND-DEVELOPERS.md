# 📋 Cattle Care API Documentation - Frontend Developer Guide

## 🎯 Quick Start for Frontend Developers

### Option 1: Use the YAML File (Recommended)
1. **Download the YAML file**: `cattle-care-api.yaml`
2. **Paste it into any online Swagger editor**:
   - [Swagger Editor](https://editor.swagger.io/) - Official Swagger editor
   - [SwaggerHub](https://app.swaggerhub.com/) - Advanced collaboration platform
   - [Stoplight Studio](https://stoplight.io/studio/) - API design tool

### Option 2: Use the HTML File (Standalone)
1. **Download both files**: `api-documentation.html` and `cattle-care-api.yaml`
2. **Place them in the same folder**
3. **Open `api-documentation.html`** in any modern web browser
4. **The documentation will load automatically**

### Option 3: Use the Live Server (Development)
- **Live Documentation**: `http://localhost:2500/api-docs`
- **Server Status**: ✅ Running on port 2500
- **Health Check**: `http://localhost:2500/`

---

## 🚀 API Overview

### Base URLs
- **Development**: `http://localhost:2500`
- **Production**: `https://api.cattlecare.com` (when deployed)

### Authentication
Most endpoints require JWT authentication:
```http
Authorization: Bearer <your-jwt-token>
```

Get token from: `POST /auth/login`

---

## 🌟 Key API Modules

### 🔐 Authentication
- `POST /auth/login` - Get JWT token

### 🌾 Feeding Module (NEW!)
**11 Advanced Endpoints for Complete Feeding Automation:**

#### 📋 Setup & Management
- `GET /feeding/pens-with-animals` - Get pens for feeding
- `GET /feeding/feed-ingredients` - Available feed ingredients
- `GET /feeding/recipe-groups` - Recipe categories
- `POST /feeding/recipe-groups` - Create recipe groups
- `GET /feeding/recipes` - All feed recipes
- `POST /feeding/recipes` - Create new recipes

#### 🍽️ Feeding Operations
- `POST /feeding/apply-recipe-shed` - Apply recipe to entire shed
- `POST /feeding/apply-recipe-adjustable-shed` - Apply with custom adjustments

#### 📊 Reports & Analytics
- `GET /feeding/shed-feed-report` - Detailed shed feeding reports
- `GET /feeding/date-wise-feed-report` - Daily feeding overview
- `GET /feeding/shed-feed-stock-print` - Printable reports

### 🐄 Animal Management
- `GET /animal` - List all animals
- `POST /animal` - Register new animal

### 🥛 Milk Production
- `GET /milk` - Production records
- `POST /milk` - Record production

### 📊 Dashboard
- `GET /dashboard/summary` - Farm overview

---

## 🔧 Frontend Implementation Tips

### 1. Authentication Flow
```javascript
// Login and store token
const loginResponse = await fetch('/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
const { data } = await loginResponse.json();
localStorage.setItem('token', data.token);

// Use token in subsequent requests
const headers = {
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
  'Content-Type': 'application/json'
};
```

### 2. Feeding Module Integration
```javascript
// Get pens for feeding interface
const pens = await fetch('/feeding/pens-with-animals', { headers });

// Apply feeding recipe
const feedingResult = await fetch('/feeding/apply-recipe-shed', {
  method: 'POST',
  headers,
  body: JSON.stringify({
    shedId: 'shed-uuid',
    recipeId: 'recipe-uuid',
    mealTime: 'morning',
    feedingDate: '2025-10-11'
  })
});
```

### 3. Error Handling
All API responses follow this structure:
```javascript
{
  "statusCode": 200,
  "success": true,
  "message": "Operation completed successfully",
  "type": "data",
  "data": { /* your data here */ }
}

// Error responses:
{
  "statusCode": 400,
  "success": false,
  "message": "Validation error",
  "error": { /* error details */ }
}
```

---

## 📱 Recommended Frontend Screens

### 🌾 Feeding Module Screens
1. **Feeding Dashboard** - Overview of today's feeding status
2. **Recipe Management** - Create and manage feed recipes
3. **Schedule Feeding** - Apply recipes to sheds/pens
4. **Feeding Reports** - Analytics and historical data
5. **Feed Inventory** - Available ingredients and stock

### 🐄 Core Application Screens
1. **Animal List/Registry** - View and manage animals
2. **Milk Production Entry** - Daily milk recording
3. **Farm Dashboard** - Key metrics overview
4. **Reports** - Comprehensive farm analytics

---

## 🚀 Development Environment

### Server Status: ✅ Running
- **Port**: 2500
- **Environment**: Local development
- **Database**: PostgreSQL (auto-creating tables)
- **Live Docs**: `http://localhost:2500/api-docs`

### Testing the API
1. **Start with authentication**: `POST /auth/login`
2. **Test feeding endpoints**: Use the 11 feeding module endpoints
3. **Check data flow**: Animal → Pen → Shed → Recipe → Feeding

---

## 📞 Support & Resources

### Documentation Files
- **YAML Specification**: `cattle-care-api.yaml` (paste into Swagger editor)
- **HTML Documentation**: `api-documentation.html` (open in browser)
- **This Guide**: `README-FRONTEND-DEVELOPERS.md`

### Getting Help
- **API Support**: support@cattlecare.com
- **Technical Issues**: Check server logs or restart with `npm run start:local`
- **Documentation Updates**: Regenerate from live server

---

## ⚡ Quick Testing

### Test Authentication
```bash
curl -X POST http://localhost:2500/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@cattlecare.com","password":"your-password"}'
```

### Test Feeding Endpoints (with token)
```bash
curl -X GET http://localhost:2500/feeding/pens-with-animals \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

**Happy Coding! 🚀**

*This API includes the complete Feeding Module with intelligent automation features for modern dairy farm management.*
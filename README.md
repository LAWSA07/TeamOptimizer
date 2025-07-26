# TeamOptimizer - AI-Driven Team Formation

An intelligent team formation system that uses AI to optimize team composition based on skills, workload, and chemistry.

## 🚀 Features

- **AI-Powered Team Optimization**: Advanced algorithms for optimal team formation
- **Employee Management**: Comprehensive employee profiles with skills and preferences
- **Project Management**: Create and manage projects with role requirements
- **Analytics Dashboard**: Performance metrics and team insights
- **Real-time Collaboration**: Team communication and project tracking

## 🛠️ Tech Stack

### Frontend
- React 18
- Chakra UI
- React Router
- React Icons

### Backend
- FastAPI (Python)
- MongoDB (Atlas)
- Motor (Async MongoDB driver)
- Pydantic (Data validation)

## 📦 Installation

### Prerequisites
- Node.js (v16+)
- Python (v3.8+)
- MongoDB Atlas account

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
# Create .env file with your MongoDB URL
uvicorn main:app --reload
```

## 🌐 Deployment

### Frontend (Netlify)
1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `build`
4. Add environment variable: `REACT_APP_API_URL=https://your-backend-url.com`

### Backend (Railway/Render/Heroku)
1. Connect your GitHub repository
2. Set environment variables:
   - `MONGODB_URL`: Your MongoDB Atlas connection string
   - `ALLOWED_ORIGINS`: Your frontend domain
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

## 🔧 Environment Variables

### Frontend (.env)
```
REACT_APP_API_URL=https://your-backend-url.com
```

### Backend (.env)
```
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net
ALLOWED_ORIGINS=https://your-frontend-domain.netlify.app
SECRET_KEY=your-secret-key
```

## 📁 Project Structure

```
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── pages/           # Page components
│   │   ├── components/      # Reusable components
│   │   └── config.js        # API configuration
│   └── netlify.toml         # Netlify configuration
├── backend/                  # FastAPI backend
│   ├── auth/                # Authentication routes
│   ├── employees/           # Employee management
│   ├── projects/            # Project management
│   ├── optimization/        # AI optimization logic
│   ├── analytics/           # Analytics routes
│   ├── collaboration/       # Collaboration features
│   └── main.py              # FastAPI application
└── README.md
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License. 
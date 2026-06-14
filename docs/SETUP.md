# Local Setup Guide

Follow these instructions to set up Resource-Adda locally.

## Prerequisites
- Node.js (v18+)
- `pnpm` (v8+)
- MongoDB (Local instance or MongoDB Atlas)
- Cloudinary Account (for file uploads)

## 1. Environment Variables

### Backend (`backend/.env`)
Create a `.env` file in the `backend` directory:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/resource-adda
JWT_SECRET=your_super_secret_jwt_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Frontend (`frontend/.env.local`)
Create a `.env.local` file in the `frontend` directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## 2. Installation
Run the following from the root directory to install all dependencies for both frontend and backend:
```bash
pnpm install
```

## 3. Running the App
To start both the frontend and backend simultaneously, run:
```bash
pnpm run dev
```

- **Frontend** will be available at: http://localhost:3000
- **Backend API** will be available at: http://localhost:5000

## 4. Initial Setup (Super Admin)
1. Navigate to `http://localhost:3000/register`.
2. The **first** user to register on a fresh database is automatically granted the `super_admin` role.
3. Once registered, log in and navigate to the **System Settings** in the dashboard to define your institute name, allowed email patterns, and dynamic page configurations.

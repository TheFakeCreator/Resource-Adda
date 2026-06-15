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

## 5. Production Deployment Guide

If you are handing this project off to someone else to deploy, they should follow these exact steps:

### Prerequisites for Production

- A VPS or Cloud Server (Ubuntu/Debian recommended)
- Node.js (v18+) and `pnpm` installed globally
- A MongoDB cluster (e.g., MongoDB Atlas)
- PM2 installed globally (`npm install -g pm2`) for process management
- Nginx for reverse proxy (optional but recommended)

### Step-by-Step Deployment

1. **Clone the repository**

   ```bash
   git clone https://github.com/NITRR-Official/Resource-Adda.git
   cd Resource-Adda
   ```

2. **Set up Environment Variables**
   The project requires `.env` files which are not tracked in git. You must copy the example templates:

   ```bash
   # Backend
   cp backend/.env.example backend/.env
   # Frontend
   cp frontend/.env.example frontend/.env.production
   ```

   **Important:** Open both newly created files and fill in the actual production values:
   - `backend/.env`: Provide the production `MONGODB_URI`, set a strong random `JWT_SECRET`, add Cloudinary credentials, and set `NODE_ENV=production`.
   - `frontend/.env.production`: Set `NEXT_PUBLIC_API_URL` to your production backend URL (e.g., `https://api.yourdomain.com/api`).

3. **Install Dependencies**

   ```bash
   pnpm install
   ```

4. **Build the Application**

   ```bash
   # Build backend
   cd backend && pnpm run build && cd ..

   # Build frontend
   cd frontend && pnpm run build && cd ..
   ```

5. **Start Services with PM2**

   ```bash
   # Start backend
   cd backend
   pm2 start dist/server.js --name "resource-adda-api"
   cd ..

   # Start frontend
   cd frontend
   pm2 start npm --name "resource-adda-web" -- start
   cd ..

   # Save PM2 process list to auto-restart on server reboot
   pm2 save
   pm2 startup
   ```

6. **First Login & Configuration**
   - Just like local setup, the **very first user** to register in production will get the `super_admin` role.
   - You MUST do this immediately after deployment to secure the admin account.
   - Log in, go to Admin Settings, and set the `allowedEmailPatterns` (e.g., `*@*.nitrr.ac.in`) so users can start registering.

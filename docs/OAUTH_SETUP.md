# Google OAuth 2.0 Setup Guide

This guide will walk you through the steps to configure Google OAuth for Resource-Adda so users can sign in with their Google accounts.

## 1. Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Sign in with your Google account.
3. In the top navigation bar, click the project dropdown and click **New Project**.
4. Give your project a name (e.g., `Resource-Adda Auth`) and click **Create**.
5. Once created, make sure your new project is selected in the top navigation bar.

## 2. Configure the OAuth Consent Screen

1. In the left sidebar, navigate to **APIs & Services** > **OAuth consent screen**.
2. Select **External** (unless you have a Google Workspace and want to restrict it strictly to your workspace organization) and click **Create**.
3. Fill in the required app information:
   - **App name**: `Resource-Adda`
   - **User support email**: Your email address
   - **Developer contact information**: Your email address
4. Click **Save and Continue**.
5. On the **Scopes** screen, you don't need to add any special scopes. The default `email`, `profile`, and `openid` scopes are sufficient. Click **Save and Continue**.
6. On the **Test users** screen, add your own email address as a test user if your app remains in "Testing" mode. Click **Save and Continue**.
7. Review your settings and click **Back to Dashboard**.

## 3. Create OAuth Credentials

1. In the left sidebar, click **Credentials**.
2. Click **+ CREATE CREDENTIALS** at the top and select **OAuth client ID**.
3. Under **Application type**, select **Web application**.
4. Give it a name (e.g., `Resource-Adda Web Client`).
5. Under **Authorized JavaScript origins**, click **+ ADD URI**.
   - Add your local development URL: `http://localhost:3000`
   - Add your production frontend URL (e.g., `https://your-domain.com`)
6. Under **Authorized redirect URIs**, you **do not** need to add anything since we are using Google Identity Services (One Tap/Pop-up) and handling the token verification on our backend directly.
7. Click **Create**.
8. A modal will appear displaying your **Client ID** and **Client Secret**.
   - _Note: We only need the Client ID for our current implementation. Keep your client secret safe anyway._

## 4. Add Credentials to Environment Variables

Copy your **Client ID** and add it to both your frontend and backend environment files.

### Frontend

Open `frontend/.env.local` (or `.env.production`) and add:

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
```

### Backend

Open `backend/.env` and add:

```env
GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
```

## 5. Restart Your Servers

After adding the environment variables, restart your frontend and backend development servers to apply the changes.

```bash
pnpm dev
```

You should now be able to use the "Continue with Google" buttons on both the login and registration pages!

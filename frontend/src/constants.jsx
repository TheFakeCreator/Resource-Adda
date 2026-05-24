// export const BASE_SERVER_URL = "https://resource-adda-1030059749120.asia-south1.run.app/server"
// export const SOCKET_URL = "https://resource-adda-1030059749120.asia-south1.run.app"
// export const BASE_SERVER_URL = "https://adda-server-1030059749120.asia-south1.run.app/server"
// export const SOCKET_URL = "https://adda-server-1030059749120.asia-south1.run.app"
// export const BASE_SERVER_URL = "http://localhost:3333/server"
// export const SOCKET_URL = 'http://localhost:3333'
// This grabs the live URL from Render. If it's not found (like when you run it locally), it uses localhost.
const backendUrl = import.meta.env.VITE_BACKEND_URL;

export const BASE_SERVER_URL = `${backendUrl}/server`;
export const SOCKET_URL = backendUrl;
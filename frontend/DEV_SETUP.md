# Development Setup

## Quick Start

To start both backend and frontend servers concurrently:

```bash
cd frontend
npm run dev
```

This will automatically:
- Start the FastAPI backend server on `http://localhost:8000`
- Start the Vite frontend server on `http://localhost:3000`
- Enable hot-reload for both servers

## Available Scripts

- `npm run dev` - Start both backend and frontend concurrently
- `npm run dev:backend` - Start only the backend server
- `npm run dev:frontend` - Start only the frontend server
- `npm run build` - Build the frontend for production
- `npm run preview` - Preview the production build

## Servers

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## Stopping Servers

Press `Ctrl+C` in the terminal to stop all running servers.

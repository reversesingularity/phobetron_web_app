# Phobetron Frontend

Modern React + TypeScript + Vite frontend for the Phobetron celestial events tracking platform.

## Features

- 📊 **Dashboard** - Overview of all tracked events
- 🗺️ **Interactive Map** - Global visualization using Leaflet.js
- 🌍 **Earthquakes** - Real-time USGS earthquake data
- 🌋 **Volcanic Activity** - Volcanic eruption tracking
- 🪐 **NEO Close Approaches** - Near-Earth Object monitoring from NASA/JPL
- 🎨 **Modern UI** - Built with Tailwind CSS
- ⚡ **Fast** - Powered by Vite

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Leaflet** - Interactive maps
- **Chart.js** - Data visualization
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`

### Build for Production

```bash
# Build the app
npm run build

# Preview production build
npm run preview
```

## Environment Variables

Create a `.env` file based on `.env.example`:

```env
VITE_API_URL=https://phobetronwebapp-production.up.railway.app/api/v1
```

## Project Structure

```
frontend/
├── src/
│   ├── components/      # Reusable components
│   │   └── Layout.tsx   # Main layout with navigation
│   ├── pages/          # Page components
│   │   ├── Dashboard.tsx
│   │   ├── MapPage.tsx
│   │   ├── EarthquakesPage.tsx
│   │   ├── VolcanicPage.tsx
│   │   └── NEOPage.tsx
│   ├── services/       # API services
│   │   └── api.ts      # API client and type definitions
│   ├── App.tsx         # Root component with routing
│   ├── main.tsx        # Entry point
│   └── index.css       # Global styles
├── public/             # Static assets
├── index.html          # HTML template
├── vite.config.ts      # Vite configuration
├── tailwind.config.js  # Tailwind CSS configuration
└── tsconfig.json       # TypeScript configuration
```

## API Integration

The frontend connects to the Phobetron API running on Railway. All API calls are proxied through Vite's dev server to avoid CORS issues during development.

### Available Endpoints

- `GET /events/earthquakes` - List earthquakes
- `GET /events/volcanic-activity` - List volcanic eruptions
- `GET /scientific/close-approaches` - List NEO approaches

See the full API documentation at: https://phobetronwebapp-production.up.railway.app/docs

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Style

The project uses ESLint and TypeScript for code quality. Run `npm run lint` to check for issues.

## Deployment

### Railway Deployment

1. Connect your GitHub repository to Railway
2. Add a new service for the frontend
3. Set environment variables in Railway dashboard
4. Railway will automatically detect Vite and deploy

### Build Settings

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install"
}
```

### Environment Variables for Production

- `VITE_API_URL` - Your production API URL

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

See the main project LICENSE file.

## Support

- API Documentation: https://phobetronwebapp-production.up.railway.app/docs
- GitHub Issues: https://github.com/reversesingularity/phobetron_web_app/issues

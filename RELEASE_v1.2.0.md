## 🌟 Production-Ready Release

[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.17558316.svg)](https://doi.org/10.5281/zenodo.17558316)
[![Version](https://img.shields.io/badge/version-1.2.0-blue.svg)](https://github.com/reversesingularity/phobetron_web_app/releases/tag/v1.2.0)
[![Status](https://img.shields.io/badge/status-production-brightgreen.svg)](https://phobetronwebapp-production-d69a.up.railway.app)

**Phobetron v1.2.0** is the first production-ready release of the world's first AI-powered biblical prophecy and celestial pattern detection system.

### 🚀 Live Demo
**https://phobetronwebapp-production-d69a.up.railway.app**

### ✨ What's New in v1.2.0

#### 🎨 UI/UX Enhancements
- **14 Functional Pages**: Complete application with modern design
- **Catalyst UI Integration**: Premium components with 2025 design trends
- **Dashboard V2**: Neumorphic cards, bold typography, glassmorphism effects
- **Micro-animations**: Staggered entrance animations, hover effects
- **Responsive Design**: Mobile-optimized layouts

#### 🤖 Machine Learning
- **4 Trained Models** with 75%+ accuracy:
  - Event Predictor (89% accuracy) - Earthquake clusters
  - Anomaly Detector (78% accuracy) - Volcanic eruptions
  - LSTM Forecaster (81% accuracy) - Hurricane formation
  - Pattern Classifier (84% accuracy) - Tsunami risk
- **100+ Training Events**: Historical data from 1900-2025
- **4 New API Endpoints**: NEO predictor, Watchman alerts, anomaly detection, pattern recognition

#### 🔭 Astronomical Features
- **Hyperbolic Orbit Support**: Interstellar objects ('Oumuamua, Borisov, 3I/ATLAS)
- **Moon Orbital Mechanics**: Eccentricity and inclination implemented
- **Debris Trail System**: Particle effects for fragmenting comets
- **Lunar Phases**: Real-time calculation based on geometry
- **3D Solar System**: Three.js rendering with accurate Keplerian mechanics

#### 🗄️ Database
- **PostgreSQL 16** with PostGIS spatial support
- **15 Core Tables**: Events, celestial signs, prophecies, correlations
- **6 Orbital Elements**: Planets and interstellar objects
- **10 Celestial Signs**: Blood moons, solar eclipses, meteor showers
- **40 Prophecies**: Canonical, apocryphal, and pseudepigraphal sources

#### 🚢 Deployment
- **Railway Production**: Live at phobetronwebapp-production-d69a.up.railway.app
- **Nginx Configuration**: Port 8080, SPA routing
- **Environment Variables**: Secure configuration management
- **Backup System**: Automated backups with restore scripts

### 📦 Installation

```bash
# Clone repository
git clone https://github.com/reversesingularity/phobetron_web_app.git
cd phobetron_web_app

# Backend setup
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8020

# Frontend setup (new terminal)
cd frontend
npm install
npm run dev
```

Visit http://localhost:3000 to see the app running locally.

### 📚 Documentation

- [README.md](README.md) - Complete overview
- [CHANGELOG.md](CHANGELOG.md) - Version history
- [CITATION.md](CITATION.md) - How to cite this work
- [docs/DATABASE_SCHEMA_COMPLETE.md](docs/DATABASE_SCHEMA_COMPLETE.md) - Database design
- [docs/ZENODO_UPLOAD_GUIDE.md](docs/ZENODO_UPLOAD_GUIDE.md) - Zenodo archival instructions
- [docs/GITHUB_RELEASE_GUIDE.md](docs/GITHUB_RELEASE_GUIDE.md) - Release workflow

### 🔗 Links

- **Live Demo**: https://phobetronwebapp-production-d69a.up.railway.app
- **Zenodo DOI**: https://doi.org/10.5281/zenodo.17558316
- **GitHub Repo**: https://github.com/reversesingularity/phobetron_web_app
- **Issues**: https://github.com/reversesingularity/phobetron_web_app/issues

### 📖 Citation

If you use Phobetron in your research:

```bibtex
@software{modina_phobetron_2025,
  author       = {Modina, Christopher},
  title        = {{Phobetron: Biblical Prophecy \& Celestial Pattern 
                   Detection System}},
  month        = nov,
  year         = 2025,
  publisher    = {Zenodo},
  version      = {1.2.0},
  doi          = {10.5281/zenodo.17558316},
  url          = {https://phobetronwebapp-production-d69a.up.railway.app}
}
```

**APA Style (7th Edition):**
```
Modina, C. (2025). Phobetron: Biblical Prophecy & Celestial Pattern Detection System (Version 1.2.0) [Computer software]. https://doi.org/10.5281/zenodo.17558316
```

See [CITATION.md](CITATION.md) for additional citation formats (MLA, Chicago, IEEE, Harvard).

### 🛠️ Technical Stack

**Frontend:**
- Next.js 16.0
- React 19.2
- TypeScript 5
- Three.js (3D visualization)
- Catalyst UI components
- Tailwind CSS

**Backend:**
- Python 3.11+
- FastAPI
- PostgreSQL 16
- PostGIS (spatial extension)
- scikit-learn (ML)
- LSTM & XGBoost

**Deployment:**
- Railway platform
- Nginx reverse proxy
- Environment-based configuration

### 🐛 Bug Fixes

- Fixed backend server startup issues
- Resolved frontend hydration errors
- Corrected orbital mechanics calculations
- Fixed Railway deployment configuration
- Improved database connection pooling

### ⚡ Performance

- GPU acceleration for Three.js rendering
- VS Code optimizations (60 FPS maintained)
- Lazy loading for ML models
- Database query optimization
- Frontend code splitting

### 🔒 Security

- Environment variable protection
- CORS configuration
- SQL injection prevention (SQLAlchemy ORM)
- Input validation on all API endpoints

### 🙏 Acknowledgments

- **NASA JPL Horizons**: Planetary ephemeris data
- **USGS**: Earthquake and volcanic event data
- **Hebrew Calendar Library**: Jewish calendar calculations
- **Catalyst UI**: Premium React component library

### 📝 License

MIT License - see [LICENSE](LICENSE) file for details

### 👤 Author

**Christopher Modina**
- Email: cmodina70@gmail.com
- GitHub: [@reversesingularity](https://github.com/reversesingularity)
- ORCID: [0009-0004-9525-0631](https://orcid.org/0009-0004-9525-0631)

---

**Full Changelog**: https://github.com/reversesingularity/phobetron_web_app/blob/001-database-schema/CHANGELOG.md

**Release Date**: November 18, 2025

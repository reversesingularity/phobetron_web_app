# Zenodo Upload Guide for Phobetron v1.2.0

## Step-by-Step Instructions

### 1. Prepare the Release Package

Create a clean release archive:

```powershell
# Navigate to project root
cd F:\Projects\phobetron_web_app

# Create release directory
New-Item -ItemType Directory -Path "releases\v1.2.0" -Force

# Copy essential files
$filesToInclude = @(
    "README.md",
    "LICENSE",
    "CITATION.md",
    "CITATION.cff",
    "ZENODO_METADATA.json",
    "backend\",
    "frontend\",
    "docs\",
    "railway.toml",
    ".gitignore"
)

foreach ($file in $filesToInclude) {
    Copy-Item -Path $file -Destination "releases\v1.2.0\" -Recurse -Force
}

# Exclude unnecessary files
Remove-Item "releases\v1.2.0\backend\venv" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "releases\v1.2.0\backend\__pycache__" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "releases\v1.2.0\backend\.pytest_cache" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "releases\v1.2.0\frontend\node_modules" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "releases\v1.2.0\frontend\.next" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "releases\v1.2.0\frontend\dist" -Recurse -Force -ErrorAction SilentlyContinue

# Create ZIP archive
Compress-Archive -Path "releases\v1.2.0\*" -DestinationPath "releases\phobetron-v1.2.0.zip" -Force

Write-Host "✅ Release package created: releases\phobetron-v1.2.0.zip"
```

### 2. Log into Zenodo

1. Go to [https://zenodo.org](https://zenodo.org)
2. Click "Log in" (top right)
3. Use your credentials or GitHub OAuth

### 3. Create New Upload

1. Click "Upload" → "New upload"
2. You'll see the upload form

### 4. Fill in Basic Information

**Upload files:**
- Drag and drop `phobetron-v1.2.0.zip` OR
- Click "Choose files" and select the ZIP

**Communities:**
- Search and add: "zenodo" (optional)
- Search and add: "astronomy" (if available)
- Search and add: "machine-learning" (if available)

### 5. Fill in Metadata (Use ZENODO_METADATA.json as reference)

**Upload type:**
- Select: "Software"

**Basic information:**
- **Digital Object Identifier**: Leave blank (Zenodo will generate)
- **Publication date**: 2025-11-18
- **Title**: Phobetron: Biblical Prophecy & Celestial Pattern Detection System
- **Creators**: 
  - Name: Modi, Charles
  - Affiliation: Reverse Singularity
  - ORCID: (add if you have one)

**Description:**
```
World's first AI-powered web application integrating biblical prophecy analysis, NASA-grade astronomical tracking, and seismic disaster correlation using machine learning. 

Features:
• Real-time 3D solar system visualization with hyperbolic orbit support
• ML models achieving 75%+ accuracy in predicting earthquake clusters, volcanic eruptions, hurricanes, and tsunamis based on celestial events
• Hebrew calendar integration for feast day alignment
• 14 functional pages with modern Catalyst UI
• Comprehensive PostgreSQL database schema with PostGIS
• FastAPI REST API with 50+ endpoints
• Production-ready deployment on Railway

Technical Stack:
• Backend: Python 3.11+, FastAPI, PostgreSQL 16, PostGIS
• Frontend: Next.js 16, React 19, TypeScript 5, Three.js
• ML: scikit-learn, TensorFlow, LSTM models
• Deployment: Railway, Docker support

Biblical Foundation:
Based on Luke 21:25 (signs in sun, moon, stars), Matthew 24:7 (earthquakes/seismos), and Revelation 6:12 (great earthquake and celestial signs).
```

**Version**: 1.2.0

**Language**: English

**Keywords** (one per line):
```
biblical-prophecy
astronomical-tracking
machine-learning
disaster-prediction
celestial-mechanics
seismology
nasa-data
3d-visualization
hebrew-calendar
postgresql
fastapi
react
typescript
hyperbolic-orbits
pattern-detection
ai-correlation
feast-days
blood-moons
eclipses
planetary-conjunctions
```

### 6. License

**License**: MIT License
- Select from dropdown: "MIT License"

### 7. Related/alternate identifiers

Add these related identifiers:

**Type**: "is supplemented by"
**Identifier**: https://github.com/reversesingularity/phobetron_web_app
**Scheme**: URL

**Type**: "is documented by"
**Identifier**: https://phobetronwebapp-production.up.railway.app
**Scheme**: URL

### 8. Contributors

Add contributor:
- **Name**: GitHub Copilot
- **Type**: Other
- **Affiliation**: Microsoft/OpenAI

### 9. References

Add these references (one per line):
```
Luke 21:25 (NIV) - Signs in sun, moon, and stars
Matthew 24:7 (NIV) - Earthquakes in various places
Revelation 6:12 (NIV) - Great earthquake and celestial signs
NASA JPL Horizons System API - https://ssd.jpl.nasa.gov/horizons/
USGS Earthquake Catalog - https://earthquake.usgs.gov/
NOAA Space Weather Prediction Center - https://www.swpc.noaa.gov/
```

### 10. Subjects

Add subjects:
- Astronomy
- Machine Learning
- Seismology
- Religious Studies

### 11. Notes (Optional)

```
Production-ready web application with 14 functional pages, 4 trained ML models (78-89% accuracy), real-time API integration, PostgreSQL database with PostGIS, and Railway deployment configuration. Includes comprehensive documentation, backup procedures, and emergency restore scripts.

For support and issues: https://github.com/reversesingularity/phobetron_web_app/issues
```

### 12. Funding (Optional)

Leave blank unless you have funding to acknowledge.

### 13. Review and Publish

1. Click "Save" (saves as draft)
2. Review all information carefully
3. Click "Publish" when ready

**Important**: Once published, the DOI is permanent and the record cannot be deleted (only updated with new versions).

### 14. After Publishing

Zenodo will:
1. Generate a DOI (e.g., 10.5281/zenodo.XXXXXXX)
2. Create a permanent archive
3. Make your software citable

**Update your files:**
1. Copy the new DOI
2. Update README.md badges with the DOI
3. Update CITATION.cff with the DOI
4. Commit and push to GitHub

---

## Creating New Versions

For future releases (v1.3.0, etc.):

1. Go to your published record on Zenodo
2. Click "New version"
3. Upload new files
4. Update version number and date
5. Update description with changes
6. Publish

Each version gets its own DOI, plus a "concept DOI" that always points to the latest version.

---

## Verification Checklist

Before publishing, verify:

- ✅ ZIP file contains all necessary code
- ✅ README.md is clear and comprehensive
- ✅ LICENSE file is included
- ✅ CITATION.cff is properly formatted
- ✅ Version number is correct (1.2.0)
- ✅ All metadata fields are filled
- ✅ Related identifiers point to correct URLs
- ✅ Keywords are relevant and complete
- ✅ Description is clear and detailed

---

## Troubleshooting

**Upload fails:**
- Check file size (Zenodo limit: 50 GB per file)
- Ensure ZIP is not corrupted
- Try smaller files or split archive

**Metadata errors:**
- Validate CITATION.cff at https://citation-file-format.github.io/cff-initializer-javascript/
- Check JSON syntax in ZENODO_METADATA.json

**Can't find record after publishing:**
- Check "My uploads" in your Zenodo account
- Search by title or DOI
- Check spam folder for confirmation email

---

## Post-Publication Tasks

1. **Update GitHub README**:
   ```markdown
   [![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.XXXXXXX.svg)](https://doi.org/10.5281/zenodo.XXXXXXX)
   ```

2. **Create GitHub Release**:
   - Tag: v1.2.0
   - Title: Phobetron v1.2.0 - Production Ready
   - Description: Link to Zenodo DOI
   - Attach: phobetron-v1.2.0.zip

3. **Announce**:
   - Twitter/X with DOI
   - LinkedIn post
   - Relevant forums/communities

4. **Monitor**:
   - Check Zenodo stats for views/downloads
   - Watch GitHub for issues/questions

---

*Last Updated: November 18, 2025*

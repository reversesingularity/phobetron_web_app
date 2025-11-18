# Phobetron v1.2.0 Release Checklist

## ✅ COMPLETED

### Git & GitHub
- [x] All changes committed to Git
- [x] Pushed to GitHub (001-database-schema branch)
- [x] Git tag v1.2.0 created
- [x] Tag pushed to origin
- [x] Release package created (phobetron-v1.2.0.zip - 33.13 MB)
- [x] ORCID updated (0009-0004-9525-0631)

### Documentation
- [x] CHANGELOG.md created with full version history
- [x] CITATION.md created with 6 citation formats
- [x] CITATION.cff updated to v1.2.0
- [x] README.md updated with badges and author info
- [x] .zenodo.json created for automatic archival
- [x] ZENODO_METADATA.json created for manual upload
- [x] RELEASE_v1.2.0.md created for GitHub release
- [x] docs/GITHUB_RELEASE_GUIDE.md created
- [x] docs/ZENODO_UPLOAD_GUIDE.md created

## 🔄 IN PROGRESS

### GitHub Release (Currently Open in Browser)
1. **Tag**: v1.2.0 ✅ (already selected)
2. **Title**: `Phobetron v1.2.0 - Production Ready 🚀`
3. **Description**: Copy entire content from `RELEASE_v1.2.0.md` (file is open in editor)
4. **Attach files** (optional): `releases/phobetron-v1.2.0.zip`
5. **Click**: "Publish release" button
6. **Verify**: Release appears at https://github.com/reversesingularity/phobetron_web_app/releases

### Zenodo Upload (Currently Open in Browser)

#### Option A: Automatic (Recommended) ⭐
1. **Enable GitHub Integration**:
   - Already at: https://zenodo.org/account/settings/github/
   - Find "phobetron_web_app" in repository list
   - Toggle ON the switch next to it
   - Zenodo will automatically:
     * Detect new GitHub releases
     * Read .zenodo.json metadata
     * Create new Zenodo version
     * Generate/update DOI

2. **After GitHub Release**:
   - Zenodo creates new version automatically (within minutes)
   - Check: https://zenodo.org/deposit
   - New DOI will be generated (or existing updated)

#### Option B: Manual Upload
1. **Create New Upload**:
   - Go to: https://zenodo.org/deposit/new
   - Click "Upload files"
   - Select: `F:\Projects\phobetron_web_app\releases\phobetron-v1.2.0.zip`

2. **Fill Metadata** (use ZENODO_METADATA.json as reference):
   - **Upload type**: Software
   - **Title**: Phobetron: Biblical Prophecy & Celestial Pattern Detection System
   - **Authors**: Modina, Christopher (ORCID: 0009-0004-9525-0631)
   - **Description**: Copy from ZENODO_METADATA.json "description" field
   - **Version**: 1.2.0
   - **Keywords**: Copy all 28 keywords from ZENODO_METADATA.json
   - **License**: MIT License
   - **Related Identifiers**:
     * GitHub: https://github.com/reversesingularity/phobetron_web_app (isSupplementTo)
     * Live Demo: https://phobetronwebapp-production.up.railway.app (isDocumentedBy)

3. **Publish**:
   - Click "Publish"
   - Note the new DOI
   - Update badges if DOI changed

## 📋 POST-PUBLICATION TASKS

### After GitHub Release
- [ ] Verify release is visible at: https://github.com/reversesingularity/phobetron_web_app/releases/tag/v1.2.0
- [ ] Check all links work in release description
- [ ] Verify ZIP file is downloadable (if attached)

### After Zenodo Upload
- [ ] Verify Zenodo record is published
- [ ] Check DOI resolves correctly
- [ ] Update DOI badges in README.md if DOI changed
- [ ] Update CITATION.md with new DOI if changed

### Announcements
- [ ] **Twitter/X** (use template from docs/GITHUB_RELEASE_GUIDE.md):
  ```
  🚀 Phobetron v1.2.0 is LIVE!
  
  First production-ready release of AI-powered biblical prophecy & celestial pattern detection system.
  
  ✨ 14 pages, 4 ML models (75%+ accuracy), 3D solar system
  🔗 https://phobetronwebapp-production.up.railway.app
  
  #AI #MachineLearning #Astronomy #BiblicalProphecy #OpenSource
  ```

- [ ] **LinkedIn** (professional announcement):
  ```
  Excited to announce the release of Phobetron v1.2.0, the world's first AI-powered biblical prophecy and celestial pattern detection system.
  
  This production-ready release features:
  • 14 fully functional pages with modern UI
  • 4 trained ML models with 75%+ accuracy
  • Real-time 3D solar system visualization
  • PostgreSQL database with spatial support
  • Live deployment on Railway
  
  Tech stack: Next.js 16, React 19, Python 3.11, FastAPI, PostgreSQL 16, Three.js
  
  Live demo: https://phobetronwebapp-production.up.railway.app
  GitHub: https://github.com/reversesingularity/phobetron_web_app
  DOI: 10.5281/zenodo.17558316
  
  #SoftwareDevelopment #MachineLearning #DataScience #FullStack #OpenSource
  ```

### Repository Maintenance
- [ ] Monitor GitHub Issues for bug reports
- [ ] Respond to questions in Discussions
- [ ] Track Zenodo downloads/citations
- [ ] Update documentation based on user feedback

## 📁 FILES CREATED

### Documentation Files
- `CHANGELOG.md` - Complete version history (v1.0.0 → v1.2.0 + unreleased)
- `CITATION.md` - BibTeX, APA, MLA, Chicago, IEEE, Harvard formats
- `CITATION.cff` - Machine-readable citation (v1.2.0)
- `.zenodo.json` - Automatic Zenodo archival metadata
- `ZENODO_METADATA.json` - Manual Zenodo upload reference
- `RELEASE_v1.2.0.md` - GitHub release description
- `docs/GITHUB_RELEASE_GUIDE.md` - Release workflow (416 lines)
- `docs/ZENODO_UPLOAD_GUIDE.md` - Zenodo instructions (350 lines)

### Release Package
- `releases/v1.2.0/phobetron-v1.2.0/` - Uncompressed source
- `releases/phobetron-v1.2.0.zip` - 33.13 MB archive for Zenodo

### Updated Files
- `README.md` - v1.2.0 badges, author section, live demo link
- `CITATION.cff` - Version 1.2.0, Railway URL, updated author

## 🔗 IMPORTANT LINKS

### GitHub
- **Repository**: https://github.com/reversesingularity/phobetron_web_app
- **Releases**: https://github.com/reversesingularity/phobetron_web_app/releases
- **New Release**: https://github.com/reversesingularity/phobetron_web_app/releases/new?tag=v1.2.0
- **Issues**: https://github.com/reversesingularity/phobetron_web_app/issues

### Zenodo
- **GitHub Settings**: https://zenodo.org/account/settings/github/
- **New Deposit**: https://zenodo.org/deposit/new
- **My Deposits**: https://zenodo.org/deposit
- **Existing DOI**: https://doi.org/10.5281/zenodo.17558316

### Live Application
- **Production**: https://phobetronwebapp-production.up.railway.app
- **Railway Dashboard**: https://railway.app/dashboard

### Author
- **ORCID**: https://orcid.org/0009-0004-9525-0631
- **GitHub**: https://github.com/reversesingularity
- **Email**: cmodina70@gmail.com

## ⏱️ ESTIMATED TIME REMAINING

- GitHub Release: **5 minutes** (copy/paste + click publish)
- Zenodo Setup (automatic): **2 minutes** (enable GitHub sync)
- Zenodo Upload (manual): **10 minutes** (upload + metadata)
- Announcements: **15 minutes** (Twitter + LinkedIn + communities)

**Total**: ~20-30 minutes to complete all remaining tasks

## 📝 NOTES

### Version Information
- **Version**: 1.2.0
- **Release Date**: November 18, 2025
- **Status**: Production Ready
- **License**: MIT
- **DOI**: 10.5281/zenodo.17558316 (to be updated)

### Technical Details
- **Commit**: 26490dc
- **Tag**: v1.2.0
- **Branch**: 001-database-schema
- **Package Size**: 33.13 MB (compressed)

### Key Features
- 14 functional pages
- 4 ML models (78-89% accuracy)
- 3D solar system with hyperbolic orbits
- PostgreSQL 16 with PostGIS
- Railway deployment
- Catalyst UI components

---

**Last Updated**: November 18, 2025, 2:30 PM
**Status**: Ready for GitHub Release & Zenodo Upload

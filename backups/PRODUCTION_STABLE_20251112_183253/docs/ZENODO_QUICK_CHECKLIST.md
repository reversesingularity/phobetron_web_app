# Zenodo Quick Reference - Pre-Release Checklist

**Use this checklist right before creating the v1.0.0 GitHub release**

---

## ✅ Final Pre-Submission Tasks (Do these NOW)

### 1. Remove DOI Placeholder
- [ ] Open `CITATION.cff`
- [ ] Comment out or remove the `identifiers` section with the placeholder DOI
- [ ] Save the file
- [ ] Commit: `git add CITATION.cff && git commit -m "Remove DOI placeholder for Zenodo submission"`

### 2. Run Verification Script
```powershell
python scripts/verify_release_ready.py
```
- [ ] All checks must pass (100%)
- [ ] Fix any failing checks
- [ ] Re-run until green

### 3. Clean Repository
- [ ] Remove any test files: `rm -r test_data/` (if exists)
- [ ] Remove temp files: `rm -r *.tmp, *.log`
- [ ] Check .gitignore covers: `.env`, `*.pyc`, `node_modules/`, `venv/`
- [ ] Commit cleanup: `git add . && git commit -m "Clean repository for release"`

### 4. Final Git Status
```powershell
git status
```
- [ ] Must show: "working tree clean"
- [ ] All changes committed
- [ ] Push to GitHub: `git push origin main`

### 5. Create Release Tag
```powershell
git tag -a v1.0.0 -m "Phobetron v1.0.0 - Initial stable release"
git push origin v1.0.0
```
- [ ] Tag created locally
- [ ] Tag pushed to GitHub

---

## 🚀 GitHub Release (Do on GitHub.com)

### 6. Create GitHub Release
1. Go to: https://github.com/reversesingularity/phobetron_web_app/releases
2. Click: **"Draft a new release"**
3. **Tag**: Select `v1.0.0`
4. **Title**: `Phobetron v1.0.0 - Biblical Prophecy & Celestial Pattern Detection`
5. **Description**: Copy from `docs/ZENODO_SUBMISSION_GUIDE.md` (Release Notes Template section)
6. **Attach files** (optional):
   - Trained ML models (if not in repo)
   - Documentation PDF
   - User manual
7. Click: **"Publish release"**

- [ ] Release published
- [ ] Release notes complete
- [ ] Downloadable assets attached

---

## ⏳ Wait for Zenodo (Automatic)

### 7. Zenodo Auto-Archive
- [ ] Check email (cmodina70@kermangildpublishing.org)
- [ ] Zenodo sends confirmation (usually <15 minutes)
- [ ] Email contains DOI: `10.5281/zenodo.XXXXXXX`
- [ ] Note the DOI number

---

## 📝 Post-Submission Updates (After DOI received)

### 8. Update CITATION.cff with Real DOI
```yaml
identifiers:
  - type: doi
    value: "10.5281/zenodo.1234567"  # <- Real DOI here
    description: "Zenodo DOI for software citation"
```
- [ ] Update CITATION.cff
- [ ] Commit: `git commit -am "Add Zenodo DOI"`
- [ ] Push: `git push`

### 9. Add DOI Badge to README.md
```markdown
[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.1234567.svg)](https://doi.org/10.5281/zenodo.1234567)
```
- [ ] Add badge near top of README.md
- [ ] Commit: `git commit -am "Add Zenodo DOI badge"`
- [ ] Push: `git push`

### 10. Verify Zenodo Page
- [ ] Visit: https://doi.org/10.5281/zenodo.XXXXXXX
- [ ] Check metadata is correct
- [ ] Download test to verify file integrity
- [ ] Share link with collaborators

---

## 🎉 Announcement (Optional)

### 11. Share Your Work
- [ ] GitHub Discussions post
- [ ] Social media (Twitter, LinkedIn)
- [ ] Academic forums (if applicable)
- [ ] Biblical prophecy communities

---

## 📊 Monitor Impact

### 12. Track Metrics
- **Zenodo**: https://zenodo.org/account/settings/applications/
- **GitHub**: Repository Insights → Traffic
- **Google Scholar**: Search for your DOI (takes ~1 week to index)

---

## ⚠️ Troubleshooting

### Zenodo Didn't Auto-Archive?
1. Check: https://zenodo.org/account/settings/github/
2. Verify repository is toggled **ON**
3. Manual upload:
   - Download release .zip from GitHub
   - Upload to Zenodo manually
   - Fill in metadata

### DOI Not in Email?
- Check spam folder
- Check Zenodo dashboard: https://zenodo.org/deposit
- Look for "GitHub" deposits

### Need to Fix Metadata?
- Log into Zenodo
- Find your deposit
- Click "Edit" (even after publication)
- Update fields
- Save changes

---

## 🔄 Future Versions

### When releasing v1.1.0, v2.0.0, etc.:
1. Repeat steps 5-10
2. Zenodo creates **new DOI** for new version
3. **Concept DOI** links all versions together
4. Update CITATION.cff with latest DOI

---

**Estimated Time**: ~30 minutes total (including Zenodo wait time)

**Need Help?**
- Zenodo Support: support@zenodo.org
- Zenodo Docs: https://help.zenodo.org/
- GitHub Release Docs: https://docs.github.com/en/repositories/releasing-projects-on-github

---

**Ready? Start with Task #1!** ✨

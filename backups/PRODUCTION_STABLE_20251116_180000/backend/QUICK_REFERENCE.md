# 🚀 Quick Reference - Database Population

## ⚡ One-Line Setup

```powershell
cd backend; .\scripts\populate_all_data.ps1
```

---

## 📋 Common Commands

### **Populate Database**
```bash
# Everything (recommended)
.\scripts\populate_all_data.ps1

# Individual types
python populate_database.py              # Interstellar + NEOs
python scripts/fetch_volcanic_data.py    # Volcanoes
python scripts/fetch_hurricane_data.py   # Hurricanes  
python scripts/fetch_tsunami_data.py     # Tsunamis
```

### **Verify Data**
```powershell
# Test all endpoints
.\scripts\test_verification.ps1

# Check specific tables
curl http://localhost:8020/api/v1/verify/database-status
curl http://localhost:8020/api/v1/verify/interstellar-objects
curl http://localhost:8020/api/v1/verify/neo-risks
curl http://localhost:8020/api/v1/verify/volcanic-activity?min_vei=5
curl http://localhost:8020/api/v1/verify/hurricanes?min_category=4
curl http://localhost:8020/api/v1/verify/tsunamis?min_intensity=8
```

### **Manual SQL**
```bash
psql -U postgres -d phobetron -f scripts/sample_inserts.sql
```

---

## 📊 Expected Results

| Table | Count | Description |
|-------|-------|-------------|
| Interstellar Objects | 3+ | 1I/'Oumuamua, 2I/Borisov, C/2025 V1 |
| NEO Impact Risks | 8+ | Apophis, Bennu, Ryugu, etc. |
| Volcanic Eruptions | 7+ | Mount St. Helens, Pinatubo, Krakatoa |
| Hurricanes | 8+ | Katrina, Patricia, Maria, Haiyan |
| Tsunamis | 10+ | 2011 Tōhoku, 2004 Indian Ocean |

---

## 🔧 Troubleshooting

### **No data showing?**
```powershell
# 1. Check backend is running
curl http://localhost:8020/health

# 2. Check database
curl http://localhost:8020/api/v1/verify/database-status

# 3. Run population
.\scripts\populate_all_data.ps1
```

### **Tables don't exist?**
```bash
# Run migration
alembic upgrade 7b8c9d0e1f23
```

### **API errors?**
```bash
# Check Python environment
python --version
pip list | grep -E "sqlalchemy|geoalchemy2|shapely"
```

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `scripts/populate_all_data.ps1` | **Master script** - runs everything |
| `scripts/test_verification.ps1` | Tests API endpoints |
| `scripts/sample_inserts.sql` | Manual SQL examples |
| `scripts/README.md` | Complete documentation |
| `scripts/AUTOMATED_SCHEDULE.txt` | Cron job setup |

---

## 🌐 API Endpoints

**Base URL:** `http://localhost:8020`

- `/api/v1/verify/database-status` - Summary counts
- `/api/v1/verify/interstellar-objects` - Hyperbolic orbits
- `/api/v1/verify/neo-risks` - Impact assessments
- `/api/v1/verify/volcanic-activity` - Eruptions
- `/api/v1/verify/hurricanes` - Tropical cyclones
- `/api/v1/verify/tsunamis` - Wave events
- `/docs` - Full API documentation

---

## ⏰ Automation Setup

```powershell
# Daily NEO updates at 2 AM
schtasks /create /tn "Phobetron NEO" `
  /tr "python f:\Projects\phobetron_web_app\backend\scripts\collect_neo_data.py" `
  /sc daily /st 02:00
```

See `AUTOMATED_SCHEDULE.txt` for complete setup.

---

**Need Help?** Check `scripts/README.md` for detailed instructions.

# Quick Railway Population Command

## Via Railway Web Dashboard

1. Go to Railway project: https://railway.app/
2. Select the **backend** service (endearing-encouragement)
3. Click **Settings** → **Environment**
4. Scroll to **Command** section
5. Add a one-time command:

```bash
python scripts/populate_production_data.py
```

6. Click **Deploy** (this will run the script once)
7. Check **Deployments** tab for output logs

## Or via Railway CLI (If Installed)

```bash
railway link
railway run --service backend python scripts/populate_production_data.py
```

## Expected Log Output

Look for these lines in Railway deployment logs:

```
✅ Added 66 feast days
✅ Added 7 volcanic events  
✅ Added 8 hurricanes
✅ Added 10 tsunamis
📊 Grand total: 91 new records
READY FOR PATTERN DETECTION! 🎉
```

## Verification

After running, test the feast days API:
```
GET https://phobetronwebapp-production.up.railway.app/api/v1/theological/feasts?year=2025
```

Should return 6 feast days for 2025.

## Alternative: Manual SQL Execution

If Railway CLI is not available, you can also populate via Railway database console:

1. Go to Railway database service
2. Click **Data** tab
3. Run the SQL INSERT statements manually

(See `backend/scripts/populate_feast_days.py` for the logic to generate SQL)

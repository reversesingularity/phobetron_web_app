# Free Monthly Auto-Update Setup Guide

## 🎯 Overview

This system uses **GitHub Actions** to automatically update your production database with fresh data every month - **completely free** (no Redis/Celery needed).

## 📊 What Gets Updated Monthly

1. **Earthquakes** - M4.0+ from last 30 days (USGS)
2. **Volcanic Activity** - Recent eruptions (Smithsonian GVP)
3. **NEO Close Approaches** - Next 90 days (NASA JPL)
4. **Solar Events** - Solar flares from last 30 days (NOAA)
5. **ML Correlations** - Recalculated patterns

## 🆓 Cost Analysis

- **GitHub Actions**: FREE (2,000 minutes/month)
- **API Usage**: FREE (all APIs are public)
- **Database Storage**: Already included in Railway
- **Total Monthly Cost**: $0.00

## 🚀 Setup Instructions

### Step 1: Add Railway Database URL to GitHub Secrets

1. **Get your Railway Database URL**:
   - Go to Railway dashboard
   - Select your PostgreSQL service
   - Copy the `DATABASE_URL` (starts with `postgresql://`)

2. **Add to GitHub Secrets**:
   - Go to: https://github.com/reversesingularity/phobetron_web_app/settings/secrets/actions
   - Click "New repository secret"
   - Name: `RAILWAY_DATABASE_URL`
   - Value: Paste your database URL
   - Click "Add secret"

3. **Optional - Add NASA API Key** (for higher rate limits):
   - Get free key: https://api.nasa.gov/
   - Add secret: `NASA_API_KEY`
   - (Not required - will use DEMO_KEY if not provided)

### Step 2: Enable GitHub Actions

1. Go to: https://github.com/reversesingularity/phobetron_web_app/actions
2. Click "I understand my workflows, go ahead and enable them"
3. Find "Monthly Data Update" workflow
4. Click "Enable workflow"

### Step 3: Test Manual Run (Optional)

Before waiting for the monthly schedule:

1. Go to Actions tab
2. Select "Monthly Data Update"
3. Click "Run workflow" dropdown
4. Click green "Run workflow" button
5. Wait 5-10 minutes for completion
6. Check results in the workflow run

## 📅 Schedule

The workflow runs automatically on:
- **Day**: 1st of every month
- **Time**: 2:00 AM UTC
- **Duration**: ~10-15 minutes total

## 📝 What Happens During Each Run

```
┌─────────────────────────────────┐
│  GitHub Actions Workflow Start  │
└────────────┬────────────────────┘
             │
             ├─→ Update Earthquakes (last 30 days)
             │   └─ Inserts new, skips duplicates
             │
             ├─→ Update Volcanic Activity (recent)
             │   └─ Inserts new eruptions
             │
             ├─→ Update NEO Approaches (next 90 days)
             │   └─ Inserts new close approaches
             │
             ├─→ Update Solar Events (last 30 days)
             │   └─ Inserts new flares/storms
             │
             └─→ Recalculate ML Correlations
                 └─ Finds patterns, creates correlations
```

## 🔍 Monitoring

### View Run History
- Go to: https://github.com/reversesingularity/phobetron_web_app/actions
- See all past runs with success/failure status
- Click any run to see detailed logs

### Check Database Updates
After a successful run, verify in Railway:
```sql
-- Check latest earthquakes
SELECT COUNT(*), MAX(event_time) 
FROM earthquakes 
WHERE created_at >= NOW() - INTERVAL '1 day';

-- Check latest NEOs
SELECT COUNT(*), MAX(approach_date) 
FROM neo_close_approaches 
WHERE created_at >= NOW() - INTERVAL '1 day';

-- Check correlations
SELECT COUNT(*) 
FROM correlations 
WHERE created_at >= NOW() - INTERVAL '1 day';
```

## 📧 Notifications (Optional)

Want email alerts when updates complete? Add this to the workflow:

```yaml
- name: Send email notification
  uses: dawidd6/action-send-mail@v3
  with:
    server_address: smtp.gmail.com
    server_port: 465
    username: ${{ secrets.EMAIL_USERNAME }}
    password: ${{ secrets.EMAIL_PASSWORD }}
    subject: Monthly Data Update Completed
    body: Check the details at ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}
    to: your-email@example.com
    from: GitHub Actions
```

## 🔧 Customization

### Change Update Frequency

Edit `.github/workflows/monthly-data-update.yml`:

```yaml
# Weekly updates (every Sunday at 2 AM UTC)
- cron: '0 2 * * 0'

# Bi-weekly (1st and 15th at 2 AM UTC)
- cron: '0 2 1,15 * *'

# Daily (every day at 2 AM UTC)
- cron: '0 2 * * *'
```

### Adjust Data Ranges

Edit the fetch scripts arguments:

```yaml
# Fetch more earthquake history
python fetch_earthquake_data.py --days=90 --min-magnitude=3.0

# Fetch more NEO approaches
python fetch_neo_data.py --days=180
```

## ⚠️ Important Notes

1. **No Breaking Changes**: Updates only ADD new data, never modifies existing
2. **Duplicate Prevention**: All scripts check for existing records
3. **Rate Limits**: All APIs used have generous free tiers
4. **Execution Time**: Total ~10-15 minutes per run
5. **GitHub Free Tier**: 2,000 minutes/month = ~133 runs (way more than needed)

## 🐛 Troubleshooting

### Workflow Fails with "DATABASE_URL not set"
- Verify secret name is exactly: `RAILWAY_DATABASE_URL`
- Check secret value starts with `postgresql://` (not `postgres://`)
- Re-enter the secret if needed

### No New Data After Run
- Check Railway database wasn't reset
- Verify APIs are responding (check workflow logs)
- May be no new events in the time period (normal)

### Timeout Errors
- Increase timeout in workflow: `timeout-minutes: 20`
- Reduce data ranges in fetch scripts

## 📚 API Documentation

- **USGS Earthquakes**: https://earthquake.usgs.gov/fdsnws/event/1/
- **NASA NEOs**: https://api.nasa.gov/
- **NOAA Solar**: https://www.swpc.noaa.gov/products/real-time-solar-wind
- **Smithsonian Volcanoes**: https://volcano.si.edu/geoserver

## 🎉 Benefits Over Celery + Redis

| Feature | GitHub Actions | Celery + Redis |
|---------|---------------|----------------|
| **Cost** | $0/month | $5-10/month |
| **Setup** | 5 minutes | 30+ minutes |
| **Maintenance** | Zero | Ongoing |
| **Monitoring** | Built-in UI | Need separate tools |
| **Logs** | Persistent | Need log storage |
| **Reliability** | GitHub SLA | Self-managed |

## ✅ Next Steps

1. Add `RAILWAY_DATABASE_URL` secret to GitHub
2. Enable GitHub Actions workflow
3. Run manual test (optional)
4. Wait for 1st of next month, or...
5. Change schedule to weekly for more frequent updates

---

**Created**: November 22, 2025  
**Version**: 1.0  
**Status**: Production Ready ✅

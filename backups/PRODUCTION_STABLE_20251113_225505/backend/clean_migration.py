"""Clean up duplicate index definitions in migration file."""

import re

filepath = r"F:\Projects\phobetron_web_app\backend\alembic\versions\5fa859e69904_001_initial_scientific_schema.py"

with open(filepath, 'r') as f:
    content = f.read()

# Remove duplicate GIST index for earthquakes (keep the first one with 'idx_earthquake_location')
content = re.sub(r"    op\.create_index\('idx_earthquakes_location'.*?\n", '', content)

# Remove duplicate index for volcanic activity location (keep the first 'idx_volcanic_location')
content = re.sub(r"    op\.create_index\('idx_volcanic_activity_location'.*?\n", '', content)

# Write back
with open(filepath, 'w') as f:
    f.write(content)

print("✅ Migration file cleaned - duplicate indexes removed")

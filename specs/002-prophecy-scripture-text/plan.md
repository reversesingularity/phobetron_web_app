# Implementation Plan: Add Scriptural Text to Biblical Prophecy Events

**Branch**: `002-prophecy-scripture-text` | **Date**: 2025-11-14 | **Spec**: [spec.md](./spec.md)

## Summary

Populate the `prophecy_text` column in the `biblical_prophecies` database table with actual KJV scripture text for all 40 prophecy events. This eliminates placeholder messages in the Prophecy Codex UI and provides users with the actual Word of God for each prophetic event.

## Technical Context

**Language/Version**: Python 3.11 (backend), SQL (database updates)  
**Primary Dependencies**: psycopg2, SQLAlchemy, Alembic (PostgreSQL tools)  
**Storage**: PostgreSQL 15 (Railway hosted, database: railway)  
**Testing**: Manual verification via UI and SQL queries  
**Target Platform**: Railway cloud platform (production database)  
**Project Type**: Web application (FastAPI backend + React frontend)  
**Performance Goals**: No degradation to existing 2-second page load time  
**Constraints**: Must not disrupt existing data, must be idempotent  
**Scale/Scope**: 40 database records to update

## Constitution Check

✅ **Data Quality**: Scripture text will be sourced from public domain KJV Bible  
✅ **Idempotency**: Update script will use UPSERT pattern (ON CONFLICT DO UPDATE)  
✅ **Observability**: Script will log each update operation  
✅ **No Implementation Details in Spec**: Spec remains technology-agnostic  

## Project Structure

### Documentation (this feature)

```text
specs/002-prophecy-scripture-text/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0: Bible text source research
├── data-model.md        # Phase 1: Database schema validation
└── tasks.md             # Phase 2: Task breakdown
```

### Source Code

```text
backend/
├── scripts/
│   └── populate_prophecy_scripture.py    # New: Scripture population script
├── alembic/
│   └── versions/
│       └── XXX_update_prophecy_text.py   # Migration to populate data
└── app/
    └── models/
        └── theological.py                 # Existing: BiblicalProphecy model

frontend/
└── src/
    └── pages/
        └── ProphecyCodex.tsx             # Existing: Already handles display
```

**Structure Decision**: Web application structure. Backend handles data population via Python script or Alembic migration. Frontend already correctly displays prophecy_text when available.

## Phase 0: Research

**Research Questions**:
1. What is the best source for KJV Bible text (API vs local file)?
2. How should we map event_name to specific Bible passages?
3. What is the current state of book_name/chapter/verse_start/verse_end data?
4. Should we use a migration or standalone script?

**Deliverable**: `research.md` with decisions on:
- KJV Bible text source (recommend: local JSON file or Bible API)
- Data mapping strategy (manual mapping table: event_name → scripture reference)
- Script approach (recommend: Python script over migration for flexibility)

## Phase 1: Design & Contracts

### Data Model Validation

**Current Schema** (from backend/app/models/theological.py):
```python
class BiblicalProphecy(Base):
    __tablename__ = "biblical_prophecies"
    
    id = Column(Integer, primary_key=True)
    event_name = Column(String(255), nullable=False)
    prophecy_text = Column(Text, nullable=True)  # Target column
    book_name = Column(String(100), nullable=True)
    chapter = Column(Integer, nullable=True)
    verse_start = Column(Integer, nullable=True)
    verse_end = Column(Integer, nullable=True)
    # ... other columns
```

**Validation**: Confirm `prophecy_text` column is TEXT type (unlimited length)

### Scripture Mapping Contract

Create `backend/scripts/scripture_mappings.json`:
```json
{
  "First Seal - White Horse of Conquest": {
    "book": "Revelation",
    "chapter": 6,
    "verse_start": 1,
    "verse_end": 2,
    "reference": "Revelation 6:1-2"
  }
}
```

### Script Contract

`backend/scripts/populate_prophecy_scripture.py` will:
- Load scripture mappings
- Fetch KJV text for each reference
- Update database using ON CONFLICT pattern
- Log success/failure for each record
- Return summary statistics

**Deliverables**:
- `data-model.md`: Schema validation results
- `contracts/scripture-mappings.schema.json`: Mapping file structure
- `contracts/population-script.md`: Script interface documentation

## Phase 2: Implementation Tasks

**Setup Tasks**:
1. Create scripture_mappings.json with all 40 event→reference mappings
2. Choose KJV Bible text source (API or local file)
3. Set up database connection configuration

**Core Tasks**:
4. Implement populate_prophecy_scripture.py script
5. Add KJV text fetching logic
6. Add database update logic with ON CONFLICT
7. Add logging and error handling

**Validation Tasks**:
8. Run script against local database first
9. Verify all 40 records updated correctly
10. Test UI displays scripture text properly
11. Run script against Railway production
12. Verify production database updated

**Deliverable**: `tasks.md` with complete task breakdown following SpecKit format

## Risk Mitigation

**Risks**:
1. **Bible API rate limits**: Mitigate by using local JSON file or caching
2. **Incorrect scripture mapping**: Mitigate by manual verification of all 40 mappings
3. **Database connection issues**: Mitigate by testing locally first, using connection retry logic
4. **Text encoding issues**: Mitigate by using UTF-8 throughout, testing special characters

## Success Validation

**Acceptance Criteria** (from spec.md):
- [ ] SC-001: All 40 cards show actual scripture text (no placeholders)
- [ ] SC-002: Bible references are accurate and verifiable
- [ ] SC-003: Database query for NULL prophecy_text returns 0
- [ ] SC-004: Page load remains under 2 seconds
- [ ] SC-005: All references follow standard format

**Testing Strategy**:
1. Query database before: `SELECT id, event_name, prophecy_text FROM biblical_prophecies WHERE prophecy_text IS NULL;`
2. Run population script
3. Query database after: verify count is 0
4. Open Prophecy Codex UI
5. Verify each category (Celestial, Seismic, Judgment, End Times) shows scripture text
6. Click individual cards and verify modal displays full text

## Dependencies

**External**:
- KJV Bible text source (public domain)

**Internal**:
- Database: `biblical_prophecies` table (exists)
- Frontend: ProphecyCodex.tsx (exists, already handles display)
- Backend: Database connection utilities (exist)

## Timeline Estimate

- Phase 0 (Research): 30 minutes
- Phase 1 (Design): 1 hour (mapping creation)
- Phase 2 (Implementation): 2 hours (script + testing)
- Phase 2 (Validation): 30 minutes (production deployment)

**Total**: ~4 hours

## Next Steps

1. Run `/speckit.plan` Phase 0 to create `research.md`
2. Run `/speckit.plan` Phase 1 to create `data-model.md` and mappings
3. Run `/speckit.tasks` to generate detailed task breakdown
4. Run `/speckit.implement` to execute tasks

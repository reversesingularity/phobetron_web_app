# Implementation Tasks: Add Scriptural Text to Biblical Prophecy Events

**Feature**: 002-prophecy-scripture-text  
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)  
**Created**: 2025-11-14

## Task Summary

- **Total Tasks**: 11
- **Parallelizable**: 2 tasks
- **Estimated Time**: 4 hours
- **MVP Scope**: User Story 1 only (Tasks T001-T008)

## Phase 1: Setup

- [ ] T001 Create scripture mappings data file at backend/scripts/scripture_mappings.json with all 40 event→reference mappings
- [ ] T002 Research and select KJV Bible text source (API or local JSON file)
- [ ] T003 Verify prophecy_text column schema in backend/app/models/theological.py (confirm TEXT type)

## Phase 2: User Story 1 - View Actual Scripture Text (P1)

**Goal**: Display actual biblical text instead of placeholders  
**Independent Test**: View Prophecy Codex page and verify all cards show scripture text

### Implementation Tasks

- [ ] T004 [US1] Create backend/scripts/populate_prophecy_scripture.py with database connection setup
- [ ] T005 [US1] Implement KJV scripture text fetching logic in populate_prophecy_scripture.py
- [ ] T006 [US1] Implement database UPDATE query with ON CONFLICT pattern in populate_prophecy_scripture.py
- [ ] T007 [US1] Add logging and error handling to populate_prophecy_scripture.py
- [ ] T008 [US1] Test script against local database and verify all 40 records updated

## Phase 3: User Story 2 - Accurate Bible References (P2)

**Goal**: Verify reference format correctness  
**Independent Test**: Compare displayed references with database records

### Validation Tasks

- [ ] T009 [P] [US2] Query database to validate book_name, chapter, verse_start, verse_end accuracy for all 40 records
- [ ] T010 [P] [US2] Open Prophecy Codex UI and verify reference format for each category (Celestial, Seismic, Judgment, End Times)

## Phase 4: User Story 3 - Complete Database Population (P3)

**Goal**: Ensure 100% data completeness  
**Independent Test**: Query for NULL prophecy_text returns 0

### Production Deployment

- [ ] T011 [US3] Execute populate_prophecy_scripture.py against Railway production database and verify success

## Dependencies

**Sequential Dependencies**:
- T001 must complete before T005 (mappings needed for text fetching)
- T002 must complete before T005 (source determines fetching logic)
- T003 must complete before T004 (schema validation before updates)
- T004-T007 must complete sequentially (script development)
- T008 must complete before T011 (local testing before production)

**Parallel Opportunities**:
- T009 and T010 can run in parallel (database query vs UI verification)

## Implementation Strategy

**MVP (Minimum Viable Product)**:
- Implement User Story 1 only (T001-T008)
- This delivers core value: scripture text visible to users
- Estimated time: 3 hours

**Full Feature**:
- Complete all user stories (T001-T011)
- Includes validation and production deployment
- Estimated time: 4 hours

## Execution Checklist

Before starting implementation:
- [ ] Spec.md is complete and approved
- [ ] Plan.md technical decisions are made
- [ ] All [NEEDS CLARIFICATION] items are resolved
- [ ] Constitution check passed

After implementation:
- [ ] All tasks marked as completed [X]
- [ ] Success criteria verified (SC-001 through SC-005)
- [ ] Production deployment successful
- [ ] Documentation updated

## Notes

- Use KJV translation (public domain, no licensing issues)
- Scripture mappings must be manually verified for accuracy
- Test locally before running against production database
- Keep script idempotent (safe to run multiple times)

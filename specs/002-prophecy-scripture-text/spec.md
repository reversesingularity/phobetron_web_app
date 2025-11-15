# Feature Specification: Add Scriptural Text to Biblical Prophecy Events

**Feature Branch**: `002-prophecy-scripture-text`  
**Created**: 2025-11-14  
**Status**: Draft  
**Input**: User description: "Add scriptural text references to biblical prophecy events in the database"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Actual Scripture Text in Prophecy Cards (Priority: P1)

Users viewing the Prophecy Codex page should see the actual biblical text for each prophecy event, not just the event description duplicated. Currently, cards show "[Event Name] - Scripture text to be added" which provides no value.

**Why this priority**: This is the core user value - reading the actual Word of God. Without scripture text, the prophecy database is incomplete and fails its primary purpose of displaying biblical prophecies.

**Independent Test**: Can be fully tested by viewing any prophecy card in the Prophecy Codex UI and verifying it displays the actual biblical verse text (e.g., "The sun will be turned to darkness and the moon to blood before the coming of the great and dreadful day of the LORD" for Joel 2:31).

**Acceptance Scenarios**:

1. **Given** I am viewing the Prophecy Codex page, **When** I look at a prophecy card, **Then** I see the actual biblical text in the italicized quote section
2. **Given** I click on a prophecy card to open the detail modal, **When** the modal displays, **Then** the "Text" section shows the complete scripture passage
3. **Given** multiple prophecies exist for the same event (e.g., seals, trumpets), **When** I view each card, **Then** each displays its specific scripture text

---

### User Story 2 - Accurate Bible References (Priority: P2)

Each prophecy card should display the correct Bible reference (book, chapter, verses) so users can verify the scripture in their own Bibles.

**Why this priority**: Users need to validate prophecies against Scripture. Without proper references, users cannot do independent study or verification.

**Independent Test**: Can be tested by comparing displayed references with the actual database records and verifying format correctness (e.g., "Revelation 6:1-2", "Joel 2:31", "Matthew 24:7-8").

**Acceptance Scenarios**:

1. **Given** a prophecy has book_name, chapter, and verse data, **When** I view the card, **Then** the header displays "Book Chapter:Verse" format (e.g., "Revelation 6:2")
2. **Given** a prophecy has verse_start and verse_end, **When** they are different, **Then** the reference shows range format (e.g., "Revelation 6:1-2")
3. **Given** a prophecy lacks book reference data, **When** I view the card, **Then** the header shows the event name as fallback

---

### User Story 3 - Complete Prophecy Database Population (Priority: P3)

All 40 prophecy events in the database should have their corresponding scripture texts populated so no cards show the "[Event Name] - Scripture text to be added" placeholder.

**Why this priority**: Database completeness ensures consistent user experience. This is lower priority because the UI already gracefully handles missing data, but completeness improves professionalism.

**Independent Test**: Can be tested by querying the database and verifying all records in the `biblical_prophecies` table have non-null `prophecy_text` values, then viewing all 40 cards in the UI.

**Acceptance Scenarios**:

1. **Given** I run a database query `SELECT COUNT(*) FROM biblical_prophecies WHERE prophecy_text IS NULL`, **When** the query executes, **Then** the result is 0
2. **Given** I view all prophecy cards in the UI, **When** I read each card's quote section, **Then** none show the "Scripture text to be added" placeholder
3. **Given** I filter by category (Celestial, Seismic, Judgment, End Times), **When** I view cards in each category, **Then** all display actual scripture text

---

### Edge Cases

- What happens when a prophecy has multiple verses but they're not contiguous (e.g., Revelation 6:1, 6:3, 6:5)?
- How does the system handle prophecies that span chapters (e.g., Matthew 24:29-25:2)?
- What if the prophecy_text field contains very long passages (500+ characters)?
- How should we handle parallel prophecies (same event described in multiple Gospels)?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display actual biblical scripture text in the prophecy card quote section instead of "[Event Name] - Scripture text to be added" placeholder
- **FR-002**: System MUST format Bible references in standard format: "Book Chapter:Verse" or "Book Chapter:Verse-Verse" for ranges
- **FR-003**: System MUST populate the `prophecy_text` column in the `biblical_prophecies` table for all 40 existing records
- **FR-004**: Database update script MUST use the correct book names, chapter numbers, and verse ranges for each prophecy event
- **FR-005**: System MUST handle missing scripture data gracefully by displaying the event name with clear indication that scripture text is pending
- **FR-006**: Scripture text MUST be sourced from a reliable translation (use KJV as it is public domain)
- **FR-007**: Each prophecy record MUST include the complete verse text, not truncated or summarized versions

### Key Entities

- **BiblicalProphecy**: Existing database table with columns: id, event_name, prophecy_category, book_name, chapter, verse_start, verse_end, prophecy_text (currently NULL for most records), source_type, fulfillment_status, theological_interpretation
- **Scripture Reference**: Composite of book_name + chapter + verse_start + verse_end to form complete reference
- **Scripture Text**: The actual biblical verse content stored in prophecy_text column

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of prophecy cards display actual biblical text instead of placeholder messages (40/40 records populated)
- **SC-002**: Users can verify prophecies by comparing displayed references with their own Bibles (book/chapter/verse accuracy validated)
- **SC-003**: Database query `SELECT COUNT(*) FROM biblical_prophecies WHERE prophecy_text IS NULL OR prophecy_text = ''` returns 0
- **SC-004**: UI displays scripture text within 2 seconds of page load (no performance degradation from longer text fields)
- **SC-005**: All Bible references follow standard format conventions (validated by regex pattern matching)

## Scope & Boundaries

### In Scope
- Populating prophecy_text for all 40 existing biblical prophecy records
- Updating database schema if needed (e.g., increasing column length for longer passages)
- Creating database update script (SQL or Python)
- Verifying UI correctly displays populated scripture text
- Testing reference format handling for various scenarios

### Out of Scope
- Adding new prophecy events beyond the existing 40
- Implementing multiple Bible translation support (single translation for MVP)
- Adding Hebrew/Greek original text
- Implementing verse-by-verse highlighting or annotations
- Audio scripture playback
- Cross-referencing with other prophecies (already handled by relatedProphecies field)

## Assumptions

1. Database already has the correct book_name, chapter, verse_start, and verse_end values for all 40 prophecies
2. Scripture text will come from KJV (public domain)
3. Frontend already handles displaying prophecy_text correctly (ProphecyCodex.tsx line 73: `text: displayText`)
4. Average scripture text length will be 100-500 characters per prophecy
5. Database column `prophecy_text` has sufficient character limit (TEXT type recommended)

## Dependencies

- Access to KJV Bible text (public domain)
- Database migration capability (Alembic for PostgreSQL)
- Railway production database write access
- ProphecyCodex.tsx component (already implemented and working)

## Non-Functional Requirements

- **Performance**: Scripture text display should not increase page load time by more than 100ms
- **Data Quality**: All scripture text must be accurately transcribed with no typos or missing words
- **Maintainability**: Data population script should be reusable for future prophecy additions
- **Observability**: Database update script should log which records were updated and any errors encountered

-- Populate feast days for 2020-2030 (66 records)
-- This script can be run directly in Railway's PostgreSQL database via the web UI

-- Insert Passover (Pesach) - Nisan 14
INSERT INTO feast_days (feast_type, name, hebrew_date, gregorian_date, gregorian_year, end_date, is_range, significance, data_source)
VALUES
    ('passover', 'Passover (Pesach)', 'Nisan 14', '2020-04-08', 2020, NULL, false, 'Celebrates the Exodus from Egypt. The lamb was sacrificed on this day, pointing to Christ our Passover lamb (1 Cor 5:7).', 'hebrew_calendar_module'),
    ('passover', 'Passover (Pesach)', 'Nisan 14', '2021-03-27', 2021, NULL, false, 'Celebrates the Exodus from Egypt. The lamb was sacrificed on this day, pointing to Christ our Passover lamb (1 Cor 5:7).', 'hebrew_calendar_module'),
    ('passover', 'Passover (Pesach)', 'Nisan 14', '2022-04-15', 2022, NULL, false, 'Celebrates the Exodus from Egypt. The lamb was sacrificed on this day, pointing to Christ our Passover lamb (1 Cor 5:7).', 'hebrew_calendar_module'),
    ('passover', 'Passover (Pesach)', 'Nisan 14', '2023-04-05', 2023, NULL, false, 'Celebrates the Exodus from Egypt. The lamb was sacrificed on this day, pointing to Christ our Passover lamb (1 Cor 5:7).', 'hebrew_calendar_module'),
    ('passover', 'Passover (Pesach)', 'Nisan 14', '2024-04-22', 2024, NULL, false, 'Celebrates the Exodus from Egypt. The lamb was sacrificed on this day, pointing to Christ our Passover lamb (1 Cor 5:7).', 'hebrew_calendar_module'),
    ('passover', 'Passover (Pesach)', 'Nisan 14', '2025-04-12', 2025, NULL, false, 'Celebrates the Exodus from Egypt. The lamb was sacrificed on this day, pointing to Christ our Passover lamb (1 Cor 5:7).', 'hebrew_calendar_module'),
    ('passover', 'Passover (Pesach)', 'Nisan 14', '2026-04-01', 2026, NULL, false, 'Celebrates the Exodus from Egypt. The lamb was sacrificed on this day, pointing to Christ our Passover lamb (1 Cor 5:7).', 'hebrew_calendar_module'),
    ('passover', 'Passover (Pesach)', 'Nisan 14', '2027-04-21', 2027, NULL, false, 'Celebrates the Exodus from Egypt. The lamb was sacrificed on this day, pointing to Christ our Passover lamb (1 Cor 5:7).', 'hebrew_calendar_module'),
    ('passover', 'Passover (Pesach)', 'Nisan 14', '2028-04-09', 2028, NULL, false, 'Celebrates the Exodus from Egypt. The lamb was sacrificed on this day, pointing to Christ our Passover lamb (1 Cor 5:7).', 'hebrew_calendar_module'),
    ('passover', 'Passover (Pesach)', 'Nisan 14', '2029-03-30', 2029, NULL, false, 'Celebrates the Exodus from Egypt. The lamb was sacrificed on this day, pointing to Christ our Passover lamb (1 Cor 5:7).', 'hebrew_calendar_module'),
    ('passover', 'Passover (Pesach)', 'Nisan 14', '2030-04-17', 2030, NULL, false, 'Celebrates the Exodus from Egypt. The lamb was sacrificed on this day, pointing to Christ our Passover lamb (1 Cor 5:7).', 'hebrew_calendar_module')
ON CONFLICT (feast_type, gregorian_year) DO NOTHING;

-- Insert Unleavened Bread - Nisan 15-21 (7 days)
INSERT INTO feast_days (feast_type, name, hebrew_date, gregorian_date, gregorian_year, end_date, is_range, significance, data_source)
VALUES
    ('unleavened_bread', 'Feast of Unleavened Bread', 'Nisan 15-21', '2020-04-09', 2020, '2020-04-15', true, 'Seven days of eating unleavened bread, symbolizing sinless living and sanctification (Ex 12:15-20).', 'hebrew_calendar_module'),
    ('unleavened_bread', 'Feast of Unleavened Bread', 'Nisan 15-21', '2021-03-28', 2021, '2021-04-03', true, 'Seven days of eating unleavened bread, symbolizing sinless living and sanctification (Ex 12:15-20).', 'hebrew_calendar_module'),
    ('unleavened_bread', 'Feast of Unleavened Bread', 'Nisan 15-21', '2022-04-16', 2022, '2022-04-22', true, 'Seven days of eating unleavened bread, symbolizing sinless living and sanctification (Ex 12:15-20).', 'hebrew_calendar_module'),
    ('unleavened_bread', 'Feast of Unleavened Bread', 'Nisan 15-21', '2023-04-06', 2023, '2023-04-12', true, 'Seven days of eating unleavened bread, symbolizing sinless living and sanctification (Ex 12:15-20).', 'hebrew_calendar_module'),
    ('unleavened_bread', 'Feast of Unleavened Bread', 'Nisan 15-21', '2024-04-23', 2024, '2024-04-29', true, 'Seven days of eating unleavened bread, symbolizing sinless living and sanctification (Ex 12:15-20).', 'hebrew_calendar_module'),
    ('unleavened_bread', 'Feast of Unleavened Bread', 'Nisan 15-21', '2025-04-13', 2025, '2025-04-19', true, 'Seven days of eating unleavened bread, symbolizing sinless living and sanctification (Ex 12:15-20).', 'hebrew_calendar_module'),
    ('unleavened_bread', 'Feast of Unleavened Bread', 'Nisan 15-21', '2026-04-02', 2026, '2026-04-08', true, 'Seven days of eating unleavened bread, symbolizing sinless living and sanctification (Ex 12:15-20).', 'hebrew_calendar_module'),
    ('unleavened_bread', 'Feast of Unleavened Bread', 'Nisan 15-21', '2027-04-22', 2027, '2027-04-28', true, 'Seven days of eating unleavened bread, symbolizing sinless living and sanctification (Ex 12:15-20).', 'hebrew_calendar_module'),
    ('unleavened_bread', 'Feast of Unleavened Bread', 'Nisan 15-21', '2028-04-10', 2028, '2028-04-16', true, 'Seven days of eating unleavened bread, symbolizing sinless living and sanctification (Ex 12:15-20).', 'hebrew_calendar_module'),
    ('unleavened_bread', 'Feast of Unleavened Bread', 'Nisan 15-21', '2029-03-31', 2029, '2029-04-06', true, 'Seven days of eating unleavened bread, symbolizing sinless living and sanctification (Ex 12:15-20).', 'hebrew_calendar_module'),
    ('unleavened_bread', 'Feast of Unleavened Bread', 'Nisan 15-21', '2030-04-18', 2030, '2030-04-24', true, 'Seven days of eating unleavened bread, symbolizing sinless living and sanctification (Ex 12:15-20).', 'hebrew_calendar_module')
ON CONFLICT (feast_type, gregorian_year) DO NOTHING;

-- Check how many records were inserted
SELECT feast_type, COUNT(*) as count FROM feast_days GROUP BY feast_type ORDER BY feast_type;

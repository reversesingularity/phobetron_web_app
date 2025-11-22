-- Quick populate feast days for 2024-2025 (12 records)
-- Run this SQL directly in Railway Postgres database

INSERT INTO feast_days (feast_type, name, hebrew_date, gregorian_date, gregorian_year, end_date, is_range, significance, data_source, created_at)
VALUES
    -- 2024 Feasts
    ('passover', 'Passover (Pesach)', 'Nisan 14', '2024-04-22', 2024, NULL, false, 'Celebrates the Exodus from Egypt. The lamb was sacrificed on this day, pointing to Christ our Passover lamb (1 Cor 5:7).', 'manual_sql', NOW()),
    ('unleavened_bread', 'Feast of Unleavened Bread', 'Nisan 15-21', '2024-04-23', 2024, '2024-04-29', true, 'Seven days of eating unleavened bread, symbolizing sinless living and sanctification (Ex 12:15-20).', 'manual_sql', NOW()),
    ('pentecost', 'Pentecost (Shavuot)', 'Sivan 6', '2024-06-12', 2024, NULL, false, 'Celebrates giving of Torah at Sinai. Fulfilled by outpouring of Holy Spirit (Acts 2).', 'manual_sql', NOW()),
    ('trumpets', 'Feast of Trumpets (Rosh Hashanah)', 'Tishrei 1', '2024-10-03', 2024, NULL, false, 'Jewish New Year. Day of trumpet blasts foreshadowing the return of Messiah (1 Thess 4:16).', 'manual_sql', NOW()),
    ('atonement', 'Day of Atonement (Yom Kippur)', 'Tishrei 10', '2024-10-12', 2024, NULL, false, 'Most solemn day of year - national repentance and atonement. Points to Christ final atonement for sin.', 'manual_sql', NOW()),
    ('tabernacles', 'Feast of Tabernacles (Sukkot)', 'Tishrei 15-21', '2024-10-17', 2024, '2024-10-23', true, 'Seven days dwelling in temporary shelters, celebrating harvest and wilderness journey (Lev 23:34).', 'manual_sql', NOW()),
    
    -- 2025 Feasts
    ('passover', 'Passover (Pesach)', 'Nisan 14', '2025-04-12', 2025, NULL, false, 'Celebrates the Exodus from Egypt. The lamb was sacrificed on this day, pointing to Christ our Passover lamb (1 Cor 5:7).', 'manual_sql', NOW()),
    ('unleavened_bread', 'Feast of Unleavened Bread', 'Nisan 15-21', '2025-04-13', 2025, '2025-04-19', true, 'Seven days of eating unleavened bread, symbolizing sinless living and sanctification (Ex 12:15-20).', 'manual_sql', NOW()),
    ('pentecost', 'Pentecost (Shavuot)', 'Sivan 6', '2025-06-02', 2025, NULL, false, 'Celebrates giving of Torah at Sinai. Fulfilled by outpouring of Holy Spirit (Acts 2).', 'manual_sql', NOW()),
    ('trumpets', 'Feast of Trumpets (Rosh Hashanah)', 'Tishrei 1', '2025-09-23', 2025, NULL, false, 'Jewish New Year. Day of trumpet blasts foreshadowing the return of Messiah (1 Thess 4:16).', 'manual_sql', NOW()),
    ('atonement', 'Day of Atonement (Yom Kippur)', 'Tishrei 10', '2025-10-02', 2025, NULL, false, 'Most solemn day of year - national repentance and atonement. Points to Christ final atonement for sin.', 'manual_sql', NOW()),
    ('tabernacles', 'Feast of Tabernacles (Sukkot)', 'Tishrei 15-21', '2025-10-07', 2025, '2025-10-13', true, 'Seven days dwelling in temporary shelters, celebrating harvest and wilderness journey (Lev 23:34).', 'manual_sql', NOW())
ON CONFLICT (feast_type, gregorian_year) DO NOTHING;

-- Verify insertion
SELECT COUNT(*) as total_feast_days FROM feast_days;
SELECT feast_type, gregorian_date, name FROM feast_days ORDER BY gregorian_date;

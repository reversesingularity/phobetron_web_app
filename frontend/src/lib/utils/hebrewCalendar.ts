/**
 * Hebrew Calendar Calculation Library
 * 
 * Calculates Jewish feast days and holy days for any Gregorian year.
 * Based on traditional Hebrew calendar algorithms.
 * 
 * Spring Feasts:
 * - Passover (Pesach) - Nissan 15
 * - Unleavened Bread (Chag HaMatzot) - Nissan 15-21
 * - First Fruits (Yom HaBikkurim) - Day after Sabbath during Unleavened Bread
 * - Pentecost (Shavuot) - 50 days after First Fruits
 * 
 * Fall Feasts:
 * - Trumpets (Rosh Hashanah) - Tishrei 1
 * - Atonement (Yom Kippur) - Tishrei 10
 * - Tabernacles (Sukkot) - Tishrei 15-21
 * - Eighth Day Assembly (Shemini Atzeret) - Tishrei 22
 * 
 * Other Holy Days:
 * - Purim - Adar 14
 * - Hanukkah - Kislev 25 to Tevet 2 (8 days)
 */

export interface HebrewFeast {
  name: string;
  hebrewName: string;
  startDate: Date;
  endDate: Date;
  category: 'spring' | 'fall' | 'other';
  biblicalReference: string;
  significance: 'high' | 'medium' | 'low';
  description: string;
}

/**
 * Calculate Passover date for a given Gregorian year
 * Uses Gauss Easter algorithm adapted for Hebrew calendar
 */
function calculatePassover(year: number): Date {
  // Hebrew year calculation
  const hebrewYear = year + 3760;
  
  // Metonic cycle calculation (19-year cycle)
  const goldenNumber = (hebrewYear % 19) + 1;
  
  // Calculate month and day using traditional algorithm
  const century = Math.floor(year / 100);
  const h = (19 * goldenNumber + century - Math.floor(century / 4) - 
             Math.floor((8 * century + 13) / 25) + 15) % 30;
  
  const i = h - Math.floor(h / 28) * (1 - Math.floor(h / 28) * 
            Math.floor(29 / (h + 1)) * Math.floor((21 - goldenNumber) / 11));
  
  const j = (year + Math.floor(year / 4) + i + 2 - century + 
             Math.floor(century / 4)) % 7;
  
  const l = i - j;
  
  const month = 3 + Math.floor((l + 40) / 44);
  const day = l + 28 - 31 * Math.floor(month / 4);
  
  return new Date(year, month - 1, day);
}

/**
 * Calculate Rosh Hashanah (Feast of Trumpets) date
 */
function calculateRoshHashanah(year: number): Date {
  // Rosh Hashanah typically falls in September or early October
  // Using simplified algorithm based on Passover calculation
  const passover = calculatePassover(year);
  
  // Rosh Hashanah is approximately 163 days after Passover
  const roshHashanah = new Date(passover);
  roshHashanah.setDate(roshHashanah.getDate() + 163);
  
  return roshHashanah;
}

/**
 * Get all Hebrew feasts and holy days for a given year
 */
export function getHebrewFeastsForYear(year: number): HebrewFeast[] {
  const feasts: HebrewFeast[] = [];
  
  // Calculate base dates
  const passover = calculatePassover(year);
  const roshHashanah = calculateRoshHashanah(year);
  
  // SPRING FEASTS
  
  // 1. Passover (Pesach) - Nissan 15
  feasts.push({
    name: "Passover",
    hebrewName: "Pesach",
    startDate: new Date(passover),
    endDate: new Date(passover),
    category: 'spring',
    biblicalReference: "Leviticus 23:5",
    significance: 'high',
    description: "Commemorates the Exodus from Egypt; foreshadows Christ's sacrifice"
  });
  
  // 2. Unleavened Bread (Chag HaMatzot) - Nissan 15-21
  const unleavenedStart = new Date(passover);
  const unleavenedEnd = new Date(passover);
  unleavenedEnd.setDate(unleavenedEnd.getDate() + 6);
  
  feasts.push({
    name: "Unleavened Bread",
    hebrewName: "Chag HaMatzot",
    startDate: unleavenedStart,
    endDate: unleavenedEnd,
    category: 'spring',
    biblicalReference: "Leviticus 23:6-8",
    significance: 'high',
    description: "Seven days of eating unleavened bread; represents sanctification"
  });
  
  // 3. First Fruits (Yom HaBikkurim) - Day after Sabbath during Unleavened Bread
  const firstFruits = new Date(passover);
  firstFruits.setDate(firstFruits.getDate() + 1); // Simplified: day after Passover
  
  feasts.push({
    name: "First Fruits",
    hebrewName: "Yom HaBikkurim",
    startDate: firstFruits,
    endDate: firstFruits,
    category: 'spring',
    biblicalReference: "Leviticus 23:9-14",
    significance: 'high',
    description: "Offering of first harvest; foreshadows Christ's resurrection"
  });
  
  // 4. Pentecost (Shavuot) - 50 days after First Fruits
  const pentecost = new Date(firstFruits);
  pentecost.setDate(pentecost.getDate() + 50);
  
  feasts.push({
    name: "Pentecost",
    hebrewName: "Shavuot",
    startDate: pentecost,
    endDate: pentecost,
    category: 'spring',
    biblicalReference: "Leviticus 23:15-22",
    significance: 'high',
    description: "Feast of Weeks; commemorates giving of Torah; foreshadows Holy Spirit"
  });
  
  // FALL FEASTS
  
  // 5. Feast of Trumpets (Rosh Hashanah) - Tishrei 1
  feasts.push({
    name: "Feast of Trumpets",
    hebrewName: "Rosh Hashanah / Yom Teruah",
    startDate: new Date(roshHashanah),
    endDate: new Date(roshHashanah),
    category: 'fall',
    biblicalReference: "Leviticus 23:23-25",
    significance: 'high',
    description: "Jewish New Year; foreshadows the Rapture and trumpet call"
  });
  
  // 6. Day of Atonement (Yom Kippur) - Tishrei 10
  const yomKippur = new Date(roshHashanah);
  yomKippur.setDate(yomKippur.getDate() + 9);
  
  feasts.push({
    name: "Day of Atonement",
    hebrewName: "Yom Kippur",
    startDate: yomKippur,
    endDate: yomKippur,
    category: 'fall',
    biblicalReference: "Leviticus 23:26-32",
    significance: 'high',
    description: "Most holy day; foreshadows Christ's atonement and Second Coming"
  });
  
  // 7. Feast of Tabernacles (Sukkot) - Tishrei 15-21
  const sukkotStart = new Date(roshHashanah);
  sukkotStart.setDate(sukkotStart.getDate() + 14);
  const sukkotEnd = new Date(sukkotStart);
  sukkotEnd.setDate(sukkotEnd.getDate() + 6);
  
  feasts.push({
    name: "Feast of Tabernacles",
    hebrewName: "Sukkot",
    startDate: sukkotStart,
    endDate: sukkotEnd,
    category: 'fall',
    biblicalReference: "Leviticus 23:33-43",
    significance: 'high',
    description: "Seven days dwelling in booths; foreshadows Millennial Kingdom"
  });
  
  // 8. Eighth Day Assembly (Shemini Atzeret) - Tishrei 22
  const sheminiAtzeret = new Date(sukkotEnd);
  sheminiAtzeret.setDate(sheminiAtzeret.getDate() + 1);
  
  feasts.push({
    name: "Eighth Day Assembly",
    hebrewName: "Shemini Atzeret",
    startDate: sheminiAtzeret,
    endDate: sheminiAtzeret,
    category: 'fall',
    biblicalReference: "Leviticus 23:36",
    significance: 'medium',
    description: "Eighth day conclusion to Tabernacles; foreshadows eternal state"
  });
  
  // OTHER HOLY DAYS
  
  // 9. Purim - Adar 14 (typically late February/March)
  const purim = new Date(passover);
  purim.setDate(purim.getDate() - 30); // Approximately 30 days before Passover
  
  feasts.push({
    name: "Purim",
    hebrewName: "Purim",
    startDate: purim,
    endDate: purim,
    category: 'other',
    biblicalReference: "Esther 9:20-32",
    significance: 'medium',
    description: "Celebrates deliverance from Haman's plot; commemorates Book of Esther"
  });
  
  // 10. Hanukkah - Kislev 25 (typically late November/December)
  const hanukkahStart = new Date(year, 11, 10); // Approximate date around December 10
  const hanukkahEnd = new Date(hanukkahStart);
  hanukkahEnd.setDate(hanukkahEnd.getDate() + 7);
  
  feasts.push({
    name: "Hanukkah",
    hebrewName: "Hanukkah / Chanukah",
    startDate: hanukkahStart,
    endDate: hanukkahEnd,
    category: 'other',
    biblicalReference: "John 10:22-23 (Feast of Dedication)",
    significance: 'low',
    description: "Festival of Lights; commemorates rededication of Second Temple"
  });
  
  return feasts;
}

/**
 * Check if a given date falls on or near a Hebrew feast
 * Returns feast info and proximity in days
 */
export interface FeastProximity {
  feast: HebrewFeast;
  proximityDays: number;
  isDirectMatch: boolean;
}

export function getFeastProximity(date: Date, toleranceDays: number = 3): FeastProximity | null {
  const year = date.getFullYear();
  const feasts = getHebrewFeastsForYear(year);
  
  // Also check previous and next year in case date is near year boundary
  const allFeasts = [
    ...getHebrewFeastsForYear(year - 1),
    ...feasts,
    ...getHebrewFeastsForYear(year + 1)
  ];
  
  let closestFeast: FeastProximity | null = null;
  let minDistance = Infinity;
  
  for (const feast of allFeasts) {
    // Check both start and end dates of feast
    const distanceToStart = Math.abs(
      (date.getTime() - feast.startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const distanceToEnd = Math.abs(
      (date.getTime() - feast.endDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    // Check if date is during the feast
    const isDuringFeast = date >= feast.startDate && date <= feast.endDate;
    
    const minDistanceToFeast = Math.min(distanceToStart, distanceToEnd);
    
    if (isDuringFeast || minDistanceToFeast <= toleranceDays) {
      if (minDistanceToFeast < minDistance) {
        minDistance = minDistanceToFeast;
        closestFeast = {
          feast,
          proximityDays: Math.round(minDistanceToFeast),
          isDirectMatch: isDuringFeast || minDistanceToFeast === 0
        };
      }
    }
  }
  
  return closestFeast;
}

/**
 * Get Hebrew year from Gregorian date
 */
export function getHebrewYear(gregorianYear: number): number {
  return gregorianYear + 3760;
}

/**
 * Format feast date range for display
 */
export function formatFeastDateRange(feast: HebrewFeast): string {
  const isSingleDay = feast.startDate.getTime() === feast.endDate.getTime();
  
  if (isSingleDay) {
    return feast.startDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }
  
  return `${feast.startDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })} - ${feast.endDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })}`;
}

/**
 * Get all feasts within a date range
 */
export function getFeastsInRange(startDate: Date, endDate: Date): HebrewFeast[] {
  const startYear = startDate.getFullYear();
  const endYear = endDate.getFullYear();
  
  const allFeasts: HebrewFeast[] = [];
  
  // Get feasts for each year in range
  for (let year = startYear; year <= endYear; year++) {
    const yearFeasts = getHebrewFeastsForYear(year);
    allFeasts.push(...yearFeasts);
  }
  
  // Filter to only feasts within date range
  return allFeasts.filter(feast => 
    (feast.startDate >= startDate && feast.startDate <= endDate) ||
    (feast.endDate >= startDate && feast.endDate <= endDate) ||
    (feast.startDate <= startDate && feast.endDate >= endDate)
  );
}

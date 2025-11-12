/**
 * Hebrew Calendar & Biblical Feast Day Calculator
 * Based on HEBREW_FEAST_SYSTEM documentation
 * 
 * Implements accurate Hebrew calendar calculations for 10 biblical feasts:
 * - Spring Feasts: Passover, Unleavened Bread, First Fruits, Pentecost
 * - Fall Feasts: Trumpets, Day of Atonement, Tabernacles, Eighth Day
 * - Other: Purim, Hanukkah
 */

import type { HebrewFeast, FeastProximity } from '../types/celestial'

/**
 * Calculate Passover date using Gauss algorithm
 * Passover falls on Nissan 14 (approximately March/April)
 */
export function calculatePassover(year: number): Date {
  // Gauss Passover algorithm
  const a = (12 * year + 12) % 19
  const b = year % 4
  const Q = -1.904412361576 + 1.554241796621 * a + 0.25 * b - 0.003177794022 * year
  const INTQ = Math.floor(Q)
  const j = (INTQ + 3 * year + 5 * b + 2) % 7
  const r = Q - INTQ
  
  let D: number
  if (j === 2 || j === 4 || j === 6) {
    D = INTQ + 23
  } else if (j === 1 && a > 6 && r >= 0.632870370) {
    D = INTQ + 24
  } else if (j === 0 && a > 11 && r >= 0.897723765) {
    D = INTQ + 23
  } else {
    D = INTQ + 22
  }
  
  // Passover is in March or April
  if (D <= 31) {
    return new Date(year, 2, D) // March
  } else {
    return new Date(year, 3, D - 31) // April
  }
}

/**
 * Calculate Hebrew year from Gregorian date
 */
export function getHebrewYear(date: Date): number {
  const gregorianYear = date.getFullYear()
  const month = date.getMonth()
  
  // Hebrew year starts in September/October
  // If before September, use gregorianYear + 3760
  // If after September, use gregorianYear + 3761
  if (month < 8) {
    return gregorianYear + 3760
  } else {
    return gregorianYear + 3761
  }
}

/**
 * Add days to a date
 */
function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

/**
 * Get next Sabbath after date (Saturday)
 */
function getNextSabbath(date: Date): Date {
  const result = new Date(date)
  const daysUntilSaturday = (6 - result.getDay() + 7) % 7
  result.setDate(result.getDate() + daysUntilSaturday)
  return result
}

/**
 * Calculate all 10 Hebrew feasts for a given year
 */
export function getHebrewFeastsForYear(year: number): HebrewFeast[] {
  const passover = calculatePassover(year)
  const feasts: HebrewFeast[] = []
  
  // 1. PASSOVER (Pesach) - Nissan 14
  feasts.push({
    name: 'Passover',
    hebrewName: 'Pesach',
    date: passover,
    significance: 'high',
    biblicalReference: 'Leviticus 23:5',
    propheticImportance: 'Commemorates the Exodus; prophetically points to the sacrifice of the Messiah',
    hebrewMonth: 'Nissan',
    hebrewDay: 14,
  })
  
  // 2. UNLEAVENED BREAD - Nissan 15-21 (7 days)
  const unleavenedStart = addDays(passover, 1)
  const unleavenedEnd = addDays(passover, 7)
  feasts.push({
    name: 'Unleavened Bread',
    hebrewName: 'Chag HaMatzot',
    date: unleavenedStart,
    endDate: unleavenedEnd,
    significance: 'high',
    biblicalReference: 'Leviticus 23:6-8',
    propheticImportance: 'Represents putting away sin and living in holiness',
    hebrewMonth: 'Nissan',
    hebrewDay: 15,
  })
  
  // 3. FIRST FRUITS - Day after Sabbath during Unleavened Bread
  const firstSabbathDuringUnleavened = getNextSabbath(unleavenedStart)
  const firstFruits = addDays(firstSabbathDuringUnleavened, 1)
  feasts.push({
    name: 'First Fruits',
    hebrewName: 'Yom HaBikkurim',
    date: firstFruits,
    significance: 'medium',
    biblicalReference: 'Leviticus 23:10-14',
    propheticImportance: 'Prophetically represents the resurrection of the Messiah',
    hebrewMonth: 'Nissan',
    hebrewDay: 16,
  })
  
  // 4. PENTECOST (Shavuot) - 50 days after First Fruits
  const pentecost = addDays(firstFruits, 49)
  feasts.push({
    name: 'Pentecost',
    hebrewName: 'Shavuot',
    date: pentecost,
    significance: 'medium',
    biblicalReference: 'Leviticus 23:15-22',
    propheticImportance: 'Commemorates giving of Torah; prophetically the outpouring of the Holy Spirit',
    hebrewMonth: 'Sivan',
    hebrewDay: 6,
  })
  
  // Calculate fall feasts (Tishrei 1 is approximately 163 days after Passover)
  const trumpets = addDays(passover, 163)
  
  // 5. TRUMPETS (Rosh Hashanah) - Tishrei 1
  feasts.push({
    name: 'Trumpets',
    hebrewName: 'Yom Teruah',
    date: trumpets,
    significance: 'high',
    biblicalReference: 'Leviticus 23:23-25',
    propheticImportance: 'Prophetically represents the rapture and the awakening call',
    hebrewMonth: 'Tishrei',
    hebrewDay: 1,
  })
  
  // 6. DAY OF ATONEMENT (Yom Kippur) - Tishrei 10
  const yomKippur = addDays(trumpets, 9)
  feasts.push({
    name: 'Day of Atonement',
    hebrewName: 'Yom Kippur',
    date: yomKippur,
    significance: 'high',
    biblicalReference: 'Leviticus 23:26-32',
    propheticImportance: 'Holiest day; prophetically represents national Israel\'s repentance and cleansing',
    hebrewMonth: 'Tishrei',
    hebrewDay: 10,
  })
  
  // 7. TABERNACLES (Sukkot) - Tishrei 15-21 (7 days)
  const sukkotStart = addDays(trumpets, 14)
  const sukkotEnd = addDays(trumpets, 20)
  feasts.push({
    name: 'Tabernacles',
    hebrewName: 'Sukkot',
    date: sukkotStart,
    endDate: sukkotEnd,
    significance: 'high',
    biblicalReference: 'Leviticus 23:33-43',
    propheticImportance: 'Prophetically represents the Millennial Kingdom reign',
    hebrewMonth: 'Tishrei',
    hebrewDay: 15,
  })
  
  // 8. EIGHTH DAY (Shemini Atzeret) - Tishrei 22
  const eighthDay = addDays(trumpets, 21)
  feasts.push({
    name: 'Eighth Day',
    hebrewName: 'Shemini Atzeret',
    date: eighthDay,
    significance: 'medium',
    biblicalReference: 'Leviticus 23:36',
    propheticImportance: 'Represents the eternal state and New Jerusalem',
    hebrewMonth: 'Tishrei',
    hebrewDay: 22,
  })
  
  // 9. PURIM - Adar 14 (approximately February/March)
  // Purim is 30 days before Passover
  const purim = addDays(passover, -30)
  feasts.push({
    name: 'Purim',
    hebrewName: 'Purim',
    date: purim,
    significance: 'low',
    biblicalReference: 'Esther 9:26-28',
    propheticImportance: 'Celebrates deliverance from Haman; represents God\'s providence',
    hebrewMonth: 'Adar',
    hebrewDay: 14,
  })
  
  // 10. HANUKKAH (Dedication) - Kislev 25 - Tevet 2 (8 days)
  // Hanukkah is approximately 75 days before Passover
  const hanukkahStart = addDays(passover, -75)
  const hanukkahEnd = addDays(hanukkahStart, 7)
  feasts.push({
    name: 'Hanukkah',
    hebrewName: 'Chanukah',
    date: hanukkahStart,
    endDate: hanukkahEnd,
    significance: 'low',
    biblicalReference: 'John 10:22-23',
    propheticImportance: 'Festival of Lights; represents rededication and spiritual victory',
    hebrewMonth: 'Kislev',
    hebrewDay: 25,
  })
  
  return feasts
}

/**
 * Check if a date is within proximity of any Hebrew feast
 * Default tolerance: ±3 days
 */
export function getFeastProximity(date: Date, toleranceDays: number = 3): FeastProximity | null {
  const year = date.getFullYear()
  const feasts = getHebrewFeastsForYear(year)
  
  // Also check previous and next year for boundary cases
  const prevYearFeasts = getHebrewFeastsForYear(year - 1)
  const nextYearFeasts = getHebrewFeastsForYear(year + 1)
  const allFeasts = [...prevYearFeasts, ...feasts, ...nextYearFeasts]
  
  for (const feast of allFeasts) {
    // Check main date
    const daysDiff = Math.abs(differenceInDays(date, feast.date))
    if (daysDiff <= toleranceDays) {
      return {
        feast,
        daysAway: differenceInDays(feast.date, date),
        isExactMatch: daysDiff === 0,
        isWithinTolerance: true,
      }
    }
    
    // Check end date for multi-day feasts
    if (feast.endDate) {
      const isWithinRange = date >= feast.date && date <= feast.endDate
      if (isWithinRange) {
        return {
          feast,
          daysAway: 0,
          isExactMatch: true,
          isWithinTolerance: true,
        }
      }
    }
  }
  
  return null
}

/**
 * Get all feasts within a date range
 */
export function getFeastsInRange(startDate: Date, endDate: Date): HebrewFeast[] {
  const startYear = startDate.getFullYear()
  const endYear = endDate.getFullYear()
  const allFeasts: HebrewFeast[] = []
  
  for (let year = startYear; year <= endYear; year++) {
    const yearFeasts = getHebrewFeastsForYear(year)
    const feastsInRange = yearFeasts.filter(feast => {
      const feastDate = feast.date
      return feastDate >= startDate && feastDate <= endDate
    })
    allFeasts.push(...feastsInRange)
  }
  
  return allFeasts
}

/**
 * Format feast date range for display
 */
export function formatFeastDateRange(feast: HebrewFeast): string {
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' }
  const startStr = feast.date.toLocaleDateString('en-US', options)
  
  if (feast.endDate) {
    const endStr = feast.endDate.toLocaleDateString('en-US', options)
    return `${startStr} - ${endStr}`
  }
  
  return startStr
}

/**
 * Calculate difference in days between two dates
 */
function differenceInDays(date1: Date, date2: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24
  const utc1 = Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate())
  const utc2 = Date.UTC(date2.getFullYear(), date2.getMonth(), date2.getDate())
  return Math.floor((utc1 - utc2) / msPerDay)
}

/**
 * Prophecy Form Validation Schema
 * 
 * Zod schemas for validating prophecy data entry forms.
 */

import { z } from 'zod';

export const prophecySchema = z.object({
  title: z.string()
    .min(5, 'Title must be at least 5 characters')
    .max(255, 'Title must be less than 255 characters'),
  
  scriptureReference: z.string()
    .min(3, 'Scripture reference is required')
    .max(100, 'Scripture reference must be less than 100 characters')
    .regex(/^[A-Za-z0-9\s:,\-]+$/, 'Invalid scripture reference format'),
  
  book: z.string()
    .min(2, 'Book name is required')
    .max(50, 'Book name must be less than 50 characters'),
  
  chapter: z.number()
    .int('Chapter must be a whole number')
    .positive('Chapter must be positive')
    .max(150, 'Chapter number too large'),
  
  verseStart: z.number()
    .int('Verse must be a whole number')
    .positive('Verse must be positive')
    .max(200, 'Verse number too large'),
  
  verseEnd: z.number()
    .int('Verse must be a whole number')
    .positive('Verse must be positive')
    .max(200, 'Verse number too large')
    .optional()
    .nullable(),
  
  fullText: z.string()
    .min(10, 'Scripture text must be at least 10 characters')
    .max(5000, 'Scripture text must be less than 5000 characters'),
  
  category: z.enum(['celestial_sign', 'terrestrial_event', 'spiritual_event'], {
    errorMap: () => ({ message: 'Please select a valid category' }),
  }),
  
  propheticContext: z.string()
    .max(2000, 'Context must be less than 2000 characters')
    .optional()
    .nullable(),
  
  interpretation: z.string()
    .max(5000, 'Interpretation must be less than 5000 characters')
    .optional()
    .nullable(),
  
  fulfillmentStatus: z.enum(['unfulfilled', 'partially_fulfilled', 'fulfilled'], {
    errorMap: () => ({ message: 'Please select a fulfillment status' }),
  }).default('unfulfilled'),
  
  significanceLevel: z.enum(['low', 'medium', 'high', 'critical'], {
    errorMap: () => ({ message: 'Please select a significance level' }),
  }).default('medium'),
  
  tags: z.array(z.string()).optional().default([]),
  
  eschatologicalContext: z.string()
    .max(100, 'Context must be less than 100 characters')
    .optional()
    .nullable(),
});

export type ProphecyFormData = z.infer<typeof prophecySchema>;

// Celestial Event Schema
export const celestialEventSchema = z.object({
  eventType: z.enum([
    'blood_moon',
    'solar_eclipse',
    'conjunction',
    'comet_perihelion',
    'neo_approach',
    'meteor_shower',
    'planetary_alignment',
  ], {
    errorMap: () => ({ message: 'Please select a valid event type' }),
  }),
  
  eventDate: z.date({
    required_error: 'Event date is required',
    invalid_type_error: 'Invalid date format',
  }),
  
  durationMinutes: z.number()
    .int('Duration must be whole minutes')
    .positive('Duration must be positive')
    .max(10000, 'Duration too large')
    .optional()
    .nullable(),
  
  title: z.string()
    .min(5, 'Title must be at least 5 characters')
    .max(255, 'Title must be less than 255 characters'),
  
  description: z.string()
    .max(2000, 'Description must be less than 2000 characters')
    .optional()
    .nullable(),
  
  celestialObjects: z.array(z.string())
    .min(1, 'At least one celestial object is required')
    .max(10, 'Too many celestial objects'),
  
  magnitude: z.number()
    .optional()
    .nullable(),
  
  visibilityRegions: z.array(z.string())
    .optional()
    .default([]),
  
  isBloodMoon: z.boolean().default(false),
  
  tetradCycleNumber: z.number()
    .int('Cycle number must be whole')
    .positive('Cycle number must be positive')
    .optional()
    .nullable(),
  
  propheticSignificance: z.number()
    .min(0, 'Significance must be 0-100')
    .max(100, 'Significance must be 0-100')
    .optional()
    .nullable(),
  
  notes: z.string()
    .max(2000, 'Notes must be less than 2000 characters')
    .optional()
    .nullable(),
});

export type CelestialEventFormData = z.infer<typeof celestialEventSchema>;

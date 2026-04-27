/**
 * Vercel Speed Insights Integration
 * This module initializes Vercel Speed Insights for performance tracking
 */

import { injectSpeedInsights } from '@vercel/speed-insights';

// Initialize Speed Insights
// This will automatically track web vitals and performance metrics
injectSpeedInsights({
  debug: false, // Set to true for development debugging
  sampleRate: 1 // Track 100% of page views (adjust as needed)
});

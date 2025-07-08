const { extractStructuredData, getStretchRecommendation, extractTimeContext } = require('./utils/patternAnalysis');

// Test cases with different time contexts
const testCases = [
  "Snatches were tough today, quads sore. Mood: Tired. Journal: Workouts, CrossFit, Snatch 5x3 at 135 lbs, Felt exhausted, Sore quads.",
  "My shoulders are still sore from yesterday's workout. Mood: Neutral. Journal: Workouts, CrossFit, Handstand push-ups 15 reps, Felt challenged, Sore shoulders.",
  "Quads have been persistently sore for the last week. Mood: Stressed. Journal: Workouts, CrossFit, Wall Balls 30 reps, Felt exhausted, Sore quads.",
  "Just did deadlifts and my lower back is sore now. Mood: Energized. Journal: Workouts, CrossFit, Deadlift 5x5 at 250 lbs, Felt strong, Sore lower back.",
  "Hips sore from last week's yoga session. Mood: Grateful. Journal: Workouts, Yoga, Yin 40 min, Felt centered, Sore hips."
];

console.log('Testing Time-Aware Pattern Extraction:\n');

testCases.forEach((testCase, index) => {
  console.log(`Test Case ${index + 1}:`);
  console.log(`Input: "${testCase}"`);
  
  const extracted = extractStructuredData(testCase);
  console.log('Extracted Data:', JSON.stringify(extracted, null, 2));
  
  if (extracted.soreness) {
    const stretch = getStretchRecommendation(extracted.soreness, extracted.timeContext);
    console.log(`Time-Aware Stretch Recommendation: ${stretch}`);
  }
  
  console.log('---\n');
});

console.log('Testing Time Context Extraction:\n');

const timeTestCases = [
  "today",
  "yesterday", 
  "last week",
  "still sore",
  "persistent pain",
  "just finished",
  "this morning",
  "recently"
];

timeTestCases.forEach((timeRef, index) => {
  const timeContext = extractTimeContext(`My quads are ${timeRef} sore`);
  console.log(`Time Reference "${timeRef}": ${JSON.stringify(timeContext)}`);
}); 
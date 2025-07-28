const fs = require('fs');
const path = require('path');

// Directory cleanup script
function cleanupDirectory() {
  console.log('🧹 Starting Directory Cleanup\n');
  
  const filesToDelete = [
    // Root directory files
    'test-results-specificity-2025-07-26T12-26-15-869Z.json',
    'test-results-specificity-2025-07-26T12-24-20-602Z.json',
    'test-results-unified-model-api-2025-07-26T11-00-22-631Z.json',
    'test-results-unified-model-api-2025-07-26T04-50-38-930Z.json',
    'test-results-unified-model-api-2025-07-25T15-01-08-655Z.json',
    'test-results-unified-model-api-2025-07-25T14-57-39-054Z.json',
    'comprehensive-unified-dataset-30-examples.jsonl',
    'clean_training_data.js',
    '.DS_Store',
    
    // AI model analysis files
    'ai-model-analysis/current-model-analysis-2025-07-20T05-29-27-469Z.md',
    'ai-model-analysis/current-model-test-2025-07-20T05-29-27-469Z.json',
    'ai-model-analysis/current-model-analysis-2025-07-20T05-40-59-358Z.md',
    'ai-model-analysis/current-model-test-2025-07-20T05-40-59-358Z.json',
    
    // Scripts to delete
    'scripts/analyzeLongResponses.js',
    'scripts/shortenLongResponses.js',
    'scripts/analyzeShortenedResults.js',
    'scripts/debugZeroLengthResponses.js',
    'scripts/improvedShortenResponses.js',
    'scripts/analyzeImprovedResults.js',
    'scripts/finalizeShortenedDataset.js',
    'scripts/testUpdatedModel.js',
    'scripts/testModelWithAuth.js',
    'scripts/testUnifiedModel.js',
    'scripts/testEnhancedSpecificity.js',
    'scripts/testUnifiedModelAPI.js',
    'scripts/testGoalIntegrationModel.js',
    'scripts/testGoalIntegration.js',
    'scripts/testYogaRecoveryIntegration.js',
    'scripts/testSpecificRecoveryKnowledge.js',
    'scripts/testFitnessProgrammingModel.js',
    'scripts/testGenericVsSpecificFitness.js',
    'scripts/testSpecificInjuryTerminology.js',
    'scripts/testComprehensiveModel.js',
    'scripts/testActionOrientedModel.js',
    'scripts/testAIImprovements.js',
    'scripts/advancedAITest.js',
    'scripts/testNewComplementaryModel.js',
    'scripts/testRealModel.js',
    'scripts/testCurrentAIModel.js',
    'scripts/testEdgeCases.js',
    'scripts/testFineTunedModel.js',
    'scripts/testMultiTurnConversations.js',
    'scripts/testComplementaryScenarios.js',
    'scripts/testMentalHealthScenarios.js',
    'scripts/testFitnessProgrammingScenarios.js',
    'scripts/testAdvancedProgrammingScenarios.js',
    'scripts/testMultiTurnMemoryScenarios.js',
    'scripts/testEnhancedMemorySystem.js',
    'scripts/testMultiTurnMemoryIntegration.js',
    'scripts/testEnhancedMemoryIntegration.js',
    'scripts/quickMemoryImprovementTest.js',
    'scripts/simpleAITest.js',
    'scripts/generateEnhancedInjurySupport.js',
    'scripts/generateMentalHealthTrainingData.js',
    'scripts/generateAdvancedProgrammingData.js',
    'scripts/generateFitnessProgrammingData.js',
    'scripts/generateMultiTurnMemoryData.js',
    'scripts/generateComplementaryTrainingData.js',
    'scripts/enhancedTrainingDataGenerator.js',
    'scripts/aiTrainingDataGenerator.js',
    'scripts/detailedTrainingDataAnalysis.js',
    'scripts/comprehensiveTrainingDataAssessment.js',
    'scripts/createFinalDataset.js',
    'scripts/finalEnhancement.js',
    'scripts/finalAssessment.js',
    'scripts/combineAndOptimize.js',
    'scripts/fullEnhancement.js',
    'scripts/deepTrainingAssessment.js',
    'scripts/assessImprovedData.js',
    'scripts/cleanAndCombineData.js',
    'scripts/createEnhancedTrainingData.js',
    'scripts/assessTrainingData.js',
    'scripts/validateFinalFile.js',
    'scripts/validateJsonlFile.js',
    'scripts/fixMultiTurnJsonl.js',
    'scripts/fixJsonlFile.js',
    'scripts/testCriticalFixes.js',
    'scripts/aiModelAnalyzerNode.js',
    'scripts/convertToPromptCompletion.js',
    'scripts/checkFineTuningModels.js',
    'scripts/migrateToEnhancedGoals.js',
    'scripts/manualTrainingCreator.js',
    'scripts/prepareFineTuningData.js',
    'scripts/startFineTuning.js',
    'scripts/uploadAndFineTune.js',
    'scripts/questionGenerator.js',
    'scripts/collectMultiTurnData.js',
    'scripts/fineTuneMultiTurnMemory.js',
    'scripts/cleanupFineTuningData.js'
  ];
  
  let deletedCount = 0;
  let errorCount = 0;
  const errors = [];
  
  console.log(`🗑️ Attempting to delete ${filesToDelete.length} files...\n`);
  
  filesToDelete.forEach(filePath => {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`✅ Deleted: ${filePath}`);
        deletedCount++;
      } else {
        console.log(`⚠️ Not found: ${filePath}`);
      }
    } catch (error) {
      console.log(`❌ Error deleting ${filePath}: ${error.message}`);
      errorCount++;
      errors.push({ file: filePath, error: error.message });
    }
  });
  
  console.log(`\n📊 CLEANUP RESULTS:`);
  console.log(`- Files deleted: ${deletedCount}`);
  console.log(`- Files not found: ${filesToDelete.length - deletedCount - errorCount}`);
  console.log(`- Errors: ${errorCount}`);
  
  if (errors.length > 0) {
    console.log(`\n❌ ERRORS:`);
    errors.forEach(({ file, error }) => {
      console.log(`- ${file}: ${error}`);
    });
  }
  
  // Create a backup of the cleanup summary
  const cleanupSummary = {
    date: new Date().toISOString(),
    filesDeleted: deletedCount,
    filesNotFound: filesToDelete.length - deletedCount - errorCount,
    errors: errorCount,
    errorDetails: errors,
    totalFilesAttempted: filesToDelete.length
  };
  
  fs.writeFileSync('CLEANUP_SUMMARY.json', JSON.stringify(cleanupSummary, null, 2));
  console.log(`\n📝 Cleanup summary saved to: CLEANUP_SUMMARY.json`);
  
  return cleanupSummary;
}

// Run the cleanup
const result = cleanupDirectory(); 
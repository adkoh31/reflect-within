const fs = require('fs');
const path = require('path');

// Clean up fine-tuning-data folder
function cleanupFineTuningData() {
  console.log('🧹 Cleaning up Fine-Tuning Data Folder\n');
  
  const fineTuningDataPath = path.join(__dirname, '../fine-tuning-data');
  
  // Files to keep (essential)
  const filesToKeep = [
    'CURRENT_WORKING_DATASET.jsonl',
    'MASTER_INDEX.md',
    'README.md'
  ];
  
  // Files to delete in current directory
  const filesToDelete = [
    'CURRENT_WORKING_DATASET.json',
    'BACKUP_CURRENT_DATASET_2025-07-28T02-52-42-255Z.jsonl',
    'IMPROVED_SHORTENED_DATASET_2025-07-28T02-50-00-638Z.jsonl',
    'SHORTENED_DATASET_2025-07-27T13-10-07-757Z.jsonl',
    'SHORTENING_SUMMARY_2025-07-28T02-52-42-266Z.json',
    'FINAL_SUMMARY-2025-07-27T11-26-14-548Z.json',
    'FINAL_TRAINING_DATASET-2025-07-27T11-26-14-548Z.json',
    'FINAL_TRAINING_DATASET-2025-07-27T11-26-14-548Z.jsonl',
    'final-enhanced-data-2025-07-27T11-25-17-167Z.json',
    'final-enhanced-data-2025-07-27T11-25-17-167Z.jsonl',
    'optimization-summary-2025-07-27T11-21-34-094Z.json',
    'optimized-training-dataset-2025-07-27T11-21-34-094Z.json',
    'optimized-training-dataset-2025-07-27T11-21-34-094Z.jsonl',
    'full-enhanced-data-2025-07-27T11-17-22-362Z.json',
    'full-enhanced-data-2025-07-27T11-17-22-362Z.jsonl',
    'combined-enhanced-dataset-2025-07-27T10-29-24-351Z.json',
    'data-improvement-summary-2025-07-27T10-29-24-351Z.json',
    'combined-enhanced-dataset-2025-07-27T10-29-24-351Z.jsonl',
    'enhanced-training-data-2025-07-27T10-26-08-290Z.json',
    'enhanced-training-data-2025-07-27T10-26-08-290Z.jsonl',
    'comprehensive-unified-dataset-30-examples.jsonl',
    'comprehensive-unified-dataset-30-examples-broken.jsonl'
  ];
  
  let deletedCount = 0;
  let errorCount = 0;
  const errors = [];
  
  console.log('🗑️ Phase 1: Removing redundant files from current directory...\n');
  
  // Delete redundant files in current directory
  filesToDelete.forEach(fileName => {
    const filePath = path.join(fineTuningDataPath, 'current', 'unified-training-data', fileName);
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`✅ Deleted: ${fileName}`);
        deletedCount++;
      } else {
        console.log(`⚠️ Not found: ${fileName}`);
      }
    } catch (error) {
      console.log(`❌ Error deleting ${fileName}: ${error.message}`);
      errorCount++;
      errors.push({ file: fileName, error: error.message });
    }
  });
  
  console.log('\n🗑️ Phase 2: Removing archive directory...\n');
  
  // Remove archive directory
  const archivePath = path.join(fineTuningDataPath, 'archive');
  try {
    if (fs.existsSync(archivePath)) {
      // Recursively remove archive directory
      removeDirectoryRecursive(archivePath);
      console.log('✅ Deleted: archive/ (entire directory)');
      deletedCount++;
    } else {
      console.log('⚠️ Archive directory not found');
    }
  } catch (error) {
    console.log(`❌ Error deleting archive directory: ${error.message}`);
    errorCount++;
    errors.push({ file: 'archive/', error: error.message });
  }
  
  console.log('\n📊 CLEANUP RESULTS:');
  console.log(`- Files deleted: ${deletedCount}`);
  console.log(`- Errors: ${errorCount}`);
  
  if (errors.length > 0) {
    console.log(`\n❌ ERRORS:`);
    errors.forEach(({ file, error }) => {
      console.log(`- ${file}: ${error}`);
    });
  }
  
  // Verify essential files are still there
  console.log('\n✅ VERIFYING ESSENTIAL FILES:');
  filesToKeep.forEach(fileName => {
    const filePath = path.join(fineTuningDataPath, 'current', 'unified-training-data', fileName);
    if (fs.existsSync(filePath)) {
      console.log(`✅ Kept: ${fileName}`);
    } else {
      console.log(`❌ Missing: ${fileName}`);
    }
  });
  
  // Create cleanup summary
  const cleanupSummary = {
    date: new Date().toISOString(),
    filesDeleted: deletedCount,
    errors: errorCount,
    errorDetails: errors,
    filesKept: filesToKeep,
    totalFilesAttempted: filesToDelete.length + 1 // +1 for archive directory
  };
  
  fs.writeFileSync('FINE_TUNING_CLEANUP_SUMMARY.json', JSON.stringify(cleanupSummary, null, 2));
  console.log(`\n📝 Cleanup summary saved to: FINE_TUNING_CLEANUP_SUMMARY.json`);
  
  return cleanupSummary;
}

// Helper function to recursively remove directory
function removeDirectoryRecursive(dirPath) {
  if (fs.existsSync(dirPath)) {
    const files = fs.readdirSync(dirPath);
    
    for (const file of files) {
      const curPath = path.join(dirPath, file);
      
      if (fs.lstatSync(curPath).isDirectory()) {
        removeDirectoryRecursive(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    }
    
    fs.rmdirSync(dirPath);
  }
}

// Run the cleanup
const result = cleanupFineTuningData(); 
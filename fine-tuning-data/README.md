# 🎯 **Fine-tuning Data Organization**

## **📁 Directory Structure**

```
fine-tuning-data/
├── current/                           ← Current active datasets
│   ├── multi-turn-memory-enhanced/   ← Latest multi-turn memory data
│   ├── multi-turn-memory/            ← Previous multi-turn memory data
│   ├── domain-expertise/             ← Domain expertise data
│   ├── complementary-role/           ← Complementary role data
│   └── consolidated/                 ← Consolidated datasets
├── archive/                          ← Archived datasets
│   ├── old-training-data/            ← Old training data files
│   └── fine-tuning-summary-*.md      ← Historical summaries
└── MASTER_INDEX.md                   ← Master index file
```

## **🚀 Current Active Datasets**

### **1. Multi-turn Memory Enhanced** ⭐ **LATEST**
**Location**: `current/multi-turn-memory-enhanced/`
- **File**: `multi-turn-memory-training-data.json`
- **Size**: 48KB (978 lines)
- **Examples**: 25 high-quality conversations
- **Memory Rate**: 100%
- **Status**: Production ready for fine-tuning

**Categories**:
- Fitness Level Variations (4 examples)
- Life Situation Variations (4 examples)
- Goal Type Variations (3 examples)
- Challenge Variations (3 examples)
- Original Categories (11 examples)

### **2. Multi-turn Memory (Previous)**
**Location**: `current/multi-turn-memory/`
- **File**: `multi-turn-memory-data-2025-07-22T13-06-17-809Z.json`
- **Size**: 48KB (434 lines)
- **Examples**: 27 examples
- **Status**: Previous version

### **3. Domain Expertise**
**Location**: `current/domain-expertise/`
- **Status**: Domain-specific training data

### **4. Complementary Role**
**Location**: `current/complementary-role/`
- **Status**: Role-based training data

### **5. Consolidated**
**Location**: `current/consolidated/`
- **Status**: Combined datasets

## **📊 Usage Guidelines**

### **For Fine-tuning**:
1. **Primary**: Use `current/multi-turn-memory-enhanced/` for latest data
2. **Backup**: Use `current/multi-turn-memory/` if needed
3. **Specialized**: Use domain-specific folders for targeted fine-tuning

### **File Naming Convention**:
- `*-training-data.json` - Main training files
- `metadata.json` - Analysis and statistics
- `fine-tuning-config.json` - Recommended parameters
- `README.md` - Documentation for each dataset

## **🔄 Version Control**

### **Current Version**: 2.0.0
- **Date**: 2025-07-23
- **Focus**: Multi-turn memory enhancement
- **Coverage**: Comprehensive user scenarios
- **Quality**: Production ready

### **Previous Versions**:
- **Version 1.0.0**: Basic multi-turn memory (7 examples)
- **Version 1.5.0**: Enhanced multi-turn memory (11 examples)
- **Version 2.0.0**: Comprehensive multi-turn memory (25 examples)

## **🎯 Next Steps**

1. **Fine-tune** using `current/multi-turn-memory-enhanced/`
2. **Test** the fine-tuned model
3. **Iterate** based on results
4. **Archive** old versions as needed

---

**Ready for fine-tuning! 🚀** 
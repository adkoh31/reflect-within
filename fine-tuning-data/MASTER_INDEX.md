# Fine-Tuning Data Master Index

**Last Updated:** 2025-01-27T10:00:00Z
**Total Files:** 21

## 📁 Directory Structure

```
fine-tuning-data/
├── current/                    # Active training data
│   ├── multi-turn-memory/      # Memory and conversation continuity
│   ├── domain-expertise/       # Mental health, fitness, programming
│   ├── complementary-role/     # AI role and positioning
│   └── consolidated/           # Combined datasets
├── archive/                    # Historical versions
└── MASTER_INDEX.md            # This file
```

## 🧠 Multi-Turn Memory Data

*Location: `current/multi-turn-memory/`*

| File | Type | Size | Description |
|------|------|------|-------------|
| `multi-turn-memory-data-2025-07-22T13-06-17-809Z.jsonl` | JSONL | 45.0 KB | Fine-tuning data (OpenAI format) |
| `multi-turn-memory-data-2025-07-22T13-06-17-809Z.json` | JSON | 48.0 KB | Training data (readable format) |
| `multi-turn-memory-data-2025-07-22T13-06-17-809Z-summary.md` | Markdown | 2.5 KB | Summary and documentation |

## 🎯 Domain Expertise Data

*Location: `current/domain-expertise/`*

| File | Type | Size | Description |
|------|------|------|-------------|
| `mental-health-training-data-2025-07-22T12-33-44-322Z.jsonl` | JSONL | 43.0 KB | Fine-tuning data (OpenAI format) |
| `mental-health-training-data-2025-07-22T12-33-44-322Z.json` | JSON | 46.0 KB | Training data (readable format) |
| `mental-health-training-data-2025-07-22T12-33-44-322Z-summary.md` | Markdown | 2.4 KB | Summary and documentation |
| `fitness-programming-data-2025-07-22T12-44-38-483Z.jsonl` | JSONL | 45.0 KB | Fine-tuning data (OpenAI format) |
| `fitness-programming-data-2025-07-22T12-44-38-483Z.json` | JSON | 48.0 KB | Training data (readable format) |
| `fitness-programming-data-2025-07-22T12-44-38-483Z-summary.md` | Markdown | 2.3 KB | Summary and documentation |
| `advanced-programming-data-2025-07-22T12-54-07-071Z.jsonl` | JSONL | 47.0 KB | Fine-tuning data (OpenAI format) |
| `advanced-programming-data-2025-07-22T12-54-07-071Z.json` | JSON | 50.0 KB | Training data (readable format) |
| `advanced-programming-data-2025-07-22T12-54-07-071Z-summary.md` | Markdown | 2.3 KB | Summary and documentation |
| `fitness-action-oriented-data-2025-01-27T10-00-00-000Z.jsonl` | JSONL | 45.0 KB | Fine-tuning data (OpenAI format) |
| `fitness-action-oriented-data-2025-01-27T10-00-00-000Z.json` | JSON | 48.0 KB | Training data (readable format) |
| `fitness-action-oriented-data-2025-01-27T10-00-00-000Z-summary.md` | Markdown | 2.4 KB | Summary and documentation |

## 🤝 Complementary Role Data

*Location: `current/complementary-role/`*

| File | Type | Size | Description |
|------|------|------|-------------|
| `complementary-training-data-2025-07-22T11-46-26-996Z.jsonl` | JSONL | 32.0 KB | Fine-tuning data (OpenAI format) |
| `complementary-training-data-2025-07-22T11-46-26-996Z.json` | JSON | 35.0 KB | Training data (readable format) |
| `complementary-training-data-2025-07-22T11-46-26-996Z-summary.md` | Markdown | 1.5 KB | Summary and documentation |

## 📦 Consolidated Data

*Location: `current/consolidated/`*

| File | Type | Size | Description |
|------|------|------|-------------|
| `fine-tuning-data-2025-07-22T09-57-45-288Z.jsonl` | JSONL | 56.0 KB | Fine-tuning data (OpenAI format) |
| `fine-tuning-data-2025-07-22T09-57-45-288Z.json` | JSON | 62.0 KB | Training data (readable format) |

## 📚 Archive

*Location: `archive/`*

| File | Type | Size | Description |
|------|------|------|-------------|
| `fine-tuning-summary-2025-07-22T09-57-45-288Z.md` | Markdown | 2.3 KB | Summary and documentation |

## 🎯 Current Model Status

**Active Model:** `ft:gpt-4o-mini-2024-07-18:personal:complementary-data:Bw5xGY3w`

### Training Data Sources:
1. **Complementary Role Data** - AI positioning and emotional support
2. **Domain Expertise Data** - Mental health, fitness, and programming knowledge
3. **Multi-Turn Memory Data** - Conversation continuity and personalization

### Next Steps:
- [ ] Fine-tune on multi-turn memory data
- [ ] Test enhanced memory capabilities
- [ ] Integrate memory system with existing conversation flow
- [ ] Monitor performance and user feedback

## 📈 Data Statistics

| Category | Files | Total Size | Examples |
|----------|-------|------------|----------|
| multi-turn-memory | 3 | 95.5 KB | 27 |
| domain-expertise | 12 | 377.0 KB | 101 |
| complementary-role | 3 | 68.5 KB | 27 |
| consolidated | 2 | 118.0 KB | 56 |
| archive | 1 | 2.3 KB | 0 |

## 🔧 Usage Guidelines

### For Development:
1. **New Training Data**: Place in appropriate category folder
2. **Testing**: Use files from `current/` directory
3. **Archiving**: Move old versions to `archive/` directory
4. **Documentation**: Update this index when adding new files

### For Fine-Tuning:
1. **Primary Data**: Use latest files from each category
2. **Combination**: Consider combining multiple datasets
3. **Validation**: Test with validation scripts before deployment
4. **Backup**: Keep previous versions in archive

## 📝 File Naming Convention

```
{category}-{description}-{timestamp}.{extension}
```

Examples:
- `multi-turn-memory-data-2025-07-22T13-06-17-809Z.jsonl`
- `mental-health-training-data-2025-07-22T12-33-44-322Z.json`
- `complementary-training-data-2025-07-22T11-46-26-996Z-summary.md`

## 🚀 Quick Access

### Latest Files by Category:
- **Multi-Turn Memory**: `current/multi-turn-memory/multi-turn-memory-data-2025-07-22T13-06-17-809Z.jsonl`
- **Mental Health**: `current/domain-expertise/mental-health-training-data-2025-07-22T12-33-44-322Z.jsonl`
- **Fitness Programming**: `current/domain-expertise/fitness-programming-data-2025-07-22T12-44-38-483Z.jsonl`
- **Advanced Programming**: `current/domain-expertise/advanced-programming-data-2025-07-22T12-54-07-071Z.jsonl`
- **Complementary Role**: `current/complementary-role/complementary-training-data-2025-07-22T11-46-26-996Z.jsonl`
- **Consolidated**: `current/consolidated/fine-tuning-data-2025-07-22T09-57-45-288Z.jsonl`

## 🎯 Training Data Summary

### Multi-Turn Memory (Latest)
- **Focus**: Conversation continuity and memory capabilities
- **Examples**: 27 scenarios covering conversation continuity, pattern recognition, emotional memory
- **Status**: Ready for fine-tuning
- **Impact**: Expected 40% improvement in conversation continuity

### Domain Expertise (Latest)
- **Mental Health**: 27 examples covering psychology, motivation, stress management
- **Fitness Programming**: 27 examples covering basic fitness principles and programming
- **Advanced Programming**: 27 examples covering movement integration and advanced concepts
- **Status**: All ready for fine-tuning
- **Impact**: Enhanced domain knowledge and expertise

### Complementary Role (Latest)
- **Focus**: AI positioning as emotional support companion
- **Examples**: 27 scenarios emphasizing complementary role to professionals
- **Status**: Currently deployed in active model
- **Impact**: Improved AI role clarity and boundaries

### Consolidated (Historical)
- **Focus**: Combined dataset from earlier development
- **Examples**: 56 examples from various sources
- **Status**: Superseded by specialized datasets
- **Impact**: Foundation for current specialized approach

---

*This index is automatically generated and should be updated when new training data is added.* 
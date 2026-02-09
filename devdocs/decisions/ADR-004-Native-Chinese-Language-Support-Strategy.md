# ADR-004: Native Chinese Language Support Strategy

## Status

**Status:** Accepted  
**Date:** 2026-02-10  
**Deciders:** Core Architecture Team  
**Supersedes:** None  
**Superseded by:** None

---

## Context

MedXAI is building a FHIR R4 implementation for the Chinese healthcare market. Unlike typical internationalization (i18n) approaches that treat non-English languages as "translations," we require **native Chinese language support** as a first-class architectural concern from the ground up.

### The Challenge

Chinese language support in healthcare IT systems presents unique challenges:

1. **Search & Retrieval**
   - Chinese characters require specialized indexing (full-text, pinyin, stroke order)
   - Pinyin input is the primary search method for Chinese users
   - Multi-character homonyms (多音字) require context-aware handling
   - Medical synonyms are common (e.g., "高血压" vs "血压升高")

2. **Medical Terminology**
   - Official Chinese medical terminologies exist (ICD-10-CN, National Drug Codes, etc.)
   - Many FHIR ValueSets/CodeSystems lack official Chinese translations
   - Chinese medical data standards (卫健委标准) differ from HL7 standards
   - Display names must be Chinese for user-facing applications

3. **Data Model Extensions**
   - Chinese-specific identifiers (身份证、医保号、社保卡)
   - Chinese administrative divisions (省/市/区/县)
   - Chinese-specific demographics (民族、户籍)

4. **Architectural Impact**
   - Cannot be "bolted on" after core implementation
   - Affects parser, validator, search, storage, and UI layers
   - Requires separate medical data resource project

### Why This Matters Now

We are completing **Phase 2 (fhir-parser)** and about to enter **Phase 3 (fhir-context)** where search and terminology services are designed. If we don't establish Chinese support strategy now, we will face costly refactoring later.

---

## Decision

We adopt a **two-layer native Chinese support strategy**:

### Layer 1: Architecture-Level Native Support (Built into fhir-core)

Chinese language features are **designed into the core architecture** from the beginning, not added as plugins:

#### A. Parser Layer (Phase 2) ✅
- **UTF-8 handling**: All parsers correctly handle Chinese characters
- **Error message i18n hooks**: `ParseIssue` includes error code that can be mapped to Chinese messages
- **Test coverage**: Fixtures include Chinese strings to verify encoding correctness

**Implementation:**
```typescript
// parse-error.ts
export type ParseErrorCode = 
  | 'INVALID_JSON'
  | 'MISSING_RESOURCE_TYPE'
  // ... existing codes

// Future: i18n mapping
const ERROR_MESSAGES_ZH: Record<ParseErrorCode, string> = {
  'INVALID_JSON': 'JSON 格式无效',
  'MISSING_RESOURCE_TYPE': '缺少 resourceType 字段',
  // ...
};
```

#### B. Search Layer (Phase 3/4) 🔄
- **Pinyin indexing**: SearchParameter implementation supports pinyin search
- **Chinese tokenization**: Full-text search uses Chinese word segmentation
- **Multi-strategy search**: Support both exact match and fuzzy pinyin match

**Technical approach:**
- PostgreSQL: `pg_trgm` + `zhparser`/`jieba` extension + custom pinyin functions
- Or: Integrate OpenSearch/Elasticsearch with Chinese analyzer
- SearchParameter modifier: `:pinyin` for explicit pinyin search

**Example:**
```
GET /Patient?name=张三          # Exact Chinese match
GET /Patient?name:pinyin=zs     # Pinyin initials
GET /Patient?name:pinyin=zhangsan # Full pinyin
```

#### C. Profile Layer (Phase 4) 🔄
- **Chinese metadata**: ElementDefinition `short`/`definition` support Chinese
- **Translation mechanism**: Use FHIR `translation` extension or custom strategy
- **Chinese-specific extensions**: Support for Chinese identifiers, demographics

**Example:**
```json
{
  "path": "Patient.identifier",
  "short": "患者标识符",
  "definition": "患者的唯一标识符，如身份证号、医保号等",
  "_short": {
    "extension": [{
      "url": "http://hl7.org/fhir/StructureDefinition/translation",
      "extension": [
        { "url": "lang", "valueCode": "zh-CN" },
        { "url": "content", "valueString": "患者标识符" }
      ]
    }]
  }
}
```

#### D. Validator Layer (Phase 5) 🔄
- **Chinese error messages**: ValidationIssue provides Chinese-localized messages
- **Path localization**: Error paths can be displayed in Chinese (e.g., "患者.姓名.名")
- **Context-aware help**: Error messages link to Chinese documentation

**Implementation:**
```typescript
// validator-error.ts
export interface ValidationIssue {
  severity: 'error' | 'warning';
  code: string;
  message: string;
  path: string;
  // i18n support
  messageTemplate?: string;  // Template key for i18n
  messageParams?: Record<string, unknown>;
}

// Usage
const issue = createValidationIssue({
  code: 'CARDINALITY_VIOLATION',
  messageTemplate: 'validation.cardinality.min',
  messageParams: { path: 'Patient.name', min: 1, actual: 0 },
  path: 'Patient.name'
});

// Chinese message: "患者.姓名 字段至少需要 1 个值，实际为 0"
```

#### E. API Layer (Phase 6+) 🔄
- **Chinese parameter support**: Accept Chinese search values
- **Response localization**: Support `Accept-Language: zh-CN` header
- **Terminology service**: Provide Chinese display lookup API

**Example:**
```
GET /terminology/$lookup?system=http://loinc.org&code=718-7&language=zh
Response:
{
  "parameter": [{
    "name": "display",
    "valueString": "血红蛋白"
  }]
}
```

---

### Layer 2: Medical Data Chinese Support (Independent Project)

Chinese medical terminology and profiles are maintained in a **separate project** (`fhir-cn-resources`) that integrates with fhir-core.

#### A. Chinese Terminology Data

**Scope:**
- CodeSystem/ValueSet resources with Chinese displays
- Official sources: ICD-10-CN, National Drug Codes, 卫健委标准
- Community sources: Common diagnoses, procedures, medications

**Data structure:**
```json
{
  "resourceType": "CodeSystem",
  "url": "http://medxai.org/fhir/CodeSystem/cn-ethnicity",
  "name": "CNEthnicity",
  "title": "中国民族",
  "status": "active",
  "content": "complete",
  "concept": [
    {
      "code": "01",
      "display": "汉族",
      "designation": [
        {
          "language": "zh-CN",
          "value": "汉族"
        },
        {
          "language": "en",
          "value": "Han"
        }
      ],
      "property": [
        {
          "code": "pinyin",
          "valueString": "hanzu"
        },
        {
          "code": "pinyin-initial",
          "valueString": "hz"
        }
      ]
    }
  ]
}
```

**MVP (Phase 1):** 20-30 high-frequency CodeSystems
- Gender (GB/T 2261.1)
- Ethnicity (GB/T 3304)
- ID types (GA 325)
- Marital status, education, occupation
- Top 100 ICD-10-CN diagnoses

#### B. Chinese Profile Library

**Baseline Profiles:**
- `CN-Patient`: Chinese patient (身份证, 医保号, 户籍, 民族)
- `CN-Practitioner`: Chinese practitioner (医师资格证, 执业证书)
- `CN-Organization`: Chinese healthcare organization (统一社会信用代码)
- `CN-MedicationRequest`: Chinese prescription (医保目录, 限定支付)
- `CN-DiagnosticReport`: Chinese lab report (LIS compliance)

**Example:**
```json
{
  "resourceType": "StructureDefinition",
  "url": "http://medxai.org/fhir/StructureDefinition/CN-Patient",
  "name": "CNPatient",
  "title": "中国患者",
  "status": "active",
  "kind": "resource",
  "abstract": false,
  "type": "Patient",
  "baseDefinition": "http://hl7.org/fhir/StructureDefinition/Patient",
  "derivation": "constraint",
  "differential": {
    "element": [
      {
        "id": "Patient.identifier:nationalId",
        "path": "Patient.identifier",
        "sliceName": "nationalId",
        "short": "身份证号",
        "definition": "中华人民共和国居民身份证号码",
        "min": 0,
        "max": "1",
        "type": [{"code": "Identifier"}],
        "patternIdentifier": {
          "system": "http://medxai.org/fhir/NamingSystem/cn-national-id"
        }
      }
    ]
  }
}
```

#### C. Project Structure

**Repository:** `fhir-cn-resources` (separate Git repo)

```
fhir-cn-resources/
├── terminology/
│   ├── codesystems/
│   │   ├── cn-gender.json
│   │   ├── cn-ethnicity.json
│   │   ├── cn-id-type.json
│   │   └── ...
│   └── valuesets/
│       ├── administrative-gender-cn.json
│       └── ...
├── profiles/
│   ├── CN-Patient.json
│   ├── CN-Practitioner.json
│   └── ...
├── examples/
│   ├── patient-example-cn.json
│   └── ...
├── tests/
│   └── ...
└── package.json
```

**Integration with MedXAI:**
- Development: Git submodule or `npm link`
- Production: npm dependency `@medxai/fhir-cn-resources`
- Runtime: Loaded via fhir-context module

---

## Consequences

### Positive

1. **Future-proof architecture**: Chinese support is built-in, not retrofitted
2. **Better user experience**: Native Chinese search, display, and error messages
3. **Compliance**: Easier to meet Chinese healthcare data standards
4. **Maintainability**: Clear separation between core architecture and medical data
5. **Community**: Independent terminology project can accept contributions

### Negative

1. **Increased complexity**: Must consider Chinese requirements in every phase
2. **Additional project**: `fhir-cn-resources` requires separate maintenance
3. **Performance**: Pinyin indexing and Chinese tokenization add overhead
4. **Testing**: Must test with Chinese data in all layers

### Risks & Mitigation

| Risk | Mitigation |
|------|------------|
| Pinyin indexing performance | Use PostgreSQL extensions; benchmark early; consider ES/OpenSearch |
| Terminology data licensing | Start with public domain data (GB/T standards); seek official partnerships |
| Profile maintenance burden | Start with 5 baseline profiles; expand based on demand |
| i18n framework overhead | Use lightweight library; lazy-load translations |

---

## Implementation Roadmap

### Phase 2: fhir-parser ✅ (Current)
- [x] UTF-8 handling in all parsers
- [x] Test fixtures with Chinese strings
- [x] Error code structure for future i18n

**Action:** Add Chinese string test fixture to `unified-test-suite.test.ts`

### Phase 3: fhir-context 🔄 (Next)
- [ ] Design SearchParameter with pinyin support
- [ ] Evaluate PostgreSQL vs OpenSearch for Chinese search
- [ ] Prototype pinyin indexing strategy
- [ ] Design terminology service API (`$lookup` with `language` param)

**Deliverable:** SearchParameter design document with Chinese search examples

### Phase 4: fhir-profile 🔄
- [ ] Profile tooling supports Chinese metadata
- [ ] Start `fhir-cn-resources` project
- [ ] Implement 5 baseline Chinese profiles
- [ ] Create 20-30 MVP CodeSystems

**Deliverable:** `fhir-cn-resources` v0.1.0 with baseline profiles

### Phase 5: fhir-validator 🔄
- [ ] Implement i18n framework for error messages
- [ ] Chinese error message templates
- [ ] Path localization based on Profile metadata

**Deliverable:** Validator with Chinese error messages

### Phase 6+: Server & UI 🔄
- [ ] API supports `Accept-Language: zh-CN`
- [ ] UI fully localized to Chinese
- [ ] Terminology display auto-completion

**Deliverable:** End-to-end Chinese user experience

---

## Alternatives Considered

### Alternative 1: Post-hoc i18n Layer
**Approach:** Build English-first, add Chinese translation later

**Rejected because:**
- Search/indexing architecture cannot be retrofitted
- Profile metadata translation is complex and error-prone
- Poor user experience during development phase

### Alternative 2: Dual-track Implementation
**Approach:** Maintain separate English and Chinese codebases

**Rejected because:**
- Massive maintenance burden
- Code duplication and divergence
- Violates DRY principle

### Alternative 3: English-only with Manual Translation
**Approach:** Store all data in English, translate on display

**Rejected because:**
- Chinese medical data sources are natively Chinese
- Translation quality and consistency issues
- Performance overhead of runtime translation

---

## References

- **FHIR R4 Specification**: https://hl7.org/fhir/R4/
- **FHIR Translation Extension**: https://hl7.org/fhir/R4/extension-translation.html
- **PostgreSQL Chinese Full-Text Search**: https://www.postgresql.org/docs/current/textsearch.html
- **zhparser**: https://github.com/amutu/zhparser (PostgreSQL Chinese parser)
- **Elasticsearch Chinese Analyzer**: https://www.elastic.co/guide/en/elasticsearch/plugins/current/analysis-smartcn.html
- **国家卫健委标准**: http://www.nhc.gov.cn/
- **ICD-10-CN**: 国家卫健委发布的中国版 ICD-10
- **GB/T Standards**: 中国国家标准（性别、民族、证件类型等）

---

## Related Documents

- [CHINESE-NATIVE-SUPPORT.md](../CHINESE-NATIVE-SUPPORT.md) - Core development principle
- [Phase 2 Detailed Plan](../stages/Phase-2-Detailed-Plan.md)
- [Phase 3 Detailed Plan](../stages/Phase-3-Detailed-Plan.md) (To be created)
- [ADR-001: HAPI-Inspired Architecture](./ADR-001-HAPI-Inspired-Architecture.md)
- [ADR-002: Single Package fhir-core](./ADR-002-Single-Package-fhir-core.md)
- [ADR-003: Choice Type Strategy](./ADR-003-FHIR-R4-Choice-Type-Strategy.md)

---

## Approval

This ADR establishes the **architectural foundation** for native Chinese language support. All future phases must adhere to the principles and strategies defined herein.

**Approved by:** Core Architecture Team  
**Date:** 2026-02-10

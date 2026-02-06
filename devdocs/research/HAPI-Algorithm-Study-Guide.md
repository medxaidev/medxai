# HAPI FHIR Algorithm Study Guide

## Status

**Status:** Active  
**Version:** v1.0  
**Purpose:** Guide for understanding HAPI's core algorithms before implementation  
**Estimated Study Time:** 40-60 hours (1-2 weeks)  
**Last Updated:** 2026-02-04

---

## Overview

This guide provides a **structured approach** to studying HAPI FHIR's core algorithms. Completing this study is **MANDATORY** before implementing Stage-1.

**Why Study HAPI First?**

1. **Proven Correctness**: HAPI has 10+ years of production validation
2. **Complex Algorithms**: Snapshot generation has 100+ edge cases
3. **Avoid Reinvention**: Don't waste time on already-solved problems
4. **Semantic Compatibility**: Ensure our implementation is FHIR-compliant

---

## Study Approach

### Recommended Method

1. **Read Code** (not just documentation)
2. **Draw Flowcharts** (visualize logic)
3. **Write Pseudocode** (language-agnostic)
4. **Identify Edge Cases** (what could go wrong?)
5. **Create Test Cases** (validate understanding)

### Tools Needed

- Java IDE (IntelliJ IDEA or Eclipse) for browsing HAPI source
- Diagram tool (draw.io, Mermaid, or pen & paper)
- Markdown editor (for notes)

---

## Core Components to Study

### Priority 1: MUST Study (Critical Path) ⭐

#### 1. ProfileUtilities.java

**Location:** `org.hl7.fhir.r4.conformance.ProfileUtilities`

**GitHub:** https://github.com/hapifhir/org.hl7.fhir.core/blob/master/org.hl7.fhir.r4/src/main/java/org/hl7/fhir/r4/conformance/ProfileUtilities.java

**Why Critical:** This is the **heart of FHIR semantic understanding**. Contains snapshot generation algorithm.

**Key Methods to Study:**

##### 1.1 `generateSnapshot()`

**Signature:**
```java
public void generateSnapshot(
    StructureDefinition base,
    StructureDefinition derived,
    String url,
    String webUrl,
    String profileName
) throws DefinitionException, FHIRException
```

**What It Does:**
- Takes a StructureDefinition with only `differential`
- Produces a complete `snapshot` by merging with base profile
- Handles inheritance, slicing, choice types

**Study Checklist:**
- [ ] Understand overall flow (6 main steps)
- [ ] Identify recursive calls (for base profiles)
- [ ] Note error handling (what throws exceptions?)
- [ ] Document assumptions (what must be true?)

**Deliverable:** Flowchart of `generateSnapshot()` logic

---

##### 1.2 `processPaths()`

**What It Does:**
- Iterates through differential elements
- Matches each to base snapshot elements
- Applies constraints

**Key Logic:**
```java
for (ElementDefinition e : derived.getDifferential().getElement()) {
    // Find matching base element
    // Merge constraints
    // Handle slicing
    // Insert into snapshot
}
```

**Study Checklist:**
- [ ] How are paths matched? (exact, prefix, sliced?)
- [ ] What happens if no match found? (new element or error?)
- [ ] How is insertion position determined?

**Deliverable:** Path matching algorithm pseudocode

---

##### 1.3 `updateFromBase()`

**What It Does:**
- Merges constraints from base element into derived element
- Implements constraint tightening rules

**Key Constraints:**
- **Cardinality**: `derived.min >= base.min`, `derived.max <= base.max`
- **Types**: Intersection of allowed types
- **Binding**: Stricter binding wins

**Study Checklist:**
- [ ] Document cardinality merge formula
- [ ] Document type intersection logic
- [ ] Document binding comparison rules
- [ ] Identify validation checks (when does it throw error?)

**Deliverable:** Constraint merging rules table

---

##### 1.4 `updateFromDefinition()`

**What It Does:**
- Applies differential constraints to snapshot element
- Similar to `updateFromBase()` but from differential side

**Study Checklist:**
- [ ] How does it differ from `updateFromBase()`?
- [ ] Which properties are overwritten vs merged?

---

##### 1.5 `processSlicing()`

**What It Does:**
- Handles slicing definitions
- Inserts slice elements into snapshot

**Key Concepts:**
- **Discriminator**: Rule to distinguish slices
- **Slicing rules**: closed, open, openAtEnd
- **Slice ordering**: How slices are positioned

**Study Checklist:**
- [ ] How are discriminators evaluated?
- [ ] How are slices inserted (before/after base element)?
- [ ] How is slice ordering enforced?

**Deliverable:** Slicing algorithm flowchart

---

##### 1.6 `sortElements()`

**What It Does:**
- Sorts snapshot elements by path (lexicographic order)

**Study Checklist:**
- [ ] What is the exact sorting rule?
- [ ] How are sliced paths sorted? (`:sliceName` suffix)
- [ ] How are choice types sorted? (`[x]` vs concrete types)

---

#### 2. StructureDefinition.java (Model)

**Location:** `org.hl7.fhir.r4.model.StructureDefinition`

**What to Study:**
- Data structure (fields and their meanings)
- Relationship between `snapshot` and `differential`
- `baseDefinition` and inheritance

**Study Checklist:**
- [ ] List all key fields
- [ ] Understand `kind` values (primitive-type, complex-type, resource, logical)
- [ ] Understand `derivation` values (specialization, constraint)

**Deliverable:** StructureDefinition data model diagram

---

#### 3. ElementDefinition.java (Model)

**Location:** `org.hl7.fhir.r4.model.ElementDefinition`

**What to Study:**
- All properties (path, min, max, type, binding, constraint, slicing)
- Nested types (ElementDefinitionType, ElementDefinitionBinding, etc.)

**Study Checklist:**
- [ ] Document all fields with examples
- [ ] Understand `path` format rules
- [ ] Understand `type` structure (code, profile, targetProfile)
- [ ] Understand `binding` structure (strength, valueSet)
- [ ] Understand `constraint` structure (key, severity, human, expression)
- [ ] Understand `slicing` structure (discriminator, rules, ordered)

**Deliverable:** ElementDefinition data model diagram

---

### Priority 2: SHOULD Study (Important Context)

#### 4. FhirContext.java

**Location:** `ca.uhn.fhir.context.FhirContext`

**What It Does:**
- Central registry for FHIR definitions
- Caches StructureDefinitions
- Provides validation support

**Study Checklist:**
- [ ] How are definitions loaded?
- [ ] How is caching implemented?
- [ ] How are circular dependencies handled?

**Deliverable:** FhirContext architecture notes

---

#### 5. IValidationSupport.java

**Location:** `org.hl7.fhir.common.hapi.validation.support.IValidationSupport`

**What It Does:**
- Interface for loading FHIR definitions
- Supports multiple sources (file, HTTP, memory)

**Study Checklist:**
- [ ] What methods must be implemented?
- [ ] How does it integrate with FhirContext?

**Deliverable:** Validation support interface notes

---

#### 6. BaseValidator.java

**Location:** `org.hl7.fhir.r4.validation.BaseValidator`

**What It Does:**
- Base class for FHIR validators
- Provides common validation utilities

**Study Checklist:**
- [ ] What validation utilities are provided?
- [ ] How are validation errors reported?

**Deliverable:** Validation patterns notes

---

### Priority 3: MAY Study (Advanced Topics)

#### 7. FHIRPathEngine.java

**Location:** `org.hl7.fhir.r4.utils.FHIRPathEngine`

**What It Does:**
- Evaluates FHIRPath expressions
- Used for constraint validation

**Note:** Stage-1 does NOT evaluate FHIRPath, but understanding the syntax is useful.

**Study Checklist:**
- [ ] Understand FHIRPath syntax basics
- [ ] Understand common operators (exists, where, all, etc.)

---

#### 8. InstanceValidator.java

**Location:** `org.hl7.fhir.r4.validation.InstanceValidator`

**What It Does:**
- Validates resource instances against profiles
- Full validation including FHIRPath constraints

**Note:** Stage-1 only does structural validation, but this shows the full picture.

---

## Study Schedule (Recommended)

### Week 1: Core Algorithm Deep Dive

| Day | Focus | Hours | Deliverable |
|-----|-------|-------|-------------|
| 1-2 | ProfileUtilities overview | 8-10 | Flowchart of generateSnapshot() |
| 3 | Path matching logic | 4-5 | Path matching pseudocode |
| 4-5 | Constraint merging | 8-10 | Constraint merging rules table |
| 6-7 | Slicing algorithm | 8-10 | Slicing flowchart |

**Week 1 Goal:** Understand snapshot generation end-to-end

---

### Week 2: Models and Context

| Day | Focus | Hours | Deliverable |
|-----|-------|-------|-------------|
| 1 | StructureDefinition model | 4-5 | Data model diagram |
| 2 | ElementDefinition model | 4-5 | Data model diagram |
| 3 | FhirContext architecture | 4-5 | Architecture notes |
| 4 | Create reference test suite | 6-8 | 20+ test cases |
| 5 | Review and consolidate | 4-5 | Study summary document |

**Week 2 Goal:** Understand data models and create test suite

---

## Study Deliverables Checklist

By the end of the study phase, you should have:

- [ ] **Flowchart**: `generateSnapshot()` algorithm (visual)
- [ ] **Pseudocode**: Path matching logic (language-agnostic)
- [ ] **Rules Table**: Constraint merging rules (cardinality, type, binding)
- [ ] **Flowchart**: Slicing algorithm (visual)
- [ ] **Diagram**: StructureDefinition data model
- [ ] **Diagram**: ElementDefinition data model
- [ ] **Notes**: FhirContext architecture
- [ ] **Test Suite**: 20+ reference test cases (JSON fixtures)
- [ ] **Summary**: Study summary document (key insights)

---

## How to Extract Test Cases from HAPI

### Method 1: Use HAPI's Test Suite

**Location:** `org.hl7.fhir.r4/src/test/java/org/hl7/fhir/r4/test/`

**Steps:**
1. Find test files for ProfileUtilities
2. Extract test StructureDefinitions (input)
3. Extract expected snapshots (output)
4. Convert to JSON format for our test suite

---

### Method 2: Run HAPI Programmatically

**Sample Code:**
```java
FhirContext ctx = FhirContext.forR4();
IValidationSupport validationSupport = ctx.getValidationSupport();

// Load base Patient
StructureDefinition basePatient = validationSupport.fetchStructureDefinition(
    "http://hl7.org/fhir/StructureDefinition/Patient"
);

// Create custom profile (differential only)
StructureDefinition customProfile = new StructureDefinition();
customProfile.setUrl("http://example.org/CustomPatient");
customProfile.setBaseDefinition("http://hl7.org/fhir/StructureDefinition/Patient");
// ... add differential elements ...

// Generate snapshot
ProfileUtilities profileUtilities = new ProfileUtilities(ctx, null, null);
profileUtilities.generateSnapshot(basePatient, customProfile, "...", "...", "CustomPatient");

// Output snapshot as JSON
IParser parser = ctx.newJsonParser().setPrettyPrint(true);
String snapshotJson = parser.encodeResourceToString(customProfile);
System.out.println(snapshotJson);
```

**Use This To:**
- Generate reference snapshots for test cases
- Validate our implementation produces same output

---

## Common Edge Cases to Study

### 1. Cardinality Edge Cases

- Base: `0..1`, Derived: `1..1` ✅ (tightening)
- Base: `1..1`, Derived: `0..1` ❌ (loosening, should fail)
- Base: `0..*`, Derived: `1..5` ✅ (tightening)
- Base: `1..5`, Derived: `0..*` ❌ (loosening, should fail)

### 2. Type Edge Cases

- Base: `[string, integer]`, Derived: `[string]` ✅ (restriction)
- Base: `[string]`, Derived: `[string, integer]` ❌ (expansion, should fail)
- Base: `Reference(Any)`, Derived: `Reference(Patient)` ✅ (profile constraint)

### 3. Slicing Edge Cases

- Multiple slices on same element
- Nested slicing (slice within slice)
- Slicing with `closed` rules (no unsliced elements allowed)
- Discriminator by value vs pattern vs type

### 4. Choice Type Edge Cases

- `value[x]` with multiple types
- Constraining choice types in derived profile
- Path normalization: `value[x]` → `valueString`, `valueQuantity`

### 5. Inheritance Edge Cases

- 3+ level inheritance chain
- Circular dependencies (should be detected and rejected)
- Abstract base profiles

---

## Questions to Answer During Study

### Snapshot Generation

1. What happens if base profile doesn't have a snapshot?
2. How are elements sorted? (exact algorithm)
3. When are validation errors thrown vs warnings?
4. How are extensions handled?
5. How are modifierExtensions handled?

### Constraint Merging

1. What is the exact formula for merging `min` and `max`?
2. How are type profiles merged?
3. How are bindings compared? (strength hierarchy)
4. How are constraints accumulated? (parent + child)

### Slicing

1. How are discriminators evaluated?
2. What happens if discriminator path doesn't exist?
3. How are slices ordered in snapshot?
4. How does `ordered` flag affect slicing?

### Path Matching

1. How are sliced paths matched? (`:sliceName` suffix)
2. How are choice types matched? (`[x]` vs concrete types)
3. How are nested elements matched? (prefix matching)

---

## Study Validation Checklist

Before proceeding to implementation, validate your understanding:

- [ ] Can you explain snapshot generation algorithm to a colleague?
- [ ] Can you draw the flowchart from memory?
- [ ] Can you write pseudocode for constraint merging?
- [ ] Can you identify 10+ edge cases?
- [ ] Can you predict HAPI's output for a given profile?
- [ ] Have you created 20+ reference test cases?
- [ ] Have you documented all key insights?

**If you answered NO to any question, continue studying.**

---

## Resources

### Official HAPI Resources

- **GitHub Repository**: https://github.com/hapifhir/hapi-fhir
- **HAPI FHIR Core**: https://github.com/hapifhir/org.hl7.fhir.core
- **Documentation**: https://hapifhir.io/hapi-fhir/docs/
- **Validation Guide**: https://hapifhir.io/hapi-fhir/docs/validation/profile_validator.html

### FHIR Specification

- **FHIR R4 Spec**: https://hl7.org/fhir/R4/
- **StructureDefinition**: https://hl7.org/fhir/R4/structuredefinition.html
- **ElementDefinition**: https://hl7.org/fhir/R4/elementdefinition.html
- **Profiling Guide**: https://hl7.org/fhir/R4/profiling.html

### Community Resources

- **FHIR Chat (Zulip)**: https://chat.fhir.org/
- **FHIR Community Forum**: https://community.fhir.org/
- **Stack Overflow**: Tag `hl7-fhir`

---

## Study Notes Template

Use this template to organize your notes:

```markdown
# HAPI Study Notes: [Component Name]

## Date: YYYY-MM-DD

## Component: [e.g., ProfileUtilities.generateSnapshot()]

## Purpose
[What does this component do?]

## Key Logic
[Describe the algorithm in your own words]

## Pseudocode
```
[Language-agnostic pseudocode]
```

## Edge Cases
1. [Edge case 1]
2. [Edge case 2]
...

## Questions / Unclear Points
- [Question 1]
- [Question 2]

## Test Cases
1. [Test case 1 description]
2. [Test case 2 description]

## Implementation Notes
[How will we adapt this for TypeScript/Node.js?]
```

---

## Final Checklist Before Implementation

- [ ] All Priority 1 components studied
- [ ] All study deliverables completed
- [ ] Reference test suite created (20+ cases)
- [ ] Team review conducted (all members understand)
- [ ] Study summary document written
- [ ] Questions answered or documented as unknowns
- [ ] Ready to implement with confidence

**Do NOT proceed to implementation until this checklist is 100% complete.**

---

**Remember: Time spent studying HAPI is an investment, not a cost. It will save weeks of debugging later.**

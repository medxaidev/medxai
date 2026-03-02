import { Age } from './Age';
import { AllergyIntolerance } from './AllergyIntolerance';
import { Annotation } from './Annotation';
import { CodeableConcept } from './CodeableConcept';
import { Condition } from './Condition';
import { DiagnosticReport } from './DiagnosticReport';
import { DocumentReference } from './DocumentReference';
import { Extension } from './Extension';
import { Identifier } from './Identifier';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { Observation } from './Observation';
import { Patient } from './Patient';
import { Period } from './Period';
import { QuestionnaireResponse } from './QuestionnaireResponse';
import { Range } from './Range';
import { Reference } from './Reference';
import { Resource } from './Resource';

/**
 * FHIR R4 FamilyMemberHistory
 * @see https://hl7.org/fhir/R4/familymemberhistory.html
 */
export interface FamilyMemberHistory {

  /**
   * This is a FamilyMemberHistory resource
   */
  readonly resourceType: 'FamilyMemberHistory';

  /**
   * FamilyMemberHistory.id
   */
  id?: string;

  /**
   * FamilyMemberHistory.meta
   */
  meta?: Meta;

  /**
   * FamilyMemberHistory.implicitRules
   */
  implicitRules?: string;

  /**
   * FamilyMemberHistory.language
   */
  language?: string;

  /**
   * FamilyMemberHistory.text
   */
  text?: Narrative;

  /**
   * FamilyMemberHistory.contained
   */
  contained?: Resource[];

  /**
   * FamilyMemberHistory.extension
   */
  extension?: Extension[];

  /**
   * FamilyMemberHistory.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * FamilyMemberHistory.identifier
   */
  identifier?: Identifier[];

  /**
   * FamilyMemberHistory.instantiatesCanonical
   */
  instantiatesCanonical?: string[];

  /**
   * FamilyMemberHistory.instantiatesUri
   */
  instantiatesUri?: string[];

  /**
   * FamilyMemberHistory.status
   */
  status: string;

  /**
   * FamilyMemberHistory.dataAbsentReason
   */
  dataAbsentReason?: CodeableConcept;

  /**
   * FamilyMemberHistory.patient
   */
  patient: Reference<Patient>;

  /**
   * FamilyMemberHistory.date
   */
  date?: string;

  /**
   * FamilyMemberHistory.name
   */
  name?: string;

  /**
   * FamilyMemberHistory.relationship
   */
  relationship: CodeableConcept;

  /**
   * FamilyMemberHistory.sex
   */
  sex?: CodeableConcept;

  /**
   * FamilyMemberHistory.born[x]
   */
  bornPeriod?: Period;

  /**
   * FamilyMemberHistory.born[x]
   */
  bornDate?: string;

  /**
   * FamilyMemberHistory.born[x]
   */
  bornString?: string;

  /**
   * FamilyMemberHistory.age[x]
   */
  ageAge?: Age;

  /**
   * FamilyMemberHistory.age[x]
   */
  ageRange?: Range;

  /**
   * FamilyMemberHistory.age[x]
   */
  ageString?: string;

  /**
   * FamilyMemberHistory.estimatedAge
   */
  estimatedAge?: boolean;

  /**
   * FamilyMemberHistory.deceased[x]
   */
  deceasedBoolean?: boolean;

  /**
   * FamilyMemberHistory.deceased[x]
   */
  deceasedAge?: Age;

  /**
   * FamilyMemberHistory.deceased[x]
   */
  deceasedRange?: Range;

  /**
   * FamilyMemberHistory.deceased[x]
   */
  deceasedDate?: string;

  /**
   * FamilyMemberHistory.deceased[x]
   */
  deceasedString?: string;

  /**
   * FamilyMemberHistory.reasonCode
   */
  reasonCode?: CodeableConcept[];

  /**
   * FamilyMemberHistory.reasonReference
   */
  reasonReference?: Reference<Condition | Observation | AllergyIntolerance | QuestionnaireResponse | DiagnosticReport | DocumentReference>[];

  /**
   * FamilyMemberHistory.note
   */
  note?: Annotation[];

  /**
   * FamilyMemberHistory.condition
   */
  condition?: FamilyMemberHistoryCondition[];
}

/**
 * FamilyMemberHistory.born[x]
 */
export type FamilyMemberHistoryBorn = Period | string;
/**
 * FamilyMemberHistory.age[x]
 */
export type FamilyMemberHistoryAge = Age | Range | string;
/**
 * FamilyMemberHistory.deceased[x]
 */
export type FamilyMemberHistoryDeceased = boolean | Age | Range | string;

/**
 * FHIR R4 FamilyMemberHistoryCondition
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface FamilyMemberHistoryCondition {

  /**
   * FamilyMemberHistory.condition.id
   */
  id?: string;

  /**
   * FamilyMemberHistory.condition.extension
   */
  extension?: Extension[];

  /**
   * FamilyMemberHistory.condition.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * FamilyMemberHistory.condition.code
   */
  code: CodeableConcept;

  /**
   * FamilyMemberHistory.condition.outcome
   */
  outcome?: CodeableConcept;

  /**
   * FamilyMemberHistory.condition.contributedToDeath
   */
  contributedToDeath?: boolean;

  /**
   * FamilyMemberHistory.condition.onset[x]
   */
  onsetAge?: Age;

  /**
   * FamilyMemberHistory.condition.onset[x]
   */
  onsetRange?: Range;

  /**
   * FamilyMemberHistory.condition.onset[x]
   */
  onsetPeriod?: Period;

  /**
   * FamilyMemberHistory.condition.onset[x]
   */
  onsetString?: string;

  /**
   * FamilyMemberHistory.condition.note
   */
  note?: Annotation[];
}

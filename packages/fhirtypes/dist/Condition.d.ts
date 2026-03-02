import { Age } from './Age';
import { Annotation } from './Annotation';
import { ClinicalImpression } from './ClinicalImpression';
import { CodeableConcept } from './CodeableConcept';
import { DiagnosticReport } from './DiagnosticReport';
import { Encounter } from './Encounter';
import { Extension } from './Extension';
import { Group } from './Group';
import { Identifier } from './Identifier';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { Observation } from './Observation';
import { Patient } from './Patient';
import { Period } from './Period';
import { Practitioner } from './Practitioner';
import { PractitionerRole } from './PractitionerRole';
import { Range } from './Range';
import { Reference } from './Reference';
import { RelatedPerson } from './RelatedPerson';
import { Resource } from './Resource';

/**
 * FHIR R4 Condition
 * @see https://hl7.org/fhir/R4/condition.html
 */
export interface Condition {

  /**
   * This is a Condition resource
   */
  readonly resourceType: 'Condition';

  /**
   * Condition.id
   */
  id?: string;

  /**
   * Condition.meta
   */
  meta?: Meta;

  /**
   * Condition.implicitRules
   */
  implicitRules?: string;

  /**
   * Condition.language
   */
  language?: string;

  /**
   * Condition.text
   */
  text?: Narrative;

  /**
   * Condition.contained
   */
  contained?: Resource[];

  /**
   * Condition.extension
   */
  extension?: Extension[];

  /**
   * Condition.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Condition.identifier
   */
  identifier?: Identifier[];

  /**
   * Condition.clinicalStatus
   */
  clinicalStatus?: CodeableConcept;

  /**
   * Condition.verificationStatus
   */
  verificationStatus?: CodeableConcept;

  /**
   * Condition.category
   */
  category?: CodeableConcept[];

  /**
   * Condition.severity
   */
  severity?: CodeableConcept;

  /**
   * Condition.code
   */
  code?: CodeableConcept;

  /**
   * Condition.bodySite
   */
  bodySite?: CodeableConcept[];

  /**
   * Condition.subject
   */
  subject: Reference<Patient | Group>;

  /**
   * Condition.encounter
   */
  encounter?: Reference<Encounter>;

  /**
   * Condition.onset[x]
   */
  onsetDateTime?: string;

  /**
   * Condition.onset[x]
   */
  onsetAge?: Age;

  /**
   * Condition.onset[x]
   */
  onsetPeriod?: Period;

  /**
   * Condition.onset[x]
   */
  onsetRange?: Range;

  /**
   * Condition.onset[x]
   */
  onsetString?: string;

  /**
   * Condition.abatement[x]
   */
  abatementDateTime?: string;

  /**
   * Condition.abatement[x]
   */
  abatementAge?: Age;

  /**
   * Condition.abatement[x]
   */
  abatementPeriod?: Period;

  /**
   * Condition.abatement[x]
   */
  abatementRange?: Range;

  /**
   * Condition.abatement[x]
   */
  abatementString?: string;

  /**
   * Condition.recordedDate
   */
  recordedDate?: string;

  /**
   * Condition.recorder
   */
  recorder?: Reference<Practitioner | PractitionerRole | Patient | RelatedPerson>;

  /**
   * Condition.asserter
   */
  asserter?: Reference<Practitioner | PractitionerRole | Patient | RelatedPerson>;

  /**
   * Condition.stage
   */
  stage?: ConditionStage[];

  /**
   * Condition.evidence
   */
  evidence?: ConditionEvidence[];

  /**
   * Condition.note
   */
  note?: Annotation[];
}

/**
 * Condition.onset[x]
 */
export type ConditionOnset = string | Age | Period | Range;
/**
 * Condition.abatement[x]
 */
export type ConditionAbatement = string | Age | Period | Range;

/**
 * FHIR R4 ConditionEvidence
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ConditionEvidence {

  /**
   * Condition.evidence.id
   */
  id?: string;

  /**
   * Condition.evidence.extension
   */
  extension?: Extension[];

  /**
   * Condition.evidence.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Condition.evidence.code
   */
  code?: CodeableConcept[];

  /**
   * Condition.evidence.detail
   */
  detail?: Reference[];
}

/**
 * FHIR R4 ConditionStage
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ConditionStage {

  /**
   * Condition.stage.id
   */
  id?: string;

  /**
   * Condition.stage.extension
   */
  extension?: Extension[];

  /**
   * Condition.stage.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Condition.stage.summary
   */
  summary?: CodeableConcept;

  /**
   * Condition.stage.assessment
   */
  assessment?: Reference<ClinicalImpression | DiagnosticReport | Observation>[];

  /**
   * Condition.stage.type
   */
  type?: CodeableConcept;
}

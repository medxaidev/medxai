import { CodeableConcept } from './CodeableConcept';
import { Device } from './Device';
import { Extension } from './Extension';
import { Identifier } from './Identifier';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { Patient } from './Patient';
import { Period } from './Period';
import { Practitioner } from './Practitioner';
import { PractitionerRole } from './PractitionerRole';
import { Reference } from './Reference';
import { Resource } from './Resource';

/**
 * FHIR R4 DetectedIssue
 * @see https://hl7.org/fhir/R4/detectedissue.html
 */
export interface DetectedIssue {

  /**
   * This is a DetectedIssue resource
   */
  readonly resourceType: 'DetectedIssue';

  /**
   * DetectedIssue.id
   */
  id?: string;

  /**
   * DetectedIssue.meta
   */
  meta?: Meta;

  /**
   * DetectedIssue.implicitRules
   */
  implicitRules?: string;

  /**
   * DetectedIssue.language
   */
  language?: string;

  /**
   * DetectedIssue.text
   */
  text?: Narrative;

  /**
   * DetectedIssue.contained
   */
  contained?: Resource[];

  /**
   * DetectedIssue.extension
   */
  extension?: Extension[];

  /**
   * DetectedIssue.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * DetectedIssue.identifier
   */
  identifier?: Identifier[];

  /**
   * DetectedIssue.status
   */
  status: 'registered' | 'preliminary' | 'final' | 'amended' | 'corrected' | 'cancelled' | 'entered-in-error' | 'unknown';

  /**
   * DetectedIssue.code
   */
  code?: CodeableConcept;

  /**
   * DetectedIssue.severity
   */
  severity?: string;

  /**
   * DetectedIssue.patient
   */
  patient?: Reference<Patient>;

  /**
   * DetectedIssue.identified[x]
   */
  identifiedDateTime?: string;

  /**
   * DetectedIssue.identified[x]
   */
  identifiedPeriod?: Period;

  /**
   * DetectedIssue.author
   */
  author?: Reference<Practitioner | PractitionerRole | Device>;

  /**
   * DetectedIssue.implicated
   */
  implicated?: Reference[];

  /**
   * DetectedIssue.evidence
   */
  evidence?: DetectedIssueEvidence[];

  /**
   * DetectedIssue.detail
   */
  detail?: string;

  /**
   * DetectedIssue.reference
   */
  reference?: string;

  /**
   * DetectedIssue.mitigation
   */
  mitigation?: DetectedIssueMitigation[];
}

/**
 * DetectedIssue.identified[x]
 */
export type DetectedIssueIdentified = string | Period;

/**
 * FHIR R4 DetectedIssueEvidence
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface DetectedIssueEvidence {

  /**
   * DetectedIssue.evidence.id
   */
  id?: string;

  /**
   * DetectedIssue.evidence.extension
   */
  extension?: Extension[];

  /**
   * DetectedIssue.evidence.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * DetectedIssue.evidence.code
   */
  code?: CodeableConcept[];

  /**
   * DetectedIssue.evidence.detail
   */
  detail?: Reference[];
}

/**
 * FHIR R4 DetectedIssueMitigation
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface DetectedIssueMitigation {

  /**
   * DetectedIssue.mitigation.id
   */
  id?: string;

  /**
   * DetectedIssue.mitigation.extension
   */
  extension?: Extension[];

  /**
   * DetectedIssue.mitigation.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * DetectedIssue.mitigation.action
   */
  action: CodeableConcept;

  /**
   * DetectedIssue.mitigation.date
   */
  date?: string;

  /**
   * DetectedIssue.mitigation.author
   */
  author?: Reference<Practitioner | PractitionerRole>;
}

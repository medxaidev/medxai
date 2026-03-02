import { Annotation } from './Annotation';
import { CodeableConcept } from './CodeableConcept';
import { Condition } from './Condition';
import { Device } from './Device';
import { DiagnosticReport } from './DiagnosticReport';
import { DocumentReference } from './DocumentReference';
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
import { Resource } from './Resource';

/**
 * FHIR R4 RiskAssessment
 * @see https://hl7.org/fhir/R4/riskassessment.html
 */
export interface RiskAssessment {

  /**
   * This is a RiskAssessment resource
   */
  readonly resourceType: 'RiskAssessment';

  /**
   * RiskAssessment.id
   */
  id?: string;

  /**
   * RiskAssessment.meta
   */
  meta?: Meta;

  /**
   * RiskAssessment.implicitRules
   */
  implicitRules?: string;

  /**
   * RiskAssessment.language
   */
  language?: string;

  /**
   * RiskAssessment.text
   */
  text?: Narrative;

  /**
   * RiskAssessment.contained
   */
  contained?: Resource[];

  /**
   * RiskAssessment.extension
   */
  extension?: Extension[];

  /**
   * RiskAssessment.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * RiskAssessment.identifier
   */
  identifier?: Identifier[];

  /**
   * RiskAssessment.basedOn
   */
  basedOn?: Reference;

  /**
   * RiskAssessment.parent
   */
  parent?: Reference;

  /**
   * RiskAssessment.status
   */
  status: 'registered' | 'preliminary' | 'final' | 'amended' | 'corrected' | 'cancelled' | 'entered-in-error' | 'unknown';

  /**
   * RiskAssessment.method
   */
  method?: CodeableConcept;

  /**
   * RiskAssessment.code
   */
  code?: CodeableConcept;

  /**
   * RiskAssessment.subject
   */
  subject: Reference<Patient | Group>;

  /**
   * RiskAssessment.encounter
   */
  encounter?: Reference<Encounter>;

  /**
   * RiskAssessment.occurrence[x]
   */
  occurrenceDateTime?: string;

  /**
   * RiskAssessment.occurrence[x]
   */
  occurrencePeriod?: Period;

  /**
   * RiskAssessment.condition
   */
  condition?: Reference<Condition>;

  /**
   * RiskAssessment.performer
   */
  performer?: Reference<Practitioner | PractitionerRole | Device>;

  /**
   * RiskAssessment.reasonCode
   */
  reasonCode?: CodeableConcept[];

  /**
   * RiskAssessment.reasonReference
   */
  reasonReference?: Reference<Condition | Observation | DiagnosticReport | DocumentReference>[];

  /**
   * RiskAssessment.basis
   */
  basis?: Reference[];

  /**
   * RiskAssessment.prediction
   */
  prediction?: RiskAssessmentPrediction[];

  /**
   * RiskAssessment.mitigation
   */
  mitigation?: string;

  /**
   * RiskAssessment.note
   */
  note?: Annotation[];
}

/**
 * RiskAssessment.occurrence[x]
 */
export type RiskAssessmentOccurrence = string | Period;

/**
 * FHIR R4 RiskAssessmentPrediction
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface RiskAssessmentPrediction {

  /**
   * RiskAssessment.prediction.id
   */
  id?: string;

  /**
   * RiskAssessment.prediction.extension
   */
  extension?: Extension[];

  /**
   * RiskAssessment.prediction.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * RiskAssessment.prediction.outcome
   */
  outcome?: CodeableConcept;

  /**
   * RiskAssessment.prediction.probability[x]
   */
  probabilityDecimal?: number;

  /**
   * RiskAssessment.prediction.probability[x]
   */
  probabilityRange?: Range;

  /**
   * RiskAssessment.prediction.qualitativeRisk
   */
  qualitativeRisk?: CodeableConcept;

  /**
   * RiskAssessment.prediction.relativeRisk
   */
  relativeRisk?: number;

  /**
   * RiskAssessment.prediction.when[x]
   */
  whenPeriod?: Period;

  /**
   * RiskAssessment.prediction.when[x]
   */
  whenRange?: Range;

  /**
   * RiskAssessment.prediction.rationale
   */
  rationale?: string;
}

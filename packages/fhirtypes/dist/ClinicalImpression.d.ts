import { AllergyIntolerance } from './AllergyIntolerance';
import { Annotation } from './Annotation';
import { CodeableConcept } from './CodeableConcept';
import { Condition } from './Condition';
import { DiagnosticReport } from './DiagnosticReport';
import { Encounter } from './Encounter';
import { Extension } from './Extension';
import { FamilyMemberHistory } from './FamilyMemberHistory';
import { Group } from './Group';
import { Identifier } from './Identifier';
import { ImagingStudy } from './ImagingStudy';
import { Media } from './Media';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { Observation } from './Observation';
import { Patient } from './Patient';
import { Period } from './Period';
import { Practitioner } from './Practitioner';
import { PractitionerRole } from './PractitionerRole';
import { QuestionnaireResponse } from './QuestionnaireResponse';
import { Reference } from './Reference';
import { Resource } from './Resource';
import { RiskAssessment } from './RiskAssessment';

/**
 * FHIR R4 ClinicalImpression
 * @see https://hl7.org/fhir/R4/clinicalimpression.html
 */
export interface ClinicalImpression {

  /**
   * This is a ClinicalImpression resource
   */
  readonly resourceType: 'ClinicalImpression';

  /**
   * ClinicalImpression.id
   */
  id?: string;

  /**
   * ClinicalImpression.meta
   */
  meta?: Meta;

  /**
   * ClinicalImpression.implicitRules
   */
  implicitRules?: string;

  /**
   * ClinicalImpression.language
   */
  language?: string;

  /**
   * ClinicalImpression.text
   */
  text?: Narrative;

  /**
   * ClinicalImpression.contained
   */
  contained?: Resource[];

  /**
   * ClinicalImpression.extension
   */
  extension?: Extension[];

  /**
   * ClinicalImpression.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * ClinicalImpression.identifier
   */
  identifier?: Identifier[];

  /**
   * ClinicalImpression.status
   */
  status: string;

  /**
   * ClinicalImpression.statusReason
   */
  statusReason?: CodeableConcept;

  /**
   * ClinicalImpression.code
   */
  code?: CodeableConcept;

  /**
   * ClinicalImpression.description
   */
  description?: string;

  /**
   * ClinicalImpression.subject
   */
  subject: Reference<Patient | Group>;

  /**
   * ClinicalImpression.encounter
   */
  encounter?: Reference<Encounter>;

  /**
   * ClinicalImpression.effective[x]
   */
  effectiveDateTime?: string;

  /**
   * ClinicalImpression.effective[x]
   */
  effectivePeriod?: Period;

  /**
   * ClinicalImpression.date
   */
  date?: string;

  /**
   * ClinicalImpression.assessor
   */
  assessor?: Reference<Practitioner | PractitionerRole>;

  /**
   * ClinicalImpression.previous
   */
  previous?: Reference<ClinicalImpression>;

  /**
   * ClinicalImpression.problem
   */
  problem?: Reference<Condition | AllergyIntolerance>[];

  /**
   * ClinicalImpression.investigation
   */
  investigation?: ClinicalImpressionInvestigation[];

  /**
   * ClinicalImpression.protocol
   */
  protocol?: string[];

  /**
   * ClinicalImpression.summary
   */
  summary?: string;

  /**
   * ClinicalImpression.finding
   */
  finding?: ClinicalImpressionFinding[];

  /**
   * ClinicalImpression.prognosisCodeableConcept
   */
  prognosisCodeableConcept?: CodeableConcept[];

  /**
   * ClinicalImpression.prognosisReference
   */
  prognosisReference?: Reference<RiskAssessment>[];

  /**
   * ClinicalImpression.supportingInfo
   */
  supportingInfo?: Reference[];

  /**
   * ClinicalImpression.note
   */
  note?: Annotation[];
}

/**
 * ClinicalImpression.effective[x]
 */
export type ClinicalImpressionEffective = string | Period;

/**
 * FHIR R4 ClinicalImpressionFinding
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ClinicalImpressionFinding {

  /**
   * ClinicalImpression.finding.id
   */
  id?: string;

  /**
   * ClinicalImpression.finding.extension
   */
  extension?: Extension[];

  /**
   * ClinicalImpression.finding.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * ClinicalImpression.finding.itemCodeableConcept
   */
  itemCodeableConcept?: CodeableConcept;

  /**
   * ClinicalImpression.finding.itemReference
   */
  itemReference?: Reference<Condition | Observation | Media>;

  /**
   * ClinicalImpression.finding.basis
   */
  basis?: string;
}

/**
 * FHIR R4 ClinicalImpressionInvestigation
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ClinicalImpressionInvestigation {

  /**
   * ClinicalImpression.investigation.id
   */
  id?: string;

  /**
   * ClinicalImpression.investigation.extension
   */
  extension?: Extension[];

  /**
   * ClinicalImpression.investigation.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * ClinicalImpression.investigation.code
   */
  code: CodeableConcept;

  /**
   * ClinicalImpression.investigation.item
   */
  item?: Reference<Observation | QuestionnaireResponse | FamilyMemberHistory | DiagnosticReport | RiskAssessment | ImagingStudy | Media>[];
}

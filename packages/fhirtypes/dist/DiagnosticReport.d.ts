import { Attachment } from './Attachment';
import { CarePlan } from './CarePlan';
import { CareTeam } from './CareTeam';
import { CodeableConcept } from './CodeableConcept';
import { Device } from './Device';
import { Encounter } from './Encounter';
import { Extension } from './Extension';
import { Group } from './Group';
import { Identifier } from './Identifier';
import { ImagingStudy } from './ImagingStudy';
import { ImmunizationRecommendation } from './ImmunizationRecommendation';
import { Location } from './Location';
import { Media } from './Media';
import { MedicationRequest } from './MedicationRequest';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { NutritionOrder } from './NutritionOrder';
import { Observation } from './Observation';
import { Organization } from './Organization';
import { Patient } from './Patient';
import { Period } from './Period';
import { Practitioner } from './Practitioner';
import { PractitionerRole } from './PractitionerRole';
import { Reference } from './Reference';
import { Resource } from './Resource';
import { ServiceRequest } from './ServiceRequest';
import { Specimen } from './Specimen';

/**
 * FHIR R4 DiagnosticReport
 * @see https://hl7.org/fhir/R4/diagnosticreport.html
 */
export interface DiagnosticReport {

  /**
   * This is a DiagnosticReport resource
   */
  readonly resourceType: 'DiagnosticReport';

  /**
   * DiagnosticReport.id
   */
  id?: string;

  /**
   * DiagnosticReport.meta
   */
  meta?: Meta;

  /**
   * DiagnosticReport.implicitRules
   */
  implicitRules?: string;

  /**
   * DiagnosticReport.language
   */
  language?: string;

  /**
   * DiagnosticReport.text
   */
  text?: Narrative;

  /**
   * DiagnosticReport.contained
   */
  contained?: Resource[];

  /**
   * DiagnosticReport.extension
   */
  extension?: Extension[];

  /**
   * DiagnosticReport.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * DiagnosticReport.identifier
   */
  identifier?: Identifier[];

  /**
   * DiagnosticReport.basedOn
   */
  basedOn?: Reference<CarePlan | ImmunizationRecommendation | MedicationRequest | NutritionOrder | ServiceRequest>[];

  /**
   * DiagnosticReport.status
   */
  status: string;

  /**
   * DiagnosticReport.category
   */
  category?: CodeableConcept[];

  /**
   * DiagnosticReport.code
   */
  code: CodeableConcept;

  /**
   * DiagnosticReport.subject
   */
  subject?: Reference<Patient | Group | Device | Location>;

  /**
   * DiagnosticReport.encounter
   */
  encounter?: Reference<Encounter>;

  /**
   * DiagnosticReport.effective[x]
   */
  effectiveDateTime?: string;

  /**
   * DiagnosticReport.effective[x]
   */
  effectivePeriod?: Period;

  /**
   * DiagnosticReport.issued
   */
  issued?: string;

  /**
   * DiagnosticReport.performer
   */
  performer?: Reference<Practitioner | PractitionerRole | Organization | CareTeam>[];

  /**
   * DiagnosticReport.resultsInterpreter
   */
  resultsInterpreter?: Reference<Practitioner | PractitionerRole | Organization | CareTeam>[];

  /**
   * DiagnosticReport.specimen
   */
  specimen?: Reference<Specimen>[];

  /**
   * DiagnosticReport.result
   */
  result?: Reference<Observation>[];

  /**
   * DiagnosticReport.imagingStudy
   */
  imagingStudy?: Reference<ImagingStudy>[];

  /**
   * DiagnosticReport.media
   */
  media?: DiagnosticReportMedia[];

  /**
   * DiagnosticReport.conclusion
   */
  conclusion?: string;

  /**
   * DiagnosticReport.conclusionCode
   */
  conclusionCode?: CodeableConcept[];

  /**
   * DiagnosticReport.presentedForm
   */
  presentedForm?: Attachment[];
}

/**
 * DiagnosticReport.effective[x]
 */
export type DiagnosticReportEffective = string | Period;

/**
 * FHIR R4 DiagnosticReportMedia
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface DiagnosticReportMedia {

  /**
   * DiagnosticReport.media.id
   */
  id?: string;

  /**
   * DiagnosticReport.media.extension
   */
  extension?: Extension[];

  /**
   * DiagnosticReport.media.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * DiagnosticReport.media.comment
   */
  comment?: string;

  /**
   * DiagnosticReport.media.link
   */
  link: Reference<Media>;
}

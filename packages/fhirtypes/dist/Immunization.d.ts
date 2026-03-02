import { Annotation } from './Annotation';
import { CodeableConcept } from './CodeableConcept';
import { Condition } from './Condition';
import { DiagnosticReport } from './DiagnosticReport';
import { Encounter } from './Encounter';
import { Extension } from './Extension';
import { Identifier } from './Identifier';
import { Location } from './Location';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { Observation } from './Observation';
import { Organization } from './Organization';
import { Patient } from './Patient';
import { Practitioner } from './Practitioner';
import { PractitionerRole } from './PractitionerRole';
import { Quantity } from './Quantity';
import { Reference } from './Reference';
import { Resource } from './Resource';

/**
 * FHIR R4 Immunization
 * @see https://hl7.org/fhir/R4/immunization.html
 */
export interface Immunization {

  /**
   * This is a Immunization resource
   */
  readonly resourceType: 'Immunization';

  /**
   * Immunization.id
   */
  id?: string;

  /**
   * Immunization.meta
   */
  meta?: Meta;

  /**
   * Immunization.implicitRules
   */
  implicitRules?: string;

  /**
   * Immunization.language
   */
  language?: string;

  /**
   * Immunization.text
   */
  text?: Narrative;

  /**
   * Immunization.contained
   */
  contained?: Resource[];

  /**
   * Immunization.extension
   */
  extension?: Extension[];

  /**
   * Immunization.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Immunization.identifier
   */
  identifier?: Identifier[];

  /**
   * Immunization.status
   */
  status: string;

  /**
   * Immunization.statusReason
   */
  statusReason?: CodeableConcept;

  /**
   * Immunization.vaccineCode
   */
  vaccineCode: CodeableConcept;

  /**
   * Immunization.patient
   */
  patient: Reference<Patient>;

  /**
   * Immunization.encounter
   */
  encounter?: Reference<Encounter>;

  /**
   * Immunization.occurrence[x]
   */
  occurrenceDateTime: string;

  /**
   * Immunization.occurrence[x]
   */
  occurrenceString: string;

  /**
   * Immunization.recorded
   */
  recorded?: string;

  /**
   * Immunization.primarySource
   */
  primarySource?: boolean;

  /**
   * Immunization.reportOrigin
   */
  reportOrigin?: CodeableConcept;

  /**
   * Immunization.location
   */
  location?: Reference<Location>;

  /**
   * Immunization.manufacturer
   */
  manufacturer?: Reference<Organization>;

  /**
   * Immunization.lotNumber
   */
  lotNumber?: string;

  /**
   * Immunization.expirationDate
   */
  expirationDate?: string;

  /**
   * Immunization.site
   */
  site?: CodeableConcept;

  /**
   * Immunization.route
   */
  route?: CodeableConcept;

  /**
   * Immunization.doseQuantity
   */
  doseQuantity?: Quantity;

  /**
   * Immunization.performer
   */
  performer?: ImmunizationPerformer[];

  /**
   * Immunization.note
   */
  note?: Annotation[];

  /**
   * Immunization.reasonCode
   */
  reasonCode?: CodeableConcept[];

  /**
   * Immunization.reasonReference
   */
  reasonReference?: Reference<Condition | Observation | DiagnosticReport>[];

  /**
   * Immunization.isSubpotent
   */
  isSubpotent?: boolean;

  /**
   * Immunization.subpotentReason
   */
  subpotentReason?: CodeableConcept[];

  /**
   * Immunization.education
   */
  education?: ImmunizationEducation[];

  /**
   * Immunization.programEligibility
   */
  programEligibility?: CodeableConcept[];

  /**
   * Immunization.fundingSource
   */
  fundingSource?: CodeableConcept;

  /**
   * Immunization.reaction
   */
  reaction?: ImmunizationReaction[];

  /**
   * Immunization.protocolApplied
   */
  protocolApplied?: ImmunizationProtocolApplied[];
}

/**
 * Immunization.occurrence[x]
 */
export type ImmunizationOccurrence = string;

/**
 * FHIR R4 ImmunizationEducation
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ImmunizationEducation {

  /**
   * Immunization.education.id
   */
  id?: string;

  /**
   * Immunization.education.extension
   */
  extension?: Extension[];

  /**
   * Immunization.education.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Immunization.education.documentType
   */
  documentType?: string;

  /**
   * Immunization.education.reference
   */
  reference?: string;

  /**
   * Immunization.education.publicationDate
   */
  publicationDate?: string;

  /**
   * Immunization.education.presentationDate
   */
  presentationDate?: string;
}

/**
 * FHIR R4 ImmunizationPerformer
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ImmunizationPerformer {

  /**
   * Immunization.performer.id
   */
  id?: string;

  /**
   * Immunization.performer.extension
   */
  extension?: Extension[];

  /**
   * Immunization.performer.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Immunization.performer.function
   */
  function?: CodeableConcept;

  /**
   * Immunization.performer.actor
   */
  actor: Reference<Practitioner | PractitionerRole | Organization>;
}

/**
 * FHIR R4 ImmunizationProtocolApplied
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ImmunizationProtocolApplied {

  /**
   * Immunization.protocolApplied.id
   */
  id?: string;

  /**
   * Immunization.protocolApplied.extension
   */
  extension?: Extension[];

  /**
   * Immunization.protocolApplied.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Immunization.protocolApplied.series
   */
  series?: string;

  /**
   * Immunization.protocolApplied.authority
   */
  authority?: Reference<Organization>;

  /**
   * Immunization.protocolApplied.targetDisease
   */
  targetDisease?: CodeableConcept[];

  /**
   * Immunization.protocolApplied.doseNumber[x]
   */
  doseNumberPositiveInt: number;

  /**
   * Immunization.protocolApplied.doseNumber[x]
   */
  doseNumberString: string;

  /**
   * Immunization.protocolApplied.seriesDoses[x]
   */
  seriesDosesPositiveInt?: number;

  /**
   * Immunization.protocolApplied.seriesDoses[x]
   */
  seriesDosesString?: string;
}

/**
 * FHIR R4 ImmunizationReaction
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ImmunizationReaction {

  /**
   * Immunization.reaction.id
   */
  id?: string;

  /**
   * Immunization.reaction.extension
   */
  extension?: Extension[];

  /**
   * Immunization.reaction.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Immunization.reaction.date
   */
  date?: string;

  /**
   * Immunization.reaction.detail
   */
  detail?: Reference<Observation>;

  /**
   * Immunization.reaction.reported
   */
  reported?: boolean;
}

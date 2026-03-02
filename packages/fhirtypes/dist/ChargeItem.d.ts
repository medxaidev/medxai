import { Account } from './Account';
import { Annotation } from './Annotation';
import { CareTeam } from './CareTeam';
import { CodeableConcept } from './CodeableConcept';
import { Device } from './Device';
import { DiagnosticReport } from './DiagnosticReport';
import { Encounter } from './Encounter';
import { EpisodeOfCare } from './EpisodeOfCare';
import { Extension } from './Extension';
import { Group } from './Group';
import { Identifier } from './Identifier';
import { ImagingStudy } from './ImagingStudy';
import { Immunization } from './Immunization';
import { Medication } from './Medication';
import { MedicationAdministration } from './MedicationAdministration';
import { MedicationDispense } from './MedicationDispense';
import { Meta } from './Meta';
import { Money } from './Money';
import { Narrative } from './Narrative';
import { Observation } from './Observation';
import { Organization } from './Organization';
import { Patient } from './Patient';
import { Period } from './Period';
import { Practitioner } from './Practitioner';
import { PractitionerRole } from './PractitionerRole';
import { Procedure } from './Procedure';
import { Quantity } from './Quantity';
import { Reference } from './Reference';
import { RelatedPerson } from './RelatedPerson';
import { Resource } from './Resource';
import { Substance } from './Substance';
import { SupplyDelivery } from './SupplyDelivery';
import { Timing } from './Timing';

/**
 * FHIR R4 ChargeItem
 * @see https://hl7.org/fhir/R4/chargeitem.html
 */
export interface ChargeItem {

  /**
   * This is a ChargeItem resource
   */
  readonly resourceType: 'ChargeItem';

  /**
   * ChargeItem.id
   */
  id?: string;

  /**
   * ChargeItem.meta
   */
  meta?: Meta;

  /**
   * ChargeItem.implicitRules
   */
  implicitRules?: string;

  /**
   * ChargeItem.language
   */
  language?: string;

  /**
   * ChargeItem.text
   */
  text?: Narrative;

  /**
   * ChargeItem.contained
   */
  contained?: Resource[];

  /**
   * ChargeItem.extension
   */
  extension?: Extension[];

  /**
   * ChargeItem.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * ChargeItem.identifier
   */
  identifier?: Identifier[];

  /**
   * ChargeItem.definitionUri
   */
  definitionUri?: string[];

  /**
   * ChargeItem.definitionCanonical
   */
  definitionCanonical?: string[];

  /**
   * ChargeItem.status
   */
  status: string;

  /**
   * ChargeItem.partOf
   */
  partOf?: Reference<ChargeItem>[];

  /**
   * ChargeItem.code
   */
  code: CodeableConcept;

  /**
   * ChargeItem.subject
   */
  subject: Reference<Patient | Group>;

  /**
   * ChargeItem.context
   */
  context?: Reference<Encounter | EpisodeOfCare>;

  /**
   * ChargeItem.occurrence[x]
   */
  occurrenceDateTime?: string;

  /**
   * ChargeItem.occurrence[x]
   */
  occurrencePeriod?: Period;

  /**
   * ChargeItem.occurrence[x]
   */
  occurrenceTiming?: Timing;

  /**
   * ChargeItem.performer
   */
  performer?: ChargeItemPerformer[];

  /**
   * ChargeItem.performingOrganization
   */
  performingOrganization?: Reference<Organization>;

  /**
   * ChargeItem.requestingOrganization
   */
  requestingOrganization?: Reference<Organization>;

  /**
   * ChargeItem.costCenter
   */
  costCenter?: Reference<Organization>;

  /**
   * ChargeItem.quantity
   */
  quantity?: Quantity;

  /**
   * ChargeItem.bodysite
   */
  bodysite?: CodeableConcept[];

  /**
   * ChargeItem.factorOverride
   */
  factorOverride?: number;

  /**
   * ChargeItem.priceOverride
   */
  priceOverride?: Money;

  /**
   * ChargeItem.overrideReason
   */
  overrideReason?: string;

  /**
   * ChargeItem.enterer
   */
  enterer?: Reference<Practitioner | PractitionerRole | Organization | Patient | Device | RelatedPerson>;

  /**
   * ChargeItem.enteredDate
   */
  enteredDate?: string;

  /**
   * ChargeItem.reason
   */
  reason?: CodeableConcept[];

  /**
   * ChargeItem.service
   */
  service?: Reference<DiagnosticReport | ImagingStudy | Immunization | MedicationAdministration | MedicationDispense | Observation | Procedure | SupplyDelivery>[];

  /**
   * ChargeItem.product[x]
   */
  productReference?: Reference<Device | Medication | Substance>;

  /**
   * ChargeItem.product[x]
   */
  productCodeableConcept?: CodeableConcept;

  /**
   * ChargeItem.account
   */
  account?: Reference<Account>[];

  /**
   * ChargeItem.note
   */
  note?: Annotation[];

  /**
   * ChargeItem.supportingInformation
   */
  supportingInformation?: Reference[];
}

/**
 * ChargeItem.occurrence[x]
 */
export type ChargeItemOccurrence = string | Period | Timing;
/**
 * ChargeItem.product[x]
 */
export type ChargeItemProduct = Reference<Device | Medication | Substance> | CodeableConcept;

/**
 * FHIR R4 ChargeItemPerformer
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ChargeItemPerformer {

  /**
   * ChargeItem.performer.id
   */
  id?: string;

  /**
   * ChargeItem.performer.extension
   */
  extension?: Extension[];

  /**
   * ChargeItem.performer.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * ChargeItem.performer.function
   */
  function?: CodeableConcept;

  /**
   * ChargeItem.performer.actor
   */
  actor: Reference<Practitioner | PractitionerRole | Organization | CareTeam | Patient | Device | RelatedPerson>;
}

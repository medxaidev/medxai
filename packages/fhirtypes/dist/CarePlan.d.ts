import { Annotation } from './Annotation';
import { Appointment } from './Appointment';
import { CareTeam } from './CareTeam';
import { CodeableConcept } from './CodeableConcept';
import { CommunicationRequest } from './CommunicationRequest';
import { Condition } from './Condition';
import { Device } from './Device';
import { DeviceRequest } from './DeviceRequest';
import { DiagnosticReport } from './DiagnosticReport';
import { DocumentReference } from './DocumentReference';
import { Encounter } from './Encounter';
import { Extension } from './Extension';
import { Goal } from './Goal';
import { Group } from './Group';
import { HealthcareService } from './HealthcareService';
import { Identifier } from './Identifier';
import { Location } from './Location';
import { Medication } from './Medication';
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
import { Quantity } from './Quantity';
import { Reference } from './Reference';
import { RelatedPerson } from './RelatedPerson';
import { RequestGroup } from './RequestGroup';
import { Resource } from './Resource';
import { ServiceRequest } from './ServiceRequest';
import { Substance } from './Substance';
import { Task } from './Task';
import { Timing } from './Timing';
import { VisionPrescription } from './VisionPrescription';

/**
 * FHIR R4 CarePlan
 * @see https://hl7.org/fhir/R4/careplan.html
 */
export interface CarePlan {

  /**
   * This is a CarePlan resource
   */
  readonly resourceType: 'CarePlan';

  /**
   * CarePlan.id
   */
  id?: string;

  /**
   * CarePlan.meta
   */
  meta?: Meta;

  /**
   * CarePlan.implicitRules
   */
  implicitRules?: string;

  /**
   * CarePlan.language
   */
  language?: string;

  /**
   * CarePlan.text
   */
  text?: Narrative;

  /**
   * CarePlan.contained
   */
  contained?: Resource[];

  /**
   * CarePlan.extension
   */
  extension?: Extension[];

  /**
   * CarePlan.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * CarePlan.identifier
   */
  identifier?: Identifier[];

  /**
   * CarePlan.instantiatesCanonical
   */
  instantiatesCanonical?: string[];

  /**
   * CarePlan.instantiatesUri
   */
  instantiatesUri?: string[];

  /**
   * CarePlan.basedOn
   */
  basedOn?: Reference<CarePlan>[];

  /**
   * CarePlan.replaces
   */
  replaces?: Reference<CarePlan>[];

  /**
   * CarePlan.partOf
   */
  partOf?: Reference<CarePlan>[];

  /**
   * CarePlan.status
   */
  status: 'draft' | 'active' | 'on-hold' | 'revoked' | 'completed' | 'entered-in-error' | 'unknown';

  /**
   * CarePlan.intent
   */
  intent: string;

  /**
   * CarePlan.category
   */
  category?: CodeableConcept[];

  /**
   * CarePlan.title
   */
  title?: string;

  /**
   * CarePlan.description
   */
  description?: string;

  /**
   * CarePlan.subject
   */
  subject: Reference<Patient | Group>;

  /**
   * CarePlan.encounter
   */
  encounter?: Reference<Encounter>;

  /**
   * CarePlan.period
   */
  period?: Period;

  /**
   * CarePlan.created
   */
  created?: string;

  /**
   * CarePlan.author
   */
  author?: Reference<Patient | Practitioner | PractitionerRole | Device | RelatedPerson | Organization | CareTeam>;

  /**
   * CarePlan.contributor
   */
  contributor?: Reference<Patient | Practitioner | PractitionerRole | Device | RelatedPerson | Organization | CareTeam>[];

  /**
   * CarePlan.careTeam
   */
  careTeam?: Reference<CareTeam>[];

  /**
   * CarePlan.addresses
   */
  addresses?: Reference<Condition>[];

  /**
   * CarePlan.supportingInfo
   */
  supportingInfo?: Reference[];

  /**
   * CarePlan.goal
   */
  goal?: Reference<Goal>[];

  /**
   * CarePlan.activity
   */
  activity?: CarePlanActivity[];

  /**
   * CarePlan.note
   */
  note?: Annotation[];
}

/**
 * FHIR R4 CarePlanActivity
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface CarePlanActivity {

  /**
   * CarePlan.activity.id
   */
  id?: string;

  /**
   * CarePlan.activity.extension
   */
  extension?: Extension[];

  /**
   * CarePlan.activity.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * CarePlan.activity.outcomeCodeableConcept
   */
  outcomeCodeableConcept?: CodeableConcept[];

  /**
   * CarePlan.activity.outcomeReference
   */
  outcomeReference?: Reference[];

  /**
   * CarePlan.activity.progress
   */
  progress?: Annotation[];

  /**
   * CarePlan.activity.reference
   */
  reference?: Reference<Appointment | CommunicationRequest | DeviceRequest | MedicationRequest | NutritionOrder | Task | ServiceRequest | VisionPrescription | RequestGroup>;

  /**
   * CarePlan.activity.detail
   */
  detail?: CarePlanActivityDetail;
}

/**
 * FHIR R4 CarePlanActivityDetail
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface CarePlanActivityDetail {

  /**
   * CarePlan.activity.detail.id
   */
  id?: string;

  /**
   * CarePlan.activity.detail.extension
   */
  extension?: Extension[];

  /**
   * CarePlan.activity.detail.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * CarePlan.activity.detail.kind
   */
  kind?: string;

  /**
   * CarePlan.activity.detail.instantiatesCanonical
   */
  instantiatesCanonical?: string[];

  /**
   * CarePlan.activity.detail.instantiatesUri
   */
  instantiatesUri?: string[];

  /**
   * CarePlan.activity.detail.code
   */
  code?: CodeableConcept;

  /**
   * CarePlan.activity.detail.reasonCode
   */
  reasonCode?: CodeableConcept[];

  /**
   * CarePlan.activity.detail.reasonReference
   */
  reasonReference?: Reference<Condition | Observation | DiagnosticReport | DocumentReference>[];

  /**
   * CarePlan.activity.detail.goal
   */
  goal?: Reference<Goal>[];

  /**
   * CarePlan.activity.detail.status
   */
  status: string;

  /**
   * CarePlan.activity.detail.statusReason
   */
  statusReason?: CodeableConcept;

  /**
   * CarePlan.activity.detail.doNotPerform
   */
  doNotPerform?: boolean;

  /**
   * CarePlan.activity.detail.scheduled[x]
   */
  scheduledTiming?: Timing;

  /**
   * CarePlan.activity.detail.scheduled[x]
   */
  scheduledPeriod?: Period;

  /**
   * CarePlan.activity.detail.scheduled[x]
   */
  scheduledString?: string;

  /**
   * CarePlan.activity.detail.location
   */
  location?: Reference<Location>;

  /**
   * CarePlan.activity.detail.performer
   */
  performer?: Reference<Practitioner | PractitionerRole | Organization | RelatedPerson | Patient | CareTeam | HealthcareService | Device>[];

  /**
   * CarePlan.activity.detail.product[x]
   */
  productCodeableConcept?: CodeableConcept;

  /**
   * CarePlan.activity.detail.product[x]
   */
  productReference?: Reference<Medication | Substance>;

  /**
   * CarePlan.activity.detail.dailyAmount
   */
  dailyAmount?: Quantity;

  /**
   * CarePlan.activity.detail.quantity
   */
  quantity?: Quantity;

  /**
   * CarePlan.activity.detail.description
   */
  description?: string;
}

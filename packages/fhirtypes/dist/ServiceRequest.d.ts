import { Annotation } from './Annotation';
import { CarePlan } from './CarePlan';
import { CareTeam } from './CareTeam';
import { ClaimResponse } from './ClaimResponse';
import { CodeableConcept } from './CodeableConcept';
import { Condition } from './Condition';
import { Coverage } from './Coverage';
import { Device } from './Device';
import { DiagnosticReport } from './DiagnosticReport';
import { DocumentReference } from './DocumentReference';
import { Encounter } from './Encounter';
import { Extension } from './Extension';
import { Group } from './Group';
import { HealthcareService } from './HealthcareService';
import { Identifier } from './Identifier';
import { Location } from './Location';
import { MedicationRequest } from './MedicationRequest';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { Observation } from './Observation';
import { Organization } from './Organization';
import { Patient } from './Patient';
import { Period } from './Period';
import { Practitioner } from './Practitioner';
import { PractitionerRole } from './PractitionerRole';
import { Provenance } from './Provenance';
import { Quantity } from './Quantity';
import { Range } from './Range';
import { Ratio } from './Ratio';
import { Reference } from './Reference';
import { RelatedPerson } from './RelatedPerson';
import { Resource } from './Resource';
import { Specimen } from './Specimen';
import { Timing } from './Timing';

/**
 * FHIR R4 ServiceRequest
 * @see https://hl7.org/fhir/R4/servicerequest.html
 */
export interface ServiceRequest {

  /**
   * This is a ServiceRequest resource
   */
  readonly resourceType: 'ServiceRequest';

  /**
   * ServiceRequest.id
   */
  id?: string;

  /**
   * ServiceRequest.meta
   */
  meta?: Meta;

  /**
   * ServiceRequest.implicitRules
   */
  implicitRules?: string;

  /**
   * ServiceRequest.language
   */
  language?: string;

  /**
   * ServiceRequest.text
   */
  text?: Narrative;

  /**
   * ServiceRequest.contained
   */
  contained?: Resource[];

  /**
   * ServiceRequest.extension
   */
  extension?: Extension[];

  /**
   * ServiceRequest.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * ServiceRequest.identifier
   */
  identifier?: Identifier[];

  /**
   * ServiceRequest.instantiatesCanonical
   */
  instantiatesCanonical?: string[];

  /**
   * ServiceRequest.instantiatesUri
   */
  instantiatesUri?: string[];

  /**
   * ServiceRequest.basedOn
   */
  basedOn?: Reference<CarePlan | ServiceRequest | MedicationRequest>[];

  /**
   * ServiceRequest.replaces
   */
  replaces?: Reference<ServiceRequest>[];

  /**
   * ServiceRequest.requisition
   */
  requisition?: Identifier;

  /**
   * ServiceRequest.status
   */
  status: 'draft' | 'active' | 'on-hold' | 'revoked' | 'completed' | 'entered-in-error' | 'unknown';

  /**
   * ServiceRequest.intent
   */
  intent: 'proposal' | 'plan' | 'directive' | 'order' | 'original-order' | 'reflex-order' | 'filler-order' | 'instance-order' | 'option';

  /**
   * ServiceRequest.category
   */
  category?: CodeableConcept[];

  /**
   * ServiceRequest.priority
   */
  priority?: 'routine' | 'urgent' | 'asap' | 'stat';

  /**
   * ServiceRequest.doNotPerform
   */
  doNotPerform?: boolean;

  /**
   * ServiceRequest.code
   */
  code?: CodeableConcept;

  /**
   * ServiceRequest.orderDetail
   */
  orderDetail?: CodeableConcept[];

  /**
   * ServiceRequest.quantity[x]
   */
  quantityQuantity?: Quantity;

  /**
   * ServiceRequest.quantity[x]
   */
  quantityRatio?: Ratio;

  /**
   * ServiceRequest.quantity[x]
   */
  quantityRange?: Range;

  /**
   * ServiceRequest.subject
   */
  subject: Reference<Patient | Group | Location | Device>;

  /**
   * ServiceRequest.encounter
   */
  encounter?: Reference<Encounter>;

  /**
   * ServiceRequest.occurrence[x]
   */
  occurrenceDateTime?: string;

  /**
   * ServiceRequest.occurrence[x]
   */
  occurrencePeriod?: Period;

  /**
   * ServiceRequest.occurrence[x]
   */
  occurrenceTiming?: Timing;

  /**
   * ServiceRequest.asNeeded[x]
   */
  asNeededBoolean?: boolean;

  /**
   * ServiceRequest.asNeeded[x]
   */
  asNeededCodeableConcept?: CodeableConcept;

  /**
   * ServiceRequest.authoredOn
   */
  authoredOn?: string;

  /**
   * ServiceRequest.requester
   */
  requester?: Reference<Practitioner | PractitionerRole | Organization | Patient | RelatedPerson | Device>;

  /**
   * ServiceRequest.performerType
   */
  performerType?: CodeableConcept;

  /**
   * ServiceRequest.performer
   */
  performer?: Reference<Practitioner | PractitionerRole | Organization | CareTeam | HealthcareService | Patient | Device | RelatedPerson>[];

  /**
   * ServiceRequest.locationCode
   */
  locationCode?: CodeableConcept[];

  /**
   * ServiceRequest.locationReference
   */
  locationReference?: Reference<Location>[];

  /**
   * ServiceRequest.reasonCode
   */
  reasonCode?: CodeableConcept[];

  /**
   * ServiceRequest.reasonReference
   */
  reasonReference?: Reference<Condition | Observation | DiagnosticReport | DocumentReference>[];

  /**
   * ServiceRequest.insurance
   */
  insurance?: Reference<Coverage | ClaimResponse>[];

  /**
   * ServiceRequest.supportingInfo
   */
  supportingInfo?: Reference[];

  /**
   * ServiceRequest.specimen
   */
  specimen?: Reference<Specimen>[];

  /**
   * ServiceRequest.bodySite
   */
  bodySite?: CodeableConcept[];

  /**
   * ServiceRequest.note
   */
  note?: Annotation[];

  /**
   * ServiceRequest.patientInstruction
   */
  patientInstruction?: string;

  /**
   * ServiceRequest.relevantHistory
   */
  relevantHistory?: Reference<Provenance>[];
}

/**
 * ServiceRequest.quantity[x]
 */
export type ServiceRequestQuantity = Quantity | Ratio | Range;
/**
 * ServiceRequest.occurrence[x]
 */
export type ServiceRequestOccurrence = string | Period | Timing;
/**
 * ServiceRequest.asNeeded[x]
 */
export type ServiceRequestAsNeeded = boolean | CodeableConcept;

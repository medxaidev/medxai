import { Annotation } from './Annotation';
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
import { Reference } from './Reference';
import { RelatedPerson } from './RelatedPerson';
import { Resource } from './Resource';
import { Timing } from './Timing';

/**
 * FHIR R4 DeviceRequest
 * @see https://hl7.org/fhir/R4/devicerequest.html
 */
export interface DeviceRequest {

  /**
   * This is a DeviceRequest resource
   */
  readonly resourceType: 'DeviceRequest';

  /**
   * DeviceRequest.id
   */
  id?: string;

  /**
   * DeviceRequest.meta
   */
  meta?: Meta;

  /**
   * DeviceRequest.implicitRules
   */
  implicitRules?: string;

  /**
   * DeviceRequest.language
   */
  language?: string;

  /**
   * DeviceRequest.text
   */
  text?: Narrative;

  /**
   * DeviceRequest.contained
   */
  contained?: Resource[];

  /**
   * DeviceRequest.extension
   */
  extension?: Extension[];

  /**
   * DeviceRequest.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * DeviceRequest.identifier
   */
  identifier?: Identifier[];

  /**
   * DeviceRequest.instantiatesCanonical
   */
  instantiatesCanonical?: string[];

  /**
   * DeviceRequest.instantiatesUri
   */
  instantiatesUri?: string[];

  /**
   * DeviceRequest.basedOn
   */
  basedOn?: Reference[];

  /**
   * DeviceRequest.priorRequest
   */
  priorRequest?: Reference[];

  /**
   * DeviceRequest.groupIdentifier
   */
  groupIdentifier?: Identifier;

  /**
   * DeviceRequest.status
   */
  status?: 'draft' | 'active' | 'on-hold' | 'revoked' | 'completed' | 'entered-in-error' | 'unknown';

  /**
   * DeviceRequest.intent
   */
  intent: 'proposal' | 'plan' | 'directive' | 'order' | 'original-order' | 'reflex-order' | 'filler-order' | 'instance-order' | 'option';

  /**
   * DeviceRequest.priority
   */
  priority?: 'routine' | 'urgent' | 'asap' | 'stat';

  /**
   * DeviceRequest.code[x]
   */
  codeReference: Reference<Device>;

  /**
   * DeviceRequest.code[x]
   */
  codeCodeableConcept: CodeableConcept;

  /**
   * DeviceRequest.parameter
   */
  parameter?: DeviceRequestParameter[];

  /**
   * DeviceRequest.subject
   */
  subject: Reference<Patient | Group | Location | Device>;

  /**
   * DeviceRequest.encounter
   */
  encounter?: Reference<Encounter>;

  /**
   * DeviceRequest.occurrence[x]
   */
  occurrenceDateTime?: string;

  /**
   * DeviceRequest.occurrence[x]
   */
  occurrencePeriod?: Period;

  /**
   * DeviceRequest.occurrence[x]
   */
  occurrenceTiming?: Timing;

  /**
   * DeviceRequest.authoredOn
   */
  authoredOn?: string;

  /**
   * DeviceRequest.requester
   */
  requester?: Reference<Device | Practitioner | PractitionerRole | Organization>;

  /**
   * DeviceRequest.performerType
   */
  performerType?: CodeableConcept;

  /**
   * DeviceRequest.performer
   */
  performer?: Reference<Practitioner | PractitionerRole | Organization | CareTeam | HealthcareService | Patient | Device | RelatedPerson>;

  /**
   * DeviceRequest.reasonCode
   */
  reasonCode?: CodeableConcept[];

  /**
   * DeviceRequest.reasonReference
   */
  reasonReference?: Reference<Condition | Observation | DiagnosticReport | DocumentReference>[];

  /**
   * DeviceRequest.insurance
   */
  insurance?: Reference<Coverage | ClaimResponse>[];

  /**
   * DeviceRequest.supportingInfo
   */
  supportingInfo?: Reference[];

  /**
   * DeviceRequest.note
   */
  note?: Annotation[];

  /**
   * DeviceRequest.relevantHistory
   */
  relevantHistory?: Reference<Provenance>[];
}

/**
 * DeviceRequest.code[x]
 */
export type DeviceRequestCode = Reference<Device> | CodeableConcept;
/**
 * DeviceRequest.occurrence[x]
 */
export type DeviceRequestOccurrence = string | Period | Timing;

/**
 * FHIR R4 DeviceRequestParameter
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface DeviceRequestParameter {

  /**
   * DeviceRequest.parameter.id
   */
  id?: string;

  /**
   * DeviceRequest.parameter.extension
   */
  extension?: Extension[];

  /**
   * DeviceRequest.parameter.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * DeviceRequest.parameter.code
   */
  code?: CodeableConcept;

  /**
   * DeviceRequest.parameter.value[x]
   */
  valueCodeableConcept?: CodeableConcept;

  /**
   * DeviceRequest.parameter.value[x]
   */
  valueQuantity?: Quantity;

  /**
   * DeviceRequest.parameter.value[x]
   */
  valueRange?: Range;

  /**
   * DeviceRequest.parameter.value[x]
   */
  valueBoolean?: boolean;
}

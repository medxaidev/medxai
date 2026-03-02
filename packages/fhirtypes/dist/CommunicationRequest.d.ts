import { Annotation } from './Annotation';
import { Attachment } from './Attachment';
import { CareTeam } from './CareTeam';
import { CodeableConcept } from './CodeableConcept';
import { Condition } from './Condition';
import { Device } from './Device';
import { DiagnosticReport } from './DiagnosticReport';
import { DocumentReference } from './DocumentReference';
import { Encounter } from './Encounter';
import { Extension } from './Extension';
import { Group } from './Group';
import { HealthcareService } from './HealthcareService';
import { Identifier } from './Identifier';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { Observation } from './Observation';
import { Organization } from './Organization';
import { Patient } from './Patient';
import { Period } from './Period';
import { Practitioner } from './Practitioner';
import { PractitionerRole } from './PractitionerRole';
import { Reference } from './Reference';
import { RelatedPerson } from './RelatedPerson';
import { Resource } from './Resource';

/**
 * FHIR R4 CommunicationRequest
 * @see https://hl7.org/fhir/R4/communicationrequest.html
 */
export interface CommunicationRequest {

  /**
   * This is a CommunicationRequest resource
   */
  readonly resourceType: 'CommunicationRequest';

  /**
   * CommunicationRequest.id
   */
  id?: string;

  /**
   * CommunicationRequest.meta
   */
  meta?: Meta;

  /**
   * CommunicationRequest.implicitRules
   */
  implicitRules?: string;

  /**
   * CommunicationRequest.language
   */
  language?: string;

  /**
   * CommunicationRequest.text
   */
  text?: Narrative;

  /**
   * CommunicationRequest.contained
   */
  contained?: Resource[];

  /**
   * CommunicationRequest.extension
   */
  extension?: Extension[];

  /**
   * CommunicationRequest.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * CommunicationRequest.identifier
   */
  identifier?: Identifier[];

  /**
   * CommunicationRequest.basedOn
   */
  basedOn?: Reference[];

  /**
   * CommunicationRequest.replaces
   */
  replaces?: Reference<CommunicationRequest>[];

  /**
   * CommunicationRequest.groupIdentifier
   */
  groupIdentifier?: Identifier;

  /**
   * CommunicationRequest.status
   */
  status: 'draft' | 'active' | 'on-hold' | 'revoked' | 'completed' | 'entered-in-error' | 'unknown';

  /**
   * CommunicationRequest.statusReason
   */
  statusReason?: CodeableConcept;

  /**
   * CommunicationRequest.category
   */
  category?: CodeableConcept[];

  /**
   * CommunicationRequest.priority
   */
  priority?: 'routine' | 'urgent' | 'asap' | 'stat';

  /**
   * CommunicationRequest.doNotPerform
   */
  doNotPerform?: boolean;

  /**
   * CommunicationRequest.medium
   */
  medium?: CodeableConcept[];

  /**
   * CommunicationRequest.subject
   */
  subject?: Reference<Patient | Group>;

  /**
   * CommunicationRequest.about
   */
  about?: Reference[];

  /**
   * CommunicationRequest.encounter
   */
  encounter?: Reference<Encounter>;

  /**
   * CommunicationRequest.payload
   */
  payload?: CommunicationRequestPayload[];

  /**
   * CommunicationRequest.occurrence[x]
   */
  occurrenceDateTime?: string;

  /**
   * CommunicationRequest.occurrence[x]
   */
  occurrencePeriod?: Period;

  /**
   * CommunicationRequest.authoredOn
   */
  authoredOn?: string;

  /**
   * CommunicationRequest.requester
   */
  requester?: Reference<Practitioner | PractitionerRole | Organization | Patient | RelatedPerson | Device>;

  /**
   * CommunicationRequest.recipient
   */
  recipient?: Reference<Device | Organization | Patient | Practitioner | PractitionerRole | RelatedPerson | Group | CareTeam | HealthcareService>[];

  /**
   * CommunicationRequest.sender
   */
  sender?: Reference<Device | Organization | Patient | Practitioner | PractitionerRole | RelatedPerson | HealthcareService>;

  /**
   * CommunicationRequest.reasonCode
   */
  reasonCode?: CodeableConcept[];

  /**
   * CommunicationRequest.reasonReference
   */
  reasonReference?: Reference<Condition | Observation | DiagnosticReport | DocumentReference>[];

  /**
   * CommunicationRequest.note
   */
  note?: Annotation[];
}

/**
 * CommunicationRequest.occurrence[x]
 */
export type CommunicationRequestOccurrence = string | Period;

/**
 * FHIR R4 CommunicationRequestPayload
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface CommunicationRequestPayload {

  /**
   * CommunicationRequest.payload.id
   */
  id?: string;

  /**
   * CommunicationRequest.payload.extension
   */
  extension?: Extension[];

  /**
   * CommunicationRequest.payload.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * CommunicationRequest.payload.content[x]
   */
  contentString: string;

  /**
   * CommunicationRequest.payload.content[x]
   */
  contentAttachment: Attachment;

  /**
   * CommunicationRequest.payload.content[x]
   */
  contentReference: Reference;
}

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
import { Practitioner } from './Practitioner';
import { PractitionerRole } from './PractitionerRole';
import { Reference } from './Reference';
import { RelatedPerson } from './RelatedPerson';
import { Resource } from './Resource';

/**
 * FHIR R4 Communication
 * @see https://hl7.org/fhir/R4/communication.html
 */
export interface Communication {

  /**
   * This is a Communication resource
   */
  readonly resourceType: 'Communication';

  /**
   * Communication.id
   */
  id?: string;

  /**
   * Communication.meta
   */
  meta?: Meta;

  /**
   * Communication.implicitRules
   */
  implicitRules?: string;

  /**
   * Communication.language
   */
  language?: string;

  /**
   * Communication.text
   */
  text?: Narrative;

  /**
   * Communication.contained
   */
  contained?: Resource[];

  /**
   * Communication.extension
   */
  extension?: Extension[];

  /**
   * Communication.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Communication.identifier
   */
  identifier?: Identifier[];

  /**
   * Communication.instantiatesCanonical
   */
  instantiatesCanonical?: string[];

  /**
   * Communication.instantiatesUri
   */
  instantiatesUri?: string[];

  /**
   * Communication.basedOn
   */
  basedOn?: Reference[];

  /**
   * Communication.partOf
   */
  partOf?: Reference[];

  /**
   * Communication.inResponseTo
   */
  inResponseTo?: Reference<Communication>[];

  /**
   * Communication.status
   */
  status: 'preparation' | 'in-progress' | 'not-done' | 'on-hold' | 'stopped' | 'completed' | 'entered-in-error' | 'unknown';

  /**
   * Communication.statusReason
   */
  statusReason?: CodeableConcept;

  /**
   * Communication.category
   */
  category?: CodeableConcept[];

  /**
   * Communication.priority
   */
  priority?: 'routine' | 'urgent' | 'asap' | 'stat';

  /**
   * Communication.medium
   */
  medium?: CodeableConcept[];

  /**
   * Communication.subject
   */
  subject?: Reference<Patient | Group>;

  /**
   * Communication.topic
   */
  topic?: CodeableConcept;

  /**
   * Communication.about
   */
  about?: Reference[];

  /**
   * Communication.encounter
   */
  encounter?: Reference<Encounter>;

  /**
   * Communication.sent
   */
  sent?: string;

  /**
   * Communication.received
   */
  received?: string;

  /**
   * Communication.recipient
   */
  recipient?: Reference<Device | Organization | Patient | Practitioner | PractitionerRole | RelatedPerson | Group | CareTeam | HealthcareService>[];

  /**
   * Communication.sender
   */
  sender?: Reference<Device | Organization | Patient | Practitioner | PractitionerRole | RelatedPerson | HealthcareService>;

  /**
   * Communication.reasonCode
   */
  reasonCode?: CodeableConcept[];

  /**
   * Communication.reasonReference
   */
  reasonReference?: Reference<Condition | Observation | DiagnosticReport | DocumentReference>[];

  /**
   * Communication.payload
   */
  payload?: CommunicationPayload[];

  /**
   * Communication.note
   */
  note?: Annotation[];
}

/**
 * FHIR R4 CommunicationPayload
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface CommunicationPayload {

  /**
   * Communication.payload.id
   */
  id?: string;

  /**
   * Communication.payload.extension
   */
  extension?: Extension[];

  /**
   * Communication.payload.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Communication.payload.content[x]
   */
  contentString: string;

  /**
   * Communication.payload.content[x]
   */
  contentAttachment: Attachment;

  /**
   * Communication.payload.content[x]
   */
  contentReference: Reference;
}

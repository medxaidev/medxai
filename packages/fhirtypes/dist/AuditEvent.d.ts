import { CodeableConcept } from './CodeableConcept';
import { Coding } from './Coding';
import { Device } from './Device';
import { Extension } from './Extension';
import { Location } from './Location';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { Organization } from './Organization';
import { Patient } from './Patient';
import { Period } from './Period';
import { Practitioner } from './Practitioner';
import { PractitionerRole } from './PractitionerRole';
import { Reference } from './Reference';
import { RelatedPerson } from './RelatedPerson';
import { Resource } from './Resource';

/**
 * FHIR R4 AuditEvent
 * @see https://hl7.org/fhir/R4/auditevent.html
 */
export interface AuditEvent {

  /**
   * This is a AuditEvent resource
   */
  readonly resourceType: 'AuditEvent';

  /**
   * AuditEvent.id
   */
  id?: string;

  /**
   * AuditEvent.meta
   */
  meta?: Meta;

  /**
   * AuditEvent.implicitRules
   */
  implicitRules?: string;

  /**
   * AuditEvent.language
   */
  language?: string;

  /**
   * AuditEvent.text
   */
  text?: Narrative;

  /**
   * AuditEvent.contained
   */
  contained?: Resource[];

  /**
   * AuditEvent.extension
   */
  extension?: Extension[];

  /**
   * AuditEvent.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * AuditEvent.type
   */
  type: Coding;

  /**
   * AuditEvent.subtype
   */
  subtype?: Coding[];

  /**
   * AuditEvent.action
   */
  action?: string;

  /**
   * AuditEvent.period
   */
  period?: Period;

  /**
   * AuditEvent.recorded
   */
  recorded: string;

  /**
   * AuditEvent.outcome
   */
  outcome?: string;

  /**
   * AuditEvent.outcomeDesc
   */
  outcomeDesc?: string;

  /**
   * AuditEvent.purposeOfEvent
   */
  purposeOfEvent?: CodeableConcept[];

  /**
   * AuditEvent.agent
   */
  agent: AuditEventAgent[];

  /**
   * AuditEvent.source
   */
  source: AuditEventSource;

  /**
   * AuditEvent.entity
   */
  entity?: AuditEventEntity[];
}

/**
 * FHIR R4 AuditEventAgent
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface AuditEventAgent {

  /**
   * AuditEvent.agent.id
   */
  id?: string;

  /**
   * AuditEvent.agent.extension
   */
  extension?: Extension[];

  /**
   * AuditEvent.agent.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * AuditEvent.agent.type
   */
  type?: CodeableConcept;

  /**
   * AuditEvent.agent.role
   */
  role?: CodeableConcept[];

  /**
   * AuditEvent.agent.who
   */
  who?: Reference<PractitionerRole | Practitioner | Organization | Device | Patient | RelatedPerson>;

  /**
   * AuditEvent.agent.altId
   */
  altId?: string;

  /**
   * AuditEvent.agent.name
   */
  name?: string;

  /**
   * AuditEvent.agent.requestor
   */
  requestor: boolean;

  /**
   * AuditEvent.agent.location
   */
  location?: Reference<Location>;

  /**
   * AuditEvent.agent.policy
   */
  policy?: string[];

  /**
   * AuditEvent.agent.media
   */
  media?: Coding;

  /**
   * AuditEvent.agent.network
   */
  network?: AuditEventAgentNetwork;

  /**
   * AuditEvent.agent.purposeOfUse
   */
  purposeOfUse?: CodeableConcept[];
}

/**
 * FHIR R4 AuditEventAgentNetwork
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface AuditEventAgentNetwork {

  /**
   * AuditEvent.agent.network.id
   */
  id?: string;

  /**
   * AuditEvent.agent.network.extension
   */
  extension?: Extension[];

  /**
   * AuditEvent.agent.network.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * AuditEvent.agent.network.address
   */
  address?: string;

  /**
   * AuditEvent.agent.network.type
   */
  type?: string;
}

/**
 * FHIR R4 AuditEventEntity
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface AuditEventEntity {

  /**
   * AuditEvent.entity.id
   */
  id?: string;

  /**
   * AuditEvent.entity.extension
   */
  extension?: Extension[];

  /**
   * AuditEvent.entity.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * AuditEvent.entity.what
   */
  what?: Reference;

  /**
   * AuditEvent.entity.type
   */
  type?: Coding;

  /**
   * AuditEvent.entity.role
   */
  role?: Coding;

  /**
   * AuditEvent.entity.lifecycle
   */
  lifecycle?: Coding;

  /**
   * AuditEvent.entity.securityLabel
   */
  securityLabel?: Coding[];

  /**
   * AuditEvent.entity.name
   */
  name?: string;

  /**
   * AuditEvent.entity.description
   */
  description?: string;

  /**
   * AuditEvent.entity.query
   */
  query?: string;

  /**
   * AuditEvent.entity.detail
   */
  detail?: AuditEventEntityDetail[];
}

/**
 * FHIR R4 AuditEventEntityDetail
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface AuditEventEntityDetail {

  /**
   * AuditEvent.entity.detail.id
   */
  id?: string;

  /**
   * AuditEvent.entity.detail.extension
   */
  extension?: Extension[];

  /**
   * AuditEvent.entity.detail.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * AuditEvent.entity.detail.type
   */
  type: string;

  /**
   * AuditEvent.entity.detail.value[x]
   */
  valueString: string;

  /**
   * AuditEvent.entity.detail.value[x]
   */
  valueBase64Binary: string;
}

/**
 * FHIR R4 AuditEventSource
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface AuditEventSource {

  /**
   * AuditEvent.source.id
   */
  id?: string;

  /**
   * AuditEvent.source.extension
   */
  extension?: Extension[];

  /**
   * AuditEvent.source.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * AuditEvent.source.site
   */
  site?: string;

  /**
   * AuditEvent.source.observer
   */
  observer: Reference<PractitionerRole | Practitioner | Organization | Device | Patient | RelatedPerson>;

  /**
   * AuditEvent.source.type
   */
  type?: Coding[];
}

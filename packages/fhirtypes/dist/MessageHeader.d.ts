import { CodeableConcept } from './CodeableConcept';
import { Coding } from './Coding';
import { ContactPoint } from './ContactPoint';
import { Device } from './Device';
import { Extension } from './Extension';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { OperationOutcome } from './OperationOutcome';
import { Organization } from './Organization';
import { Practitioner } from './Practitioner';
import { PractitionerRole } from './PractitionerRole';
import { Reference } from './Reference';
import { Resource } from './Resource';

/**
 * FHIR R4 MessageHeader
 * @see https://hl7.org/fhir/R4/messageheader.html
 */
export interface MessageHeader {

  /**
   * This is a MessageHeader resource
   */
  readonly resourceType: 'MessageHeader';

  /**
   * MessageHeader.id
   */
  id?: string;

  /**
   * MessageHeader.meta
   */
  meta?: Meta;

  /**
   * MessageHeader.implicitRules
   */
  implicitRules?: string;

  /**
   * MessageHeader.language
   */
  language?: string;

  /**
   * MessageHeader.text
   */
  text?: Narrative;

  /**
   * MessageHeader.contained
   */
  contained?: Resource[];

  /**
   * MessageHeader.extension
   */
  extension?: Extension[];

  /**
   * MessageHeader.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * MessageHeader.event[x]
   */
  eventCoding: Coding;

  /**
   * MessageHeader.event[x]
   */
  eventUri: string;

  /**
   * MessageHeader.destination
   */
  destination?: MessageHeaderDestination[];

  /**
   * MessageHeader.sender
   */
  sender?: Reference<Practitioner | PractitionerRole | Organization>;

  /**
   * MessageHeader.enterer
   */
  enterer?: Reference<Practitioner | PractitionerRole>;

  /**
   * MessageHeader.author
   */
  author?: Reference<Practitioner | PractitionerRole>;

  /**
   * MessageHeader.source
   */
  source: MessageHeaderSource;

  /**
   * MessageHeader.responsible
   */
  responsible?: Reference<Practitioner | PractitionerRole | Organization>;

  /**
   * MessageHeader.reason
   */
  reason?: CodeableConcept;

  /**
   * MessageHeader.response
   */
  response?: MessageHeaderResponse;

  /**
   * MessageHeader.focus
   */
  focus?: Reference[];

  /**
   * MessageHeader.definition
   */
  definition?: string;
}

/**
 * MessageHeader.event[x]
 */
export type MessageHeaderEvent = Coding | string;

/**
 * FHIR R4 MessageHeaderDestination
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface MessageHeaderDestination {

  /**
   * MessageHeader.destination.id
   */
  id?: string;

  /**
   * MessageHeader.destination.extension
   */
  extension?: Extension[];

  /**
   * MessageHeader.destination.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * MessageHeader.destination.name
   */
  name?: string;

  /**
   * MessageHeader.destination.target
   */
  target?: Reference<Device>;

  /**
   * MessageHeader.destination.endpoint
   */
  endpoint: string;

  /**
   * MessageHeader.destination.receiver
   */
  receiver?: Reference<Practitioner | PractitionerRole | Organization>;
}

/**
 * FHIR R4 MessageHeaderResponse
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface MessageHeaderResponse {

  /**
   * MessageHeader.response.id
   */
  id?: string;

  /**
   * MessageHeader.response.extension
   */
  extension?: Extension[];

  /**
   * MessageHeader.response.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * MessageHeader.response.identifier
   */
  identifier: string;

  /**
   * MessageHeader.response.code
   */
  code: string;

  /**
   * MessageHeader.response.details
   */
  details?: Reference<OperationOutcome>;
}

/**
 * FHIR R4 MessageHeaderSource
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface MessageHeaderSource {

  /**
   * MessageHeader.source.id
   */
  id?: string;

  /**
   * MessageHeader.source.extension
   */
  extension?: Extension[];

  /**
   * MessageHeader.source.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * MessageHeader.source.name
   */
  name?: string;

  /**
   * MessageHeader.source.software
   */
  software?: string;

  /**
   * MessageHeader.source.version
   */
  version?: string;

  /**
   * MessageHeader.source.contact
   */
  contact?: ContactPoint;

  /**
   * MessageHeader.source.endpoint
   */
  endpoint: string;
}

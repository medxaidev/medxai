import { CodeableConcept } from './CodeableConcept';
import { Coding } from './Coding';
import { ContactDetail } from './ContactDetail';
import { Extension } from './Extension';
import { Identifier } from './Identifier';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { Resource } from './Resource';
import { UsageContext } from './UsageContext';

/**
 * FHIR R4 MessageDefinition
 * @see https://hl7.org/fhir/R4/messagedefinition.html
 */
export interface MessageDefinition {

  /**
   * This is a MessageDefinition resource
   */
  readonly resourceType: 'MessageDefinition';

  /**
   * MessageDefinition.id
   */
  id?: string;

  /**
   * MessageDefinition.meta
   */
  meta?: Meta;

  /**
   * MessageDefinition.implicitRules
   */
  implicitRules?: string;

  /**
   * MessageDefinition.language
   */
  language?: string;

  /**
   * MessageDefinition.text
   */
  text?: Narrative;

  /**
   * MessageDefinition.contained
   */
  contained?: Resource[];

  /**
   * MessageDefinition.extension
   */
  extension?: Extension[];

  /**
   * MessageDefinition.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * MessageDefinition.url
   */
  url?: string;

  /**
   * MessageDefinition.identifier
   */
  identifier?: Identifier[];

  /**
   * MessageDefinition.version
   */
  version?: string;

  /**
   * MessageDefinition.name
   */
  name?: string;

  /**
   * MessageDefinition.title
   */
  title?: string;

  /**
   * MessageDefinition.replaces
   */
  replaces?: string[];

  /**
   * MessageDefinition.status
   */
  status: 'draft' | 'active' | 'retired' | 'unknown';

  /**
   * MessageDefinition.experimental
   */
  experimental?: boolean;

  /**
   * MessageDefinition.date
   */
  date: string;

  /**
   * MessageDefinition.publisher
   */
  publisher?: string;

  /**
   * MessageDefinition.contact
   */
  contact?: ContactDetail[];

  /**
   * MessageDefinition.description
   */
  description?: string;

  /**
   * MessageDefinition.useContext
   */
  useContext?: UsageContext[];

  /**
   * MessageDefinition.jurisdiction
   */
  jurisdiction?: CodeableConcept[];

  /**
   * MessageDefinition.purpose
   */
  purpose?: string;

  /**
   * MessageDefinition.copyright
   */
  copyright?: string;

  /**
   * MessageDefinition.base
   */
  base?: string;

  /**
   * MessageDefinition.parent
   */
  parent?: string[];

  /**
   * MessageDefinition.event[x]
   */
  eventCoding: Coding;

  /**
   * MessageDefinition.event[x]
   */
  eventUri: string;

  /**
   * MessageDefinition.category
   */
  category?: string;

  /**
   * MessageDefinition.focus
   */
  focus?: MessageDefinitionFocus[];

  /**
   * MessageDefinition.responseRequired
   */
  responseRequired?: string;

  /**
   * MessageDefinition.allowedResponse
   */
  allowedResponse?: MessageDefinitionAllowedResponse[];

  /**
   * MessageDefinition.graph
   */
  graph?: string[];
}

/**
 * MessageDefinition.event[x]
 */
export type MessageDefinitionEvent = Coding | string;

/**
 * FHIR R4 MessageDefinitionAllowedResponse
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface MessageDefinitionAllowedResponse {

  /**
   * MessageDefinition.allowedResponse.id
   */
  id?: string;

  /**
   * MessageDefinition.allowedResponse.extension
   */
  extension?: Extension[];

  /**
   * MessageDefinition.allowedResponse.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * MessageDefinition.allowedResponse.message
   */
  message: string;

  /**
   * MessageDefinition.allowedResponse.situation
   */
  situation?: string;
}

/**
 * FHIR R4 MessageDefinitionFocus
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface MessageDefinitionFocus {

  /**
   * MessageDefinition.focus.id
   */
  id?: string;

  /**
   * MessageDefinition.focus.extension
   */
  extension?: Extension[];

  /**
   * MessageDefinition.focus.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * MessageDefinition.focus.code
   */
  code: string;

  /**
   * MessageDefinition.focus.profile
   */
  profile?: string;

  /**
   * MessageDefinition.focus.min
   */
  min: number;

  /**
   * MessageDefinition.focus.max
   */
  max?: string;
}

import { CodeableConcept } from './CodeableConcept';
import { Coding } from './Coding';
import { ContactDetail } from './ContactDetail';
import { Extension } from './Extension';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { Organization } from './Organization';
import { Reference } from './Reference';
import { Resource } from './Resource';
import { UsageContext } from './UsageContext';

/**
 * FHIR R4 CapabilityStatement
 * @see https://hl7.org/fhir/R4/capabilitystatement.html
 */
export interface CapabilityStatement {

  /**
   * This is a CapabilityStatement resource
   */
  readonly resourceType: 'CapabilityStatement';

  /**
   * CapabilityStatement.id
   */
  id?: string;

  /**
   * CapabilityStatement.meta
   */
  meta?: Meta;

  /**
   * CapabilityStatement.implicitRules
   */
  implicitRules?: string;

  /**
   * CapabilityStatement.language
   */
  language?: string;

  /**
   * CapabilityStatement.text
   */
  text?: Narrative;

  /**
   * CapabilityStatement.contained
   */
  contained?: Resource[];

  /**
   * CapabilityStatement.extension
   */
  extension?: Extension[];

  /**
   * CapabilityStatement.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * CapabilityStatement.url
   */
  url?: string;

  /**
   * CapabilityStatement.version
   */
  version?: string;

  /**
   * CapabilityStatement.name
   */
  name?: string;

  /**
   * CapabilityStatement.title
   */
  title?: string;

  /**
   * CapabilityStatement.status
   */
  status: 'draft' | 'active' | 'retired' | 'unknown';

  /**
   * CapabilityStatement.experimental
   */
  experimental?: boolean;

  /**
   * CapabilityStatement.date
   */
  date: string;

  /**
   * CapabilityStatement.publisher
   */
  publisher?: string;

  /**
   * CapabilityStatement.contact
   */
  contact?: ContactDetail[];

  /**
   * CapabilityStatement.description
   */
  description?: string;

  /**
   * CapabilityStatement.useContext
   */
  useContext?: UsageContext[];

  /**
   * CapabilityStatement.jurisdiction
   */
  jurisdiction?: CodeableConcept[];

  /**
   * CapabilityStatement.purpose
   */
  purpose?: string;

  /**
   * CapabilityStatement.copyright
   */
  copyright?: string;

  /**
   * CapabilityStatement.kind
   */
  kind: string;

  /**
   * CapabilityStatement.instantiates
   */
  instantiates?: string[];

  /**
   * CapabilityStatement.imports
   */
  imports?: string[];

  /**
   * CapabilityStatement.software
   */
  software?: CapabilityStatementSoftware;

  /**
   * CapabilityStatement.implementation
   */
  implementation?: CapabilityStatementImplementation;

  /**
   * CapabilityStatement.fhirVersion
   */
  fhirVersion: string;

  /**
   * CapabilityStatement.format
   */
  format: string[];

  /**
   * CapabilityStatement.patchFormat
   */
  patchFormat?: string[];

  /**
   * CapabilityStatement.implementationGuide
   */
  implementationGuide?: string[];

  /**
   * CapabilityStatement.rest
   */
  rest?: CapabilityStatementRest[];

  /**
   * CapabilityStatement.messaging
   */
  messaging?: CapabilityStatementMessaging[];

  /**
   * CapabilityStatement.document
   */
  document?: CapabilityStatementDocument[];
}

/**
 * FHIR R4 CapabilityStatementDocument
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface CapabilityStatementDocument {

  /**
   * CapabilityStatement.document.id
   */
  id?: string;

  /**
   * CapabilityStatement.document.extension
   */
  extension?: Extension[];

  /**
   * CapabilityStatement.document.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * CapabilityStatement.document.mode
   */
  mode: string;

  /**
   * CapabilityStatement.document.documentation
   */
  documentation?: string;

  /**
   * CapabilityStatement.document.profile
   */
  profile: string;
}

/**
 * FHIR R4 CapabilityStatementImplementation
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface CapabilityStatementImplementation {

  /**
   * CapabilityStatement.implementation.id
   */
  id?: string;

  /**
   * CapabilityStatement.implementation.extension
   */
  extension?: Extension[];

  /**
   * CapabilityStatement.implementation.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * CapabilityStatement.implementation.description
   */
  description: string;

  /**
   * CapabilityStatement.implementation.url
   */
  url?: string;

  /**
   * CapabilityStatement.implementation.custodian
   */
  custodian?: Reference<Organization>;
}

/**
 * FHIR R4 CapabilityStatementMessaging
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface CapabilityStatementMessaging {

  /**
   * CapabilityStatement.messaging.id
   */
  id?: string;

  /**
   * CapabilityStatement.messaging.extension
   */
  extension?: Extension[];

  /**
   * CapabilityStatement.messaging.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * CapabilityStatement.messaging.endpoint
   */
  endpoint?: CapabilityStatementMessagingEndpoint[];

  /**
   * CapabilityStatement.messaging.reliableCache
   */
  reliableCache?: number;

  /**
   * CapabilityStatement.messaging.documentation
   */
  documentation?: string;

  /**
   * CapabilityStatement.messaging.supportedMessage
   */
  supportedMessage?: CapabilityStatementMessagingSupportedMessage[];
}

/**
 * FHIR R4 CapabilityStatementMessagingEndpoint
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface CapabilityStatementMessagingEndpoint {

  /**
   * CapabilityStatement.messaging.endpoint.id
   */
  id?: string;

  /**
   * CapabilityStatement.messaging.endpoint.extension
   */
  extension?: Extension[];

  /**
   * CapabilityStatement.messaging.endpoint.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * CapabilityStatement.messaging.endpoint.protocol
   */
  protocol: Coding;

  /**
   * CapabilityStatement.messaging.endpoint.address
   */
  address: string;
}

/**
 * FHIR R4 CapabilityStatementMessagingSupportedMessage
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface CapabilityStatementMessagingSupportedMessage {

  /**
   * CapabilityStatement.messaging.supportedMessage.id
   */
  id?: string;

  /**
   * CapabilityStatement.messaging.supportedMessage.extension
   */
  extension?: Extension[];

  /**
   * CapabilityStatement.messaging.supportedMessage.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * CapabilityStatement.messaging.supportedMessage.mode
   */
  mode: string;

  /**
   * CapabilityStatement.messaging.supportedMessage.definition
   */
  definition: string;
}

/**
 * FHIR R4 CapabilityStatementRest
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface CapabilityStatementRest {

  /**
   * CapabilityStatement.rest.id
   */
  id?: string;

  /**
   * CapabilityStatement.rest.extension
   */
  extension?: Extension[];

  /**
   * CapabilityStatement.rest.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * CapabilityStatement.rest.mode
   */
  mode: string;

  /**
   * CapabilityStatement.rest.documentation
   */
  documentation?: string;

  /**
   * CapabilityStatement.rest.security
   */
  security?: CapabilityStatementRestSecurity;

  /**
   * CapabilityStatement.rest.resource
   */
  resource?: CapabilityStatementRestResource[];

  /**
   * CapabilityStatement.rest.interaction
   */
  interaction?: CapabilityStatementRestInteraction[];

  /**
   * CapabilityStatement.rest.compartment
   */
  compartment?: string[];
}

/**
 * FHIR R4 CapabilityStatementRestInteraction
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface CapabilityStatementRestInteraction {

  /**
   * CapabilityStatement.rest.interaction.id
   */
  id?: string;

  /**
   * CapabilityStatement.rest.interaction.extension
   */
  extension?: Extension[];

  /**
   * CapabilityStatement.rest.interaction.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * CapabilityStatement.rest.interaction.code
   */
  code: string;

  /**
   * CapabilityStatement.rest.interaction.documentation
   */
  documentation?: string;
}

/**
 * FHIR R4 CapabilityStatementRestResource
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface CapabilityStatementRestResource {

  /**
   * CapabilityStatement.rest.resource.id
   */
  id?: string;

  /**
   * CapabilityStatement.rest.resource.extension
   */
  extension?: Extension[];

  /**
   * CapabilityStatement.rest.resource.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * CapabilityStatement.rest.resource.type
   */
  type: string;

  /**
   * CapabilityStatement.rest.resource.profile
   */
  profile?: string;

  /**
   * CapabilityStatement.rest.resource.supportedProfile
   */
  supportedProfile?: string[];

  /**
   * CapabilityStatement.rest.resource.documentation
   */
  documentation?: string;

  /**
   * CapabilityStatement.rest.resource.interaction
   */
  interaction?: CapabilityStatementRestResourceInteraction[];

  /**
   * CapabilityStatement.rest.resource.versioning
   */
  versioning?: string;

  /**
   * CapabilityStatement.rest.resource.readHistory
   */
  readHistory?: boolean;

  /**
   * CapabilityStatement.rest.resource.updateCreate
   */
  updateCreate?: boolean;

  /**
   * CapabilityStatement.rest.resource.conditionalCreate
   */
  conditionalCreate?: boolean;

  /**
   * CapabilityStatement.rest.resource.conditionalRead
   */
  conditionalRead?: string;

  /**
   * CapabilityStatement.rest.resource.conditionalUpdate
   */
  conditionalUpdate?: boolean;

  /**
   * CapabilityStatement.rest.resource.conditionalDelete
   */
  conditionalDelete?: string;

  /**
   * CapabilityStatement.rest.resource.referencePolicy
   */
  referencePolicy?: string[];

  /**
   * CapabilityStatement.rest.resource.searchInclude
   */
  searchInclude?: string[];

  /**
   * CapabilityStatement.rest.resource.searchRevInclude
   */
  searchRevInclude?: string[];

  /**
   * CapabilityStatement.rest.resource.searchParam
   */
  searchParam?: CapabilityStatementRestResourceSearchParam[];

  /**
   * CapabilityStatement.rest.resource.operation
   */
  operation?: CapabilityStatementRestResourceOperation[];
}

/**
 * FHIR R4 CapabilityStatementRestResourceInteraction
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface CapabilityStatementRestResourceInteraction {

  /**
   * CapabilityStatement.rest.resource.interaction.id
   */
  id?: string;

  /**
   * CapabilityStatement.rest.resource.interaction.extension
   */
  extension?: Extension[];

  /**
   * CapabilityStatement.rest.resource.interaction.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * CapabilityStatement.rest.resource.interaction.code
   */
  code: string;

  /**
   * CapabilityStatement.rest.resource.interaction.documentation
   */
  documentation?: string;
}

/**
 * FHIR R4 CapabilityStatementRestResourceOperation
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface CapabilityStatementRestResourceOperation {

  /**
   * CapabilityStatement.rest.resource.operation.id
   */
  id?: string;

  /**
   * CapabilityStatement.rest.resource.operation.extension
   */
  extension?: Extension[];

  /**
   * CapabilityStatement.rest.resource.operation.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * CapabilityStatement.rest.resource.operation.name
   */
  name: string;

  /**
   * CapabilityStatement.rest.resource.operation.definition
   */
  definition: string;

  /**
   * CapabilityStatement.rest.resource.operation.documentation
   */
  documentation?: string;
}

/**
 * FHIR R4 CapabilityStatementRestResourceSearchParam
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface CapabilityStatementRestResourceSearchParam {

  /**
   * CapabilityStatement.rest.resource.searchParam.id
   */
  id?: string;

  /**
   * CapabilityStatement.rest.resource.searchParam.extension
   */
  extension?: Extension[];

  /**
   * CapabilityStatement.rest.resource.searchParam.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * CapabilityStatement.rest.resource.searchParam.name
   */
  name: string;

  /**
   * CapabilityStatement.rest.resource.searchParam.definition
   */
  definition?: string;

  /**
   * CapabilityStatement.rest.resource.searchParam.type
   */
  type: string;

  /**
   * CapabilityStatement.rest.resource.searchParam.documentation
   */
  documentation?: string;
}

/**
 * FHIR R4 CapabilityStatementRestSecurity
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface CapabilityStatementRestSecurity {

  /**
   * CapabilityStatement.rest.security.id
   */
  id?: string;

  /**
   * CapabilityStatement.rest.security.extension
   */
  extension?: Extension[];

  /**
   * CapabilityStatement.rest.security.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * CapabilityStatement.rest.security.cors
   */
  cors?: boolean;

  /**
   * CapabilityStatement.rest.security.service
   */
  service?: CodeableConcept[];

  /**
   * CapabilityStatement.rest.security.description
   */
  description?: string;
}

/**
 * FHIR R4 CapabilityStatementSoftware
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface CapabilityStatementSoftware {

  /**
   * CapabilityStatement.software.id
   */
  id?: string;

  /**
   * CapabilityStatement.software.extension
   */
  extension?: Extension[];

  /**
   * CapabilityStatement.software.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * CapabilityStatement.software.name
   */
  name: string;

  /**
   * CapabilityStatement.software.version
   */
  version?: string;

  /**
   * CapabilityStatement.software.releaseDate
   */
  releaseDate?: string;
}

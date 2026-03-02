import { CodeableConcept } from './CodeableConcept';
import { Coding } from './Coding';
import { ContactPoint } from './ContactPoint';
import { Extension } from './Extension';
import { Identifier } from './Identifier';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { Organization } from './Organization';
import { Period } from './Period';
import { Reference } from './Reference';
import { Resource } from './Resource';

/**
 * FHIR R4 Endpoint
 * @see https://hl7.org/fhir/R4/endpoint.html
 */
export interface Endpoint {

  /**
   * This is a Endpoint resource
   */
  readonly resourceType: 'Endpoint';

  /**
   * Endpoint.id
   */
  id?: string;

  /**
   * Endpoint.meta
   */
  meta?: Meta;

  /**
   * Endpoint.implicitRules
   */
  implicitRules?: string;

  /**
   * Endpoint.language
   */
  language?: string;

  /**
   * Endpoint.text
   */
  text?: Narrative;

  /**
   * Endpoint.contained
   */
  contained?: Resource[];

  /**
   * Endpoint.extension
   */
  extension?: Extension[];

  /**
   * Endpoint.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Endpoint.identifier
   */
  identifier?: Identifier[];

  /**
   * Endpoint.status
   */
  status: string;

  /**
   * Endpoint.connectionType
   */
  connectionType: Coding;

  /**
   * Endpoint.name
   */
  name?: string;

  /**
   * Endpoint.managingOrganization
   */
  managingOrganization?: Reference<Organization>;

  /**
   * Endpoint.contact
   */
  contact?: ContactPoint[];

  /**
   * Endpoint.period
   */
  period?: Period;

  /**
   * Endpoint.payloadType
   */
  payloadType: CodeableConcept[];

  /**
   * Endpoint.payloadMimeType
   */
  payloadMimeType?: string[];

  /**
   * Endpoint.address
   */
  address: string;

  /**
   * Endpoint.header
   */
  header?: string[];
}

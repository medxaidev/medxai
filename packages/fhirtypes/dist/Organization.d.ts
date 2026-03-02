import { Address } from './Address';
import { CodeableConcept } from './CodeableConcept';
import { ContactPoint } from './ContactPoint';
import { Endpoint } from './Endpoint';
import { Extension } from './Extension';
import { HumanName } from './HumanName';
import { Identifier } from './Identifier';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { Reference } from './Reference';
import { Resource } from './Resource';

/**
 * FHIR R4 Organization
 * @see https://hl7.org/fhir/R4/organization.html
 */
export interface Organization {

  /**
   * This is a Organization resource
   */
  readonly resourceType: 'Organization';

  /**
   * Organization.id
   */
  id?: string;

  /**
   * Organization.meta
   */
  meta?: Meta;

  /**
   * Organization.implicitRules
   */
  implicitRules?: string;

  /**
   * Organization.language
   */
  language?: string;

  /**
   * Organization.text
   */
  text?: Narrative;

  /**
   * Organization.contained
   */
  contained?: Resource[];

  /**
   * Organization.extension
   */
  extension?: Extension[];

  /**
   * Organization.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Organization.identifier
   */
  identifier?: Identifier[];

  /**
   * Organization.active
   */
  active?: boolean;

  /**
   * Organization.type
   */
  type?: CodeableConcept[];

  /**
   * Organization.name
   */
  name?: string;

  /**
   * Organization.alias
   */
  alias?: string[];

  /**
   * Organization.telecom
   */
  telecom?: ContactPoint[];

  /**
   * Organization.address
   */
  address?: Address[];

  /**
   * Organization.partOf
   */
  partOf?: Reference<Organization>;

  /**
   * Organization.contact
   */
  contact?: OrganizationContact[];

  /**
   * Organization.endpoint
   */
  endpoint?: Reference<Endpoint>[];
}

/**
 * FHIR R4 OrganizationContact
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface OrganizationContact {

  /**
   * Organization.contact.id
   */
  id?: string;

  /**
   * Organization.contact.extension
   */
  extension?: Extension[];

  /**
   * Organization.contact.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Organization.contact.purpose
   */
  purpose?: CodeableConcept;

  /**
   * Organization.contact.name
   */
  name?: HumanName;

  /**
   * Organization.contact.telecom
   */
  telecom?: ContactPoint[];

  /**
   * Organization.contact.address
   */
  address?: Address;
}

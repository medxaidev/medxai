import { Address } from './Address';
import { Attachment } from './Attachment';
import { ContactPoint } from './ContactPoint';
import { Extension } from './Extension';
import { HumanName } from './HumanName';
import { Identifier } from './Identifier';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { Organization } from './Organization';
import { Patient } from './Patient';
import { Practitioner } from './Practitioner';
import { Reference } from './Reference';
import { RelatedPerson } from './RelatedPerson';
import { Resource } from './Resource';

/**
 * FHIR R4 Person
 * @see https://hl7.org/fhir/R4/person.html
 */
export interface Person {

  /**
   * This is a Person resource
   */
  readonly resourceType: 'Person';

  /**
   * Person.id
   */
  id?: string;

  /**
   * Person.meta
   */
  meta?: Meta;

  /**
   * Person.implicitRules
   */
  implicitRules?: string;

  /**
   * Person.language
   */
  language?: string;

  /**
   * Person.text
   */
  text?: Narrative;

  /**
   * Person.contained
   */
  contained?: Resource[];

  /**
   * Person.extension
   */
  extension?: Extension[];

  /**
   * Person.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Person.identifier
   */
  identifier?: Identifier[];

  /**
   * Person.name
   */
  name?: HumanName[];

  /**
   * Person.telecom
   */
  telecom?: ContactPoint[];

  /**
   * Person.gender
   */
  gender?: 'male' | 'female' | 'other' | 'unknown';

  /**
   * Person.birthDate
   */
  birthDate?: string;

  /**
   * Person.address
   */
  address?: Address[];

  /**
   * Person.photo
   */
  photo?: Attachment;

  /**
   * Person.managingOrganization
   */
  managingOrganization?: Reference<Organization>;

  /**
   * Person.active
   */
  active?: boolean;

  /**
   * Person.link
   */
  link?: PersonLink[];
}

/**
 * FHIR R4 PersonLink
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface PersonLink {

  /**
   * Person.link.id
   */
  id?: string;

  /**
   * Person.link.extension
   */
  extension?: Extension[];

  /**
   * Person.link.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Person.link.target
   */
  target: Reference<Patient | Practitioner | RelatedPerson | Person>;

  /**
   * Person.link.assurance
   */
  assurance?: string;
}

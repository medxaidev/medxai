import { Address } from './Address';
import { Attachment } from './Attachment';
import { CodeableConcept } from './CodeableConcept';
import { ContactPoint } from './ContactPoint';
import { Extension } from './Extension';
import { HumanName } from './HumanName';
import { Identifier } from './Identifier';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { Patient } from './Patient';
import { Period } from './Period';
import { Reference } from './Reference';
import { Resource } from './Resource';

/**
 * FHIR R4 RelatedPerson
 * @see https://hl7.org/fhir/R4/relatedperson.html
 */
export interface RelatedPerson {

  /**
   * This is a RelatedPerson resource
   */
  readonly resourceType: 'RelatedPerson';

  /**
   * RelatedPerson.id
   */
  id?: string;

  /**
   * RelatedPerson.meta
   */
  meta?: Meta;

  /**
   * RelatedPerson.implicitRules
   */
  implicitRules?: string;

  /**
   * RelatedPerson.language
   */
  language?: string;

  /**
   * RelatedPerson.text
   */
  text?: Narrative;

  /**
   * RelatedPerson.contained
   */
  contained?: Resource[];

  /**
   * RelatedPerson.extension
   */
  extension?: Extension[];

  /**
   * RelatedPerson.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * RelatedPerson.identifier
   */
  identifier?: Identifier[];

  /**
   * RelatedPerson.active
   */
  active?: boolean;

  /**
   * RelatedPerson.patient
   */
  patient: Reference<Patient>;

  /**
   * RelatedPerson.relationship
   */
  relationship?: CodeableConcept[];

  /**
   * RelatedPerson.name
   */
  name?: HumanName[];

  /**
   * RelatedPerson.telecom
   */
  telecom?: ContactPoint[];

  /**
   * RelatedPerson.gender
   */
  gender?: 'male' | 'female' | 'other' | 'unknown';

  /**
   * RelatedPerson.birthDate
   */
  birthDate?: string;

  /**
   * RelatedPerson.address
   */
  address?: Address[];

  /**
   * RelatedPerson.photo
   */
  photo?: Attachment[];

  /**
   * RelatedPerson.period
   */
  period?: Period;

  /**
   * RelatedPerson.communication
   */
  communication?: RelatedPersonCommunication[];
}

/**
 * FHIR R4 RelatedPersonCommunication
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface RelatedPersonCommunication {

  /**
   * RelatedPerson.communication.id
   */
  id?: string;

  /**
   * RelatedPerson.communication.extension
   */
  extension?: Extension[];

  /**
   * RelatedPerson.communication.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * RelatedPerson.communication.language
   */
  language: CodeableConcept;

  /**
   * RelatedPerson.communication.preferred
   */
  preferred?: boolean;
}

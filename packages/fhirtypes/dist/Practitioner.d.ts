import { Address } from './Address';
import { Attachment } from './Attachment';
import { CodeableConcept } from './CodeableConcept';
import { ContactPoint } from './ContactPoint';
import { Extension } from './Extension';
import { HumanName } from './HumanName';
import { Identifier } from './Identifier';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { Organization } from './Organization';
import { Period } from './Period';
import { Reference } from './Reference';
import { Resource } from './Resource';

/**
 * FHIR R4 Practitioner
 * @see https://hl7.org/fhir/R4/practitioner.html
 */
export interface Practitioner {

  /**
   * This is a Practitioner resource
   */
  readonly resourceType: 'Practitioner';

  /**
   * Practitioner.id
   */
  id?: string;

  /**
   * Practitioner.meta
   */
  meta?: Meta;

  /**
   * Practitioner.implicitRules
   */
  implicitRules?: string;

  /**
   * Practitioner.language
   */
  language?: string;

  /**
   * Practitioner.text
   */
  text?: Narrative;

  /**
   * Practitioner.contained
   */
  contained?: Resource[];

  /**
   * Practitioner.extension
   */
  extension?: Extension[];

  /**
   * Practitioner.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Practitioner.identifier
   */
  identifier?: Identifier[];

  /**
   * Practitioner.active
   */
  active?: boolean;

  /**
   * Practitioner.name
   */
  name?: HumanName[];

  /**
   * Practitioner.telecom
   */
  telecom?: ContactPoint[];

  /**
   * Practitioner.address
   */
  address?: Address[];

  /**
   * Practitioner.gender
   */
  gender?: 'male' | 'female' | 'other' | 'unknown';

  /**
   * Practitioner.birthDate
   */
  birthDate?: string;

  /**
   * Practitioner.photo
   */
  photo?: Attachment[];

  /**
   * Practitioner.qualification
   */
  qualification?: PractitionerQualification[];

  /**
   * Practitioner.communication
   */
  communication?: CodeableConcept[];
}

/**
 * FHIR R4 PractitionerQualification
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface PractitionerQualification {

  /**
   * Practitioner.qualification.id
   */
  id?: string;

  /**
   * Practitioner.qualification.extension
   */
  extension?: Extension[];

  /**
   * Practitioner.qualification.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Practitioner.qualification.identifier
   */
  identifier?: Identifier[];

  /**
   * Practitioner.qualification.code
   */
  code: CodeableConcept;

  /**
   * Practitioner.qualification.period
   */
  period?: Period;

  /**
   * Practitioner.qualification.issuer
   */
  issuer?: Reference<Organization>;
}

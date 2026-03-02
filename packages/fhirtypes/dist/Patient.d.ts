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
import { Practitioner } from './Practitioner';
import { PractitionerRole } from './PractitionerRole';
import { Reference } from './Reference';
import { RelatedPerson } from './RelatedPerson';
import { Resource } from './Resource';

/**
 * FHIR R4 Patient
 * @see https://hl7.org/fhir/R4/patient.html
 */
export interface Patient {

  /**
   * This is a Patient resource
   */
  readonly resourceType: 'Patient';

  /**
   * Patient.id
   */
  id?: string;

  /**
   * Patient.meta
   */
  meta?: Meta;

  /**
   * Patient.implicitRules
   */
  implicitRules?: string;

  /**
   * Patient.language
   */
  language?: string;

  /**
   * Patient.text
   */
  text?: Narrative;

  /**
   * Patient.contained
   */
  contained?: Resource[];

  /**
   * Patient.extension
   */
  extension?: Extension[];

  /**
   * Patient.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Patient.identifier
   */
  identifier?: Identifier[];

  /**
   * Patient.active
   */
  active?: boolean;

  /**
   * Patient.name
   */
  name?: HumanName[];

  /**
   * Patient.telecom
   */
  telecom?: ContactPoint[];

  /**
   * Patient.gender
   */
  gender?: 'male' | 'female' | 'other' | 'unknown';

  /**
   * Patient.birthDate
   */
  birthDate?: string;

  /**
   * Patient.deceased[x]
   */
  deceasedBoolean?: boolean;

  /**
   * Patient.deceased[x]
   */
  deceasedDateTime?: string;

  /**
   * Patient.address
   */
  address?: Address[];

  /**
   * Patient.maritalStatus
   */
  maritalStatus?: CodeableConcept;

  /**
   * Patient.multipleBirth[x]
   */
  multipleBirthBoolean?: boolean;

  /**
   * Patient.multipleBirth[x]
   */
  multipleBirthInteger?: number;

  /**
   * Patient.photo
   */
  photo?: Attachment[];

  /**
   * Patient.contact
   */
  contact?: PatientContact[];

  /**
   * Patient.communication
   */
  communication?: PatientCommunication[];

  /**
   * Patient.generalPractitioner
   */
  generalPractitioner?: Reference<Organization | Practitioner | PractitionerRole>[];

  /**
   * Patient.managingOrganization
   */
  managingOrganization?: Reference<Organization>;

  /**
   * Patient.link
   */
  link?: PatientLink[];
}

/**
 * Patient.deceased[x]
 */
export type PatientDeceased = boolean | string;
/**
 * Patient.multipleBirth[x]
 */
export type PatientMultipleBirth = boolean | number;

/**
 * FHIR R4 PatientCommunication
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface PatientCommunication {

  /**
   * Patient.communication.id
   */
  id?: string;

  /**
   * Patient.communication.extension
   */
  extension?: Extension[];

  /**
   * Patient.communication.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Patient.communication.language
   */
  language: CodeableConcept;

  /**
   * Patient.communication.preferred
   */
  preferred?: boolean;
}

/**
 * FHIR R4 PatientContact
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface PatientContact {

  /**
   * Patient.contact.id
   */
  id?: string;

  /**
   * Patient.contact.extension
   */
  extension?: Extension[];

  /**
   * Patient.contact.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Patient.contact.relationship
   */
  relationship?: CodeableConcept[];

  /**
   * Patient.contact.name
   */
  name?: HumanName;

  /**
   * Patient.contact.telecom
   */
  telecom?: ContactPoint[];

  /**
   * Patient.contact.address
   */
  address?: Address;

  /**
   * Patient.contact.gender
   */
  gender?: 'male' | 'female' | 'other' | 'unknown';

  /**
   * Patient.contact.organization
   */
  organization?: Reference<Organization>;

  /**
   * Patient.contact.period
   */
  period?: Period;
}

/**
 * FHIR R4 PatientLink
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface PatientLink {

  /**
   * Patient.link.id
   */
  id?: string;

  /**
   * Patient.link.extension
   */
  extension?: Extension[];

  /**
   * Patient.link.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Patient.link.other
   */
  other: Reference<Patient | RelatedPerson>;

  /**
   * Patient.link.type
   */
  type: 'replaced-by' | 'replaces' | 'refer' | 'seealso';
}

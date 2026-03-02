import { CodeableConcept } from './CodeableConcept';
import { Device } from './Device';
import { Extension } from './Extension';
import { Identifier } from './Identifier';
import { Medication } from './Medication';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { Organization } from './Organization';
import { Patient } from './Patient';
import { Period } from './Period';
import { Practitioner } from './Practitioner';
import { PractitionerRole } from './PractitionerRole';
import { Quantity } from './Quantity';
import { Range } from './Range';
import { Reference } from './Reference';
import { RelatedPerson } from './RelatedPerson';
import { Resource } from './Resource';
import { Substance } from './Substance';

/**
 * FHIR R4 Group
 * @see https://hl7.org/fhir/R4/group.html
 */
export interface Group {

  /**
   * This is a Group resource
   */
  readonly resourceType: 'Group';

  /**
   * Group.id
   */
  id?: string;

  /**
   * Group.meta
   */
  meta?: Meta;

  /**
   * Group.implicitRules
   */
  implicitRules?: string;

  /**
   * Group.language
   */
  language?: string;

  /**
   * Group.text
   */
  text?: Narrative;

  /**
   * Group.contained
   */
  contained?: Resource[];

  /**
   * Group.extension
   */
  extension?: Extension[];

  /**
   * Group.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Group.identifier
   */
  identifier?: Identifier[];

  /**
   * Group.active
   */
  active?: boolean;

  /**
   * Group.type
   */
  type: string;

  /**
   * Group.actual
   */
  actual: boolean;

  /**
   * Group.code
   */
  code?: CodeableConcept;

  /**
   * Group.name
   */
  name?: string;

  /**
   * Group.quantity
   */
  quantity?: number;

  /**
   * Group.managingEntity
   */
  managingEntity?: Reference<Organization | RelatedPerson | Practitioner | PractitionerRole>;

  /**
   * Group.characteristic
   */
  characteristic?: GroupCharacteristic[];

  /**
   * Group.member
   */
  member?: GroupMember[];
}

/**
 * FHIR R4 GroupCharacteristic
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface GroupCharacteristic {

  /**
   * Group.characteristic.id
   */
  id?: string;

  /**
   * Group.characteristic.extension
   */
  extension?: Extension[];

  /**
   * Group.characteristic.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Group.characteristic.code
   */
  code: CodeableConcept;

  /**
   * Group.characteristic.value[x]
   */
  valueCodeableConcept: CodeableConcept;

  /**
   * Group.characteristic.value[x]
   */
  valueBoolean: boolean;

  /**
   * Group.characteristic.value[x]
   */
  valueQuantity: Quantity;

  /**
   * Group.characteristic.value[x]
   */
  valueRange: Range;

  /**
   * Group.characteristic.value[x]
   */
  valueReference: Reference;

  /**
   * Group.characteristic.exclude
   */
  exclude: boolean;

  /**
   * Group.characteristic.period
   */
  period?: Period;
}

/**
 * FHIR R4 GroupMember
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface GroupMember {

  /**
   * Group.member.id
   */
  id?: string;

  /**
   * Group.member.extension
   */
  extension?: Extension[];

  /**
   * Group.member.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Group.member.entity
   */
  entity: Reference<Patient | Practitioner | PractitionerRole | Device | Medication | Substance | Group>;

  /**
   * Group.member.period
   */
  period?: Period;

  /**
   * Group.member.inactive
   */
  inactive?: boolean;
}

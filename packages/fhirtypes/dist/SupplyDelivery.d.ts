import { CodeableConcept } from './CodeableConcept';
import { Contract } from './Contract';
import { Device } from './Device';
import { Extension } from './Extension';
import { Identifier } from './Identifier';
import { Location } from './Location';
import { Medication } from './Medication';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { Organization } from './Organization';
import { Patient } from './Patient';
import { Period } from './Period';
import { Practitioner } from './Practitioner';
import { PractitionerRole } from './PractitionerRole';
import { Quantity } from './Quantity';
import { Reference } from './Reference';
import { Resource } from './Resource';
import { Substance } from './Substance';
import { SupplyRequest } from './SupplyRequest';
import { Timing } from './Timing';

/**
 * FHIR R4 SupplyDelivery
 * @see https://hl7.org/fhir/R4/supplydelivery.html
 */
export interface SupplyDelivery {

  /**
   * This is a SupplyDelivery resource
   */
  readonly resourceType: 'SupplyDelivery';

  /**
   * SupplyDelivery.id
   */
  id?: string;

  /**
   * SupplyDelivery.meta
   */
  meta?: Meta;

  /**
   * SupplyDelivery.implicitRules
   */
  implicitRules?: string;

  /**
   * SupplyDelivery.language
   */
  language?: string;

  /**
   * SupplyDelivery.text
   */
  text?: Narrative;

  /**
   * SupplyDelivery.contained
   */
  contained?: Resource[];

  /**
   * SupplyDelivery.extension
   */
  extension?: Extension[];

  /**
   * SupplyDelivery.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * SupplyDelivery.identifier
   */
  identifier?: Identifier[];

  /**
   * SupplyDelivery.basedOn
   */
  basedOn?: Reference<SupplyRequest>[];

  /**
   * SupplyDelivery.partOf
   */
  partOf?: Reference<SupplyDelivery | Contract>[];

  /**
   * SupplyDelivery.status
   */
  status?: string;

  /**
   * SupplyDelivery.patient
   */
  patient?: Reference<Patient>;

  /**
   * SupplyDelivery.type
   */
  type?: CodeableConcept;

  /**
   * SupplyDelivery.suppliedItem
   */
  suppliedItem?: SupplyDeliverySuppliedItem;

  /**
   * SupplyDelivery.occurrence[x]
   */
  occurrenceDateTime?: string;

  /**
   * SupplyDelivery.occurrence[x]
   */
  occurrencePeriod?: Period;

  /**
   * SupplyDelivery.occurrence[x]
   */
  occurrenceTiming?: Timing;

  /**
   * SupplyDelivery.supplier
   */
  supplier?: Reference<Practitioner | PractitionerRole | Organization>;

  /**
   * SupplyDelivery.destination
   */
  destination?: Reference<Location>;

  /**
   * SupplyDelivery.receiver
   */
  receiver?: Reference<Practitioner | PractitionerRole>[];
}

/**
 * SupplyDelivery.occurrence[x]
 */
export type SupplyDeliveryOccurrence = string | Period | Timing;

/**
 * FHIR R4 SupplyDeliverySuppliedItem
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface SupplyDeliverySuppliedItem {

  /**
   * SupplyDelivery.suppliedItem.id
   */
  id?: string;

  /**
   * SupplyDelivery.suppliedItem.extension
   */
  extension?: Extension[];

  /**
   * SupplyDelivery.suppliedItem.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * SupplyDelivery.suppliedItem.quantity
   */
  quantity?: Quantity;

  /**
   * SupplyDelivery.suppliedItem.item[x]
   */
  itemCodeableConcept?: CodeableConcept;

  /**
   * SupplyDelivery.suppliedItem.item[x]
   */
  itemReference?: Reference<Medication | Substance | Device>;
}

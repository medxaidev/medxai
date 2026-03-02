import { CodeableConcept } from './CodeableConcept';
import { Extension } from './Extension';
import { Identifier } from './Identifier';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { Reference } from './Reference';
import { Resource } from './Resource';
import { Schedule } from './Schedule';

/**
 * FHIR R4 Slot
 * @see https://hl7.org/fhir/R4/slot.html
 */
export interface Slot {

  /**
   * This is a Slot resource
   */
  readonly resourceType: 'Slot';

  /**
   * Slot.id
   */
  id?: string;

  /**
   * Slot.meta
   */
  meta?: Meta;

  /**
   * Slot.implicitRules
   */
  implicitRules?: string;

  /**
   * Slot.language
   */
  language?: string;

  /**
   * Slot.text
   */
  text?: Narrative;

  /**
   * Slot.contained
   */
  contained?: Resource[];

  /**
   * Slot.extension
   */
  extension?: Extension[];

  /**
   * Slot.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Slot.identifier
   */
  identifier?: Identifier[];

  /**
   * Slot.serviceCategory
   */
  serviceCategory?: CodeableConcept[];

  /**
   * Slot.serviceType
   */
  serviceType?: CodeableConcept[];

  /**
   * Slot.specialty
   */
  specialty?: CodeableConcept[];

  /**
   * Slot.appointmentType
   */
  appointmentType?: CodeableConcept;

  /**
   * Slot.schedule
   */
  schedule: Reference<Schedule>;

  /**
   * Slot.status
   */
  status: string;

  /**
   * Slot.start
   */
  start: string;

  /**
   * Slot.end
   */
  end: string;

  /**
   * Slot.overbooked
   */
  overbooked?: boolean;

  /**
   * Slot.comment
   */
  comment?: string;
}

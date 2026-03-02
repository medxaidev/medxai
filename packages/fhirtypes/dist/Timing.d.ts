import { CodeableConcept } from './CodeableConcept';
import { Duration } from './Duration';
import { Extension } from './Extension';
import { Period } from './Period';
import { Range } from './Range';

/**
 * FHIR R4 Timing
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface Timing {

  /**
   * Timing.id
   */
  id?: string;

  /**
   * Timing.extension
   */
  extension?: Extension[];

  /**
   * Timing.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Timing.event
   */
  event?: string[];

  /**
   * Timing.repeat
   */
  repeat?: TimingRepeat;

  /**
   * Timing.code
   */
  code?: CodeableConcept;
}

/**
 * FHIR R4 TimingRepeat
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface TimingRepeat {

  /**
   * Timing.repeat.id
   */
  id?: string;

  /**
   * Timing.repeat.extension
   */
  extension?: Extension[];

  /**
   * Timing.repeat.bounds[x]
   */
  boundsDuration?: Duration;

  /**
   * Timing.repeat.bounds[x]
   */
  boundsRange?: Range;

  /**
   * Timing.repeat.bounds[x]
   */
  boundsPeriod?: Period;

  /**
   * Timing.repeat.count
   */
  count?: number;

  /**
   * Timing.repeat.countMax
   */
  countMax?: number;

  /**
   * Timing.repeat.duration
   */
  duration?: number;

  /**
   * Timing.repeat.durationMax
   */
  durationMax?: number;

  /**
   * Timing.repeat.durationUnit
   */
  durationUnit?: string;

  /**
   * Timing.repeat.frequency
   */
  frequency?: number;

  /**
   * Timing.repeat.frequencyMax
   */
  frequencyMax?: number;

  /**
   * Timing.repeat.period
   */
  period?: number;

  /**
   * Timing.repeat.periodMax
   */
  periodMax?: number;

  /**
   * Timing.repeat.periodUnit
   */
  periodUnit?: string;

  /**
   * Timing.repeat.dayOfWeek
   */
  dayOfWeek?: string[];

  /**
   * Timing.repeat.timeOfDay
   */
  timeOfDay?: string[];

  /**
   * Timing.repeat.when
   */
  when?: string[];

  /**
   * Timing.repeat.offset
   */
  offset?: number;
}

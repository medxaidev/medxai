import { CodeableConcept } from './CodeableConcept';
import { Device } from './Device';
import { Extension } from './Extension';
import { Identifier } from './Identifier';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { Reference } from './Reference';
import { Resource } from './Resource';
import { Timing } from './Timing';

/**
 * FHIR R4 DeviceMetric
 * @see https://hl7.org/fhir/R4/devicemetric.html
 */
export interface DeviceMetric {

  /**
   * This is a DeviceMetric resource
   */
  readonly resourceType: 'DeviceMetric';

  /**
   * DeviceMetric.id
   */
  id?: string;

  /**
   * DeviceMetric.meta
   */
  meta?: Meta;

  /**
   * DeviceMetric.implicitRules
   */
  implicitRules?: string;

  /**
   * DeviceMetric.language
   */
  language?: string;

  /**
   * DeviceMetric.text
   */
  text?: Narrative;

  /**
   * DeviceMetric.contained
   */
  contained?: Resource[];

  /**
   * DeviceMetric.extension
   */
  extension?: Extension[];

  /**
   * DeviceMetric.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * DeviceMetric.identifier
   */
  identifier?: Identifier[];

  /**
   * DeviceMetric.type
   */
  type: CodeableConcept;

  /**
   * DeviceMetric.unit
   */
  unit?: CodeableConcept;

  /**
   * DeviceMetric.source
   */
  source?: Reference<Device>;

  /**
   * DeviceMetric.parent
   */
  parent?: Reference<Device>;

  /**
   * DeviceMetric.operationalStatus
   */
  operationalStatus?: string;

  /**
   * DeviceMetric.color
   */
  color?: string;

  /**
   * DeviceMetric.category
   */
  category: string;

  /**
   * DeviceMetric.measurementPeriod
   */
  measurementPeriod?: Timing;

  /**
   * DeviceMetric.calibration
   */
  calibration?: DeviceMetricCalibration[];
}

/**
 * FHIR R4 DeviceMetricCalibration
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface DeviceMetricCalibration {

  /**
   * DeviceMetric.calibration.id
   */
  id?: string;

  /**
   * DeviceMetric.calibration.extension
   */
  extension?: Extension[];

  /**
   * DeviceMetric.calibration.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * DeviceMetric.calibration.type
   */
  type?: string;

  /**
   * DeviceMetric.calibration.state
   */
  state?: string;

  /**
   * DeviceMetric.calibration.time
   */
  time?: string;
}

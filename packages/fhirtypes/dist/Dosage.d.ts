import { CodeableConcept } from './CodeableConcept';
import { Extension } from './Extension';
import { Quantity } from './Quantity';
import { Range } from './Range';
import { Ratio } from './Ratio';
import { Timing } from './Timing';

/**
 * FHIR R4 Dosage
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface Dosage {

  /**
   * Dosage.id
   */
  id?: string;

  /**
   * Dosage.extension
   */
  extension?: Extension[];

  /**
   * Dosage.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Dosage.sequence
   */
  sequence?: number;

  /**
   * Dosage.text
   */
  text?: string;

  /**
   * Dosage.additionalInstruction
   */
  additionalInstruction?: CodeableConcept[];

  /**
   * Dosage.patientInstruction
   */
  patientInstruction?: string;

  /**
   * Dosage.timing
   */
  timing?: Timing;

  /**
   * Dosage.asNeeded[x]
   */
  asNeededBoolean?: boolean;

  /**
   * Dosage.asNeeded[x]
   */
  asNeededCodeableConcept?: CodeableConcept;

  /**
   * Dosage.site
   */
  site?: CodeableConcept;

  /**
   * Dosage.route
   */
  route?: CodeableConcept;

  /**
   * Dosage.method
   */
  method?: CodeableConcept;

  /**
   * Dosage.doseAndRate
   */
  doseAndRate?: DosageDoseAndRate[];

  /**
   * Dosage.maxDosePerPeriod
   */
  maxDosePerPeriod?: Ratio;

  /**
   * Dosage.maxDosePerAdministration
   */
  maxDosePerAdministration?: Quantity;

  /**
   * Dosage.maxDosePerLifetime
   */
  maxDosePerLifetime?: Quantity;
}

/**
 * Dosage.asNeeded[x]
 */
export type DosageAsNeeded = boolean | CodeableConcept;

/**
 * FHIR R4 DosageDoseAndRate
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface DosageDoseAndRate {

  /**
   * Dosage.doseAndRate.id
   */
  id?: string;

  /**
   * Dosage.doseAndRate.extension
   */
  extension?: Extension[];

  /**
   * Dosage.doseAndRate.type
   */
  type?: CodeableConcept;

  /**
   * Dosage.doseAndRate.dose[x]
   */
  doseRange?: Range;

  /**
   * Dosage.doseAndRate.dose[x]
   */
  doseQuantity?: Quantity;

  /**
   * Dosage.doseAndRate.rate[x]
   */
  rateRatio?: Ratio;

  /**
   * Dosage.doseAndRate.rate[x]
   */
  rateRange?: Range;

  /**
   * Dosage.doseAndRate.rate[x]
   */
  rateQuantity?: Quantity;
}

import { CodeableConcept } from './CodeableConcept';
import { Extension } from './Extension';
import { Medication } from './Medication';
import { MedicinalProduct } from './MedicinalProduct';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { Population } from './Population';
import { Reference } from './Reference';
import { Resource } from './Resource';

/**
 * FHIR R4 MedicinalProductUndesirableEffect
 * @see https://hl7.org/fhir/R4/medicinalproductundesirableeffect.html
 */
export interface MedicinalProductUndesirableEffect {

  /**
   * This is a MedicinalProductUndesirableEffect resource
   */
  readonly resourceType: 'MedicinalProductUndesirableEffect';

  /**
   * MedicinalProductUndesirableEffect.id
   */
  id?: string;

  /**
   * MedicinalProductUndesirableEffect.meta
   */
  meta?: Meta;

  /**
   * MedicinalProductUndesirableEffect.implicitRules
   */
  implicitRules?: string;

  /**
   * MedicinalProductUndesirableEffect.language
   */
  language?: string;

  /**
   * MedicinalProductUndesirableEffect.text
   */
  text?: Narrative;

  /**
   * MedicinalProductUndesirableEffect.contained
   */
  contained?: Resource[];

  /**
   * MedicinalProductUndesirableEffect.extension
   */
  extension?: Extension[];

  /**
   * MedicinalProductUndesirableEffect.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * MedicinalProductUndesirableEffect.subject
   */
  subject?: Reference<MedicinalProduct | Medication>[];

  /**
   * MedicinalProductUndesirableEffect.symptomConditionEffect
   */
  symptomConditionEffect?: CodeableConcept;

  /**
   * MedicinalProductUndesirableEffect.classification
   */
  classification?: CodeableConcept;

  /**
   * MedicinalProductUndesirableEffect.frequencyOfOccurrence
   */
  frequencyOfOccurrence?: CodeableConcept;

  /**
   * MedicinalProductUndesirableEffect.population
   */
  population?: Population[];
}

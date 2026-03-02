import { CodeableConcept } from './CodeableConcept';
import { Extension } from './Extension';
import { Identifier } from './Identifier';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { Organization } from './Organization';
import { Ratio } from './Ratio';
import { Reference } from './Reference';
import { Resource } from './Resource';
import { Substance } from './Substance';

/**
 * FHIR R4 Medication
 * @see https://hl7.org/fhir/R4/medication.html
 */
export interface Medication {

  /**
   * This is a Medication resource
   */
  readonly resourceType: 'Medication';

  /**
   * Medication.id
   */
  id?: string;

  /**
   * Medication.meta
   */
  meta?: Meta;

  /**
   * Medication.implicitRules
   */
  implicitRules?: string;

  /**
   * Medication.language
   */
  language?: string;

  /**
   * Medication.text
   */
  text?: Narrative;

  /**
   * Medication.contained
   */
  contained?: Resource[];

  /**
   * Medication.extension
   */
  extension?: Extension[];

  /**
   * Medication.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Medication.identifier
   */
  identifier?: Identifier[];

  /**
   * Medication.code
   */
  code?: CodeableConcept;

  /**
   * Medication.status
   */
  status?: string;

  /**
   * Medication.manufacturer
   */
  manufacturer?: Reference<Organization>;

  /**
   * Medication.form
   */
  form?: CodeableConcept;

  /**
   * Medication.amount
   */
  amount?: Ratio;

  /**
   * Medication.ingredient
   */
  ingredient?: MedicationIngredient[];

  /**
   * Medication.batch
   */
  batch?: MedicationBatch;
}

/**
 * FHIR R4 MedicationBatch
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface MedicationBatch {

  /**
   * Medication.batch.id
   */
  id?: string;

  /**
   * Medication.batch.extension
   */
  extension?: Extension[];

  /**
   * Medication.batch.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Medication.batch.lotNumber
   */
  lotNumber?: string;

  /**
   * Medication.batch.expirationDate
   */
  expirationDate?: string;
}

/**
 * FHIR R4 MedicationIngredient
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface MedicationIngredient {

  /**
   * Medication.ingredient.id
   */
  id?: string;

  /**
   * Medication.ingredient.extension
   */
  extension?: Extension[];

  /**
   * Medication.ingredient.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Medication.ingredient.item[x]
   */
  itemCodeableConcept: CodeableConcept;

  /**
   * Medication.ingredient.item[x]
   */
  itemReference: Reference<Substance | Medication>;

  /**
   * Medication.ingredient.isActive
   */
  isActive?: boolean;

  /**
   * Medication.ingredient.strength
   */
  strength?: Ratio;
}

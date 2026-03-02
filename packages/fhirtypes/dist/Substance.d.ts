import { CodeableConcept } from './CodeableConcept';
import { Extension } from './Extension';
import { Identifier } from './Identifier';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { Quantity } from './Quantity';
import { Ratio } from './Ratio';
import { Reference } from './Reference';
import { Resource } from './Resource';

/**
 * FHIR R4 Substance
 * @see https://hl7.org/fhir/R4/substance.html
 */
export interface Substance {

  /**
   * This is a Substance resource
   */
  readonly resourceType: 'Substance';

  /**
   * Substance.id
   */
  id?: string;

  /**
   * Substance.meta
   */
  meta?: Meta;

  /**
   * Substance.implicitRules
   */
  implicitRules?: string;

  /**
   * Substance.language
   */
  language?: string;

  /**
   * Substance.text
   */
  text?: Narrative;

  /**
   * Substance.contained
   */
  contained?: Resource[];

  /**
   * Substance.extension
   */
  extension?: Extension[];

  /**
   * Substance.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Substance.identifier
   */
  identifier?: Identifier[];

  /**
   * Substance.status
   */
  status?: string;

  /**
   * Substance.category
   */
  category?: CodeableConcept[];

  /**
   * Substance.code
   */
  code: CodeableConcept;

  /**
   * Substance.description
   */
  description?: string;

  /**
   * Substance.instance
   */
  instance?: SubstanceInstance[];

  /**
   * Substance.ingredient
   */
  ingredient?: SubstanceIngredient[];
}

/**
 * FHIR R4 SubstanceIngredient
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface SubstanceIngredient {

  /**
   * Substance.ingredient.id
   */
  id?: string;

  /**
   * Substance.ingredient.extension
   */
  extension?: Extension[];

  /**
   * Substance.ingredient.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Substance.ingredient.quantity
   */
  quantity?: Ratio;

  /**
   * Substance.ingredient.substance[x]
   */
  substanceCodeableConcept: CodeableConcept;

  /**
   * Substance.ingredient.substance[x]
   */
  substanceReference: Reference<Substance>;
}

/**
 * FHIR R4 SubstanceInstance
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface SubstanceInstance {

  /**
   * Substance.instance.id
   */
  id?: string;

  /**
   * Substance.instance.extension
   */
  extension?: Extension[];

  /**
   * Substance.instance.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Substance.instance.identifier
   */
  identifier?: Identifier;

  /**
   * Substance.instance.expiry
   */
  expiry?: string;

  /**
   * Substance.instance.quantity
   */
  quantity?: Quantity;
}

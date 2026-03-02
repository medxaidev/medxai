import { CodeableConcept } from './CodeableConcept';
import { Extension } from './Extension';
import { Identifier } from './Identifier';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { Organization } from './Organization';
import { Ratio } from './Ratio';
import { Reference } from './Reference';
import { Resource } from './Resource';

/**
 * FHIR R4 MedicinalProductIngredient
 * @see https://hl7.org/fhir/R4/medicinalproductingredient.html
 */
export interface MedicinalProductIngredient {

  /**
   * This is a MedicinalProductIngredient resource
   */
  readonly resourceType: 'MedicinalProductIngredient';

  /**
   * MedicinalProductIngredient.id
   */
  id?: string;

  /**
   * MedicinalProductIngredient.meta
   */
  meta?: Meta;

  /**
   * MedicinalProductIngredient.implicitRules
   */
  implicitRules?: string;

  /**
   * MedicinalProductIngredient.language
   */
  language?: string;

  /**
   * MedicinalProductIngredient.text
   */
  text?: Narrative;

  /**
   * MedicinalProductIngredient.contained
   */
  contained?: Resource[];

  /**
   * MedicinalProductIngredient.extension
   */
  extension?: Extension[];

  /**
   * MedicinalProductIngredient.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * MedicinalProductIngredient.identifier
   */
  identifier?: Identifier;

  /**
   * MedicinalProductIngredient.role
   */
  role: CodeableConcept;

  /**
   * MedicinalProductIngredient.allergenicIndicator
   */
  allergenicIndicator?: boolean;

  /**
   * MedicinalProductIngredient.manufacturer
   */
  manufacturer?: Reference<Organization>[];

  /**
   * MedicinalProductIngredient.specifiedSubstance
   */
  specifiedSubstance?: MedicinalProductIngredientSpecifiedSubstance[];

  /**
   * MedicinalProductIngredient.substance
   */
  substance?: MedicinalProductIngredientSubstance;
}

/**
 * FHIR R4 MedicinalProductIngredientSpecifiedSubstance
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface MedicinalProductIngredientSpecifiedSubstance {

  /**
   * MedicinalProductIngredient.specifiedSubstance.id
   */
  id?: string;

  /**
   * MedicinalProductIngredient.specifiedSubstance.extension
   */
  extension?: Extension[];

  /**
   * MedicinalProductIngredient.specifiedSubstance.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * MedicinalProductIngredient.specifiedSubstance.code
   */
  code: CodeableConcept;

  /**
   * MedicinalProductIngredient.specifiedSubstance.group
   */
  group: CodeableConcept;

  /**
   * MedicinalProductIngredient.specifiedSubstance.confidentiality
   */
  confidentiality?: CodeableConcept;

  /**
   * MedicinalProductIngredient.specifiedSubstance.strength
   */
  strength?: MedicinalProductIngredientSpecifiedSubstanceStrength[];
}

/**
 * FHIR R4 MedicinalProductIngredientSpecifiedSubstanceStrength
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface MedicinalProductIngredientSpecifiedSubstanceStrength {

  /**
   * MedicinalProductIngredient.specifiedSubstance.strength.id
   */
  id?: string;

  /**
   * MedicinalProductIngredient.specifiedSubstance.strength.extension
   */
  extension?: Extension[];

  /**
   * MedicinalProductIngredient.specifiedSubstance.strength.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * MedicinalProductIngredient.specifiedSubstance.strength.presentation
   */
  presentation: Ratio;

  /**
   * MedicinalProductIngredient.specifiedSubstance.strength.presentationLowLimit
   */
  presentationLowLimit?: Ratio;

  /**
   * MedicinalProductIngredient.specifiedSubstance.strength.concentration
   */
  concentration?: Ratio;

  /**
   * MedicinalProductIngredient.specifiedSubstance.strength.concentrationLowLimit
   */
  concentrationLowLimit?: Ratio;

  /**
   * MedicinalProductIngredient.specifiedSubstance.strength.measurementPoint
   */
  measurementPoint?: string;

  /**
   * MedicinalProductIngredient.specifiedSubstance.strength.country
   */
  country?: CodeableConcept[];

  /**
   * MedicinalProductIngredient.specifiedSubstance.strength.referenceStrength
   */
  referenceStrength?: MedicinalProductIngredientSpecifiedSubstanceStrengthReferenceStrength[];
}

/**
 * FHIR R4 MedicinalProductIngredientSpecifiedSubstanceStrengthReferenceStrength
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface MedicinalProductIngredientSpecifiedSubstanceStrengthReferenceStrength {

  /**
   * MedicinalProductIngredient.specifiedSubstance.strength.referenceStrength.id
   */
  id?: string;

  /**
   * MedicinalProductIngredient.specifiedSubstance.strength.referenceStrength.extension
   */
  extension?: Extension[];

  /**
   * MedicinalProductIngredient.specifiedSubstance.strength.referenceStrength.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * MedicinalProductIngredient.specifiedSubstance.strength.referenceStrength.substance
   */
  substance?: CodeableConcept;

  /**
   * MedicinalProductIngredient.specifiedSubstance.strength.referenceStrength.strength
   */
  strength: Ratio;

  /**
   * MedicinalProductIngredient.specifiedSubstance.strength.referenceStrength.strengthLowLimit
   */
  strengthLowLimit?: Ratio;

  /**
   * MedicinalProductIngredient.specifiedSubstance.strength.referenceStrength.measurementPoint
   */
  measurementPoint?: string;

  /**
   * MedicinalProductIngredient.specifiedSubstance.strength.referenceStrength.country
   */
  country?: CodeableConcept[];
}

/**
 * FHIR R4 MedicinalProductIngredientSubstance
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface MedicinalProductIngredientSubstance {

  /**
   * MedicinalProductIngredient.substance.id
   */
  id?: string;

  /**
   * MedicinalProductIngredient.substance.extension
   */
  extension?: Extension[];

  /**
   * MedicinalProductIngredient.substance.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * MedicinalProductIngredient.substance.code
   */
  code: CodeableConcept;
}

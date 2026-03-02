import { AllergyIntolerance } from './AllergyIntolerance';
import { Annotation } from './Annotation';
import { CodeableConcept } from './CodeableConcept';
import { Encounter } from './Encounter';
import { Extension } from './Extension';
import { Identifier } from './Identifier';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { Patient } from './Patient';
import { Practitioner } from './Practitioner';
import { PractitionerRole } from './PractitionerRole';
import { Quantity } from './Quantity';
import { Ratio } from './Ratio';
import { Reference } from './Reference';
import { Resource } from './Resource';
import { Timing } from './Timing';

/**
 * FHIR R4 NutritionOrder
 * @see https://hl7.org/fhir/R4/nutritionorder.html
 */
export interface NutritionOrder {

  /**
   * This is a NutritionOrder resource
   */
  readonly resourceType: 'NutritionOrder';

  /**
   * NutritionOrder.id
   */
  id?: string;

  /**
   * NutritionOrder.meta
   */
  meta?: Meta;

  /**
   * NutritionOrder.implicitRules
   */
  implicitRules?: string;

  /**
   * NutritionOrder.language
   */
  language?: string;

  /**
   * NutritionOrder.text
   */
  text?: Narrative;

  /**
   * NutritionOrder.contained
   */
  contained?: Resource[];

  /**
   * NutritionOrder.extension
   */
  extension?: Extension[];

  /**
   * NutritionOrder.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * NutritionOrder.identifier
   */
  identifier?: Identifier[];

  /**
   * NutritionOrder.instantiatesCanonical
   */
  instantiatesCanonical?: string[];

  /**
   * NutritionOrder.instantiatesUri
   */
  instantiatesUri?: string[];

  /**
   * NutritionOrder.instantiates
   */
  instantiates?: string[];

  /**
   * NutritionOrder.status
   */
  status: 'draft' | 'active' | 'on-hold' | 'revoked' | 'completed' | 'entered-in-error' | 'unknown';

  /**
   * NutritionOrder.intent
   */
  intent: 'proposal' | 'plan' | 'directive' | 'order' | 'original-order' | 'reflex-order' | 'filler-order' | 'instance-order' | 'option';

  /**
   * NutritionOrder.patient
   */
  patient: Reference<Patient>;

  /**
   * NutritionOrder.encounter
   */
  encounter?: Reference<Encounter>;

  /**
   * NutritionOrder.dateTime
   */
  dateTime: string;

  /**
   * NutritionOrder.orderer
   */
  orderer?: Reference<Practitioner | PractitionerRole>;

  /**
   * NutritionOrder.allergyIntolerance
   */
  allergyIntolerance?: Reference<AllergyIntolerance>[];

  /**
   * NutritionOrder.foodPreferenceModifier
   */
  foodPreferenceModifier?: CodeableConcept[];

  /**
   * NutritionOrder.excludeFoodModifier
   */
  excludeFoodModifier?: CodeableConcept[];

  /**
   * NutritionOrder.oralDiet
   */
  oralDiet?: NutritionOrderOralDiet;

  /**
   * NutritionOrder.supplement
   */
  supplement?: NutritionOrderSupplement[];

  /**
   * NutritionOrder.enteralFormula
   */
  enteralFormula?: NutritionOrderEnteralFormula;

  /**
   * NutritionOrder.note
   */
  note?: Annotation[];
}

/**
 * FHIR R4 NutritionOrderEnteralFormula
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface NutritionOrderEnteralFormula {

  /**
   * NutritionOrder.enteralFormula.id
   */
  id?: string;

  /**
   * NutritionOrder.enteralFormula.extension
   */
  extension?: Extension[];

  /**
   * NutritionOrder.enteralFormula.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * NutritionOrder.enteralFormula.baseFormulaType
   */
  baseFormulaType?: CodeableConcept;

  /**
   * NutritionOrder.enteralFormula.baseFormulaProductName
   */
  baseFormulaProductName?: string;

  /**
   * NutritionOrder.enteralFormula.additiveType
   */
  additiveType?: CodeableConcept;

  /**
   * NutritionOrder.enteralFormula.additiveProductName
   */
  additiveProductName?: string;

  /**
   * NutritionOrder.enteralFormula.caloricDensity
   */
  caloricDensity?: Quantity;

  /**
   * NutritionOrder.enteralFormula.routeofAdministration
   */
  routeofAdministration?: CodeableConcept;

  /**
   * NutritionOrder.enteralFormula.administration
   */
  administration?: NutritionOrderEnteralFormulaAdministration[];

  /**
   * NutritionOrder.enteralFormula.maxVolumeToDeliver
   */
  maxVolumeToDeliver?: Quantity;

  /**
   * NutritionOrder.enteralFormula.administrationInstruction
   */
  administrationInstruction?: string;
}

/**
 * FHIR R4 NutritionOrderEnteralFormulaAdministration
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface NutritionOrderEnteralFormulaAdministration {

  /**
   * NutritionOrder.enteralFormula.administration.id
   */
  id?: string;

  /**
   * NutritionOrder.enteralFormula.administration.extension
   */
  extension?: Extension[];

  /**
   * NutritionOrder.enteralFormula.administration.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * NutritionOrder.enteralFormula.administration.schedule
   */
  schedule?: Timing;

  /**
   * NutritionOrder.enteralFormula.administration.quantity
   */
  quantity?: Quantity;

  /**
   * NutritionOrder.enteralFormula.administration.rate[x]
   */
  rateQuantity?: Quantity;

  /**
   * NutritionOrder.enteralFormula.administration.rate[x]
   */
  rateRatio?: Ratio;
}

/**
 * FHIR R4 NutritionOrderOralDiet
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface NutritionOrderOralDiet {

  /**
   * NutritionOrder.oralDiet.id
   */
  id?: string;

  /**
   * NutritionOrder.oralDiet.extension
   */
  extension?: Extension[];

  /**
   * NutritionOrder.oralDiet.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * NutritionOrder.oralDiet.type
   */
  type?: CodeableConcept[];

  /**
   * NutritionOrder.oralDiet.schedule
   */
  schedule?: Timing[];

  /**
   * NutritionOrder.oralDiet.nutrient
   */
  nutrient?: NutritionOrderOralDietNutrient[];

  /**
   * NutritionOrder.oralDiet.texture
   */
  texture?: NutritionOrderOralDietTexture[];

  /**
   * NutritionOrder.oralDiet.fluidConsistencyType
   */
  fluidConsistencyType?: CodeableConcept[];

  /**
   * NutritionOrder.oralDiet.instruction
   */
  instruction?: string;
}

/**
 * FHIR R4 NutritionOrderOralDietNutrient
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface NutritionOrderOralDietNutrient {

  /**
   * NutritionOrder.oralDiet.nutrient.id
   */
  id?: string;

  /**
   * NutritionOrder.oralDiet.nutrient.extension
   */
  extension?: Extension[];

  /**
   * NutritionOrder.oralDiet.nutrient.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * NutritionOrder.oralDiet.nutrient.modifier
   */
  modifier?: CodeableConcept;

  /**
   * NutritionOrder.oralDiet.nutrient.amount
   */
  amount?: Quantity;
}

/**
 * FHIR R4 NutritionOrderOralDietTexture
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface NutritionOrderOralDietTexture {

  /**
   * NutritionOrder.oralDiet.texture.id
   */
  id?: string;

  /**
   * NutritionOrder.oralDiet.texture.extension
   */
  extension?: Extension[];

  /**
   * NutritionOrder.oralDiet.texture.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * NutritionOrder.oralDiet.texture.modifier
   */
  modifier?: CodeableConcept;

  /**
   * NutritionOrder.oralDiet.texture.foodType
   */
  foodType?: CodeableConcept;
}

/**
 * FHIR R4 NutritionOrderSupplement
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface NutritionOrderSupplement {

  /**
   * NutritionOrder.supplement.id
   */
  id?: string;

  /**
   * NutritionOrder.supplement.extension
   */
  extension?: Extension[];

  /**
   * NutritionOrder.supplement.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * NutritionOrder.supplement.type
   */
  type?: CodeableConcept;

  /**
   * NutritionOrder.supplement.productName
   */
  productName?: string;

  /**
   * NutritionOrder.supplement.schedule
   */
  schedule?: Timing[];

  /**
   * NutritionOrder.supplement.quantity
   */
  quantity?: Quantity;

  /**
   * NutritionOrder.supplement.instruction
   */
  instruction?: string;
}

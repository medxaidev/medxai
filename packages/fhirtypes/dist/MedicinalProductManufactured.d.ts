import { CodeableConcept } from './CodeableConcept';
import { Extension } from './Extension';
import { MedicinalProductIngredient } from './MedicinalProductIngredient';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { Organization } from './Organization';
import { ProdCharacteristic } from './ProdCharacteristic';
import { Quantity } from './Quantity';
import { Reference } from './Reference';
import { Resource } from './Resource';

/**
 * FHIR R4 MedicinalProductManufactured
 * @see https://hl7.org/fhir/R4/medicinalproductmanufactured.html
 */
export interface MedicinalProductManufactured {

  /**
   * This is a MedicinalProductManufactured resource
   */
  readonly resourceType: 'MedicinalProductManufactured';

  /**
   * MedicinalProductManufactured.id
   */
  id?: string;

  /**
   * MedicinalProductManufactured.meta
   */
  meta?: Meta;

  /**
   * MedicinalProductManufactured.implicitRules
   */
  implicitRules?: string;

  /**
   * MedicinalProductManufactured.language
   */
  language?: string;

  /**
   * MedicinalProductManufactured.text
   */
  text?: Narrative;

  /**
   * MedicinalProductManufactured.contained
   */
  contained?: Resource[];

  /**
   * MedicinalProductManufactured.extension
   */
  extension?: Extension[];

  /**
   * MedicinalProductManufactured.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * MedicinalProductManufactured.manufacturedDoseForm
   */
  manufacturedDoseForm: CodeableConcept;

  /**
   * MedicinalProductManufactured.unitOfPresentation
   */
  unitOfPresentation?: CodeableConcept;

  /**
   * MedicinalProductManufactured.quantity
   */
  quantity: Quantity;

  /**
   * MedicinalProductManufactured.manufacturer
   */
  manufacturer?: Reference<Organization>[];

  /**
   * MedicinalProductManufactured.ingredient
   */
  ingredient?: Reference<MedicinalProductIngredient>[];

  /**
   * MedicinalProductManufactured.physicalCharacteristics
   */
  physicalCharacteristics?: ProdCharacteristic;

  /**
   * MedicinalProductManufactured.otherCharacteristics
   */
  otherCharacteristics?: CodeableConcept[];
}

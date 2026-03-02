import { CodeableConcept } from './CodeableConcept';
import { Extension } from './Extension';
import { Quantity } from './Quantity';
import { Range } from './Range';

/**
 * FHIR R4 SubstanceAmount
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface SubstanceAmount {

  /**
   * SubstanceAmount.id
   */
  id?: string;

  /**
   * SubstanceAmount.extension
   */
  extension?: Extension[];

  /**
   * SubstanceAmount.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * SubstanceAmount.amount[x]
   */
  amountQuantity?: Quantity;

  /**
   * SubstanceAmount.amount[x]
   */
  amountRange?: Range;

  /**
   * SubstanceAmount.amount[x]
   */
  amountString?: string;

  /**
   * SubstanceAmount.amountType
   */
  amountType?: CodeableConcept;

  /**
   * SubstanceAmount.amountText
   */
  amountText?: string;

  /**
   * SubstanceAmount.referenceRange
   */
  referenceRange?: SubstanceAmountReferenceRange;
}

/**
 * SubstanceAmount.amount[x]
 */
export type SubstanceAmountAmount = Quantity | Range | string;

/**
 * FHIR R4 SubstanceAmountReferenceRange
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface SubstanceAmountReferenceRange {

  /**
   * SubstanceAmount.referenceRange.id
   */
  id?: string;

  /**
   * SubstanceAmount.referenceRange.extension
   */
  extension?: Extension[];

  /**
   * SubstanceAmount.referenceRange.lowLimit
   */
  lowLimit?: Quantity;

  /**
   * SubstanceAmount.referenceRange.highLimit
   */
  highLimit?: Quantity;
}

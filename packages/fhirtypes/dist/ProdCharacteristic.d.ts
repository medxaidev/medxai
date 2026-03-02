import { Attachment } from './Attachment';
import { CodeableConcept } from './CodeableConcept';
import { Extension } from './Extension';
import { Quantity } from './Quantity';

/**
 * FHIR R4 ProdCharacteristic
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ProdCharacteristic {

  /**
   * ProdCharacteristic.id
   */
  id?: string;

  /**
   * ProdCharacteristic.extension
   */
  extension?: Extension[];

  /**
   * ProdCharacteristic.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * ProdCharacteristic.height
   */
  height?: Quantity;

  /**
   * ProdCharacteristic.width
   */
  width?: Quantity;

  /**
   * ProdCharacteristic.depth
   */
  depth?: Quantity;

  /**
   * ProdCharacteristic.weight
   */
  weight?: Quantity;

  /**
   * ProdCharacteristic.nominalVolume
   */
  nominalVolume?: Quantity;

  /**
   * ProdCharacteristic.externalDiameter
   */
  externalDiameter?: Quantity;

  /**
   * ProdCharacteristic.shape
   */
  shape?: string;

  /**
   * ProdCharacteristic.color
   */
  color?: string[];

  /**
   * ProdCharacteristic.imprint
   */
  imprint?: string[];

  /**
   * ProdCharacteristic.image
   */
  image?: Attachment[];

  /**
   * ProdCharacteristic.scoring
   */
  scoring?: CodeableConcept;
}

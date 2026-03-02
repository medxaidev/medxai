import { CodeableConcept } from './CodeableConcept';
import { DeviceDefinition } from './DeviceDefinition';
import { Extension } from './Extension';
import { Identifier } from './Identifier';
import { MarketingStatus } from './MarketingStatus';
import { MedicinalProduct } from './MedicinalProduct';
import { MedicinalProductAuthorization } from './MedicinalProductAuthorization';
import { MedicinalProductManufactured } from './MedicinalProductManufactured';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { Organization } from './Organization';
import { ProdCharacteristic } from './ProdCharacteristic';
import { ProductShelfLife } from './ProductShelfLife';
import { Quantity } from './Quantity';
import { Reference } from './Reference';
import { Resource } from './Resource';

/**
 * FHIR R4 MedicinalProductPackaged
 * @see https://hl7.org/fhir/R4/medicinalproductpackaged.html
 */
export interface MedicinalProductPackaged {

  /**
   * This is a MedicinalProductPackaged resource
   */
  readonly resourceType: 'MedicinalProductPackaged';

  /**
   * MedicinalProductPackaged.id
   */
  id?: string;

  /**
   * MedicinalProductPackaged.meta
   */
  meta?: Meta;

  /**
   * MedicinalProductPackaged.implicitRules
   */
  implicitRules?: string;

  /**
   * MedicinalProductPackaged.language
   */
  language?: string;

  /**
   * MedicinalProductPackaged.text
   */
  text?: Narrative;

  /**
   * MedicinalProductPackaged.contained
   */
  contained?: Resource[];

  /**
   * MedicinalProductPackaged.extension
   */
  extension?: Extension[];

  /**
   * MedicinalProductPackaged.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * MedicinalProductPackaged.identifier
   */
  identifier?: Identifier[];

  /**
   * MedicinalProductPackaged.subject
   */
  subject?: Reference<MedicinalProduct>[];

  /**
   * MedicinalProductPackaged.description
   */
  description?: string;

  /**
   * MedicinalProductPackaged.legalStatusOfSupply
   */
  legalStatusOfSupply?: CodeableConcept;

  /**
   * MedicinalProductPackaged.marketingStatus
   */
  marketingStatus?: MarketingStatus[];

  /**
   * MedicinalProductPackaged.marketingAuthorization
   */
  marketingAuthorization?: Reference<MedicinalProductAuthorization>;

  /**
   * MedicinalProductPackaged.manufacturer
   */
  manufacturer?: Reference<Organization>[];

  /**
   * MedicinalProductPackaged.batchIdentifier
   */
  batchIdentifier?: MedicinalProductPackagedBatchIdentifier[];

  /**
   * MedicinalProductPackaged.packageItem
   */
  packageItem: MedicinalProductPackagedPackageItem[];
}

/**
 * FHIR R4 MedicinalProductPackagedBatchIdentifier
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface MedicinalProductPackagedBatchIdentifier {

  /**
   * MedicinalProductPackaged.batchIdentifier.id
   */
  id?: string;

  /**
   * MedicinalProductPackaged.batchIdentifier.extension
   */
  extension?: Extension[];

  /**
   * MedicinalProductPackaged.batchIdentifier.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * MedicinalProductPackaged.batchIdentifier.outerPackaging
   */
  outerPackaging: Identifier;

  /**
   * MedicinalProductPackaged.batchIdentifier.immediatePackaging
   */
  immediatePackaging?: Identifier;
}

/**
 * FHIR R4 MedicinalProductPackagedPackageItem
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface MedicinalProductPackagedPackageItem {

  /**
   * MedicinalProductPackaged.packageItem.id
   */
  id?: string;

  /**
   * MedicinalProductPackaged.packageItem.extension
   */
  extension?: Extension[];

  /**
   * MedicinalProductPackaged.packageItem.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * MedicinalProductPackaged.packageItem.identifier
   */
  identifier?: Identifier[];

  /**
   * MedicinalProductPackaged.packageItem.type
   */
  type: CodeableConcept;

  /**
   * MedicinalProductPackaged.packageItem.quantity
   */
  quantity: Quantity;

  /**
   * MedicinalProductPackaged.packageItem.material
   */
  material?: CodeableConcept[];

  /**
   * MedicinalProductPackaged.packageItem.alternateMaterial
   */
  alternateMaterial?: CodeableConcept[];

  /**
   * MedicinalProductPackaged.packageItem.device
   */
  device?: Reference<DeviceDefinition>[];

  /**
   * MedicinalProductPackaged.packageItem.manufacturedItem
   */
  manufacturedItem?: Reference<MedicinalProductManufactured>[];

  /**
   * MedicinalProductPackaged.packageItem.physicalCharacteristics
   */
  physicalCharacteristics?: ProdCharacteristic;

  /**
   * MedicinalProductPackaged.packageItem.otherCharacteristics
   */
  otherCharacteristics?: CodeableConcept[];

  /**
   * MedicinalProductPackaged.packageItem.shelfLifeStorage
   */
  shelfLifeStorage?: ProductShelfLife[];

  /**
   * MedicinalProductPackaged.packageItem.manufacturer
   */
  manufacturer?: Reference<Organization>[];
}

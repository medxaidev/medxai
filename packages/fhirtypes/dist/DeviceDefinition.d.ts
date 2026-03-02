import { Annotation } from './Annotation';
import { CodeableConcept } from './CodeableConcept';
import { ContactPoint } from './ContactPoint';
import { Extension } from './Extension';
import { Identifier } from './Identifier';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { Organization } from './Organization';
import { ProdCharacteristic } from './ProdCharacteristic';
import { ProductShelfLife } from './ProductShelfLife';
import { Quantity } from './Quantity';
import { Reference } from './Reference';
import { Resource } from './Resource';

/**
 * FHIR R4 DeviceDefinition
 * @see https://hl7.org/fhir/R4/devicedefinition.html
 */
export interface DeviceDefinition {

  /**
   * This is a DeviceDefinition resource
   */
  readonly resourceType: 'DeviceDefinition';

  /**
   * DeviceDefinition.id
   */
  id?: string;

  /**
   * DeviceDefinition.meta
   */
  meta?: Meta;

  /**
   * DeviceDefinition.implicitRules
   */
  implicitRules?: string;

  /**
   * DeviceDefinition.language
   */
  language?: string;

  /**
   * DeviceDefinition.text
   */
  text?: Narrative;

  /**
   * DeviceDefinition.contained
   */
  contained?: Resource[];

  /**
   * DeviceDefinition.extension
   */
  extension?: Extension[];

  /**
   * DeviceDefinition.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * DeviceDefinition.identifier
   */
  identifier?: Identifier[];

  /**
   * DeviceDefinition.udiDeviceIdentifier
   */
  udiDeviceIdentifier?: DeviceDefinitionUdiDeviceIdentifier[];

  /**
   * DeviceDefinition.manufacturer[x]
   */
  manufacturerString?: string;

  /**
   * DeviceDefinition.manufacturer[x]
   */
  manufacturerReference?: Reference<Organization>;

  /**
   * DeviceDefinition.deviceName
   */
  deviceName?: DeviceDefinitionDeviceName[];

  /**
   * DeviceDefinition.modelNumber
   */
  modelNumber?: string;

  /**
   * DeviceDefinition.type
   */
  type?: CodeableConcept;

  /**
   * DeviceDefinition.specialization
   */
  specialization?: DeviceDefinitionSpecialization[];

  /**
   * DeviceDefinition.version
   */
  version?: string[];

  /**
   * DeviceDefinition.safety
   */
  safety?: CodeableConcept[];

  /**
   * DeviceDefinition.shelfLifeStorage
   */
  shelfLifeStorage?: ProductShelfLife[];

  /**
   * DeviceDefinition.physicalCharacteristics
   */
  physicalCharacteristics?: ProdCharacteristic;

  /**
   * DeviceDefinition.languageCode
   */
  languageCode?: CodeableConcept[];

  /**
   * DeviceDefinition.capability
   */
  capability?: DeviceDefinitionCapability[];

  /**
   * DeviceDefinition.property
   */
  property?: DeviceDefinitionProperty[];

  /**
   * DeviceDefinition.owner
   */
  owner?: Reference<Organization>;

  /**
   * DeviceDefinition.contact
   */
  contact?: ContactPoint[];

  /**
   * DeviceDefinition.url
   */
  url?: string;

  /**
   * DeviceDefinition.onlineInformation
   */
  onlineInformation?: string;

  /**
   * DeviceDefinition.note
   */
  note?: Annotation[];

  /**
   * DeviceDefinition.quantity
   */
  quantity?: Quantity;

  /**
   * DeviceDefinition.parentDevice
   */
  parentDevice?: Reference<DeviceDefinition>;

  /**
   * DeviceDefinition.material
   */
  material?: DeviceDefinitionMaterial[];
}

/**
 * DeviceDefinition.manufacturer[x]
 */
export type DeviceDefinitionManufacturer = string | Reference<Organization>;

/**
 * FHIR R4 DeviceDefinitionCapability
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface DeviceDefinitionCapability {

  /**
   * DeviceDefinition.capability.id
   */
  id?: string;

  /**
   * DeviceDefinition.capability.extension
   */
  extension?: Extension[];

  /**
   * DeviceDefinition.capability.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * DeviceDefinition.capability.type
   */
  type: CodeableConcept;

  /**
   * DeviceDefinition.capability.description
   */
  description?: CodeableConcept[];
}

/**
 * FHIR R4 DeviceDefinitionDeviceName
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface DeviceDefinitionDeviceName {

  /**
   * DeviceDefinition.deviceName.id
   */
  id?: string;

  /**
   * DeviceDefinition.deviceName.extension
   */
  extension?: Extension[];

  /**
   * DeviceDefinition.deviceName.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * DeviceDefinition.deviceName.name
   */
  name: string;

  /**
   * DeviceDefinition.deviceName.type
   */
  type: string;
}

/**
 * FHIR R4 DeviceDefinitionMaterial
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface DeviceDefinitionMaterial {

  /**
   * DeviceDefinition.material.id
   */
  id?: string;

  /**
   * DeviceDefinition.material.extension
   */
  extension?: Extension[];

  /**
   * DeviceDefinition.material.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * DeviceDefinition.material.substance
   */
  substance: CodeableConcept;

  /**
   * DeviceDefinition.material.alternate
   */
  alternate?: boolean;

  /**
   * DeviceDefinition.material.allergenicIndicator
   */
  allergenicIndicator?: boolean;
}

/**
 * FHIR R4 DeviceDefinitionProperty
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface DeviceDefinitionProperty {

  /**
   * DeviceDefinition.property.id
   */
  id?: string;

  /**
   * DeviceDefinition.property.extension
   */
  extension?: Extension[];

  /**
   * DeviceDefinition.property.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * DeviceDefinition.property.type
   */
  type: CodeableConcept;

  /**
   * DeviceDefinition.property.valueQuantity
   */
  valueQuantity?: Quantity[];

  /**
   * DeviceDefinition.property.valueCode
   */
  valueCode?: CodeableConcept[];
}

/**
 * FHIR R4 DeviceDefinitionSpecialization
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface DeviceDefinitionSpecialization {

  /**
   * DeviceDefinition.specialization.id
   */
  id?: string;

  /**
   * DeviceDefinition.specialization.extension
   */
  extension?: Extension[];

  /**
   * DeviceDefinition.specialization.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * DeviceDefinition.specialization.systemType
   */
  systemType: string;

  /**
   * DeviceDefinition.specialization.version
   */
  version?: string;
}

/**
 * FHIR R4 DeviceDefinitionUdiDeviceIdentifier
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface DeviceDefinitionUdiDeviceIdentifier {

  /**
   * DeviceDefinition.udiDeviceIdentifier.id
   */
  id?: string;

  /**
   * DeviceDefinition.udiDeviceIdentifier.extension
   */
  extension?: Extension[];

  /**
   * DeviceDefinition.udiDeviceIdentifier.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * DeviceDefinition.udiDeviceIdentifier.deviceIdentifier
   */
  deviceIdentifier: string;

  /**
   * DeviceDefinition.udiDeviceIdentifier.issuer
   */
  issuer: string;

  /**
   * DeviceDefinition.udiDeviceIdentifier.jurisdiction
   */
  jurisdiction: string;
}

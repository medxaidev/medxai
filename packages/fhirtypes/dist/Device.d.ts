import { Annotation } from './Annotation';
import { CodeableConcept } from './CodeableConcept';
import { ContactPoint } from './ContactPoint';
import { DeviceDefinition } from './DeviceDefinition';
import { Extension } from './Extension';
import { Identifier } from './Identifier';
import { Location } from './Location';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { Organization } from './Organization';
import { Patient } from './Patient';
import { Quantity } from './Quantity';
import { Reference } from './Reference';
import { Resource } from './Resource';

/**
 * FHIR R4 Device
 * @see https://hl7.org/fhir/R4/device.html
 */
export interface Device {

  /**
   * This is a Device resource
   */
  readonly resourceType: 'Device';

  /**
   * Device.id
   */
  id?: string;

  /**
   * Device.meta
   */
  meta?: Meta;

  /**
   * Device.implicitRules
   */
  implicitRules?: string;

  /**
   * Device.language
   */
  language?: string;

  /**
   * Device.text
   */
  text?: Narrative;

  /**
   * Device.contained
   */
  contained?: Resource[];

  /**
   * Device.extension
   */
  extension?: Extension[];

  /**
   * Device.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Device.identifier
   */
  identifier?: Identifier[];

  /**
   * Device.definition
   */
  definition?: Reference<DeviceDefinition>;

  /**
   * Device.udiCarrier
   */
  udiCarrier?: DeviceUdiCarrier[];

  /**
   * Device.status
   */
  status?: string;

  /**
   * Device.statusReason
   */
  statusReason?: CodeableConcept[];

  /**
   * Device.distinctIdentifier
   */
  distinctIdentifier?: string;

  /**
   * Device.manufacturer
   */
  manufacturer?: string;

  /**
   * Device.manufactureDate
   */
  manufactureDate?: string;

  /**
   * Device.expirationDate
   */
  expirationDate?: string;

  /**
   * Device.lotNumber
   */
  lotNumber?: string;

  /**
   * Device.serialNumber
   */
  serialNumber?: string;

  /**
   * Device.deviceName
   */
  deviceName?: DeviceDeviceName[];

  /**
   * Device.modelNumber
   */
  modelNumber?: string;

  /**
   * Device.partNumber
   */
  partNumber?: string;

  /**
   * Device.type
   */
  type?: CodeableConcept;

  /**
   * Device.specialization
   */
  specialization?: DeviceSpecialization[];

  /**
   * Device.version
   */
  version?: DeviceVersion[];

  /**
   * Device.property
   */
  property?: DeviceProperty[];

  /**
   * Device.patient
   */
  patient?: Reference<Patient>;

  /**
   * Device.owner
   */
  owner?: Reference<Organization>;

  /**
   * Device.contact
   */
  contact?: ContactPoint[];

  /**
   * Device.location
   */
  location?: Reference<Location>;

  /**
   * Device.url
   */
  url?: string;

  /**
   * Device.note
   */
  note?: Annotation[];

  /**
   * Device.safety
   */
  safety?: CodeableConcept[];

  /**
   * Device.parent
   */
  parent?: Reference<Device>;
}

/**
 * FHIR R4 DeviceDeviceName
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface DeviceDeviceName {

  /**
   * Device.deviceName.id
   */
  id?: string;

  /**
   * Device.deviceName.extension
   */
  extension?: Extension[];

  /**
   * Device.deviceName.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Device.deviceName.name
   */
  name: string;

  /**
   * Device.deviceName.type
   */
  type: string;
}

/**
 * FHIR R4 DeviceProperty
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface DeviceProperty {

  /**
   * Device.property.id
   */
  id?: string;

  /**
   * Device.property.extension
   */
  extension?: Extension[];

  /**
   * Device.property.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Device.property.type
   */
  type: CodeableConcept;

  /**
   * Device.property.valueQuantity
   */
  valueQuantity?: Quantity[];

  /**
   * Device.property.valueCode
   */
  valueCode?: CodeableConcept[];
}

/**
 * FHIR R4 DeviceSpecialization
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface DeviceSpecialization {

  /**
   * Device.specialization.id
   */
  id?: string;

  /**
   * Device.specialization.extension
   */
  extension?: Extension[];

  /**
   * Device.specialization.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Device.specialization.systemType
   */
  systemType: CodeableConcept;

  /**
   * Device.specialization.version
   */
  version?: string;
}

/**
 * FHIR R4 DeviceUdiCarrier
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface DeviceUdiCarrier {

  /**
   * Device.udiCarrier.id
   */
  id?: string;

  /**
   * Device.udiCarrier.extension
   */
  extension?: Extension[];

  /**
   * Device.udiCarrier.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Device.udiCarrier.deviceIdentifier
   */
  deviceIdentifier?: string;

  /**
   * Device.udiCarrier.issuer
   */
  issuer?: string;

  /**
   * Device.udiCarrier.jurisdiction
   */
  jurisdiction?: string;

  /**
   * Device.udiCarrier.carrierAIDC
   */
  carrierAIDC?: string;

  /**
   * Device.udiCarrier.carrierHRF
   */
  carrierHRF?: string;

  /**
   * Device.udiCarrier.entryType
   */
  entryType?: string;
}

/**
 * FHIR R4 DeviceVersion
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface DeviceVersion {

  /**
   * Device.version.id
   */
  id?: string;

  /**
   * Device.version.extension
   */
  extension?: Extension[];

  /**
   * Device.version.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Device.version.type
   */
  type?: CodeableConcept;

  /**
   * Device.version.component
   */
  component?: Identifier;

  /**
   * Device.version.value
   */
  value: string;
}

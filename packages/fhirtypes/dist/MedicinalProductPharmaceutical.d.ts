import { CodeableConcept } from './CodeableConcept';
import { DeviceDefinition } from './DeviceDefinition';
import { Duration } from './Duration';
import { Extension } from './Extension';
import { Identifier } from './Identifier';
import { MedicinalProductIngredient } from './MedicinalProductIngredient';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { Quantity } from './Quantity';
import { Ratio } from './Ratio';
import { Reference } from './Reference';
import { Resource } from './Resource';

/**
 * FHIR R4 MedicinalProductPharmaceutical
 * @see https://hl7.org/fhir/R4/medicinalproductpharmaceutical.html
 */
export interface MedicinalProductPharmaceutical {

  /**
   * This is a MedicinalProductPharmaceutical resource
   */
  readonly resourceType: 'MedicinalProductPharmaceutical';

  /**
   * MedicinalProductPharmaceutical.id
   */
  id?: string;

  /**
   * MedicinalProductPharmaceutical.meta
   */
  meta?: Meta;

  /**
   * MedicinalProductPharmaceutical.implicitRules
   */
  implicitRules?: string;

  /**
   * MedicinalProductPharmaceutical.language
   */
  language?: string;

  /**
   * MedicinalProductPharmaceutical.text
   */
  text?: Narrative;

  /**
   * MedicinalProductPharmaceutical.contained
   */
  contained?: Resource[];

  /**
   * MedicinalProductPharmaceutical.extension
   */
  extension?: Extension[];

  /**
   * MedicinalProductPharmaceutical.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * MedicinalProductPharmaceutical.identifier
   */
  identifier?: Identifier[];

  /**
   * MedicinalProductPharmaceutical.administrableDoseForm
   */
  administrableDoseForm: CodeableConcept;

  /**
   * MedicinalProductPharmaceutical.unitOfPresentation
   */
  unitOfPresentation?: CodeableConcept;

  /**
   * MedicinalProductPharmaceutical.ingredient
   */
  ingredient?: Reference<MedicinalProductIngredient>[];

  /**
   * MedicinalProductPharmaceutical.device
   */
  device?: Reference<DeviceDefinition>[];

  /**
   * MedicinalProductPharmaceutical.characteristics
   */
  characteristics?: MedicinalProductPharmaceuticalCharacteristics[];

  /**
   * MedicinalProductPharmaceutical.routeOfAdministration
   */
  routeOfAdministration: MedicinalProductPharmaceuticalRouteOfAdministration[];
}

/**
 * FHIR R4 MedicinalProductPharmaceuticalCharacteristics
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface MedicinalProductPharmaceuticalCharacteristics {

  /**
   * MedicinalProductPharmaceutical.characteristics.id
   */
  id?: string;

  /**
   * MedicinalProductPharmaceutical.characteristics.extension
   */
  extension?: Extension[];

  /**
   * MedicinalProductPharmaceutical.characteristics.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * MedicinalProductPharmaceutical.characteristics.code
   */
  code: CodeableConcept;

  /**
   * MedicinalProductPharmaceutical.characteristics.status
   */
  status?: CodeableConcept;
}

/**
 * FHIR R4 MedicinalProductPharmaceuticalRouteOfAdministration
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface MedicinalProductPharmaceuticalRouteOfAdministration {

  /**
   * MedicinalProductPharmaceutical.routeOfAdministration.id
   */
  id?: string;

  /**
   * MedicinalProductPharmaceutical.routeOfAdministration.extension
   */
  extension?: Extension[];

  /**
   * MedicinalProductPharmaceutical.routeOfAdministration.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * MedicinalProductPharmaceutical.routeOfAdministration.code
   */
  code: CodeableConcept;

  /**
   * MedicinalProductPharmaceutical.routeOfAdministration.firstDose
   */
  firstDose?: Quantity;

  /**
   * MedicinalProductPharmaceutical.routeOfAdministration.maxSingleDose
   */
  maxSingleDose?: Quantity;

  /**
   * MedicinalProductPharmaceutical.routeOfAdministration.maxDosePerDay
   */
  maxDosePerDay?: Quantity;

  /**
   * MedicinalProductPharmaceutical.routeOfAdministration.maxDosePerTreatmentPeriod
   */
  maxDosePerTreatmentPeriod?: Ratio;

  /**
   * MedicinalProductPharmaceutical.routeOfAdministration.maxTreatmentPeriod
   */
  maxTreatmentPeriod?: Duration;

  /**
   * MedicinalProductPharmaceutical.routeOfAdministration.targetSpecies
   */
  targetSpecies?: MedicinalProductPharmaceuticalRouteOfAdministrationTargetSpecies[];
}

/**
 * FHIR R4 MedicinalProductPharmaceuticalRouteOfAdministrationTargetSpecies
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface MedicinalProductPharmaceuticalRouteOfAdministrationTargetSpecies {

  /**
   * MedicinalProductPharmaceutical.routeOfAdministration.targetSpecies.id
   */
  id?: string;

  /**
   * MedicinalProductPharmaceutical.routeOfAdministration.targetSpecies.extension
   */
  extension?: Extension[];

  /**
   * MedicinalProductPharmaceutical.routeOfAdministration.targetSpecies.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * MedicinalProductPharmaceutical.routeOfAdministration.targetSpecies.code
   */
  code: CodeableConcept;

  /**
   * MedicinalProductPharmaceutical.routeOfAdministration.targetSpecies.withdrawalPeriod
   */
  withdrawalPeriod?: MedicinalProductPharmaceuticalRouteOfAdministrationTargetSpeciesWithdrawalPeriod[];
}

/**
 * FHIR R4 MedicinalProductPharmaceuticalRouteOfAdministrationTargetSpeciesWithdrawalPeriod
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface MedicinalProductPharmaceuticalRouteOfAdministrationTargetSpeciesWithdrawalPeriod {

  /**
   * MedicinalProductPharmaceutical.routeOfAdministration.targetSpecies.withdrawalPeriod.id
   */
  id?: string;

  /**
   * MedicinalProductPharmaceutical.routeOfAdministration.targetSpecies.withdrawalPeriod.extension
   */
  extension?: Extension[];

  /**
   * MedicinalProductPharmaceutical.routeOfAdministration.targetSpecies.withdrawalPeriod.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * MedicinalProductPharmaceutical.routeOfAdministration.targetSpecies.withdrawalPeriod.tissue
   */
  tissue: CodeableConcept;

  /**
   * MedicinalProductPharmaceutical.routeOfAdministration.targetSpecies.withdrawalPeriod.value
   */
  value: Quantity;

  /**
   * MedicinalProductPharmaceutical.routeOfAdministration.targetSpecies.withdrawalPeriod.supportingInformation
   */
  supportingInformation?: string;
}

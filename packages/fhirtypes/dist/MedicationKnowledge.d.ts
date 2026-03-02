import { CodeableConcept } from './CodeableConcept';
import { DetectedIssue } from './DetectedIssue';
import { DocumentReference } from './DocumentReference';
import { Dosage } from './Dosage';
import { Duration } from './Duration';
import { Extension } from './Extension';
import { Media } from './Media';
import { Medication } from './Medication';
import { Meta } from './Meta';
import { Money } from './Money';
import { Narrative } from './Narrative';
import { ObservationDefinition } from './ObservationDefinition';
import { Organization } from './Organization';
import { Quantity } from './Quantity';
import { Ratio } from './Ratio';
import { Reference } from './Reference';
import { Resource } from './Resource';
import { Substance } from './Substance';

/**
 * FHIR R4 MedicationKnowledge
 * @see https://hl7.org/fhir/R4/medicationknowledge.html
 */
export interface MedicationKnowledge {

  /**
   * This is a MedicationKnowledge resource
   */
  readonly resourceType: 'MedicationKnowledge';

  /**
   * MedicationKnowledge.id
   */
  id?: string;

  /**
   * MedicationKnowledge.meta
   */
  meta?: Meta;

  /**
   * MedicationKnowledge.implicitRules
   */
  implicitRules?: string;

  /**
   * MedicationKnowledge.language
   */
  language?: string;

  /**
   * MedicationKnowledge.text
   */
  text?: Narrative;

  /**
   * MedicationKnowledge.contained
   */
  contained?: Resource[];

  /**
   * MedicationKnowledge.extension
   */
  extension?: Extension[];

  /**
   * MedicationKnowledge.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * MedicationKnowledge.code
   */
  code?: CodeableConcept;

  /**
   * MedicationKnowledge.status
   */
  status?: string;

  /**
   * MedicationKnowledge.manufacturer
   */
  manufacturer?: Reference<Organization>;

  /**
   * MedicationKnowledge.doseForm
   */
  doseForm?: CodeableConcept;

  /**
   * MedicationKnowledge.amount
   */
  amount?: Quantity;

  /**
   * MedicationKnowledge.synonym
   */
  synonym?: string[];

  /**
   * MedicationKnowledge.relatedMedicationKnowledge
   */
  relatedMedicationKnowledge?: MedicationKnowledgeRelatedMedicationKnowledge[];

  /**
   * MedicationKnowledge.associatedMedication
   */
  associatedMedication?: Reference<Medication>[];

  /**
   * MedicationKnowledge.productType
   */
  productType?: CodeableConcept[];

  /**
   * MedicationKnowledge.monograph
   */
  monograph?: MedicationKnowledgeMonograph[];

  /**
   * MedicationKnowledge.ingredient
   */
  ingredient?: MedicationKnowledgeIngredient[];

  /**
   * MedicationKnowledge.preparationInstruction
   */
  preparationInstruction?: string;

  /**
   * MedicationKnowledge.intendedRoute
   */
  intendedRoute?: CodeableConcept[];

  /**
   * MedicationKnowledge.cost
   */
  cost?: MedicationKnowledgeCost[];

  /**
   * MedicationKnowledge.monitoringProgram
   */
  monitoringProgram?: MedicationKnowledgeMonitoringProgram[];

  /**
   * MedicationKnowledge.administrationGuidelines
   */
  administrationGuidelines?: MedicationKnowledgeAdministrationGuidelines[];

  /**
   * MedicationKnowledge.medicineClassification
   */
  medicineClassification?: MedicationKnowledgeMedicineClassification[];

  /**
   * MedicationKnowledge.packaging
   */
  packaging?: MedicationKnowledgePackaging;

  /**
   * MedicationKnowledge.drugCharacteristic
   */
  drugCharacteristic?: MedicationKnowledgeDrugCharacteristic[];

  /**
   * MedicationKnowledge.contraindication
   */
  contraindication?: Reference<DetectedIssue>[];

  /**
   * MedicationKnowledge.regulatory
   */
  regulatory?: MedicationKnowledgeRegulatory[];

  /**
   * MedicationKnowledge.kinetics
   */
  kinetics?: MedicationKnowledgeKinetics[];
}

/**
 * FHIR R4 MedicationKnowledgeAdministrationGuidelines
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface MedicationKnowledgeAdministrationGuidelines {

  /**
   * MedicationKnowledge.administrationGuidelines.id
   */
  id?: string;

  /**
   * MedicationKnowledge.administrationGuidelines.extension
   */
  extension?: Extension[];

  /**
   * MedicationKnowledge.administrationGuidelines.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * MedicationKnowledge.administrationGuidelines.dosage
   */
  dosage?: MedicationKnowledgeAdministrationGuidelinesDosage[];

  /**
   * MedicationKnowledge.administrationGuidelines.indication[x]
   */
  indicationCodeableConcept?: CodeableConcept;

  /**
   * MedicationKnowledge.administrationGuidelines.indication[x]
   */
  indicationReference?: Reference<ObservationDefinition>;

  /**
   * MedicationKnowledge.administrationGuidelines.patientCharacteristics
   */
  patientCharacteristics?: MedicationKnowledgeAdministrationGuidelinesPatientCharacteristics[];
}

/**
 * FHIR R4 MedicationKnowledgeAdministrationGuidelinesDosage
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface MedicationKnowledgeAdministrationGuidelinesDosage {

  /**
   * MedicationKnowledge.administrationGuidelines.dosage.id
   */
  id?: string;

  /**
   * MedicationKnowledge.administrationGuidelines.dosage.extension
   */
  extension?: Extension[];

  /**
   * MedicationKnowledge.administrationGuidelines.dosage.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * MedicationKnowledge.administrationGuidelines.dosage.type
   */
  type: CodeableConcept;

  /**
   * MedicationKnowledge.administrationGuidelines.dosage.dosage
   */
  dosage: Dosage[];
}

/**
 * FHIR R4 MedicationKnowledgeAdministrationGuidelinesPatientCharacteristics
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface MedicationKnowledgeAdministrationGuidelinesPatientCharacteristics {

  /**
   * MedicationKnowledge.administrationGuidelines.patientCharacteristics.id
   */
  id?: string;

  /**
   * MedicationKnowledge.administrationGuidelines.patientCharacteristics.extension
   */
  extension?: Extension[];

  /**
   * MedicationKnowledge.administrationGuidelines.patientCharacteristics.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * MedicationKnowledge.administrationGuidelines.patientCharacteristics.characteristic[x]
   */
  characteristicCodeableConcept: CodeableConcept;

  /**
   * MedicationKnowledge.administrationGuidelines.patientCharacteristics.characteristic[x]
   */
  characteristicQuantity: Quantity;

  /**
   * MedicationKnowledge.administrationGuidelines.patientCharacteristics.value
   */
  value?: string[];
}

/**
 * FHIR R4 MedicationKnowledgeCost
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface MedicationKnowledgeCost {

  /**
   * MedicationKnowledge.cost.id
   */
  id?: string;

  /**
   * MedicationKnowledge.cost.extension
   */
  extension?: Extension[];

  /**
   * MedicationKnowledge.cost.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * MedicationKnowledge.cost.type
   */
  type: CodeableConcept;

  /**
   * MedicationKnowledge.cost.source
   */
  source?: string;

  /**
   * MedicationKnowledge.cost.cost
   */
  cost: Money;
}

/**
 * FHIR R4 MedicationKnowledgeDrugCharacteristic
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface MedicationKnowledgeDrugCharacteristic {

  /**
   * MedicationKnowledge.drugCharacteristic.id
   */
  id?: string;

  /**
   * MedicationKnowledge.drugCharacteristic.extension
   */
  extension?: Extension[];

  /**
   * MedicationKnowledge.drugCharacteristic.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * MedicationKnowledge.drugCharacteristic.type
   */
  type?: CodeableConcept;

  /**
   * MedicationKnowledge.drugCharacteristic.value[x]
   */
  valueCodeableConcept?: CodeableConcept;

  /**
   * MedicationKnowledge.drugCharacteristic.value[x]
   */
  valueString?: string;

  /**
   * MedicationKnowledge.drugCharacteristic.value[x]
   */
  valueQuantity?: Quantity;

  /**
   * MedicationKnowledge.drugCharacteristic.value[x]
   */
  valueBase64Binary?: string;
}

/**
 * FHIR R4 MedicationKnowledgeIngredient
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface MedicationKnowledgeIngredient {

  /**
   * MedicationKnowledge.ingredient.id
   */
  id?: string;

  /**
   * MedicationKnowledge.ingredient.extension
   */
  extension?: Extension[];

  /**
   * MedicationKnowledge.ingredient.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * MedicationKnowledge.ingredient.item[x]
   */
  itemCodeableConcept: CodeableConcept;

  /**
   * MedicationKnowledge.ingredient.item[x]
   */
  itemReference: Reference<Substance>;

  /**
   * MedicationKnowledge.ingredient.isActive
   */
  isActive?: boolean;

  /**
   * MedicationKnowledge.ingredient.strength
   */
  strength?: Ratio;
}

/**
 * FHIR R4 MedicationKnowledgeKinetics
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface MedicationKnowledgeKinetics {

  /**
   * MedicationKnowledge.kinetics.id
   */
  id?: string;

  /**
   * MedicationKnowledge.kinetics.extension
   */
  extension?: Extension[];

  /**
   * MedicationKnowledge.kinetics.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * MedicationKnowledge.kinetics.areaUnderCurve
   */
  areaUnderCurve?: Quantity[];

  /**
   * MedicationKnowledge.kinetics.lethalDose50
   */
  lethalDose50?: Quantity[];

  /**
   * MedicationKnowledge.kinetics.halfLifePeriod
   */
  halfLifePeriod?: Duration;
}

/**
 * FHIR R4 MedicationKnowledgeMedicineClassification
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface MedicationKnowledgeMedicineClassification {

  /**
   * MedicationKnowledge.medicineClassification.id
   */
  id?: string;

  /**
   * MedicationKnowledge.medicineClassification.extension
   */
  extension?: Extension[];

  /**
   * MedicationKnowledge.medicineClassification.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * MedicationKnowledge.medicineClassification.type
   */
  type: CodeableConcept;

  /**
   * MedicationKnowledge.medicineClassification.classification
   */
  classification?: CodeableConcept[];
}

/**
 * FHIR R4 MedicationKnowledgeMonitoringProgram
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface MedicationKnowledgeMonitoringProgram {

  /**
   * MedicationKnowledge.monitoringProgram.id
   */
  id?: string;

  /**
   * MedicationKnowledge.monitoringProgram.extension
   */
  extension?: Extension[];

  /**
   * MedicationKnowledge.monitoringProgram.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * MedicationKnowledge.monitoringProgram.type
   */
  type?: CodeableConcept;

  /**
   * MedicationKnowledge.monitoringProgram.name
   */
  name?: string;
}

/**
 * FHIR R4 MedicationKnowledgeMonograph
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface MedicationKnowledgeMonograph {

  /**
   * MedicationKnowledge.monograph.id
   */
  id?: string;

  /**
   * MedicationKnowledge.monograph.extension
   */
  extension?: Extension[];

  /**
   * MedicationKnowledge.monograph.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * MedicationKnowledge.monograph.type
   */
  type?: CodeableConcept;

  /**
   * MedicationKnowledge.monograph.source
   */
  source?: Reference<DocumentReference | Media>;
}

/**
 * FHIR R4 MedicationKnowledgePackaging
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface MedicationKnowledgePackaging {

  /**
   * MedicationKnowledge.packaging.id
   */
  id?: string;

  /**
   * MedicationKnowledge.packaging.extension
   */
  extension?: Extension[];

  /**
   * MedicationKnowledge.packaging.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * MedicationKnowledge.packaging.type
   */
  type?: CodeableConcept;

  /**
   * MedicationKnowledge.packaging.quantity
   */
  quantity?: Quantity;
}

/**
 * FHIR R4 MedicationKnowledgeRegulatory
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface MedicationKnowledgeRegulatory {

  /**
   * MedicationKnowledge.regulatory.id
   */
  id?: string;

  /**
   * MedicationKnowledge.regulatory.extension
   */
  extension?: Extension[];

  /**
   * MedicationKnowledge.regulatory.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * MedicationKnowledge.regulatory.regulatoryAuthority
   */
  regulatoryAuthority: Reference<Organization>;

  /**
   * MedicationKnowledge.regulatory.substitution
   */
  substitution?: MedicationKnowledgeRegulatorySubstitution[];

  /**
   * MedicationKnowledge.regulatory.schedule
   */
  schedule?: MedicationKnowledgeRegulatorySchedule[];

  /**
   * MedicationKnowledge.regulatory.maxDispense
   */
  maxDispense?: MedicationKnowledgeRegulatoryMaxDispense;
}

/**
 * FHIR R4 MedicationKnowledgeRegulatoryMaxDispense
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface MedicationKnowledgeRegulatoryMaxDispense {

  /**
   * MedicationKnowledge.regulatory.maxDispense.id
   */
  id?: string;

  /**
   * MedicationKnowledge.regulatory.maxDispense.extension
   */
  extension?: Extension[];

  /**
   * MedicationKnowledge.regulatory.maxDispense.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * MedicationKnowledge.regulatory.maxDispense.quantity
   */
  quantity: Quantity;

  /**
   * MedicationKnowledge.regulatory.maxDispense.period
   */
  period?: Duration;
}

/**
 * FHIR R4 MedicationKnowledgeRegulatorySchedule
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface MedicationKnowledgeRegulatorySchedule {

  /**
   * MedicationKnowledge.regulatory.schedule.id
   */
  id?: string;

  /**
   * MedicationKnowledge.regulatory.schedule.extension
   */
  extension?: Extension[];

  /**
   * MedicationKnowledge.regulatory.schedule.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * MedicationKnowledge.regulatory.schedule.schedule
   */
  schedule: CodeableConcept;
}

/**
 * FHIR R4 MedicationKnowledgeRegulatorySubstitution
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface MedicationKnowledgeRegulatorySubstitution {

  /**
   * MedicationKnowledge.regulatory.substitution.id
   */
  id?: string;

  /**
   * MedicationKnowledge.regulatory.substitution.extension
   */
  extension?: Extension[];

  /**
   * MedicationKnowledge.regulatory.substitution.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * MedicationKnowledge.regulatory.substitution.type
   */
  type: CodeableConcept;

  /**
   * MedicationKnowledge.regulatory.substitution.allowed
   */
  allowed: boolean;
}

/**
 * FHIR R4 MedicationKnowledgeRelatedMedicationKnowledge
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface MedicationKnowledgeRelatedMedicationKnowledge {

  /**
   * MedicationKnowledge.relatedMedicationKnowledge.id
   */
  id?: string;

  /**
   * MedicationKnowledge.relatedMedicationKnowledge.extension
   */
  extension?: Extension[];

  /**
   * MedicationKnowledge.relatedMedicationKnowledge.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * MedicationKnowledge.relatedMedicationKnowledge.type
   */
  type: CodeableConcept;

  /**
   * MedicationKnowledge.relatedMedicationKnowledge.reference
   */
  reference: Reference<MedicationKnowledge>[];
}

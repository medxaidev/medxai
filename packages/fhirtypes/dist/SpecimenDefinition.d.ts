import { CodeableConcept } from './CodeableConcept';
import { Duration } from './Duration';
import { Extension } from './Extension';
import { Identifier } from './Identifier';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { Quantity } from './Quantity';
import { Range } from './Range';
import { Reference } from './Reference';
import { Resource } from './Resource';
import { Substance } from './Substance';

/**
 * FHIR R4 SpecimenDefinition
 * @see https://hl7.org/fhir/R4/specimendefinition.html
 */
export interface SpecimenDefinition {

  /**
   * This is a SpecimenDefinition resource
   */
  readonly resourceType: 'SpecimenDefinition';

  /**
   * SpecimenDefinition.id
   */
  id?: string;

  /**
   * SpecimenDefinition.meta
   */
  meta?: Meta;

  /**
   * SpecimenDefinition.implicitRules
   */
  implicitRules?: string;

  /**
   * SpecimenDefinition.language
   */
  language?: string;

  /**
   * SpecimenDefinition.text
   */
  text?: Narrative;

  /**
   * SpecimenDefinition.contained
   */
  contained?: Resource[];

  /**
   * SpecimenDefinition.extension
   */
  extension?: Extension[];

  /**
   * SpecimenDefinition.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * SpecimenDefinition.identifier
   */
  identifier?: Identifier;

  /**
   * SpecimenDefinition.typeCollected
   */
  typeCollected?: CodeableConcept;

  /**
   * SpecimenDefinition.patientPreparation
   */
  patientPreparation?: CodeableConcept[];

  /**
   * SpecimenDefinition.timeAspect
   */
  timeAspect?: string;

  /**
   * SpecimenDefinition.collection
   */
  collection?: CodeableConcept[];

  /**
   * SpecimenDefinition.typeTested
   */
  typeTested?: SpecimenDefinitionTypeTested[];
}

/**
 * FHIR R4 SpecimenDefinitionTypeTested
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface SpecimenDefinitionTypeTested {

  /**
   * SpecimenDefinition.typeTested.id
   */
  id?: string;

  /**
   * SpecimenDefinition.typeTested.extension
   */
  extension?: Extension[];

  /**
   * SpecimenDefinition.typeTested.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * SpecimenDefinition.typeTested.isDerived
   */
  isDerived?: boolean;

  /**
   * SpecimenDefinition.typeTested.type
   */
  type?: CodeableConcept;

  /**
   * SpecimenDefinition.typeTested.preference
   */
  preference: string;

  /**
   * SpecimenDefinition.typeTested.container
   */
  container?: SpecimenDefinitionTypeTestedContainer;

  /**
   * SpecimenDefinition.typeTested.requirement
   */
  requirement?: string;

  /**
   * SpecimenDefinition.typeTested.retentionTime
   */
  retentionTime?: Duration;

  /**
   * SpecimenDefinition.typeTested.rejectionCriterion
   */
  rejectionCriterion?: CodeableConcept[];

  /**
   * SpecimenDefinition.typeTested.handling
   */
  handling?: SpecimenDefinitionTypeTestedHandling[];
}

/**
 * FHIR R4 SpecimenDefinitionTypeTestedContainer
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface SpecimenDefinitionTypeTestedContainer {

  /**
   * SpecimenDefinition.typeTested.container.id
   */
  id?: string;

  /**
   * SpecimenDefinition.typeTested.container.extension
   */
  extension?: Extension[];

  /**
   * SpecimenDefinition.typeTested.container.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * SpecimenDefinition.typeTested.container.material
   */
  material?: CodeableConcept;

  /**
   * SpecimenDefinition.typeTested.container.type
   */
  type?: CodeableConcept;

  /**
   * SpecimenDefinition.typeTested.container.cap
   */
  cap?: CodeableConcept;

  /**
   * SpecimenDefinition.typeTested.container.description
   */
  description?: string;

  /**
   * SpecimenDefinition.typeTested.container.capacity
   */
  capacity?: Quantity;

  /**
   * SpecimenDefinition.typeTested.container.minimumVolume[x]
   */
  minimumVolumeQuantity?: Quantity;

  /**
   * SpecimenDefinition.typeTested.container.minimumVolume[x]
   */
  minimumVolumeString?: string;

  /**
   * SpecimenDefinition.typeTested.container.additive
   */
  additive?: SpecimenDefinitionTypeTestedContainerAdditive[];

  /**
   * SpecimenDefinition.typeTested.container.preparation
   */
  preparation?: string;
}

/**
 * FHIR R4 SpecimenDefinitionTypeTestedContainerAdditive
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface SpecimenDefinitionTypeTestedContainerAdditive {

  /**
   * SpecimenDefinition.typeTested.container.additive.id
   */
  id?: string;

  /**
   * SpecimenDefinition.typeTested.container.additive.extension
   */
  extension?: Extension[];

  /**
   * SpecimenDefinition.typeTested.container.additive.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * SpecimenDefinition.typeTested.container.additive.additive[x]
   */
  additiveCodeableConcept: CodeableConcept;

  /**
   * SpecimenDefinition.typeTested.container.additive.additive[x]
   */
  additiveReference: Reference<Substance>;
}

/**
 * FHIR R4 SpecimenDefinitionTypeTestedHandling
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface SpecimenDefinitionTypeTestedHandling {

  /**
   * SpecimenDefinition.typeTested.handling.id
   */
  id?: string;

  /**
   * SpecimenDefinition.typeTested.handling.extension
   */
  extension?: Extension[];

  /**
   * SpecimenDefinition.typeTested.handling.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * SpecimenDefinition.typeTested.handling.temperatureQualifier
   */
  temperatureQualifier?: CodeableConcept;

  /**
   * SpecimenDefinition.typeTested.handling.temperatureRange
   */
  temperatureRange?: Range;

  /**
   * SpecimenDefinition.typeTested.handling.maxDuration
   */
  maxDuration?: Duration;

  /**
   * SpecimenDefinition.typeTested.handling.instruction
   */
  instruction?: string;
}

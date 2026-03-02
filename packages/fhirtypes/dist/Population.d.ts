import { CodeableConcept } from './CodeableConcept';
import { Extension } from './Extension';
import { Range } from './Range';

/**
 * FHIR R4 Population
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface Population {

  /**
   * Population.id
   */
  id?: string;

  /**
   * Population.extension
   */
  extension?: Extension[];

  /**
   * Population.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Population.age[x]
   */
  ageRange?: Range;

  /**
   * Population.age[x]
   */
  ageCodeableConcept?: CodeableConcept;

  /**
   * Population.gender
   */
  gender?: CodeableConcept;

  /**
   * Population.race
   */
  race?: CodeableConcept;

  /**
   * Population.physiologicalCondition
   */
  physiologicalCondition?: CodeableConcept;
}

/**
 * Population.age[x]
 */
export type PopulationAge = Range | CodeableConcept;

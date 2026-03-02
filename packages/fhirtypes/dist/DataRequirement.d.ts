import { CodeableConcept } from './CodeableConcept';
import { Coding } from './Coding';
import { Duration } from './Duration';
import { Extension } from './Extension';
import { Group } from './Group';
import { Period } from './Period';
import { Reference } from './Reference';

/**
 * FHIR R4 DataRequirement
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface DataRequirement {

  /**
   * DataRequirement.id
   */
  id?: string;

  /**
   * DataRequirement.extension
   */
  extension?: Extension[];

  /**
   * DataRequirement.type
   */
  type: string;

  /**
   * DataRequirement.profile
   */
  profile?: string[];

  /**
   * DataRequirement.subject[x]
   */
  subjectCodeableConcept?: CodeableConcept;

  /**
   * DataRequirement.subject[x]
   */
  subjectReference?: Reference<Group>;

  /**
   * DataRequirement.mustSupport
   */
  mustSupport?: string[];

  /**
   * DataRequirement.codeFilter
   */
  codeFilter?: DataRequirementCodeFilter[];

  /**
   * DataRequirement.dateFilter
   */
  dateFilter?: DataRequirementDateFilter[];

  /**
   * DataRequirement.limit
   */
  limit?: number;

  /**
   * DataRequirement.sort
   */
  sort?: DataRequirementSort[];
}

/**
 * DataRequirement.subject[x]
 */
export type DataRequirementSubject = CodeableConcept | Reference<Group>;

/**
 * FHIR R4 DataRequirementCodeFilter
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface DataRequirementCodeFilter {

  /**
   * DataRequirement.codeFilter.id
   */
  id?: string;

  /**
   * DataRequirement.codeFilter.extension
   */
  extension?: Extension[];

  /**
   * DataRequirement.codeFilter.path
   */
  path?: string;

  /**
   * DataRequirement.codeFilter.searchParam
   */
  searchParam?: string;

  /**
   * DataRequirement.codeFilter.valueSet
   */
  valueSet?: string;

  /**
   * DataRequirement.codeFilter.code
   */
  code?: Coding[];
}

/**
 * FHIR R4 DataRequirementDateFilter
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface DataRequirementDateFilter {

  /**
   * DataRequirement.dateFilter.id
   */
  id?: string;

  /**
   * DataRequirement.dateFilter.extension
   */
  extension?: Extension[];

  /**
   * DataRequirement.dateFilter.path
   */
  path?: string;

  /**
   * DataRequirement.dateFilter.searchParam
   */
  searchParam?: string;

  /**
   * DataRequirement.dateFilter.value[x]
   */
  valueDateTime?: string;

  /**
   * DataRequirement.dateFilter.value[x]
   */
  valuePeriod?: Period;

  /**
   * DataRequirement.dateFilter.value[x]
   */
  valueDuration?: Duration;
}

/**
 * FHIR R4 DataRequirementSort
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface DataRequirementSort {

  /**
   * DataRequirement.sort.id
   */
  id?: string;

  /**
   * DataRequirement.sort.extension
   */
  extension?: Extension[];

  /**
   * DataRequirement.sort.path
   */
  path: string;

  /**
   * DataRequirement.sort.direction
   */
  direction: string;
}

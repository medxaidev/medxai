import { CodeableConcept } from './CodeableConcept';
import { Extension } from './Extension';
import { Identifier } from './Identifier';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { Range } from './Range';
import { Reference } from './Reference';
import { Resource } from './Resource';
import { ValueSet } from './ValueSet';

/**
 * FHIR R4 ObservationDefinition
 * @see https://hl7.org/fhir/R4/observationdefinition.html
 */
export interface ObservationDefinition {

  /**
   * This is a ObservationDefinition resource
   */
  readonly resourceType: 'ObservationDefinition';

  /**
   * ObservationDefinition.id
   */
  id?: string;

  /**
   * ObservationDefinition.meta
   */
  meta?: Meta;

  /**
   * ObservationDefinition.implicitRules
   */
  implicitRules?: string;

  /**
   * ObservationDefinition.language
   */
  language?: string;

  /**
   * ObservationDefinition.text
   */
  text?: Narrative;

  /**
   * ObservationDefinition.contained
   */
  contained?: Resource[];

  /**
   * ObservationDefinition.extension
   */
  extension?: Extension[];

  /**
   * ObservationDefinition.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * ObservationDefinition.category
   */
  category?: CodeableConcept[];

  /**
   * ObservationDefinition.code
   */
  code: CodeableConcept;

  /**
   * ObservationDefinition.identifier
   */
  identifier?: Identifier[];

  /**
   * ObservationDefinition.permittedDataType
   */
  permittedDataType?: string[];

  /**
   * ObservationDefinition.multipleResultsAllowed
   */
  multipleResultsAllowed?: boolean;

  /**
   * ObservationDefinition.method
   */
  method?: CodeableConcept;

  /**
   * ObservationDefinition.preferredReportName
   */
  preferredReportName?: string;

  /**
   * ObservationDefinition.quantitativeDetails
   */
  quantitativeDetails?: ObservationDefinitionQuantitativeDetails;

  /**
   * ObservationDefinition.qualifiedInterval
   */
  qualifiedInterval?: ObservationDefinitionQualifiedInterval[];

  /**
   * ObservationDefinition.validCodedValueSet
   */
  validCodedValueSet?: Reference<ValueSet>;

  /**
   * ObservationDefinition.normalCodedValueSet
   */
  normalCodedValueSet?: Reference<ValueSet>;

  /**
   * ObservationDefinition.abnormalCodedValueSet
   */
  abnormalCodedValueSet?: Reference<ValueSet>;

  /**
   * ObservationDefinition.criticalCodedValueSet
   */
  criticalCodedValueSet?: Reference<ValueSet>;
}

/**
 * FHIR R4 ObservationDefinitionQualifiedInterval
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ObservationDefinitionQualifiedInterval {

  /**
   * ObservationDefinition.qualifiedInterval.id
   */
  id?: string;

  /**
   * ObservationDefinition.qualifiedInterval.extension
   */
  extension?: Extension[];

  /**
   * ObservationDefinition.qualifiedInterval.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * ObservationDefinition.qualifiedInterval.category
   */
  category?: string;

  /**
   * ObservationDefinition.qualifiedInterval.range
   */
  range?: Range;

  /**
   * ObservationDefinition.qualifiedInterval.context
   */
  context?: CodeableConcept;

  /**
   * ObservationDefinition.qualifiedInterval.appliesTo
   */
  appliesTo?: CodeableConcept[];

  /**
   * ObservationDefinition.qualifiedInterval.gender
   */
  gender?: 'male' | 'female' | 'other' | 'unknown';

  /**
   * ObservationDefinition.qualifiedInterval.age
   */
  age?: Range;

  /**
   * ObservationDefinition.qualifiedInterval.gestationalAge
   */
  gestationalAge?: Range;

  /**
   * ObservationDefinition.qualifiedInterval.condition
   */
  condition?: string;
}

/**
 * FHIR R4 ObservationDefinitionQuantitativeDetails
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ObservationDefinitionQuantitativeDetails {

  /**
   * ObservationDefinition.quantitativeDetails.id
   */
  id?: string;

  /**
   * ObservationDefinition.quantitativeDetails.extension
   */
  extension?: Extension[];

  /**
   * ObservationDefinition.quantitativeDetails.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * ObservationDefinition.quantitativeDetails.customaryUnit
   */
  customaryUnit?: CodeableConcept;

  /**
   * ObservationDefinition.quantitativeDetails.unit
   */
  unit?: CodeableConcept;

  /**
   * ObservationDefinition.quantitativeDetails.conversionFactor
   */
  conversionFactor?: number;

  /**
   * ObservationDefinition.quantitativeDetails.decimalPrecision
   */
  decimalPrecision?: number;
}

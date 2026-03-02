import { Address } from './Address';
import { Age } from './Age';
import { Annotation } from './Annotation';
import { Attachment } from './Attachment';
import { CodeableConcept } from './CodeableConcept';
import { Coding } from './Coding';
import { ContactDetail } from './ContactDetail';
import { ContactPoint } from './ContactPoint';
import { Contributor } from './Contributor';
import { Count } from './Count';
import { DataRequirement } from './DataRequirement';
import { Distance } from './Distance';
import { Dosage } from './Dosage';
import { Duration } from './Duration';
import { Expression } from './Expression';
import { Extension } from './Extension';
import { HumanName } from './HumanName';
import { Identifier } from './Identifier';
import { Meta } from './Meta';
import { Money } from './Money';
import { ParameterDefinition } from './ParameterDefinition';
import { Period } from './Period';
import { Quantity } from './Quantity';
import { Range } from './Range';
import { Ratio } from './Ratio';
import { Reference } from './Reference';
import { RelatedArtifact } from './RelatedArtifact';
import { SampledData } from './SampledData';
import { Signature } from './Signature';
import { Timing } from './Timing';
import { TriggerDefinition } from './TriggerDefinition';
import { UsageContext } from './UsageContext';

/**
 * FHIR R4 ElementDefinition
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ElementDefinition {

  /**
   * ElementDefinition.id
   */
  id?: string;

  /**
   * ElementDefinition.extension
   */
  extension?: Extension[];

  /**
   * ElementDefinition.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * ElementDefinition.path
   */
  path: string;

  /**
   * ElementDefinition.representation
   */
  representation?: string[];

  /**
   * ElementDefinition.sliceName
   */
  sliceName?: string;

  /**
   * ElementDefinition.sliceIsConstraining
   */
  sliceIsConstraining?: boolean;

  /**
   * ElementDefinition.label
   */
  label?: string;

  /**
   * ElementDefinition.code
   */
  code?: Coding[];

  /**
   * ElementDefinition.slicing
   */
  slicing?: ElementDefinitionSlicing;

  /**
   * ElementDefinition.short
   */
  short?: string;

  /**
   * ElementDefinition.definition
   */
  definition?: string;

  /**
   * ElementDefinition.comment
   */
  comment?: string;

  /**
   * ElementDefinition.requirements
   */
  requirements?: string;

  /**
   * ElementDefinition.alias
   */
  alias?: string[];

  /**
   * ElementDefinition.min
   */
  min?: number;

  /**
   * ElementDefinition.max
   */
  max?: string;

  /**
   * ElementDefinition.base
   */
  base?: ElementDefinitionBase;

  /**
   * ElementDefinition.contentReference
   */
  contentReference?: string;

  /**
   * ElementDefinition.type
   */
  type?: ElementDefinitionType[];

  /**
   * ElementDefinition.defaultValue[x]
   */
  defaultValueBase64Binary?: string;

  /**
   * ElementDefinition.defaultValue[x]
   */
  defaultValueBoolean?: boolean;

  /**
   * ElementDefinition.defaultValue[x]
   */
  defaultValueCanonical?: string;

  /**
   * ElementDefinition.defaultValue[x]
   */
  defaultValueCode?: string;

  /**
   * ElementDefinition.defaultValue[x]
   */
  defaultValueDate?: string;

  /**
   * ElementDefinition.defaultValue[x]
   */
  defaultValueDateTime?: string;

  /**
   * ElementDefinition.defaultValue[x]
   */
  defaultValueDecimal?: number;

  /**
   * ElementDefinition.defaultValue[x]
   */
  defaultValueId?: string;

  /**
   * ElementDefinition.defaultValue[x]
   */
  defaultValueInstant?: string;

  /**
   * ElementDefinition.defaultValue[x]
   */
  defaultValueInteger?: number;

  /**
   * ElementDefinition.defaultValue[x]
   */
  defaultValueMarkdown?: string;

  /**
   * ElementDefinition.defaultValue[x]
   */
  defaultValueOid?: string;

  /**
   * ElementDefinition.defaultValue[x]
   */
  defaultValuePositiveInt?: number;

  /**
   * ElementDefinition.defaultValue[x]
   */
  defaultValueString?: string;

  /**
   * ElementDefinition.defaultValue[x]
   */
  defaultValueTime?: string;

  /**
   * ElementDefinition.defaultValue[x]
   */
  defaultValueUnsignedInt?: number;

  /**
   * ElementDefinition.defaultValue[x]
   */
  defaultValueUri?: string;

  /**
   * ElementDefinition.defaultValue[x]
   */
  defaultValueUrl?: string;

  /**
   * ElementDefinition.defaultValue[x]
   */
  defaultValueUuid?: string;

  /**
   * ElementDefinition.defaultValue[x]
   */
  defaultValueAddress?: Address;

  /**
   * ElementDefinition.defaultValue[x]
   */
  defaultValueAge?: Age;

  /**
   * ElementDefinition.defaultValue[x]
   */
  defaultValueAnnotation?: Annotation;

  /**
   * ElementDefinition.defaultValue[x]
   */
  defaultValueAttachment?: Attachment;

  /**
   * ElementDefinition.defaultValue[x]
   */
  defaultValueCodeableConcept?: CodeableConcept;

  /**
   * ElementDefinition.defaultValue[x]
   */
  defaultValueCoding?: Coding;

  /**
   * ElementDefinition.defaultValue[x]
   */
  defaultValueContactPoint?: ContactPoint;

  /**
   * ElementDefinition.defaultValue[x]
   */
  defaultValueCount?: Count;

  /**
   * ElementDefinition.defaultValue[x]
   */
  defaultValueDistance?: Distance;

  /**
   * ElementDefinition.defaultValue[x]
   */
  defaultValueDuration?: Duration;

  /**
   * ElementDefinition.defaultValue[x]
   */
  defaultValueHumanName?: HumanName;

  /**
   * ElementDefinition.defaultValue[x]
   */
  defaultValueIdentifier?: Identifier;

  /**
   * ElementDefinition.defaultValue[x]
   */
  defaultValueMoney?: Money;

  /**
   * ElementDefinition.defaultValue[x]
   */
  defaultValuePeriod?: Period;

  /**
   * ElementDefinition.defaultValue[x]
   */
  defaultValueQuantity?: Quantity;

  /**
   * ElementDefinition.defaultValue[x]
   */
  defaultValueRange?: Range;

  /**
   * ElementDefinition.defaultValue[x]
   */
  defaultValueRatio?: Ratio;

  /**
   * ElementDefinition.defaultValue[x]
   */
  defaultValueReference?: Reference;

  /**
   * ElementDefinition.defaultValue[x]
   */
  defaultValueSampledData?: SampledData;

  /**
   * ElementDefinition.defaultValue[x]
   */
  defaultValueSignature?: Signature;

  /**
   * ElementDefinition.defaultValue[x]
   */
  defaultValueTiming?: Timing;

  /**
   * ElementDefinition.defaultValue[x]
   */
  defaultValueContactDetail?: ContactDetail;

  /**
   * ElementDefinition.defaultValue[x]
   */
  defaultValueContributor?: Contributor;

  /**
   * ElementDefinition.defaultValue[x]
   */
  defaultValueDataRequirement?: DataRequirement;

  /**
   * ElementDefinition.defaultValue[x]
   */
  defaultValueExpression?: Expression;

  /**
   * ElementDefinition.defaultValue[x]
   */
  defaultValueParameterDefinition?: ParameterDefinition;

  /**
   * ElementDefinition.defaultValue[x]
   */
  defaultValueRelatedArtifact?: RelatedArtifact;

  /**
   * ElementDefinition.defaultValue[x]
   */
  defaultValueTriggerDefinition?: TriggerDefinition;

  /**
   * ElementDefinition.defaultValue[x]
   */
  defaultValueUsageContext?: UsageContext;

  /**
   * ElementDefinition.defaultValue[x]
   */
  defaultValueDosage?: Dosage;

  /**
   * ElementDefinition.defaultValue[x]
   */
  defaultValueMeta?: Meta;

  /**
   * ElementDefinition.meaningWhenMissing
   */
  meaningWhenMissing?: string;

  /**
   * ElementDefinition.orderMeaning
   */
  orderMeaning?: string;

  /**
   * ElementDefinition.fixed[x]
   */
  fixedBase64Binary?: string;

  /**
   * ElementDefinition.fixed[x]
   */
  fixedBoolean?: boolean;

  /**
   * ElementDefinition.fixed[x]
   */
  fixedCanonical?: string;

  /**
   * ElementDefinition.fixed[x]
   */
  fixedCode?: string;

  /**
   * ElementDefinition.fixed[x]
   */
  fixedDate?: string;

  /**
   * ElementDefinition.fixed[x]
   */
  fixedDateTime?: string;

  /**
   * ElementDefinition.fixed[x]
   */
  fixedDecimal?: number;

  /**
   * ElementDefinition.fixed[x]
   */
  fixedId?: string;

  /**
   * ElementDefinition.fixed[x]
   */
  fixedInstant?: string;

  /**
   * ElementDefinition.fixed[x]
   */
  fixedInteger?: number;

  /**
   * ElementDefinition.fixed[x]
   */
  fixedMarkdown?: string;

  /**
   * ElementDefinition.fixed[x]
   */
  fixedOid?: string;

  /**
   * ElementDefinition.fixed[x]
   */
  fixedPositiveInt?: number;

  /**
   * ElementDefinition.fixed[x]
   */
  fixedString?: string;

  /**
   * ElementDefinition.fixed[x]
   */
  fixedTime?: string;

  /**
   * ElementDefinition.fixed[x]
   */
  fixedUnsignedInt?: number;

  /**
   * ElementDefinition.fixed[x]
   */
  fixedUri?: string;

  /**
   * ElementDefinition.fixed[x]
   */
  fixedUrl?: string;

  /**
   * ElementDefinition.fixed[x]
   */
  fixedUuid?: string;

  /**
   * ElementDefinition.fixed[x]
   */
  fixedAddress?: Address;

  /**
   * ElementDefinition.fixed[x]
   */
  fixedAge?: Age;

  /**
   * ElementDefinition.fixed[x]
   */
  fixedAnnotation?: Annotation;

  /**
   * ElementDefinition.fixed[x]
   */
  fixedAttachment?: Attachment;

  /**
   * ElementDefinition.fixed[x]
   */
  fixedCodeableConcept?: CodeableConcept;

  /**
   * ElementDefinition.fixed[x]
   */
  fixedCoding?: Coding;

  /**
   * ElementDefinition.fixed[x]
   */
  fixedContactPoint?: ContactPoint;

  /**
   * ElementDefinition.fixed[x]
   */
  fixedCount?: Count;

  /**
   * ElementDefinition.fixed[x]
   */
  fixedDistance?: Distance;

  /**
   * ElementDefinition.fixed[x]
   */
  fixedDuration?: Duration;

  /**
   * ElementDefinition.fixed[x]
   */
  fixedHumanName?: HumanName;

  /**
   * ElementDefinition.fixed[x]
   */
  fixedIdentifier?: Identifier;

  /**
   * ElementDefinition.fixed[x]
   */
  fixedMoney?: Money;

  /**
   * ElementDefinition.fixed[x]
   */
  fixedPeriod?: Period;

  /**
   * ElementDefinition.fixed[x]
   */
  fixedQuantity?: Quantity;

  /**
   * ElementDefinition.fixed[x]
   */
  fixedRange?: Range;

  /**
   * ElementDefinition.fixed[x]
   */
  fixedRatio?: Ratio;

  /**
   * ElementDefinition.fixed[x]
   */
  fixedReference?: Reference;

  /**
   * ElementDefinition.fixed[x]
   */
  fixedSampledData?: SampledData;

  /**
   * ElementDefinition.fixed[x]
   */
  fixedSignature?: Signature;

  /**
   * ElementDefinition.fixed[x]
   */
  fixedTiming?: Timing;

  /**
   * ElementDefinition.fixed[x]
   */
  fixedContactDetail?: ContactDetail;

  /**
   * ElementDefinition.fixed[x]
   */
  fixedContributor?: Contributor;

  /**
   * ElementDefinition.fixed[x]
   */
  fixedDataRequirement?: DataRequirement;

  /**
   * ElementDefinition.fixed[x]
   */
  fixedExpression?: Expression;

  /**
   * ElementDefinition.fixed[x]
   */
  fixedParameterDefinition?: ParameterDefinition;

  /**
   * ElementDefinition.fixed[x]
   */
  fixedRelatedArtifact?: RelatedArtifact;

  /**
   * ElementDefinition.fixed[x]
   */
  fixedTriggerDefinition?: TriggerDefinition;

  /**
   * ElementDefinition.fixed[x]
   */
  fixedUsageContext?: UsageContext;

  /**
   * ElementDefinition.fixed[x]
   */
  fixedDosage?: Dosage;

  /**
   * ElementDefinition.fixed[x]
   */
  fixedMeta?: Meta;

  /**
   * ElementDefinition.pattern[x]
   */
  patternBase64Binary?: string;

  /**
   * ElementDefinition.pattern[x]
   */
  patternBoolean?: boolean;

  /**
   * ElementDefinition.pattern[x]
   */
  patternCanonical?: string;

  /**
   * ElementDefinition.pattern[x]
   */
  patternCode?: string;

  /**
   * ElementDefinition.pattern[x]
   */
  patternDate?: string;

  /**
   * ElementDefinition.pattern[x]
   */
  patternDateTime?: string;

  /**
   * ElementDefinition.pattern[x]
   */
  patternDecimal?: number;

  /**
   * ElementDefinition.pattern[x]
   */
  patternId?: string;

  /**
   * ElementDefinition.pattern[x]
   */
  patternInstant?: string;

  /**
   * ElementDefinition.pattern[x]
   */
  patternInteger?: number;

  /**
   * ElementDefinition.pattern[x]
   */
  patternMarkdown?: string;

  /**
   * ElementDefinition.pattern[x]
   */
  patternOid?: string;

  /**
   * ElementDefinition.pattern[x]
   */
  patternPositiveInt?: number;

  /**
   * ElementDefinition.pattern[x]
   */
  patternString?: string;

  /**
   * ElementDefinition.pattern[x]
   */
  patternTime?: string;

  /**
   * ElementDefinition.pattern[x]
   */
  patternUnsignedInt?: number;

  /**
   * ElementDefinition.pattern[x]
   */
  patternUri?: string;

  /**
   * ElementDefinition.pattern[x]
   */
  patternUrl?: string;

  /**
   * ElementDefinition.pattern[x]
   */
  patternUuid?: string;

  /**
   * ElementDefinition.pattern[x]
   */
  patternAddress?: Address;

  /**
   * ElementDefinition.pattern[x]
   */
  patternAge?: Age;

  /**
   * ElementDefinition.pattern[x]
   */
  patternAnnotation?: Annotation;

  /**
   * ElementDefinition.pattern[x]
   */
  patternAttachment?: Attachment;

  /**
   * ElementDefinition.pattern[x]
   */
  patternCodeableConcept?: CodeableConcept;

  /**
   * ElementDefinition.pattern[x]
   */
  patternCoding?: Coding;

  /**
   * ElementDefinition.pattern[x]
   */
  patternContactPoint?: ContactPoint;

  /**
   * ElementDefinition.pattern[x]
   */
  patternCount?: Count;

  /**
   * ElementDefinition.pattern[x]
   */
  patternDistance?: Distance;

  /**
   * ElementDefinition.pattern[x]
   */
  patternDuration?: Duration;

  /**
   * ElementDefinition.pattern[x]
   */
  patternHumanName?: HumanName;

  /**
   * ElementDefinition.pattern[x]
   */
  patternIdentifier?: Identifier;

  /**
   * ElementDefinition.pattern[x]
   */
  patternMoney?: Money;

  /**
   * ElementDefinition.pattern[x]
   */
  patternPeriod?: Period;

  /**
   * ElementDefinition.pattern[x]
   */
  patternQuantity?: Quantity;

  /**
   * ElementDefinition.pattern[x]
   */
  patternRange?: Range;

  /**
   * ElementDefinition.pattern[x]
   */
  patternRatio?: Ratio;

  /**
   * ElementDefinition.pattern[x]
   */
  patternReference?: Reference;

  /**
   * ElementDefinition.pattern[x]
   */
  patternSampledData?: SampledData;

  /**
   * ElementDefinition.pattern[x]
   */
  patternSignature?: Signature;

  /**
   * ElementDefinition.pattern[x]
   */
  patternTiming?: Timing;

  /**
   * ElementDefinition.pattern[x]
   */
  patternContactDetail?: ContactDetail;

  /**
   * ElementDefinition.pattern[x]
   */
  patternContributor?: Contributor;

  /**
   * ElementDefinition.pattern[x]
   */
  patternDataRequirement?: DataRequirement;

  /**
   * ElementDefinition.pattern[x]
   */
  patternExpression?: Expression;

  /**
   * ElementDefinition.pattern[x]
   */
  patternParameterDefinition?: ParameterDefinition;

  /**
   * ElementDefinition.pattern[x]
   */
  patternRelatedArtifact?: RelatedArtifact;

  /**
   * ElementDefinition.pattern[x]
   */
  patternTriggerDefinition?: TriggerDefinition;

  /**
   * ElementDefinition.pattern[x]
   */
  patternUsageContext?: UsageContext;

  /**
   * ElementDefinition.pattern[x]
   */
  patternDosage?: Dosage;

  /**
   * ElementDefinition.pattern[x]
   */
  patternMeta?: Meta;

  /**
   * ElementDefinition.example
   */
  example?: ElementDefinitionExample[];

  /**
   * ElementDefinition.minValue[x]
   */
  minValueDate?: string;

  /**
   * ElementDefinition.minValue[x]
   */
  minValueDateTime?: string;

  /**
   * ElementDefinition.minValue[x]
   */
  minValueInstant?: string;

  /**
   * ElementDefinition.minValue[x]
   */
  minValueTime?: string;

  /**
   * ElementDefinition.minValue[x]
   */
  minValueDecimal?: number;

  /**
   * ElementDefinition.minValue[x]
   */
  minValueInteger?: number;

  /**
   * ElementDefinition.minValue[x]
   */
  minValuePositiveInt?: number;

  /**
   * ElementDefinition.minValue[x]
   */
  minValueUnsignedInt?: number;

  /**
   * ElementDefinition.minValue[x]
   */
  minValueQuantity?: Quantity;

  /**
   * ElementDefinition.maxValue[x]
   */
  maxValueDate?: string;

  /**
   * ElementDefinition.maxValue[x]
   */
  maxValueDateTime?: string;

  /**
   * ElementDefinition.maxValue[x]
   */
  maxValueInstant?: string;

  /**
   * ElementDefinition.maxValue[x]
   */
  maxValueTime?: string;

  /**
   * ElementDefinition.maxValue[x]
   */
  maxValueDecimal?: number;

  /**
   * ElementDefinition.maxValue[x]
   */
  maxValueInteger?: number;

  /**
   * ElementDefinition.maxValue[x]
   */
  maxValuePositiveInt?: number;

  /**
   * ElementDefinition.maxValue[x]
   */
  maxValueUnsignedInt?: number;

  /**
   * ElementDefinition.maxValue[x]
   */
  maxValueQuantity?: Quantity;

  /**
   * ElementDefinition.maxLength
   */
  maxLength?: number;

  /**
   * ElementDefinition.condition
   */
  condition?: string[];

  /**
   * ElementDefinition.constraint
   */
  constraint?: ElementDefinitionConstraint[];

  /**
   * ElementDefinition.mustSupport
   */
  mustSupport?: boolean;

  /**
   * ElementDefinition.isModifier
   */
  isModifier?: boolean;

  /**
   * ElementDefinition.isModifierReason
   */
  isModifierReason?: string;

  /**
   * ElementDefinition.isSummary
   */
  isSummary?: boolean;

  /**
   * ElementDefinition.binding
   */
  binding?: ElementDefinitionBinding;

  /**
   * ElementDefinition.mapping
   */
  mapping?: ElementDefinitionMapping[];
}

/**
 * ElementDefinition.defaultValue[x]
 */
export type ElementDefinitionDefaultValue = string | boolean | number | Address | Age | Annotation | Attachment | CodeableConcept | Coding | ContactPoint | Count | Distance | Duration | HumanName | Identifier | Money | Period | Quantity | Range | Ratio | Reference | SampledData | Signature | Timing | ContactDetail | Contributor | DataRequirement | Expression | ParameterDefinition | RelatedArtifact | TriggerDefinition | UsageContext | Dosage | Meta;
/**
 * ElementDefinition.fixed[x]
 */
export type ElementDefinitionFixed = string | boolean | number | Address | Age | Annotation | Attachment | CodeableConcept | Coding | ContactPoint | Count | Distance | Duration | HumanName | Identifier | Money | Period | Quantity | Range | Ratio | Reference | SampledData | Signature | Timing | ContactDetail | Contributor | DataRequirement | Expression | ParameterDefinition | RelatedArtifact | TriggerDefinition | UsageContext | Dosage | Meta;
/**
 * ElementDefinition.pattern[x]
 */
export type ElementDefinitionPattern = string | boolean | number | Address | Age | Annotation | Attachment | CodeableConcept | Coding | ContactPoint | Count | Distance | Duration | HumanName | Identifier | Money | Period | Quantity | Range | Ratio | Reference | SampledData | Signature | Timing | ContactDetail | Contributor | DataRequirement | Expression | ParameterDefinition | RelatedArtifact | TriggerDefinition | UsageContext | Dosage | Meta;
/**
 * ElementDefinition.minValue[x]
 */
export type ElementDefinitionMinValue = string | number | Quantity;
/**
 * ElementDefinition.maxValue[x]
 */
export type ElementDefinitionMaxValue = string | number | Quantity;

/**
 * FHIR R4 ElementDefinitionBase
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ElementDefinitionBase {

  /**
   * ElementDefinition.base.id
   */
  id?: string;

  /**
   * ElementDefinition.base.extension
   */
  extension?: Extension[];

  /**
   * ElementDefinition.base.path
   */
  path: string;

  /**
   * ElementDefinition.base.min
   */
  min: number;

  /**
   * ElementDefinition.base.max
   */
  max: string;
}

/**
 * FHIR R4 ElementDefinitionBinding
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ElementDefinitionBinding {

  /**
   * ElementDefinition.binding.id
   */
  id?: string;

  /**
   * ElementDefinition.binding.extension
   */
  extension?: Extension[];

  /**
   * ElementDefinition.binding.strength
   */
  strength: string;

  /**
   * ElementDefinition.binding.description
   */
  description?: string;

  /**
   * ElementDefinition.binding.valueSet
   */
  valueSet?: string;
}

/**
 * FHIR R4 ElementDefinitionConstraint
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ElementDefinitionConstraint {

  /**
   * ElementDefinition.constraint.id
   */
  id?: string;

  /**
   * ElementDefinition.constraint.extension
   */
  extension?: Extension[];

  /**
   * ElementDefinition.constraint.key
   */
  key: string;

  /**
   * ElementDefinition.constraint.requirements
   */
  requirements?: string;

  /**
   * ElementDefinition.constraint.severity
   */
  severity: string;

  /**
   * ElementDefinition.constraint.human
   */
  human: string;

  /**
   * ElementDefinition.constraint.expression
   */
  expression?: string;

  /**
   * ElementDefinition.constraint.xpath
   */
  xpath?: string;

  /**
   * ElementDefinition.constraint.source
   */
  source?: string;
}

/**
 * FHIR R4 ElementDefinitionExample
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ElementDefinitionExample {

  /**
   * ElementDefinition.example.id
   */
  id?: string;

  /**
   * ElementDefinition.example.extension
   */
  extension?: Extension[];

  /**
   * ElementDefinition.example.label
   */
  label: string;

  /**
   * ElementDefinition.example.value[x]
   */
  valueBase64Binary: string;

  /**
   * ElementDefinition.example.value[x]
   */
  valueBoolean: boolean;

  /**
   * ElementDefinition.example.value[x]
   */
  valueCanonical: string;

  /**
   * ElementDefinition.example.value[x]
   */
  valueCode: string;

  /**
   * ElementDefinition.example.value[x]
   */
  valueDate: string;

  /**
   * ElementDefinition.example.value[x]
   */
  valueDateTime: string;

  /**
   * ElementDefinition.example.value[x]
   */
  valueDecimal: number;

  /**
   * ElementDefinition.example.value[x]
   */
  valueId: string;

  /**
   * ElementDefinition.example.value[x]
   */
  valueInstant: string;

  /**
   * ElementDefinition.example.value[x]
   */
  valueInteger: number;

  /**
   * ElementDefinition.example.value[x]
   */
  valueMarkdown: string;

  /**
   * ElementDefinition.example.value[x]
   */
  valueOid: string;

  /**
   * ElementDefinition.example.value[x]
   */
  valuePositiveInt: number;

  /**
   * ElementDefinition.example.value[x]
   */
  valueString: string;

  /**
   * ElementDefinition.example.value[x]
   */
  valueTime: string;

  /**
   * ElementDefinition.example.value[x]
   */
  valueUnsignedInt: number;

  /**
   * ElementDefinition.example.value[x]
   */
  valueUri: string;

  /**
   * ElementDefinition.example.value[x]
   */
  valueUrl: string;

  /**
   * ElementDefinition.example.value[x]
   */
  valueUuid: string;

  /**
   * ElementDefinition.example.value[x]
   */
  valueAddress: Address;

  /**
   * ElementDefinition.example.value[x]
   */
  valueAge: Age;

  /**
   * ElementDefinition.example.value[x]
   */
  valueAnnotation: Annotation;

  /**
   * ElementDefinition.example.value[x]
   */
  valueAttachment: Attachment;

  /**
   * ElementDefinition.example.value[x]
   */
  valueCodeableConcept: CodeableConcept;

  /**
   * ElementDefinition.example.value[x]
   */
  valueCoding: Coding;

  /**
   * ElementDefinition.example.value[x]
   */
  valueContactPoint: ContactPoint;

  /**
   * ElementDefinition.example.value[x]
   */
  valueCount: Count;

  /**
   * ElementDefinition.example.value[x]
   */
  valueDistance: Distance;

  /**
   * ElementDefinition.example.value[x]
   */
  valueDuration: Duration;

  /**
   * ElementDefinition.example.value[x]
   */
  valueHumanName: HumanName;

  /**
   * ElementDefinition.example.value[x]
   */
  valueIdentifier: Identifier;

  /**
   * ElementDefinition.example.value[x]
   */
  valueMoney: Money;

  /**
   * ElementDefinition.example.value[x]
   */
  valuePeriod: Period;

  /**
   * ElementDefinition.example.value[x]
   */
  valueQuantity: Quantity;

  /**
   * ElementDefinition.example.value[x]
   */
  valueRange: Range;

  /**
   * ElementDefinition.example.value[x]
   */
  valueRatio: Ratio;

  /**
   * ElementDefinition.example.value[x]
   */
  valueReference: Reference;

  /**
   * ElementDefinition.example.value[x]
   */
  valueSampledData: SampledData;

  /**
   * ElementDefinition.example.value[x]
   */
  valueSignature: Signature;

  /**
   * ElementDefinition.example.value[x]
   */
  valueTiming: Timing;

  /**
   * ElementDefinition.example.value[x]
   */
  valueContactDetail: ContactDetail;

  /**
   * ElementDefinition.example.value[x]
   */
  valueContributor: Contributor;

  /**
   * ElementDefinition.example.value[x]
   */
  valueDataRequirement: DataRequirement;

  /**
   * ElementDefinition.example.value[x]
   */
  valueExpression: Expression;

  /**
   * ElementDefinition.example.value[x]
   */
  valueParameterDefinition: ParameterDefinition;

  /**
   * ElementDefinition.example.value[x]
   */
  valueRelatedArtifact: RelatedArtifact;

  /**
   * ElementDefinition.example.value[x]
   */
  valueTriggerDefinition: TriggerDefinition;

  /**
   * ElementDefinition.example.value[x]
   */
  valueUsageContext: UsageContext;

  /**
   * ElementDefinition.example.value[x]
   */
  valueDosage: Dosage;

  /**
   * ElementDefinition.example.value[x]
   */
  valueMeta: Meta;
}

/**
 * FHIR R4 ElementDefinitionMapping
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ElementDefinitionMapping {

  /**
   * ElementDefinition.mapping.id
   */
  id?: string;

  /**
   * ElementDefinition.mapping.extension
   */
  extension?: Extension[];

  /**
   * ElementDefinition.mapping.identity
   */
  identity: string;

  /**
   * ElementDefinition.mapping.language
   */
  language?: string;

  /**
   * ElementDefinition.mapping.map
   */
  map: string;

  /**
   * ElementDefinition.mapping.comment
   */
  comment?: string;
}

/**
 * FHIR R4 ElementDefinitionSlicing
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ElementDefinitionSlicing {

  /**
   * ElementDefinition.slicing.id
   */
  id?: string;

  /**
   * ElementDefinition.slicing.extension
   */
  extension?: Extension[];

  /**
   * ElementDefinition.slicing.discriminator
   */
  discriminator?: ElementDefinitionSlicingDiscriminator[];

  /**
   * ElementDefinition.slicing.description
   */
  description?: string;

  /**
   * ElementDefinition.slicing.ordered
   */
  ordered?: boolean;

  /**
   * ElementDefinition.slicing.rules
   */
  rules: string;
}

/**
 * FHIR R4 ElementDefinitionSlicingDiscriminator
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ElementDefinitionSlicingDiscriminator {

  /**
   * ElementDefinition.slicing.discriminator.id
   */
  id?: string;

  /**
   * ElementDefinition.slicing.discriminator.extension
   */
  extension?: Extension[];

  /**
   * ElementDefinition.slicing.discriminator.type
   */
  type: string;

  /**
   * ElementDefinition.slicing.discriminator.path
   */
  path: string;
}

/**
 * FHIR R4 ElementDefinitionType
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ElementDefinitionType {

  /**
   * ElementDefinition.type.id
   */
  id?: string;

  /**
   * ElementDefinition.type.extension
   */
  extension?: Extension[];

  /**
   * ElementDefinition.type.code
   */
  code: string;

  /**
   * ElementDefinition.type.profile
   */
  profile?: string[];

  /**
   * ElementDefinition.type.targetProfile
   */
  targetProfile?: string[];

  /**
   * ElementDefinition.type.aggregation
   */
  aggregation?: string[];

  /**
   * ElementDefinition.type.versioning
   */
  versioning?: string;
}

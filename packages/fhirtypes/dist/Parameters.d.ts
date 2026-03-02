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
import { Resource } from './Resource';
import { SampledData } from './SampledData';
import { Signature } from './Signature';
import { Timing } from './Timing';
import { TriggerDefinition } from './TriggerDefinition';
import { UsageContext } from './UsageContext';

/**
 * FHIR R4 Parameters
 * @see https://hl7.org/fhir/R4/parameters.html
 */
export interface Parameters {

  /**
   * This is a Parameters resource
   */
  readonly resourceType: 'Parameters';

  /**
   * Parameters.id
   */
  id?: string;

  /**
   * Parameters.meta
   */
  meta?: Meta;

  /**
   * Parameters.implicitRules
   */
  implicitRules?: string;

  /**
   * Parameters.language
   */
  language?: string;

  /**
   * Parameters.parameter
   */
  parameter?: ParametersParameter[];
}

/**
 * FHIR R4 ParametersParameter
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ParametersParameter {

  /**
   * Parameters.parameter.id
   */
  id?: string;

  /**
   * Parameters.parameter.extension
   */
  extension?: Extension[];

  /**
   * Parameters.parameter.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Parameters.parameter.name
   */
  name: string;

  /**
   * Parameters.parameter.value[x]
   */
  valueBase64Binary?: string;

  /**
   * Parameters.parameter.value[x]
   */
  valueBoolean?: boolean;

  /**
   * Parameters.parameter.value[x]
   */
  valueCanonical?: string;

  /**
   * Parameters.parameter.value[x]
   */
  valueCode?: string;

  /**
   * Parameters.parameter.value[x]
   */
  valueDate?: string;

  /**
   * Parameters.parameter.value[x]
   */
  valueDateTime?: string;

  /**
   * Parameters.parameter.value[x]
   */
  valueDecimal?: number;

  /**
   * Parameters.parameter.value[x]
   */
  valueId?: string;

  /**
   * Parameters.parameter.value[x]
   */
  valueInstant?: string;

  /**
   * Parameters.parameter.value[x]
   */
  valueInteger?: number;

  /**
   * Parameters.parameter.value[x]
   */
  valueMarkdown?: string;

  /**
   * Parameters.parameter.value[x]
   */
  valueOid?: string;

  /**
   * Parameters.parameter.value[x]
   */
  valuePositiveInt?: number;

  /**
   * Parameters.parameter.value[x]
   */
  valueString?: string;

  /**
   * Parameters.parameter.value[x]
   */
  valueTime?: string;

  /**
   * Parameters.parameter.value[x]
   */
  valueUnsignedInt?: number;

  /**
   * Parameters.parameter.value[x]
   */
  valueUri?: string;

  /**
   * Parameters.parameter.value[x]
   */
  valueUrl?: string;

  /**
   * Parameters.parameter.value[x]
   */
  valueUuid?: string;

  /**
   * Parameters.parameter.value[x]
   */
  valueAddress?: Address;

  /**
   * Parameters.parameter.value[x]
   */
  valueAge?: Age;

  /**
   * Parameters.parameter.value[x]
   */
  valueAnnotation?: Annotation;

  /**
   * Parameters.parameter.value[x]
   */
  valueAttachment?: Attachment;

  /**
   * Parameters.parameter.value[x]
   */
  valueCodeableConcept?: CodeableConcept;

  /**
   * Parameters.parameter.value[x]
   */
  valueCoding?: Coding;

  /**
   * Parameters.parameter.value[x]
   */
  valueContactPoint?: ContactPoint;

  /**
   * Parameters.parameter.value[x]
   */
  valueCount?: Count;

  /**
   * Parameters.parameter.value[x]
   */
  valueDistance?: Distance;

  /**
   * Parameters.parameter.value[x]
   */
  valueDuration?: Duration;

  /**
   * Parameters.parameter.value[x]
   */
  valueHumanName?: HumanName;

  /**
   * Parameters.parameter.value[x]
   */
  valueIdentifier?: Identifier;

  /**
   * Parameters.parameter.value[x]
   */
  valueMoney?: Money;

  /**
   * Parameters.parameter.value[x]
   */
  valuePeriod?: Period;

  /**
   * Parameters.parameter.value[x]
   */
  valueQuantity?: Quantity;

  /**
   * Parameters.parameter.value[x]
   */
  valueRange?: Range;

  /**
   * Parameters.parameter.value[x]
   */
  valueRatio?: Ratio;

  /**
   * Parameters.parameter.value[x]
   */
  valueReference?: Reference;

  /**
   * Parameters.parameter.value[x]
   */
  valueSampledData?: SampledData;

  /**
   * Parameters.parameter.value[x]
   */
  valueSignature?: Signature;

  /**
   * Parameters.parameter.value[x]
   */
  valueTiming?: Timing;

  /**
   * Parameters.parameter.value[x]
   */
  valueContactDetail?: ContactDetail;

  /**
   * Parameters.parameter.value[x]
   */
  valueContributor?: Contributor;

  /**
   * Parameters.parameter.value[x]
   */
  valueDataRequirement?: DataRequirement;

  /**
   * Parameters.parameter.value[x]
   */
  valueExpression?: Expression;

  /**
   * Parameters.parameter.value[x]
   */
  valueParameterDefinition?: ParameterDefinition;

  /**
   * Parameters.parameter.value[x]
   */
  valueRelatedArtifact?: RelatedArtifact;

  /**
   * Parameters.parameter.value[x]
   */
  valueTriggerDefinition?: TriggerDefinition;

  /**
   * Parameters.parameter.value[x]
   */
  valueUsageContext?: UsageContext;

  /**
   * Parameters.parameter.value[x]
   */
  valueDosage?: Dosage;

  /**
   * Parameters.parameter.value[x]
   */
  valueMeta?: Meta;

  /**
   * Parameters.parameter.resource
   */
  resource?: Resource;
}

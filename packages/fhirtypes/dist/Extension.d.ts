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
 * FHIR R4 Extension
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface Extension {

  /**
   * Extension.id
   */
  id?: string;

  /**
   * Extension.extension
   */
  extension?: Extension[];

  /**
   * Extension.url
   */
  url: string;

  /**
   * Extension.value[x]
   */
  valueBase64Binary?: string;

  /**
   * Extension.value[x]
   */
  valueBoolean?: boolean;

  /**
   * Extension.value[x]
   */
  valueCanonical?: string;

  /**
   * Extension.value[x]
   */
  valueCode?: string;

  /**
   * Extension.value[x]
   */
  valueDate?: string;

  /**
   * Extension.value[x]
   */
  valueDateTime?: string;

  /**
   * Extension.value[x]
   */
  valueDecimal?: number;

  /**
   * Extension.value[x]
   */
  valueId?: string;

  /**
   * Extension.value[x]
   */
  valueInstant?: string;

  /**
   * Extension.value[x]
   */
  valueInteger?: number;

  /**
   * Extension.value[x]
   */
  valueMarkdown?: string;

  /**
   * Extension.value[x]
   */
  valueOid?: string;

  /**
   * Extension.value[x]
   */
  valuePositiveInt?: number;

  /**
   * Extension.value[x]
   */
  valueString?: string;

  /**
   * Extension.value[x]
   */
  valueTime?: string;

  /**
   * Extension.value[x]
   */
  valueUnsignedInt?: number;

  /**
   * Extension.value[x]
   */
  valueUri?: string;

  /**
   * Extension.value[x]
   */
  valueUrl?: string;

  /**
   * Extension.value[x]
   */
  valueUuid?: string;

  /**
   * Extension.value[x]
   */
  valueAddress?: Address;

  /**
   * Extension.value[x]
   */
  valueAge?: Age;

  /**
   * Extension.value[x]
   */
  valueAnnotation?: Annotation;

  /**
   * Extension.value[x]
   */
  valueAttachment?: Attachment;

  /**
   * Extension.value[x]
   */
  valueCodeableConcept?: CodeableConcept;

  /**
   * Extension.value[x]
   */
  valueCoding?: Coding;

  /**
   * Extension.value[x]
   */
  valueContactPoint?: ContactPoint;

  /**
   * Extension.value[x]
   */
  valueCount?: Count;

  /**
   * Extension.value[x]
   */
  valueDistance?: Distance;

  /**
   * Extension.value[x]
   */
  valueDuration?: Duration;

  /**
   * Extension.value[x]
   */
  valueHumanName?: HumanName;

  /**
   * Extension.value[x]
   */
  valueIdentifier?: Identifier;

  /**
   * Extension.value[x]
   */
  valueMoney?: Money;

  /**
   * Extension.value[x]
   */
  valuePeriod?: Period;

  /**
   * Extension.value[x]
   */
  valueQuantity?: Quantity;

  /**
   * Extension.value[x]
   */
  valueRange?: Range;

  /**
   * Extension.value[x]
   */
  valueRatio?: Ratio;

  /**
   * Extension.value[x]
   */
  valueReference?: Reference;

  /**
   * Extension.value[x]
   */
  valueSampledData?: SampledData;

  /**
   * Extension.value[x]
   */
  valueSignature?: Signature;

  /**
   * Extension.value[x]
   */
  valueTiming?: Timing;

  /**
   * Extension.value[x]
   */
  valueContactDetail?: ContactDetail;

  /**
   * Extension.value[x]
   */
  valueContributor?: Contributor;

  /**
   * Extension.value[x]
   */
  valueDataRequirement?: DataRequirement;

  /**
   * Extension.value[x]
   */
  valueExpression?: Expression;

  /**
   * Extension.value[x]
   */
  valueParameterDefinition?: ParameterDefinition;

  /**
   * Extension.value[x]
   */
  valueRelatedArtifact?: RelatedArtifact;

  /**
   * Extension.value[x]
   */
  valueTriggerDefinition?: TriggerDefinition;

  /**
   * Extension.value[x]
   */
  valueUsageContext?: UsageContext;

  /**
   * Extension.value[x]
   */
  valueDosage?: Dosage;

  /**
   * Extension.value[x]
   */
  valueMeta?: Meta;
}

/**
 * Extension.value[x]
 */
export type ExtensionValue = string | boolean | number | Address | Age | Annotation | Attachment | CodeableConcept | Coding | ContactPoint | Count | Distance | Duration | HumanName | Identifier | Money | Period | Quantity | Range | Ratio | Reference | SampledData | Signature | Timing | ContactDetail | Contributor | DataRequirement | Expression | ParameterDefinition | RelatedArtifact | TriggerDefinition | UsageContext | Dosage | Meta;

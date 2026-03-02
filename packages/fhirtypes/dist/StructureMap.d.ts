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
import { Narrative } from './Narrative';
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
 * FHIR R4 StructureMap
 * @see https://hl7.org/fhir/R4/structuremap.html
 */
export interface StructureMap {

  /**
   * This is a StructureMap resource
   */
  readonly resourceType: 'StructureMap';

  /**
   * StructureMap.id
   */
  id?: string;

  /**
   * StructureMap.meta
   */
  meta?: Meta;

  /**
   * StructureMap.implicitRules
   */
  implicitRules?: string;

  /**
   * StructureMap.language
   */
  language?: string;

  /**
   * StructureMap.text
   */
  text?: Narrative;

  /**
   * StructureMap.contained
   */
  contained?: Resource[];

  /**
   * StructureMap.extension
   */
  extension?: Extension[];

  /**
   * StructureMap.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * StructureMap.url
   */
  url: string;

  /**
   * StructureMap.identifier
   */
  identifier?: Identifier[];

  /**
   * StructureMap.version
   */
  version?: string;

  /**
   * StructureMap.name
   */
  name: string;

  /**
   * StructureMap.title
   */
  title?: string;

  /**
   * StructureMap.status
   */
  status: 'draft' | 'active' | 'retired' | 'unknown';

  /**
   * StructureMap.experimental
   */
  experimental?: boolean;

  /**
   * StructureMap.date
   */
  date?: string;

  /**
   * StructureMap.publisher
   */
  publisher?: string;

  /**
   * StructureMap.contact
   */
  contact?: ContactDetail[];

  /**
   * StructureMap.description
   */
  description?: string;

  /**
   * StructureMap.useContext
   */
  useContext?: UsageContext[];

  /**
   * StructureMap.jurisdiction
   */
  jurisdiction?: CodeableConcept[];

  /**
   * StructureMap.purpose
   */
  purpose?: string;

  /**
   * StructureMap.copyright
   */
  copyright?: string;

  /**
   * StructureMap.structure
   */
  structure?: StructureMapStructure[];

  /**
   * StructureMap.import
   */
  import?: string[];

  /**
   * StructureMap.group
   */
  group: StructureMapGroup[];
}

/**
 * FHIR R4 StructureMapGroup
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface StructureMapGroup {

  /**
   * StructureMap.group.id
   */
  id?: string;

  /**
   * StructureMap.group.extension
   */
  extension?: Extension[];

  /**
   * StructureMap.group.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * StructureMap.group.name
   */
  name: string;

  /**
   * StructureMap.group.extends
   */
  extends?: string;

  /**
   * StructureMap.group.typeMode
   */
  typeMode: string;

  /**
   * StructureMap.group.documentation
   */
  documentation?: string;

  /**
   * StructureMap.group.input
   */
  input: StructureMapGroupInput[];

  /**
   * StructureMap.group.rule
   */
  rule: StructureMapGroupRule[];
}

/**
 * FHIR R4 StructureMapGroupInput
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface StructureMapGroupInput {

  /**
   * StructureMap.group.input.id
   */
  id?: string;

  /**
   * StructureMap.group.input.extension
   */
  extension?: Extension[];

  /**
   * StructureMap.group.input.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * StructureMap.group.input.name
   */
  name: string;

  /**
   * StructureMap.group.input.type
   */
  type?: string;

  /**
   * StructureMap.group.input.mode
   */
  mode: string;

  /**
   * StructureMap.group.input.documentation
   */
  documentation?: string;
}

/**
 * FHIR R4 StructureMapGroupRule
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface StructureMapGroupRule {

  /**
   * StructureMap.group.rule.id
   */
  id?: string;

  /**
   * StructureMap.group.rule.extension
   */
  extension?: Extension[];

  /**
   * StructureMap.group.rule.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * StructureMap.group.rule.name
   */
  name: string;

  /**
   * StructureMap.group.rule.source
   */
  source: StructureMapGroupRuleSource[];

  /**
   * StructureMap.group.rule.target
   */
  target?: StructureMapGroupRuleTarget[];

  /**
   * StructureMap.group.rule.dependent
   */
  dependent?: StructureMapGroupRuleDependent[];

  /**
   * StructureMap.group.rule.documentation
   */
  documentation?: string;
}

/**
 * FHIR R4 StructureMapGroupRuleDependent
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface StructureMapGroupRuleDependent {

  /**
   * StructureMap.group.rule.dependent.id
   */
  id?: string;

  /**
   * StructureMap.group.rule.dependent.extension
   */
  extension?: Extension[];

  /**
   * StructureMap.group.rule.dependent.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * StructureMap.group.rule.dependent.name
   */
  name: string;

  /**
   * StructureMap.group.rule.dependent.variable
   */
  variable: string[];
}

/**
 * FHIR R4 StructureMapGroupRuleSource
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface StructureMapGroupRuleSource {

  /**
   * StructureMap.group.rule.source.id
   */
  id?: string;

  /**
   * StructureMap.group.rule.source.extension
   */
  extension?: Extension[];

  /**
   * StructureMap.group.rule.source.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * StructureMap.group.rule.source.context
   */
  context: string;

  /**
   * StructureMap.group.rule.source.min
   */
  min?: number;

  /**
   * StructureMap.group.rule.source.max
   */
  max?: string;

  /**
   * StructureMap.group.rule.source.type
   */
  type?: string;

  /**
   * StructureMap.group.rule.source.defaultValue[x]
   */
  defaultValueBase64Binary?: string;

  /**
   * StructureMap.group.rule.source.defaultValue[x]
   */
  defaultValueBoolean?: boolean;

  /**
   * StructureMap.group.rule.source.defaultValue[x]
   */
  defaultValueCanonical?: string;

  /**
   * StructureMap.group.rule.source.defaultValue[x]
   */
  defaultValueCode?: string;

  /**
   * StructureMap.group.rule.source.defaultValue[x]
   */
  defaultValueDate?: string;

  /**
   * StructureMap.group.rule.source.defaultValue[x]
   */
  defaultValueDateTime?: string;

  /**
   * StructureMap.group.rule.source.defaultValue[x]
   */
  defaultValueDecimal?: number;

  /**
   * StructureMap.group.rule.source.defaultValue[x]
   */
  defaultValueId?: string;

  /**
   * StructureMap.group.rule.source.defaultValue[x]
   */
  defaultValueInstant?: string;

  /**
   * StructureMap.group.rule.source.defaultValue[x]
   */
  defaultValueInteger?: number;

  /**
   * StructureMap.group.rule.source.defaultValue[x]
   */
  defaultValueMarkdown?: string;

  /**
   * StructureMap.group.rule.source.defaultValue[x]
   */
  defaultValueOid?: string;

  /**
   * StructureMap.group.rule.source.defaultValue[x]
   */
  defaultValuePositiveInt?: number;

  /**
   * StructureMap.group.rule.source.defaultValue[x]
   */
  defaultValueString?: string;

  /**
   * StructureMap.group.rule.source.defaultValue[x]
   */
  defaultValueTime?: string;

  /**
   * StructureMap.group.rule.source.defaultValue[x]
   */
  defaultValueUnsignedInt?: number;

  /**
   * StructureMap.group.rule.source.defaultValue[x]
   */
  defaultValueUri?: string;

  /**
   * StructureMap.group.rule.source.defaultValue[x]
   */
  defaultValueUrl?: string;

  /**
   * StructureMap.group.rule.source.defaultValue[x]
   */
  defaultValueUuid?: string;

  /**
   * StructureMap.group.rule.source.defaultValue[x]
   */
  defaultValueAddress?: Address;

  /**
   * StructureMap.group.rule.source.defaultValue[x]
   */
  defaultValueAge?: Age;

  /**
   * StructureMap.group.rule.source.defaultValue[x]
   */
  defaultValueAnnotation?: Annotation;

  /**
   * StructureMap.group.rule.source.defaultValue[x]
   */
  defaultValueAttachment?: Attachment;

  /**
   * StructureMap.group.rule.source.defaultValue[x]
   */
  defaultValueCodeableConcept?: CodeableConcept;

  /**
   * StructureMap.group.rule.source.defaultValue[x]
   */
  defaultValueCoding?: Coding;

  /**
   * StructureMap.group.rule.source.defaultValue[x]
   */
  defaultValueContactPoint?: ContactPoint;

  /**
   * StructureMap.group.rule.source.defaultValue[x]
   */
  defaultValueCount?: Count;

  /**
   * StructureMap.group.rule.source.defaultValue[x]
   */
  defaultValueDistance?: Distance;

  /**
   * StructureMap.group.rule.source.defaultValue[x]
   */
  defaultValueDuration?: Duration;

  /**
   * StructureMap.group.rule.source.defaultValue[x]
   */
  defaultValueHumanName?: HumanName;

  /**
   * StructureMap.group.rule.source.defaultValue[x]
   */
  defaultValueIdentifier?: Identifier;

  /**
   * StructureMap.group.rule.source.defaultValue[x]
   */
  defaultValueMoney?: Money;

  /**
   * StructureMap.group.rule.source.defaultValue[x]
   */
  defaultValuePeriod?: Period;

  /**
   * StructureMap.group.rule.source.defaultValue[x]
   */
  defaultValueQuantity?: Quantity;

  /**
   * StructureMap.group.rule.source.defaultValue[x]
   */
  defaultValueRange?: Range;

  /**
   * StructureMap.group.rule.source.defaultValue[x]
   */
  defaultValueRatio?: Ratio;

  /**
   * StructureMap.group.rule.source.defaultValue[x]
   */
  defaultValueReference?: Reference;

  /**
   * StructureMap.group.rule.source.defaultValue[x]
   */
  defaultValueSampledData?: SampledData;

  /**
   * StructureMap.group.rule.source.defaultValue[x]
   */
  defaultValueSignature?: Signature;

  /**
   * StructureMap.group.rule.source.defaultValue[x]
   */
  defaultValueTiming?: Timing;

  /**
   * StructureMap.group.rule.source.defaultValue[x]
   */
  defaultValueContactDetail?: ContactDetail;

  /**
   * StructureMap.group.rule.source.defaultValue[x]
   */
  defaultValueContributor?: Contributor;

  /**
   * StructureMap.group.rule.source.defaultValue[x]
   */
  defaultValueDataRequirement?: DataRequirement;

  /**
   * StructureMap.group.rule.source.defaultValue[x]
   */
  defaultValueExpression?: Expression;

  /**
   * StructureMap.group.rule.source.defaultValue[x]
   */
  defaultValueParameterDefinition?: ParameterDefinition;

  /**
   * StructureMap.group.rule.source.defaultValue[x]
   */
  defaultValueRelatedArtifact?: RelatedArtifact;

  /**
   * StructureMap.group.rule.source.defaultValue[x]
   */
  defaultValueTriggerDefinition?: TriggerDefinition;

  /**
   * StructureMap.group.rule.source.defaultValue[x]
   */
  defaultValueUsageContext?: UsageContext;

  /**
   * StructureMap.group.rule.source.defaultValue[x]
   */
  defaultValueDosage?: Dosage;

  /**
   * StructureMap.group.rule.source.defaultValue[x]
   */
  defaultValueMeta?: Meta;

  /**
   * StructureMap.group.rule.source.element
   */
  element?: string;

  /**
   * StructureMap.group.rule.source.listMode
   */
  listMode?: string;

  /**
   * StructureMap.group.rule.source.variable
   */
  variable?: string;

  /**
   * StructureMap.group.rule.source.condition
   */
  condition?: string;

  /**
   * StructureMap.group.rule.source.check
   */
  check?: string;

  /**
   * StructureMap.group.rule.source.logMessage
   */
  logMessage?: string;
}

/**
 * FHIR R4 StructureMapGroupRuleTarget
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface StructureMapGroupRuleTarget {

  /**
   * StructureMap.group.rule.target.id
   */
  id?: string;

  /**
   * StructureMap.group.rule.target.extension
   */
  extension?: Extension[];

  /**
   * StructureMap.group.rule.target.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * StructureMap.group.rule.target.context
   */
  context?: string;

  /**
   * StructureMap.group.rule.target.contextType
   */
  contextType?: string;

  /**
   * StructureMap.group.rule.target.element
   */
  element?: string;

  /**
   * StructureMap.group.rule.target.variable
   */
  variable?: string;

  /**
   * StructureMap.group.rule.target.listMode
   */
  listMode?: string[];

  /**
   * StructureMap.group.rule.target.listRuleId
   */
  listRuleId?: string;

  /**
   * StructureMap.group.rule.target.transform
   */
  transform?: string;

  /**
   * StructureMap.group.rule.target.parameter
   */
  parameter?: StructureMapGroupRuleTargetParameter[];
}

/**
 * FHIR R4 StructureMapGroupRuleTargetParameter
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface StructureMapGroupRuleTargetParameter {

  /**
   * StructureMap.group.rule.target.parameter.id
   */
  id?: string;

  /**
   * StructureMap.group.rule.target.parameter.extension
   */
  extension?: Extension[];

  /**
   * StructureMap.group.rule.target.parameter.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * StructureMap.group.rule.target.parameter.value[x]
   */
  valueId: string;

  /**
   * StructureMap.group.rule.target.parameter.value[x]
   */
  valueString: string;

  /**
   * StructureMap.group.rule.target.parameter.value[x]
   */
  valueBoolean: boolean;

  /**
   * StructureMap.group.rule.target.parameter.value[x]
   */
  valueInteger: number;

  /**
   * StructureMap.group.rule.target.parameter.value[x]
   */
  valueDecimal: number;
}

/**
 * FHIR R4 StructureMapStructure
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface StructureMapStructure {

  /**
   * StructureMap.structure.id
   */
  id?: string;

  /**
   * StructureMap.structure.extension
   */
  extension?: Extension[];

  /**
   * StructureMap.structure.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * StructureMap.structure.url
   */
  url: string;

  /**
   * StructureMap.structure.mode
   */
  mode: string;

  /**
   * StructureMap.structure.alias
   */
  alias?: string;

  /**
   * StructureMap.structure.documentation
   */
  documentation?: string;
}

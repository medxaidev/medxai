import { CodeableConcept } from './CodeableConcept';
import { ContactDetail } from './ContactDetail';
import { Extension } from './Extension';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { Resource } from './Resource';
import { UsageContext } from './UsageContext';

/**
 * FHIR R4 OperationDefinition
 * @see https://hl7.org/fhir/R4/operationdefinition.html
 */
export interface OperationDefinition {

  /**
   * This is a OperationDefinition resource
   */
  readonly resourceType: 'OperationDefinition';

  /**
   * OperationDefinition.id
   */
  id?: string;

  /**
   * OperationDefinition.meta
   */
  meta?: Meta;

  /**
   * OperationDefinition.implicitRules
   */
  implicitRules?: string;

  /**
   * OperationDefinition.language
   */
  language?: string;

  /**
   * OperationDefinition.text
   */
  text?: Narrative;

  /**
   * OperationDefinition.contained
   */
  contained?: Resource[];

  /**
   * OperationDefinition.extension
   */
  extension?: Extension[];

  /**
   * OperationDefinition.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * OperationDefinition.url
   */
  url?: string;

  /**
   * OperationDefinition.version
   */
  version?: string;

  /**
   * OperationDefinition.name
   */
  name: string;

  /**
   * OperationDefinition.title
   */
  title?: string;

  /**
   * OperationDefinition.status
   */
  status: 'draft' | 'active' | 'retired' | 'unknown';

  /**
   * OperationDefinition.kind
   */
  kind: string;

  /**
   * OperationDefinition.experimental
   */
  experimental?: boolean;

  /**
   * OperationDefinition.date
   */
  date?: string;

  /**
   * OperationDefinition.publisher
   */
  publisher?: string;

  /**
   * OperationDefinition.contact
   */
  contact?: ContactDetail[];

  /**
   * OperationDefinition.description
   */
  description?: string;

  /**
   * OperationDefinition.useContext
   */
  useContext?: UsageContext[];

  /**
   * OperationDefinition.jurisdiction
   */
  jurisdiction?: CodeableConcept[];

  /**
   * OperationDefinition.purpose
   */
  purpose?: string;

  /**
   * OperationDefinition.affectsState
   */
  affectsState?: boolean;

  /**
   * OperationDefinition.code
   */
  code: string;

  /**
   * OperationDefinition.comment
   */
  comment?: string;

  /**
   * OperationDefinition.base
   */
  base?: string;

  /**
   * OperationDefinition.resource
   */
  resource?: string[];

  /**
   * OperationDefinition.system
   */
  system: boolean;

  /**
   * OperationDefinition.type
   */
  type: boolean;

  /**
   * OperationDefinition.instance
   */
  instance: boolean;

  /**
   * OperationDefinition.inputProfile
   */
  inputProfile?: string;

  /**
   * OperationDefinition.outputProfile
   */
  outputProfile?: string;

  /**
   * OperationDefinition.parameter
   */
  parameter?: OperationDefinitionParameter[];

  /**
   * OperationDefinition.overload
   */
  overload?: OperationDefinitionOverload[];
}

/**
 * FHIR R4 OperationDefinitionOverload
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface OperationDefinitionOverload {

  /**
   * OperationDefinition.overload.id
   */
  id?: string;

  /**
   * OperationDefinition.overload.extension
   */
  extension?: Extension[];

  /**
   * OperationDefinition.overload.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * OperationDefinition.overload.parameterName
   */
  parameterName?: string[];

  /**
   * OperationDefinition.overload.comment
   */
  comment?: string;
}

/**
 * FHIR R4 OperationDefinitionParameter
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface OperationDefinitionParameter {

  /**
   * OperationDefinition.parameter.id
   */
  id?: string;

  /**
   * OperationDefinition.parameter.extension
   */
  extension?: Extension[];

  /**
   * OperationDefinition.parameter.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * OperationDefinition.parameter.name
   */
  name: string;

  /**
   * OperationDefinition.parameter.use
   */
  use: string;

  /**
   * OperationDefinition.parameter.min
   */
  min: number;

  /**
   * OperationDefinition.parameter.max
   */
  max: string;

  /**
   * OperationDefinition.parameter.documentation
   */
  documentation?: string;

  /**
   * OperationDefinition.parameter.type
   */
  type?: string;

  /**
   * OperationDefinition.parameter.targetProfile
   */
  targetProfile?: string[];

  /**
   * OperationDefinition.parameter.searchType
   */
  searchType?: string;

  /**
   * OperationDefinition.parameter.binding
   */
  binding?: OperationDefinitionParameterBinding;

  /**
   * OperationDefinition.parameter.referencedFrom
   */
  referencedFrom?: OperationDefinitionParameterReferencedFrom[];
}

/**
 * FHIR R4 OperationDefinitionParameterBinding
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface OperationDefinitionParameterBinding {

  /**
   * OperationDefinition.parameter.binding.id
   */
  id?: string;

  /**
   * OperationDefinition.parameter.binding.extension
   */
  extension?: Extension[];

  /**
   * OperationDefinition.parameter.binding.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * OperationDefinition.parameter.binding.strength
   */
  strength: string;

  /**
   * OperationDefinition.parameter.binding.valueSet
   */
  valueSet: string;
}

/**
 * FHIR R4 OperationDefinitionParameterReferencedFrom
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface OperationDefinitionParameterReferencedFrom {

  /**
   * OperationDefinition.parameter.referencedFrom.id
   */
  id?: string;

  /**
   * OperationDefinition.parameter.referencedFrom.extension
   */
  extension?: Extension[];

  /**
   * OperationDefinition.parameter.referencedFrom.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * OperationDefinition.parameter.referencedFrom.source
   */
  source: string;

  /**
   * OperationDefinition.parameter.referencedFrom.sourceId
   */
  sourceId?: string;
}

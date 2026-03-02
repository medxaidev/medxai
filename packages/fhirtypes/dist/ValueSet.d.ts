import { CodeableConcept } from './CodeableConcept';
import { Coding } from './Coding';
import { ContactDetail } from './ContactDetail';
import { Extension } from './Extension';
import { Identifier } from './Identifier';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { Resource } from './Resource';
import { UsageContext } from './UsageContext';

/**
 * FHIR R4 ValueSet
 * @see https://hl7.org/fhir/R4/valueset.html
 */
export interface ValueSet {

  /**
   * This is a ValueSet resource
   */
  readonly resourceType: 'ValueSet';

  /**
   * ValueSet.id
   */
  id?: string;

  /**
   * ValueSet.meta
   */
  meta?: Meta;

  /**
   * ValueSet.implicitRules
   */
  implicitRules?: string;

  /**
   * ValueSet.language
   */
  language?: string;

  /**
   * ValueSet.text
   */
  text?: Narrative;

  /**
   * ValueSet.contained
   */
  contained?: Resource[];

  /**
   * ValueSet.extension
   */
  extension?: Extension[];

  /**
   * ValueSet.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * ValueSet.url
   */
  url?: string;

  /**
   * ValueSet.identifier
   */
  identifier?: Identifier[];

  /**
   * ValueSet.version
   */
  version?: string;

  /**
   * ValueSet.name
   */
  name?: string;

  /**
   * ValueSet.title
   */
  title?: string;

  /**
   * ValueSet.status
   */
  status: 'draft' | 'active' | 'retired' | 'unknown';

  /**
   * ValueSet.experimental
   */
  experimental?: boolean;

  /**
   * ValueSet.date
   */
  date?: string;

  /**
   * ValueSet.publisher
   */
  publisher?: string;

  /**
   * ValueSet.contact
   */
  contact?: ContactDetail[];

  /**
   * ValueSet.description
   */
  description?: string;

  /**
   * ValueSet.useContext
   */
  useContext?: UsageContext[];

  /**
   * ValueSet.jurisdiction
   */
  jurisdiction?: CodeableConcept[];

  /**
   * ValueSet.immutable
   */
  immutable?: boolean;

  /**
   * ValueSet.purpose
   */
  purpose?: string;

  /**
   * ValueSet.copyright
   */
  copyright?: string;

  /**
   * ValueSet.compose
   */
  compose?: ValueSetCompose;

  /**
   * ValueSet.expansion
   */
  expansion?: ValueSetExpansion;
}

/**
 * FHIR R4 ValueSetCompose
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ValueSetCompose {

  /**
   * ValueSet.compose.id
   */
  id?: string;

  /**
   * ValueSet.compose.extension
   */
  extension?: Extension[];

  /**
   * ValueSet.compose.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * ValueSet.compose.lockedDate
   */
  lockedDate?: string;

  /**
   * ValueSet.compose.inactive
   */
  inactive?: boolean;

  /**
   * ValueSet.compose.include
   */
  include: ValueSetComposeInclude[];
}

/**
 * FHIR R4 ValueSetComposeInclude
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ValueSetComposeInclude {

  /**
   * ValueSet.compose.include.id
   */
  id?: string;

  /**
   * ValueSet.compose.include.extension
   */
  extension?: Extension[];

  /**
   * ValueSet.compose.include.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * ValueSet.compose.include.system
   */
  system?: string;

  /**
   * ValueSet.compose.include.version
   */
  version?: string;

  /**
   * ValueSet.compose.include.concept
   */
  concept?: ValueSetComposeIncludeConcept[];

  /**
   * ValueSet.compose.include.filter
   */
  filter?: ValueSetComposeIncludeFilter[];

  /**
   * ValueSet.compose.include.valueSet
   */
  valueSet?: string[];
}

/**
 * FHIR R4 ValueSetComposeIncludeConcept
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ValueSetComposeIncludeConcept {

  /**
   * ValueSet.compose.include.concept.id
   */
  id?: string;

  /**
   * ValueSet.compose.include.concept.extension
   */
  extension?: Extension[];

  /**
   * ValueSet.compose.include.concept.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * ValueSet.compose.include.concept.code
   */
  code: string;

  /**
   * ValueSet.compose.include.concept.display
   */
  display?: string;

  /**
   * ValueSet.compose.include.concept.designation
   */
  designation?: ValueSetComposeIncludeConceptDesignation[];
}

/**
 * FHIR R4 ValueSetComposeIncludeConceptDesignation
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ValueSetComposeIncludeConceptDesignation {

  /**
   * ValueSet.compose.include.concept.designation.id
   */
  id?: string;

  /**
   * ValueSet.compose.include.concept.designation.extension
   */
  extension?: Extension[];

  /**
   * ValueSet.compose.include.concept.designation.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * ValueSet.compose.include.concept.designation.language
   */
  language?: string;

  /**
   * ValueSet.compose.include.concept.designation.use
   */
  use?: Coding;

  /**
   * ValueSet.compose.include.concept.designation.value
   */
  value: string;
}

/**
 * FHIR R4 ValueSetComposeIncludeFilter
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ValueSetComposeIncludeFilter {

  /**
   * ValueSet.compose.include.filter.id
   */
  id?: string;

  /**
   * ValueSet.compose.include.filter.extension
   */
  extension?: Extension[];

  /**
   * ValueSet.compose.include.filter.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * ValueSet.compose.include.filter.property
   */
  property: string;

  /**
   * ValueSet.compose.include.filter.op
   */
  op: string;

  /**
   * ValueSet.compose.include.filter.value
   */
  value: string;
}

/**
 * FHIR R4 ValueSetExpansion
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ValueSetExpansion {

  /**
   * ValueSet.expansion.id
   */
  id?: string;

  /**
   * ValueSet.expansion.extension
   */
  extension?: Extension[];

  /**
   * ValueSet.expansion.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * ValueSet.expansion.identifier
   */
  identifier?: string;

  /**
   * ValueSet.expansion.timestamp
   */
  timestamp: string;

  /**
   * ValueSet.expansion.total
   */
  total?: number;

  /**
   * ValueSet.expansion.offset
   */
  offset?: number;

  /**
   * ValueSet.expansion.parameter
   */
  parameter?: ValueSetExpansionParameter[];

  /**
   * ValueSet.expansion.contains
   */
  contains?: ValueSetExpansionContains[];
}

/**
 * FHIR R4 ValueSetExpansionContains
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ValueSetExpansionContains {

  /**
   * ValueSet.expansion.contains.id
   */
  id?: string;

  /**
   * ValueSet.expansion.contains.extension
   */
  extension?: Extension[];

  /**
   * ValueSet.expansion.contains.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * ValueSet.expansion.contains.system
   */
  system?: string;

  /**
   * ValueSet.expansion.contains.abstract
   */
  abstract?: boolean;

  /**
   * ValueSet.expansion.contains.inactive
   */
  inactive?: boolean;

  /**
   * ValueSet.expansion.contains.version
   */
  version?: string;

  /**
   * ValueSet.expansion.contains.code
   */
  code?: string;

  /**
   * ValueSet.expansion.contains.display
   */
  display?: string;
}

/**
 * FHIR R4 ValueSetExpansionParameter
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ValueSetExpansionParameter {

  /**
   * ValueSet.expansion.parameter.id
   */
  id?: string;

  /**
   * ValueSet.expansion.parameter.extension
   */
  extension?: Extension[];

  /**
   * ValueSet.expansion.parameter.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * ValueSet.expansion.parameter.name
   */
  name: string;

  /**
   * ValueSet.expansion.parameter.value[x]
   */
  valueString?: string;

  /**
   * ValueSet.expansion.parameter.value[x]
   */
  valueBoolean?: boolean;

  /**
   * ValueSet.expansion.parameter.value[x]
   */
  valueInteger?: number;

  /**
   * ValueSet.expansion.parameter.value[x]
   */
  valueDecimal?: number;

  /**
   * ValueSet.expansion.parameter.value[x]
   */
  valueUri?: string;

  /**
   * ValueSet.expansion.parameter.value[x]
   */
  valueCode?: string;

  /**
   * ValueSet.expansion.parameter.value[x]
   */
  valueDateTime?: string;
}

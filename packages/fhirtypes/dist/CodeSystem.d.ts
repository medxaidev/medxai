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
 * FHIR R4 CodeSystem
 * @see https://hl7.org/fhir/R4/codesystem.html
 */
export interface CodeSystem {

  /**
   * This is a CodeSystem resource
   */
  readonly resourceType: 'CodeSystem';

  /**
   * CodeSystem.id
   */
  id?: string;

  /**
   * CodeSystem.meta
   */
  meta?: Meta;

  /**
   * CodeSystem.implicitRules
   */
  implicitRules?: string;

  /**
   * CodeSystem.language
   */
  language?: string;

  /**
   * CodeSystem.text
   */
  text?: Narrative;

  /**
   * CodeSystem.contained
   */
  contained?: Resource[];

  /**
   * CodeSystem.extension
   */
  extension?: Extension[];

  /**
   * CodeSystem.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * CodeSystem.url
   */
  url?: string;

  /**
   * CodeSystem.identifier
   */
  identifier?: Identifier[];

  /**
   * CodeSystem.version
   */
  version?: string;

  /**
   * CodeSystem.name
   */
  name?: string;

  /**
   * CodeSystem.title
   */
  title?: string;

  /**
   * CodeSystem.status
   */
  status: 'draft' | 'active' | 'retired' | 'unknown';

  /**
   * CodeSystem.experimental
   */
  experimental?: boolean;

  /**
   * CodeSystem.date
   */
  date?: string;

  /**
   * CodeSystem.publisher
   */
  publisher?: string;

  /**
   * CodeSystem.contact
   */
  contact?: ContactDetail[];

  /**
   * CodeSystem.description
   */
  description?: string;

  /**
   * CodeSystem.useContext
   */
  useContext?: UsageContext[];

  /**
   * CodeSystem.jurisdiction
   */
  jurisdiction?: CodeableConcept[];

  /**
   * CodeSystem.purpose
   */
  purpose?: string;

  /**
   * CodeSystem.copyright
   */
  copyright?: string;

  /**
   * CodeSystem.caseSensitive
   */
  caseSensitive?: boolean;

  /**
   * CodeSystem.valueSet
   */
  valueSet?: string;

  /**
   * CodeSystem.hierarchyMeaning
   */
  hierarchyMeaning?: string;

  /**
   * CodeSystem.compositional
   */
  compositional?: boolean;

  /**
   * CodeSystem.versionNeeded
   */
  versionNeeded?: boolean;

  /**
   * CodeSystem.content
   */
  content: string;

  /**
   * CodeSystem.supplements
   */
  supplements?: string;

  /**
   * CodeSystem.count
   */
  count?: number;

  /**
   * CodeSystem.filter
   */
  filter?: CodeSystemFilter[];

  /**
   * CodeSystem.property
   */
  property?: CodeSystemProperty[];

  /**
   * CodeSystem.concept
   */
  concept?: CodeSystemConcept[];
}

/**
 * FHIR R4 CodeSystemConcept
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface CodeSystemConcept {

  /**
   * CodeSystem.concept.id
   */
  id?: string;

  /**
   * CodeSystem.concept.extension
   */
  extension?: Extension[];

  /**
   * CodeSystem.concept.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * CodeSystem.concept.code
   */
  code: string;

  /**
   * CodeSystem.concept.display
   */
  display?: string;

  /**
   * CodeSystem.concept.definition
   */
  definition?: string;

  /**
   * CodeSystem.concept.designation
   */
  designation?: CodeSystemConceptDesignation[];

  /**
   * CodeSystem.concept.property
   */
  property?: CodeSystemConceptProperty[];
}

/**
 * FHIR R4 CodeSystemConceptDesignation
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface CodeSystemConceptDesignation {

  /**
   * CodeSystem.concept.designation.id
   */
  id?: string;

  /**
   * CodeSystem.concept.designation.extension
   */
  extension?: Extension[];

  /**
   * CodeSystem.concept.designation.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * CodeSystem.concept.designation.language
   */
  language?: string;

  /**
   * CodeSystem.concept.designation.use
   */
  use?: Coding;

  /**
   * CodeSystem.concept.designation.value
   */
  value: string;
}

/**
 * FHIR R4 CodeSystemConceptProperty
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface CodeSystemConceptProperty {

  /**
   * CodeSystem.concept.property.id
   */
  id?: string;

  /**
   * CodeSystem.concept.property.extension
   */
  extension?: Extension[];

  /**
   * CodeSystem.concept.property.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * CodeSystem.concept.property.code
   */
  code: string;

  /**
   * CodeSystem.concept.property.value[x]
   */
  valueCode: string;

  /**
   * CodeSystem.concept.property.value[x]
   */
  valueCoding: Coding;

  /**
   * CodeSystem.concept.property.value[x]
   */
  valueString: string;

  /**
   * CodeSystem.concept.property.value[x]
   */
  valueInteger: number;

  /**
   * CodeSystem.concept.property.value[x]
   */
  valueBoolean: boolean;

  /**
   * CodeSystem.concept.property.value[x]
   */
  valueDateTime: string;

  /**
   * CodeSystem.concept.property.value[x]
   */
  valueDecimal: number;
}

/**
 * FHIR R4 CodeSystemFilter
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface CodeSystemFilter {

  /**
   * CodeSystem.filter.id
   */
  id?: string;

  /**
   * CodeSystem.filter.extension
   */
  extension?: Extension[];

  /**
   * CodeSystem.filter.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * CodeSystem.filter.code
   */
  code: string;

  /**
   * CodeSystem.filter.description
   */
  description?: string;

  /**
   * CodeSystem.filter.operator
   */
  operator: string[];

  /**
   * CodeSystem.filter.value
   */
  value: string;
}

/**
 * FHIR R4 CodeSystemProperty
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface CodeSystemProperty {

  /**
   * CodeSystem.property.id
   */
  id?: string;

  /**
   * CodeSystem.property.extension
   */
  extension?: Extension[];

  /**
   * CodeSystem.property.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * CodeSystem.property.code
   */
  code: string;

  /**
   * CodeSystem.property.uri
   */
  uri?: string;

  /**
   * CodeSystem.property.description
   */
  description?: string;

  /**
   * CodeSystem.property.type
   */
  type: string;
}

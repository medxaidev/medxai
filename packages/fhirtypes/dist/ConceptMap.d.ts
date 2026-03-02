import { CodeableConcept } from './CodeableConcept';
import { ContactDetail } from './ContactDetail';
import { Extension } from './Extension';
import { Identifier } from './Identifier';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { Resource } from './Resource';
import { UsageContext } from './UsageContext';

/**
 * FHIR R4 ConceptMap
 * @see https://hl7.org/fhir/R4/conceptmap.html
 */
export interface ConceptMap {

  /**
   * This is a ConceptMap resource
   */
  readonly resourceType: 'ConceptMap';

  /**
   * ConceptMap.id
   */
  id?: string;

  /**
   * ConceptMap.meta
   */
  meta?: Meta;

  /**
   * ConceptMap.implicitRules
   */
  implicitRules?: string;

  /**
   * ConceptMap.language
   */
  language?: string;

  /**
   * ConceptMap.text
   */
  text?: Narrative;

  /**
   * ConceptMap.contained
   */
  contained?: Resource[];

  /**
   * ConceptMap.extension
   */
  extension?: Extension[];

  /**
   * ConceptMap.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * ConceptMap.url
   */
  url?: string;

  /**
   * ConceptMap.identifier
   */
  identifier?: Identifier;

  /**
   * ConceptMap.version
   */
  version?: string;

  /**
   * ConceptMap.name
   */
  name?: string;

  /**
   * ConceptMap.title
   */
  title?: string;

  /**
   * ConceptMap.status
   */
  status: 'draft' | 'active' | 'retired' | 'unknown';

  /**
   * ConceptMap.experimental
   */
  experimental?: boolean;

  /**
   * ConceptMap.date
   */
  date?: string;

  /**
   * ConceptMap.publisher
   */
  publisher?: string;

  /**
   * ConceptMap.contact
   */
  contact?: ContactDetail[];

  /**
   * ConceptMap.description
   */
  description?: string;

  /**
   * ConceptMap.useContext
   */
  useContext?: UsageContext[];

  /**
   * ConceptMap.jurisdiction
   */
  jurisdiction?: CodeableConcept[];

  /**
   * ConceptMap.purpose
   */
  purpose?: string;

  /**
   * ConceptMap.copyright
   */
  copyright?: string;

  /**
   * ConceptMap.source[x]
   */
  sourceUri?: string;

  /**
   * ConceptMap.source[x]
   */
  sourceCanonical?: string;

  /**
   * ConceptMap.target[x]
   */
  targetUri?: string;

  /**
   * ConceptMap.target[x]
   */
  targetCanonical?: string;

  /**
   * ConceptMap.group
   */
  group?: ConceptMapGroup[];
}

/**
 * ConceptMap.source[x]
 */
export type ConceptMapSource = string;
/**
 * ConceptMap.target[x]
 */
export type ConceptMapTarget = string;

/**
 * FHIR R4 ConceptMapGroup
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ConceptMapGroup {

  /**
   * ConceptMap.group.id
   */
  id?: string;

  /**
   * ConceptMap.group.extension
   */
  extension?: Extension[];

  /**
   * ConceptMap.group.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * ConceptMap.group.source
   */
  source?: string;

  /**
   * ConceptMap.group.sourceVersion
   */
  sourceVersion?: string;

  /**
   * ConceptMap.group.target
   */
  target?: string;

  /**
   * ConceptMap.group.targetVersion
   */
  targetVersion?: string;

  /**
   * ConceptMap.group.element
   */
  element: ConceptMapGroupElement[];

  /**
   * ConceptMap.group.unmapped
   */
  unmapped?: ConceptMapGroupUnmapped;
}

/**
 * FHIR R4 ConceptMapGroupElement
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ConceptMapGroupElement {

  /**
   * ConceptMap.group.element.id
   */
  id?: string;

  /**
   * ConceptMap.group.element.extension
   */
  extension?: Extension[];

  /**
   * ConceptMap.group.element.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * ConceptMap.group.element.code
   */
  code?: string;

  /**
   * ConceptMap.group.element.display
   */
  display?: string;

  /**
   * ConceptMap.group.element.target
   */
  target?: ConceptMapGroupElementTarget[];
}

/**
 * FHIR R4 ConceptMapGroupElementTarget
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ConceptMapGroupElementTarget {

  /**
   * ConceptMap.group.element.target.id
   */
  id?: string;

  /**
   * ConceptMap.group.element.target.extension
   */
  extension?: Extension[];

  /**
   * ConceptMap.group.element.target.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * ConceptMap.group.element.target.code
   */
  code?: string;

  /**
   * ConceptMap.group.element.target.display
   */
  display?: string;

  /**
   * ConceptMap.group.element.target.equivalence
   */
  equivalence: string;

  /**
   * ConceptMap.group.element.target.comment
   */
  comment?: string;

  /**
   * ConceptMap.group.element.target.dependsOn
   */
  dependsOn?: ConceptMapGroupElementTargetDependsOn[];
}

/**
 * FHIR R4 ConceptMapGroupElementTargetDependsOn
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ConceptMapGroupElementTargetDependsOn {

  /**
   * ConceptMap.group.element.target.dependsOn.id
   */
  id?: string;

  /**
   * ConceptMap.group.element.target.dependsOn.extension
   */
  extension?: Extension[];

  /**
   * ConceptMap.group.element.target.dependsOn.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * ConceptMap.group.element.target.dependsOn.property
   */
  property: string;

  /**
   * ConceptMap.group.element.target.dependsOn.system
   */
  system?: string;

  /**
   * ConceptMap.group.element.target.dependsOn.value
   */
  value: string;

  /**
   * ConceptMap.group.element.target.dependsOn.display
   */
  display?: string;
}

/**
 * FHIR R4 ConceptMapGroupUnmapped
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ConceptMapGroupUnmapped {

  /**
   * ConceptMap.group.unmapped.id
   */
  id?: string;

  /**
   * ConceptMap.group.unmapped.extension
   */
  extension?: Extension[];

  /**
   * ConceptMap.group.unmapped.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * ConceptMap.group.unmapped.mode
   */
  mode: string;

  /**
   * ConceptMap.group.unmapped.code
   */
  code?: string;

  /**
   * ConceptMap.group.unmapped.display
   */
  display?: string;

  /**
   * ConceptMap.group.unmapped.url
   */
  url?: string;
}

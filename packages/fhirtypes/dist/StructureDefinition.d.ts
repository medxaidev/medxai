import { CodeableConcept } from './CodeableConcept';
import { Coding } from './Coding';
import { ContactDetail } from './ContactDetail';
import { ElementDefinition } from './ElementDefinition';
import { Extension } from './Extension';
import { Identifier } from './Identifier';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { Resource } from './Resource';
import { UsageContext } from './UsageContext';

/**
 * FHIR R4 StructureDefinition
 * @see https://hl7.org/fhir/R4/structuredefinition.html
 */
export interface StructureDefinition {

  /**
   * This is a StructureDefinition resource
   */
  readonly resourceType: 'StructureDefinition';

  /**
   * StructureDefinition.id
   */
  id?: string;

  /**
   * StructureDefinition.meta
   */
  meta?: Meta;

  /**
   * StructureDefinition.implicitRules
   */
  implicitRules?: string;

  /**
   * StructureDefinition.language
   */
  language?: string;

  /**
   * StructureDefinition.text
   */
  text?: Narrative;

  /**
   * StructureDefinition.contained
   */
  contained?: Resource[];

  /**
   * StructureDefinition.extension
   */
  extension?: Extension[];

  /**
   * StructureDefinition.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * StructureDefinition.url
   */
  url: string;

  /**
   * StructureDefinition.identifier
   */
  identifier?: Identifier[];

  /**
   * StructureDefinition.version
   */
  version?: string;

  /**
   * StructureDefinition.name
   */
  name: string;

  /**
   * StructureDefinition.title
   */
  title?: string;

  /**
   * StructureDefinition.status
   */
  status: 'draft' | 'active' | 'retired' | 'unknown';

  /**
   * StructureDefinition.experimental
   */
  experimental?: boolean;

  /**
   * StructureDefinition.date
   */
  date?: string;

  /**
   * StructureDefinition.publisher
   */
  publisher?: string;

  /**
   * StructureDefinition.contact
   */
  contact?: ContactDetail[];

  /**
   * StructureDefinition.description
   */
  description?: string;

  /**
   * StructureDefinition.useContext
   */
  useContext?: UsageContext[];

  /**
   * StructureDefinition.jurisdiction
   */
  jurisdiction?: CodeableConcept[];

  /**
   * StructureDefinition.purpose
   */
  purpose?: string;

  /**
   * StructureDefinition.copyright
   */
  copyright?: string;

  /**
   * StructureDefinition.keyword
   */
  keyword?: Coding[];

  /**
   * StructureDefinition.fhirVersion
   */
  fhirVersion?: string;

  /**
   * StructureDefinition.mapping
   */
  mapping?: StructureDefinitionMapping[];

  /**
   * StructureDefinition.kind
   */
  kind: string;

  /**
   * StructureDefinition.abstract
   */
  abstract: boolean;

  /**
   * StructureDefinition.context
   */
  context?: StructureDefinitionContext[];

  /**
   * StructureDefinition.contextInvariant
   */
  contextInvariant?: string[];

  /**
   * StructureDefinition.type
   */
  type: string;

  /**
   * StructureDefinition.baseDefinition
   */
  baseDefinition?: string;

  /**
   * StructureDefinition.derivation
   */
  derivation?: string;

  /**
   * StructureDefinition.snapshot
   */
  snapshot?: StructureDefinitionSnapshot;

  /**
   * StructureDefinition.differential
   */
  differential?: StructureDefinitionDifferential;
}

/**
 * FHIR R4 StructureDefinitionContext
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface StructureDefinitionContext {

  /**
   * StructureDefinition.context.id
   */
  id?: string;

  /**
   * StructureDefinition.context.extension
   */
  extension?: Extension[];

  /**
   * StructureDefinition.context.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * StructureDefinition.context.type
   */
  type: string;

  /**
   * StructureDefinition.context.expression
   */
  expression: string;
}

/**
 * FHIR R4 StructureDefinitionDifferential
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface StructureDefinitionDifferential {

  /**
   * StructureDefinition.differential.id
   */
  id?: string;

  /**
   * StructureDefinition.differential.extension
   */
  extension?: Extension[];

  /**
   * StructureDefinition.differential.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * StructureDefinition.differential.element
   */
  element: ElementDefinition[];
}

/**
 * FHIR R4 StructureDefinitionMapping
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface StructureDefinitionMapping {

  /**
   * StructureDefinition.mapping.id
   */
  id?: string;

  /**
   * StructureDefinition.mapping.extension
   */
  extension?: Extension[];

  /**
   * StructureDefinition.mapping.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * StructureDefinition.mapping.identity
   */
  identity: string;

  /**
   * StructureDefinition.mapping.uri
   */
  uri?: string;

  /**
   * StructureDefinition.mapping.name
   */
  name?: string;

  /**
   * StructureDefinition.mapping.comment
   */
  comment?: string;
}

/**
 * FHIR R4 StructureDefinitionSnapshot
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface StructureDefinitionSnapshot {

  /**
   * StructureDefinition.snapshot.id
   */
  id?: string;

  /**
   * StructureDefinition.snapshot.extension
   */
  extension?: Extension[];

  /**
   * StructureDefinition.snapshot.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * StructureDefinition.snapshot.element
   */
  element: ElementDefinition[];
}

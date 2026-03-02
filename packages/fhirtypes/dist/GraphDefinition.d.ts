import { CodeableConcept } from './CodeableConcept';
import { ContactDetail } from './ContactDetail';
import { Extension } from './Extension';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { Resource } from './Resource';
import { UsageContext } from './UsageContext';

/**
 * FHIR R4 GraphDefinition
 * @see https://hl7.org/fhir/R4/graphdefinition.html
 */
export interface GraphDefinition {

  /**
   * This is a GraphDefinition resource
   */
  readonly resourceType: 'GraphDefinition';

  /**
   * GraphDefinition.id
   */
  id?: string;

  /**
   * GraphDefinition.meta
   */
  meta?: Meta;

  /**
   * GraphDefinition.implicitRules
   */
  implicitRules?: string;

  /**
   * GraphDefinition.language
   */
  language?: string;

  /**
   * GraphDefinition.text
   */
  text?: Narrative;

  /**
   * GraphDefinition.contained
   */
  contained?: Resource[];

  /**
   * GraphDefinition.extension
   */
  extension?: Extension[];

  /**
   * GraphDefinition.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * GraphDefinition.url
   */
  url?: string;

  /**
   * GraphDefinition.version
   */
  version?: string;

  /**
   * GraphDefinition.name
   */
  name: string;

  /**
   * GraphDefinition.status
   */
  status: 'draft' | 'active' | 'retired' | 'unknown';

  /**
   * GraphDefinition.experimental
   */
  experimental?: boolean;

  /**
   * GraphDefinition.date
   */
  date?: string;

  /**
   * GraphDefinition.publisher
   */
  publisher?: string;

  /**
   * GraphDefinition.contact
   */
  contact?: ContactDetail[];

  /**
   * GraphDefinition.description
   */
  description?: string;

  /**
   * GraphDefinition.useContext
   */
  useContext?: UsageContext[];

  /**
   * GraphDefinition.jurisdiction
   */
  jurisdiction?: CodeableConcept[];

  /**
   * GraphDefinition.purpose
   */
  purpose?: string;

  /**
   * GraphDefinition.start
   */
  start: string;

  /**
   * GraphDefinition.profile
   */
  profile?: string;

  /**
   * GraphDefinition.link
   */
  link?: GraphDefinitionLink[];
}

/**
 * FHIR R4 GraphDefinitionLink
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface GraphDefinitionLink {

  /**
   * GraphDefinition.link.id
   */
  id?: string;

  /**
   * GraphDefinition.link.extension
   */
  extension?: Extension[];

  /**
   * GraphDefinition.link.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * GraphDefinition.link.path
   */
  path?: string;

  /**
   * GraphDefinition.link.sliceName
   */
  sliceName?: string;

  /**
   * GraphDefinition.link.min
   */
  min?: number;

  /**
   * GraphDefinition.link.max
   */
  max?: string;

  /**
   * GraphDefinition.link.description
   */
  description?: string;

  /**
   * GraphDefinition.link.target
   */
  target?: GraphDefinitionLinkTarget[];
}

/**
 * FHIR R4 GraphDefinitionLinkTarget
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface GraphDefinitionLinkTarget {

  /**
   * GraphDefinition.link.target.id
   */
  id?: string;

  /**
   * GraphDefinition.link.target.extension
   */
  extension?: Extension[];

  /**
   * GraphDefinition.link.target.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * GraphDefinition.link.target.type
   */
  type: string;

  /**
   * GraphDefinition.link.target.params
   */
  params?: string;

  /**
   * GraphDefinition.link.target.profile
   */
  profile?: string;

  /**
   * GraphDefinition.link.target.compartment
   */
  compartment?: GraphDefinitionLinkTargetCompartment[];
}

/**
 * FHIR R4 GraphDefinitionLinkTargetCompartment
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface GraphDefinitionLinkTargetCompartment {

  /**
   * GraphDefinition.link.target.compartment.id
   */
  id?: string;

  /**
   * GraphDefinition.link.target.compartment.extension
   */
  extension?: Extension[];

  /**
   * GraphDefinition.link.target.compartment.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * GraphDefinition.link.target.compartment.use
   */
  use: string;

  /**
   * GraphDefinition.link.target.compartment.code
   */
  code: string;

  /**
   * GraphDefinition.link.target.compartment.rule
   */
  rule: string;

  /**
   * GraphDefinition.link.target.compartment.expression
   */
  expression?: string;

  /**
   * GraphDefinition.link.target.compartment.description
   */
  description?: string;
}

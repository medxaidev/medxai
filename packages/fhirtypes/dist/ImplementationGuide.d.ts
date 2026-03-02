import { Binary } from './Binary';
import { CodeableConcept } from './CodeableConcept';
import { ContactDetail } from './ContactDetail';
import { Extension } from './Extension';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { Reference } from './Reference';
import { Resource } from './Resource';
import { UsageContext } from './UsageContext';

/**
 * FHIR R4 ImplementationGuide
 * @see https://hl7.org/fhir/R4/implementationguide.html
 */
export interface ImplementationGuide {

  /**
   * This is a ImplementationGuide resource
   */
  readonly resourceType: 'ImplementationGuide';

  /**
   * ImplementationGuide.id
   */
  id?: string;

  /**
   * ImplementationGuide.meta
   */
  meta?: Meta;

  /**
   * ImplementationGuide.implicitRules
   */
  implicitRules?: string;

  /**
   * ImplementationGuide.language
   */
  language?: string;

  /**
   * ImplementationGuide.text
   */
  text?: Narrative;

  /**
   * ImplementationGuide.contained
   */
  contained?: Resource[];

  /**
   * ImplementationGuide.extension
   */
  extension?: Extension[];

  /**
   * ImplementationGuide.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * ImplementationGuide.url
   */
  url: string;

  /**
   * ImplementationGuide.version
   */
  version?: string;

  /**
   * ImplementationGuide.name
   */
  name: string;

  /**
   * ImplementationGuide.title
   */
  title?: string;

  /**
   * ImplementationGuide.status
   */
  status: 'draft' | 'active' | 'retired' | 'unknown';

  /**
   * ImplementationGuide.experimental
   */
  experimental?: boolean;

  /**
   * ImplementationGuide.date
   */
  date?: string;

  /**
   * ImplementationGuide.publisher
   */
  publisher?: string;

  /**
   * ImplementationGuide.contact
   */
  contact?: ContactDetail[];

  /**
   * ImplementationGuide.description
   */
  description?: string;

  /**
   * ImplementationGuide.useContext
   */
  useContext?: UsageContext[];

  /**
   * ImplementationGuide.jurisdiction
   */
  jurisdiction?: CodeableConcept[];

  /**
   * ImplementationGuide.copyright
   */
  copyright?: string;

  /**
   * ImplementationGuide.packageId
   */
  packageId: string;

  /**
   * ImplementationGuide.license
   */
  license?: string;

  /**
   * ImplementationGuide.fhirVersion
   */
  fhirVersion: string[];

  /**
   * ImplementationGuide.dependsOn
   */
  dependsOn?: ImplementationGuideDependsOn[];

  /**
   * ImplementationGuide.global
   */
  global?: ImplementationGuideGlobal[];

  /**
   * ImplementationGuide.definition
   */
  definition?: ImplementationGuideDefinition;

  /**
   * ImplementationGuide.manifest
   */
  manifest?: ImplementationGuideManifest;
}

/**
 * FHIR R4 ImplementationGuideDefinition
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ImplementationGuideDefinition {

  /**
   * ImplementationGuide.definition.id
   */
  id?: string;

  /**
   * ImplementationGuide.definition.extension
   */
  extension?: Extension[];

  /**
   * ImplementationGuide.definition.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * ImplementationGuide.definition.grouping
   */
  grouping?: ImplementationGuideDefinitionGrouping[];

  /**
   * ImplementationGuide.definition.resource
   */
  resource: ImplementationGuideDefinitionResource[];

  /**
   * ImplementationGuide.definition.page
   */
  page?: ImplementationGuideDefinitionPage;

  /**
   * ImplementationGuide.definition.parameter
   */
  parameter?: ImplementationGuideDefinitionParameter[];

  /**
   * ImplementationGuide.definition.template
   */
  template?: ImplementationGuideDefinitionTemplate[];
}

/**
 * FHIR R4 ImplementationGuideDefinitionGrouping
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ImplementationGuideDefinitionGrouping {

  /**
   * ImplementationGuide.definition.grouping.id
   */
  id?: string;

  /**
   * ImplementationGuide.definition.grouping.extension
   */
  extension?: Extension[];

  /**
   * ImplementationGuide.definition.grouping.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * ImplementationGuide.definition.grouping.name
   */
  name: string;

  /**
   * ImplementationGuide.definition.grouping.description
   */
  description?: string;
}

/**
 * FHIR R4 ImplementationGuideDefinitionPage
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ImplementationGuideDefinitionPage {

  /**
   * ImplementationGuide.definition.page.id
   */
  id?: string;

  /**
   * ImplementationGuide.definition.page.extension
   */
  extension?: Extension[];

  /**
   * ImplementationGuide.definition.page.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * ImplementationGuide.definition.page.name[x]
   */
  nameUrl: string;

  /**
   * ImplementationGuide.definition.page.name[x]
   */
  nameReference: Reference<Binary>;

  /**
   * ImplementationGuide.definition.page.title
   */
  title: string;

  /**
   * ImplementationGuide.definition.page.generation
   */
  generation: string;
}

/**
 * FHIR R4 ImplementationGuideDefinitionParameter
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ImplementationGuideDefinitionParameter {

  /**
   * ImplementationGuide.definition.parameter.id
   */
  id?: string;

  /**
   * ImplementationGuide.definition.parameter.extension
   */
  extension?: Extension[];

  /**
   * ImplementationGuide.definition.parameter.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * ImplementationGuide.definition.parameter.code
   */
  code: string;

  /**
   * ImplementationGuide.definition.parameter.value
   */
  value: string;
}

/**
 * FHIR R4 ImplementationGuideDefinitionResource
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ImplementationGuideDefinitionResource {

  /**
   * ImplementationGuide.definition.resource.id
   */
  id?: string;

  /**
   * ImplementationGuide.definition.resource.extension
   */
  extension?: Extension[];

  /**
   * ImplementationGuide.definition.resource.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * ImplementationGuide.definition.resource.reference
   */
  reference: Reference;

  /**
   * ImplementationGuide.definition.resource.fhirVersion
   */
  fhirVersion?: string[];

  /**
   * ImplementationGuide.definition.resource.name
   */
  name?: string;

  /**
   * ImplementationGuide.definition.resource.description
   */
  description?: string;

  /**
   * ImplementationGuide.definition.resource.example[x]
   */
  exampleBoolean?: boolean;

  /**
   * ImplementationGuide.definition.resource.example[x]
   */
  exampleCanonical?: string;

  /**
   * ImplementationGuide.definition.resource.groupingId
   */
  groupingId?: string;
}

/**
 * FHIR R4 ImplementationGuideDefinitionTemplate
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ImplementationGuideDefinitionTemplate {

  /**
   * ImplementationGuide.definition.template.id
   */
  id?: string;

  /**
   * ImplementationGuide.definition.template.extension
   */
  extension?: Extension[];

  /**
   * ImplementationGuide.definition.template.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * ImplementationGuide.definition.template.code
   */
  code: string;

  /**
   * ImplementationGuide.definition.template.source
   */
  source: string;

  /**
   * ImplementationGuide.definition.template.scope
   */
  scope?: string;
}

/**
 * FHIR R4 ImplementationGuideDependsOn
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ImplementationGuideDependsOn {

  /**
   * ImplementationGuide.dependsOn.id
   */
  id?: string;

  /**
   * ImplementationGuide.dependsOn.extension
   */
  extension?: Extension[];

  /**
   * ImplementationGuide.dependsOn.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * ImplementationGuide.dependsOn.uri
   */
  uri: string;

  /**
   * ImplementationGuide.dependsOn.packageId
   */
  packageId?: string;

  /**
   * ImplementationGuide.dependsOn.version
   */
  version?: string;
}

/**
 * FHIR R4 ImplementationGuideGlobal
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ImplementationGuideGlobal {

  /**
   * ImplementationGuide.global.id
   */
  id?: string;

  /**
   * ImplementationGuide.global.extension
   */
  extension?: Extension[];

  /**
   * ImplementationGuide.global.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * ImplementationGuide.global.type
   */
  type: string;

  /**
   * ImplementationGuide.global.profile
   */
  profile: string;
}

/**
 * FHIR R4 ImplementationGuideManifest
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ImplementationGuideManifest {

  /**
   * ImplementationGuide.manifest.id
   */
  id?: string;

  /**
   * ImplementationGuide.manifest.extension
   */
  extension?: Extension[];

  /**
   * ImplementationGuide.manifest.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * ImplementationGuide.manifest.rendering
   */
  rendering?: string;

  /**
   * ImplementationGuide.manifest.resource
   */
  resource: ImplementationGuideManifestResource[];

  /**
   * ImplementationGuide.manifest.page
   */
  page?: ImplementationGuideManifestPage[];

  /**
   * ImplementationGuide.manifest.image
   */
  image?: string[];

  /**
   * ImplementationGuide.manifest.other
   */
  other?: string[];
}

/**
 * FHIR R4 ImplementationGuideManifestPage
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ImplementationGuideManifestPage {

  /**
   * ImplementationGuide.manifest.page.id
   */
  id?: string;

  /**
   * ImplementationGuide.manifest.page.extension
   */
  extension?: Extension[];

  /**
   * ImplementationGuide.manifest.page.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * ImplementationGuide.manifest.page.name
   */
  name: string;

  /**
   * ImplementationGuide.manifest.page.title
   */
  title?: string;

  /**
   * ImplementationGuide.manifest.page.anchor
   */
  anchor?: string[];
}

/**
 * FHIR R4 ImplementationGuideManifestResource
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ImplementationGuideManifestResource {

  /**
   * ImplementationGuide.manifest.resource.id
   */
  id?: string;

  /**
   * ImplementationGuide.manifest.resource.extension
   */
  extension?: Extension[];

  /**
   * ImplementationGuide.manifest.resource.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * ImplementationGuide.manifest.resource.reference
   */
  reference: Reference;

  /**
   * ImplementationGuide.manifest.resource.example[x]
   */
  exampleBoolean?: boolean;

  /**
   * ImplementationGuide.manifest.resource.example[x]
   */
  exampleCanonical?: string;

  /**
   * ImplementationGuide.manifest.resource.relativePath
   */
  relativePath?: string;
}

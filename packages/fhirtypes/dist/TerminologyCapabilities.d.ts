import { CodeableConcept } from './CodeableConcept';
import { ContactDetail } from './ContactDetail';
import { Extension } from './Extension';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { Resource } from './Resource';
import { UsageContext } from './UsageContext';

/**
 * FHIR R4 TerminologyCapabilities
 * @see https://hl7.org/fhir/R4/terminologycapabilities.html
 */
export interface TerminologyCapabilities {

  /**
   * This is a TerminologyCapabilities resource
   */
  readonly resourceType: 'TerminologyCapabilities';

  /**
   * TerminologyCapabilities.id
   */
  id?: string;

  /**
   * TerminologyCapabilities.meta
   */
  meta?: Meta;

  /**
   * TerminologyCapabilities.implicitRules
   */
  implicitRules?: string;

  /**
   * TerminologyCapabilities.language
   */
  language?: string;

  /**
   * TerminologyCapabilities.text
   */
  text?: Narrative;

  /**
   * TerminologyCapabilities.contained
   */
  contained?: Resource[];

  /**
   * TerminologyCapabilities.extension
   */
  extension?: Extension[];

  /**
   * TerminologyCapabilities.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * TerminologyCapabilities.url
   */
  url?: string;

  /**
   * TerminologyCapabilities.version
   */
  version?: string;

  /**
   * TerminologyCapabilities.name
   */
  name?: string;

  /**
   * TerminologyCapabilities.title
   */
  title?: string;

  /**
   * TerminologyCapabilities.status
   */
  status: 'draft' | 'active' | 'retired' | 'unknown';

  /**
   * TerminologyCapabilities.experimental
   */
  experimental?: boolean;

  /**
   * TerminologyCapabilities.date
   */
  date: string;

  /**
   * TerminologyCapabilities.publisher
   */
  publisher?: string;

  /**
   * TerminologyCapabilities.contact
   */
  contact?: ContactDetail[];

  /**
   * TerminologyCapabilities.description
   */
  description?: string;

  /**
   * TerminologyCapabilities.useContext
   */
  useContext?: UsageContext[];

  /**
   * TerminologyCapabilities.jurisdiction
   */
  jurisdiction?: CodeableConcept[];

  /**
   * TerminologyCapabilities.purpose
   */
  purpose?: string;

  /**
   * TerminologyCapabilities.copyright
   */
  copyright?: string;

  /**
   * TerminologyCapabilities.kind
   */
  kind: string;

  /**
   * TerminologyCapabilities.software
   */
  software?: TerminologyCapabilitiesSoftware;

  /**
   * TerminologyCapabilities.implementation
   */
  implementation?: TerminologyCapabilitiesImplementation;

  /**
   * TerminologyCapabilities.lockedDate
   */
  lockedDate?: boolean;

  /**
   * TerminologyCapabilities.codeSystem
   */
  codeSystem?: TerminologyCapabilitiesCodeSystem[];

  /**
   * TerminologyCapabilities.expansion
   */
  expansion?: TerminologyCapabilitiesExpansion;

  /**
   * TerminologyCapabilities.codeSearch
   */
  codeSearch?: string;

  /**
   * TerminologyCapabilities.validateCode
   */
  validateCode?: TerminologyCapabilitiesValidateCode;

  /**
   * TerminologyCapabilities.translation
   */
  translation?: TerminologyCapabilitiesTranslation;

  /**
   * TerminologyCapabilities.closure
   */
  closure?: TerminologyCapabilitiesClosure;
}

/**
 * FHIR R4 TerminologyCapabilitiesClosure
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface TerminologyCapabilitiesClosure {

  /**
   * TerminologyCapabilities.closure.id
   */
  id?: string;

  /**
   * TerminologyCapabilities.closure.extension
   */
  extension?: Extension[];

  /**
   * TerminologyCapabilities.closure.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * TerminologyCapabilities.closure.translation
   */
  translation?: boolean;
}

/**
 * FHIR R4 TerminologyCapabilitiesCodeSystem
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface TerminologyCapabilitiesCodeSystem {

  /**
   * TerminologyCapabilities.codeSystem.id
   */
  id?: string;

  /**
   * TerminologyCapabilities.codeSystem.extension
   */
  extension?: Extension[];

  /**
   * TerminologyCapabilities.codeSystem.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * TerminologyCapabilities.codeSystem.uri
   */
  uri?: string;

  /**
   * TerminologyCapabilities.codeSystem.version
   */
  version?: TerminologyCapabilitiesCodeSystemVersion[];

  /**
   * TerminologyCapabilities.codeSystem.subsumption
   */
  subsumption?: boolean;
}

/**
 * FHIR R4 TerminologyCapabilitiesCodeSystemVersion
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface TerminologyCapabilitiesCodeSystemVersion {

  /**
   * TerminologyCapabilities.codeSystem.version.id
   */
  id?: string;

  /**
   * TerminologyCapabilities.codeSystem.version.extension
   */
  extension?: Extension[];

  /**
   * TerminologyCapabilities.codeSystem.version.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * TerminologyCapabilities.codeSystem.version.code
   */
  code?: string;

  /**
   * TerminologyCapabilities.codeSystem.version.isDefault
   */
  isDefault?: boolean;

  /**
   * TerminologyCapabilities.codeSystem.version.compositional
   */
  compositional?: boolean;

  /**
   * TerminologyCapabilities.codeSystem.version.language
   */
  language?: string[];

  /**
   * TerminologyCapabilities.codeSystem.version.filter
   */
  filter?: TerminologyCapabilitiesCodeSystemVersionFilter[];

  /**
   * TerminologyCapabilities.codeSystem.version.property
   */
  property?: string[];
}

/**
 * FHIR R4 TerminologyCapabilitiesCodeSystemVersionFilter
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface TerminologyCapabilitiesCodeSystemVersionFilter {

  /**
   * TerminologyCapabilities.codeSystem.version.filter.id
   */
  id?: string;

  /**
   * TerminologyCapabilities.codeSystem.version.filter.extension
   */
  extension?: Extension[];

  /**
   * TerminologyCapabilities.codeSystem.version.filter.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * TerminologyCapabilities.codeSystem.version.filter.code
   */
  code: string;

  /**
   * TerminologyCapabilities.codeSystem.version.filter.op
   */
  op: string[];
}

/**
 * FHIR R4 TerminologyCapabilitiesExpansion
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface TerminologyCapabilitiesExpansion {

  /**
   * TerminologyCapabilities.expansion.id
   */
  id?: string;

  /**
   * TerminologyCapabilities.expansion.extension
   */
  extension?: Extension[];

  /**
   * TerminologyCapabilities.expansion.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * TerminologyCapabilities.expansion.hierarchical
   */
  hierarchical?: boolean;

  /**
   * TerminologyCapabilities.expansion.paging
   */
  paging?: boolean;

  /**
   * TerminologyCapabilities.expansion.incomplete
   */
  incomplete?: boolean;

  /**
   * TerminologyCapabilities.expansion.parameter
   */
  parameter?: TerminologyCapabilitiesExpansionParameter[];

  /**
   * TerminologyCapabilities.expansion.textFilter
   */
  textFilter?: string;
}

/**
 * FHIR R4 TerminologyCapabilitiesExpansionParameter
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface TerminologyCapabilitiesExpansionParameter {

  /**
   * TerminologyCapabilities.expansion.parameter.id
   */
  id?: string;

  /**
   * TerminologyCapabilities.expansion.parameter.extension
   */
  extension?: Extension[];

  /**
   * TerminologyCapabilities.expansion.parameter.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * TerminologyCapabilities.expansion.parameter.name
   */
  name: string;

  /**
   * TerminologyCapabilities.expansion.parameter.documentation
   */
  documentation?: string;
}

/**
 * FHIR R4 TerminologyCapabilitiesImplementation
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface TerminologyCapabilitiesImplementation {

  /**
   * TerminologyCapabilities.implementation.id
   */
  id?: string;

  /**
   * TerminologyCapabilities.implementation.extension
   */
  extension?: Extension[];

  /**
   * TerminologyCapabilities.implementation.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * TerminologyCapabilities.implementation.description
   */
  description: string;

  /**
   * TerminologyCapabilities.implementation.url
   */
  url?: string;
}

/**
 * FHIR R4 TerminologyCapabilitiesSoftware
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface TerminologyCapabilitiesSoftware {

  /**
   * TerminologyCapabilities.software.id
   */
  id?: string;

  /**
   * TerminologyCapabilities.software.extension
   */
  extension?: Extension[];

  /**
   * TerminologyCapabilities.software.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * TerminologyCapabilities.software.name
   */
  name: string;

  /**
   * TerminologyCapabilities.software.version
   */
  version?: string;
}

/**
 * FHIR R4 TerminologyCapabilitiesTranslation
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface TerminologyCapabilitiesTranslation {

  /**
   * TerminologyCapabilities.translation.id
   */
  id?: string;

  /**
   * TerminologyCapabilities.translation.extension
   */
  extension?: Extension[];

  /**
   * TerminologyCapabilities.translation.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * TerminologyCapabilities.translation.needsMap
   */
  needsMap: boolean;
}

/**
 * FHIR R4 TerminologyCapabilitiesValidateCode
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface TerminologyCapabilitiesValidateCode {

  /**
   * TerminologyCapabilities.validateCode.id
   */
  id?: string;

  /**
   * TerminologyCapabilities.validateCode.extension
   */
  extension?: Extension[];

  /**
   * TerminologyCapabilities.validateCode.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * TerminologyCapabilities.validateCode.translations
   */
  translations: boolean;
}

import { CodeableConcept } from './CodeableConcept';
import { ContactDetail } from './ContactDetail';
import { Extension } from './Extension';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { Resource } from './Resource';
import { UsageContext } from './UsageContext';

/**
 * FHIR R4 SearchParameter
 * @see https://hl7.org/fhir/R4/searchparameter.html
 */
export interface SearchParameter {

  /**
   * This is a SearchParameter resource
   */
  readonly resourceType: 'SearchParameter';

  /**
   * SearchParameter.id
   */
  id?: string;

  /**
   * SearchParameter.meta
   */
  meta?: Meta;

  /**
   * SearchParameter.implicitRules
   */
  implicitRules?: string;

  /**
   * SearchParameter.language
   */
  language?: string;

  /**
   * SearchParameter.text
   */
  text?: Narrative;

  /**
   * SearchParameter.contained
   */
  contained?: Resource[];

  /**
   * SearchParameter.extension
   */
  extension?: Extension[];

  /**
   * SearchParameter.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * SearchParameter.url
   */
  url: string;

  /**
   * SearchParameter.version
   */
  version?: string;

  /**
   * SearchParameter.name
   */
  name: string;

  /**
   * SearchParameter.derivedFrom
   */
  derivedFrom?: string;

  /**
   * SearchParameter.status
   */
  status: 'draft' | 'active' | 'retired' | 'unknown';

  /**
   * SearchParameter.experimental
   */
  experimental?: boolean;

  /**
   * SearchParameter.date
   */
  date?: string;

  /**
   * SearchParameter.publisher
   */
  publisher?: string;

  /**
   * SearchParameter.contact
   */
  contact?: ContactDetail[];

  /**
   * SearchParameter.description
   */
  description: string;

  /**
   * SearchParameter.useContext
   */
  useContext?: UsageContext[];

  /**
   * SearchParameter.jurisdiction
   */
  jurisdiction?: CodeableConcept[];

  /**
   * SearchParameter.purpose
   */
  purpose?: string;

  /**
   * SearchParameter.code
   */
  code: string;

  /**
   * SearchParameter.base
   */
  base: string[];

  /**
   * SearchParameter.type
   */
  type: string;

  /**
   * SearchParameter.expression
   */
  expression?: string;

  /**
   * SearchParameter.xpath
   */
  xpath?: string;

  /**
   * SearchParameter.xpathUsage
   */
  xpathUsage?: string;

  /**
   * SearchParameter.target
   */
  target?: string[];

  /**
   * SearchParameter.multipleOr
   */
  multipleOr?: boolean;

  /**
   * SearchParameter.multipleAnd
   */
  multipleAnd?: boolean;

  /**
   * SearchParameter.comparator
   */
  comparator?: string[];

  /**
   * SearchParameter.modifier
   */
  modifier?: string[];

  /**
   * SearchParameter.chain
   */
  chain?: string[];

  /**
   * SearchParameter.component
   */
  component?: SearchParameterComponent[];
}

/**
 * FHIR R4 SearchParameterComponent
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface SearchParameterComponent {

  /**
   * SearchParameter.component.id
   */
  id?: string;

  /**
   * SearchParameter.component.extension
   */
  extension?: Extension[];

  /**
   * SearchParameter.component.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * SearchParameter.component.definition
   */
  definition: string;

  /**
   * SearchParameter.component.expression
   */
  expression: string;
}

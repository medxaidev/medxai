import { ContactDetail } from './ContactDetail';
import { Extension } from './Extension';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { Resource } from './Resource';
import { UsageContext } from './UsageContext';

/**
 * FHIR R4 CompartmentDefinition
 * @see https://hl7.org/fhir/R4/compartmentdefinition.html
 */
export interface CompartmentDefinition {

  /**
   * This is a CompartmentDefinition resource
   */
  readonly resourceType: 'CompartmentDefinition';

  /**
   * CompartmentDefinition.id
   */
  id?: string;

  /**
   * CompartmentDefinition.meta
   */
  meta?: Meta;

  /**
   * CompartmentDefinition.implicitRules
   */
  implicitRules?: string;

  /**
   * CompartmentDefinition.language
   */
  language?: string;

  /**
   * CompartmentDefinition.text
   */
  text?: Narrative;

  /**
   * CompartmentDefinition.contained
   */
  contained?: Resource[];

  /**
   * CompartmentDefinition.extension
   */
  extension?: Extension[];

  /**
   * CompartmentDefinition.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * CompartmentDefinition.url
   */
  url: string;

  /**
   * CompartmentDefinition.version
   */
  version?: string;

  /**
   * CompartmentDefinition.name
   */
  name: string;

  /**
   * CompartmentDefinition.status
   */
  status: 'draft' | 'active' | 'retired' | 'unknown';

  /**
   * CompartmentDefinition.experimental
   */
  experimental?: boolean;

  /**
   * CompartmentDefinition.date
   */
  date?: string;

  /**
   * CompartmentDefinition.publisher
   */
  publisher?: string;

  /**
   * CompartmentDefinition.contact
   */
  contact?: ContactDetail[];

  /**
   * CompartmentDefinition.description
   */
  description?: string;

  /**
   * CompartmentDefinition.useContext
   */
  useContext?: UsageContext[];

  /**
   * CompartmentDefinition.purpose
   */
  purpose?: string;

  /**
   * CompartmentDefinition.code
   */
  code: string;

  /**
   * CompartmentDefinition.search
   */
  search: boolean;

  /**
   * CompartmentDefinition.resource
   */
  resource?: CompartmentDefinitionResource[];
}

/**
 * FHIR R4 CompartmentDefinitionResource
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface CompartmentDefinitionResource {

  /**
   * CompartmentDefinition.resource.id
   */
  id?: string;

  /**
   * CompartmentDefinition.resource.extension
   */
  extension?: Extension[];

  /**
   * CompartmentDefinition.resource.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * CompartmentDefinition.resource.code
   */
  code: string;

  /**
   * CompartmentDefinition.resource.param
   */
  param?: string[];

  /**
   * CompartmentDefinition.resource.documentation
   */
  documentation?: string;
}

import { CodeableConcept } from './CodeableConcept';
import { ContactDetail } from './ContactDetail';
import { Extension } from './Extension';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { Resource } from './Resource';
import { UsageContext } from './UsageContext';

/**
 * FHIR R4 MetadataResource
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface MetadataResource {

  /**
   * MetadataResource.id
   */
  id?: string;

  /**
   * MetadataResource.meta
   */
  meta?: Meta;

  /**
   * MetadataResource.implicitRules
   */
  implicitRules?: string;

  /**
   * MetadataResource.language
   */
  language?: string;

  /**
   * MetadataResource.text
   */
  text?: Narrative;

  /**
   * MetadataResource.contained
   */
  contained?: Resource[];

  /**
   * MetadataResource.extension
   */
  extension?: Extension[];

  /**
   * MetadataResource.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * MetadataResource.url
   */
  url?: string;

  /**
   * MetadataResource.version
   */
  version?: string;

  /**
   * MetadataResource.name
   */
  name?: string;

  /**
   * MetadataResource.title
   */
  title?: string;

  /**
   * MetadataResource.status
   */
  status: 'draft' | 'active' | 'retired' | 'unknown';

  /**
   * MetadataResource.experimental
   */
  experimental?: boolean;

  /**
   * MetadataResource.date
   */
  date?: string;

  /**
   * MetadataResource.publisher
   */
  publisher?: string;

  /**
   * MetadataResource.contact
   */
  contact?: ContactDetail[];

  /**
   * MetadataResource.description
   */
  description?: string;

  /**
   * MetadataResource.useContext
   */
  useContext?: UsageContext[];

  /**
   * MetadataResource.jurisdiction
   */
  jurisdiction?: CodeableConcept[];
}

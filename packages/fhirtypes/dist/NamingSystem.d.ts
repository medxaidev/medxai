import { CodeableConcept } from './CodeableConcept';
import { ContactDetail } from './ContactDetail';
import { Extension } from './Extension';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { Period } from './Period';
import { Resource } from './Resource';
import { UsageContext } from './UsageContext';

/**
 * FHIR R4 NamingSystem
 * @see https://hl7.org/fhir/R4/namingsystem.html
 */
export interface NamingSystem {

  /**
   * This is a NamingSystem resource
   */
  readonly resourceType: 'NamingSystem';

  /**
   * NamingSystem.id
   */
  id?: string;

  /**
   * NamingSystem.meta
   */
  meta?: Meta;

  /**
   * NamingSystem.implicitRules
   */
  implicitRules?: string;

  /**
   * NamingSystem.language
   */
  language?: string;

  /**
   * NamingSystem.text
   */
  text?: Narrative;

  /**
   * NamingSystem.contained
   */
  contained?: Resource[];

  /**
   * NamingSystem.extension
   */
  extension?: Extension[];

  /**
   * NamingSystem.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * NamingSystem.name
   */
  name: string;

  /**
   * NamingSystem.status
   */
  status: 'draft' | 'active' | 'retired' | 'unknown';

  /**
   * NamingSystem.kind
   */
  kind: string;

  /**
   * NamingSystem.date
   */
  date: string;

  /**
   * NamingSystem.publisher
   */
  publisher?: string;

  /**
   * NamingSystem.contact
   */
  contact?: ContactDetail[];

  /**
   * NamingSystem.responsible
   */
  responsible?: string;

  /**
   * NamingSystem.type
   */
  type?: CodeableConcept;

  /**
   * NamingSystem.description
   */
  description?: string;

  /**
   * NamingSystem.useContext
   */
  useContext?: UsageContext[];

  /**
   * NamingSystem.jurisdiction
   */
  jurisdiction?: CodeableConcept[];

  /**
   * NamingSystem.usage
   */
  usage?: string;

  /**
   * NamingSystem.uniqueId
   */
  uniqueId: NamingSystemUniqueId[];
}

/**
 * FHIR R4 NamingSystemUniqueId
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface NamingSystemUniqueId {

  /**
   * NamingSystem.uniqueId.id
   */
  id?: string;

  /**
   * NamingSystem.uniqueId.extension
   */
  extension?: Extension[];

  /**
   * NamingSystem.uniqueId.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * NamingSystem.uniqueId.type
   */
  type: string;

  /**
   * NamingSystem.uniqueId.value
   */
  value: string;

  /**
   * NamingSystem.uniqueId.preferred
   */
  preferred?: boolean;

  /**
   * NamingSystem.uniqueId.comment
   */
  comment?: string;

  /**
   * NamingSystem.uniqueId.period
   */
  period?: Period;
}

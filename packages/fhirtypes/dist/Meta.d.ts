import { Coding } from './Coding';
import { Extension } from './Extension';

/**
 * FHIR R4 Meta
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface Meta {

  /**
   * Meta.id
   */
  id?: string;

  /**
   * Meta.extension
   */
  extension?: Extension[];

  /**
   * Meta.versionId
   */
  versionId?: string;

  /**
   * Meta.lastUpdated
   */
  lastUpdated?: string;

  /**
   * Meta.source
   */
  source?: string;

  /**
   * Meta.profile
   */
  profile?: string[];

  /**
   * Meta.security
   */
  security?: Coding[];

  /**
   * Meta.tag
   */
  tag?: Coding[];
}

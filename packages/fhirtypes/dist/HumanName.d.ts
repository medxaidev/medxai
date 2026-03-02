import { Extension } from './Extension';
import { Period } from './Period';

/**
 * FHIR R4 HumanName
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface HumanName {

  /**
   * HumanName.id
   */
  id?: string;

  /**
   * HumanName.extension
   */
  extension?: Extension[];

  /**
   * HumanName.use
   */
  use?: 'usual' | 'official' | 'temp' | 'nickname' | 'anonymous' | 'old' | 'maiden';

  /**
   * HumanName.text
   */
  text?: string;

  /**
   * HumanName.family
   */
  family?: string;

  /**
   * HumanName.given
   */
  given?: string[];

  /**
   * HumanName.prefix
   */
  prefix?: string[];

  /**
   * HumanName.suffix
   */
  suffix?: string[];

  /**
   * HumanName.period
   */
  period?: Period;
}

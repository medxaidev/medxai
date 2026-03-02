import { CodeableConcept } from './CodeableConcept';
import { Extension } from './Extension';
import { Organization } from './Organization';
import { Period } from './Period';
import { Reference } from './Reference';

/**
 * FHIR R4 Identifier
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface Identifier {

  /**
   * Identifier.id
   */
  id?: string;

  /**
   * Identifier.extension
   */
  extension?: Extension[];

  /**
   * Identifier.use
   */
  use?: 'usual' | 'official' | 'temp' | 'secondary' | 'old';

  /**
   * Identifier.type
   */
  type?: CodeableConcept;

  /**
   * Identifier.system
   */
  system?: string;

  /**
   * Identifier.value
   */
  value?: string;

  /**
   * Identifier.period
   */
  period?: Period;

  /**
   * Identifier.assigner
   */
  assigner?: Reference<Organization>;
}

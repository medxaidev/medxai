import { Extension } from './Extension';

/**
 * FHIR R4 ParameterDefinition
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ParameterDefinition {

  /**
   * ParameterDefinition.id
   */
  id?: string;

  /**
   * ParameterDefinition.extension
   */
  extension?: Extension[];

  /**
   * ParameterDefinition.name
   */
  name?: string;

  /**
   * ParameterDefinition.use
   */
  use: string;

  /**
   * ParameterDefinition.min
   */
  min?: number;

  /**
   * ParameterDefinition.max
   */
  max?: string;

  /**
   * ParameterDefinition.documentation
   */
  documentation?: string;

  /**
   * ParameterDefinition.type
   */
  type: string;

  /**
   * ParameterDefinition.profile
   */
  profile?: string;
}

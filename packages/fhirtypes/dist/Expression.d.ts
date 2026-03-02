import { Extension } from './Extension';

/**
 * FHIR R4 Expression
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface Expression {

  /**
   * Expression.id
   */
  id?: string;

  /**
   * Expression.extension
   */
  extension?: Extension[];

  /**
   * Expression.description
   */
  description?: string;

  /**
   * Expression.name
   */
  name?: string;

  /**
   * Expression.language
   */
  language: string;

  /**
   * Expression.expression
   */
  expression?: string;

  /**
   * Expression.reference
   */
  reference?: string;
}

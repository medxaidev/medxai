import { Extension } from './Extension';

/**
 * FHIR R4 Money
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface Money {

  /**
   * Money.id
   */
  id?: string;

  /**
   * Money.extension
   */
  extension?: Extension[];

  /**
   * Money.value
   */
  value?: number;

  /**
   * Money.currency
   */
  currency?: string;
}

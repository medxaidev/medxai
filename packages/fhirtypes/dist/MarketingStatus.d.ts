import { CodeableConcept } from './CodeableConcept';
import { Extension } from './Extension';
import { Period } from './Period';

/**
 * FHIR R4 MarketingStatus
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface MarketingStatus {

  /**
   * MarketingStatus.id
   */
  id?: string;

  /**
   * MarketingStatus.extension
   */
  extension?: Extension[];

  /**
   * MarketingStatus.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * MarketingStatus.country
   */
  country: CodeableConcept;

  /**
   * MarketingStatus.jurisdiction
   */
  jurisdiction?: CodeableConcept;

  /**
   * MarketingStatus.status
   */
  status: CodeableConcept;

  /**
   * MarketingStatus.dateRange
   */
  dateRange: Period;

  /**
   * MarketingStatus.restoreDate
   */
  restoreDate?: string;
}

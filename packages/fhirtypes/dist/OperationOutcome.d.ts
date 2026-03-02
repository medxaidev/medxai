import { CodeableConcept } from './CodeableConcept';
import { Extension } from './Extension';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { Resource } from './Resource';

/**
 * FHIR R4 OperationOutcome
 * @see https://hl7.org/fhir/R4/operationoutcome.html
 */
export interface OperationOutcome {

  /**
   * This is a OperationOutcome resource
   */
  readonly resourceType: 'OperationOutcome';

  /**
   * OperationOutcome.id
   */
  id?: string;

  /**
   * OperationOutcome.meta
   */
  meta?: Meta;

  /**
   * OperationOutcome.implicitRules
   */
  implicitRules?: string;

  /**
   * OperationOutcome.language
   */
  language?: string;

  /**
   * OperationOutcome.text
   */
  text?: Narrative;

  /**
   * OperationOutcome.contained
   */
  contained?: Resource[];

  /**
   * OperationOutcome.extension
   */
  extension?: Extension[];

  /**
   * OperationOutcome.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * OperationOutcome.issue
   */
  issue: OperationOutcomeIssue[];
}

/**
 * FHIR R4 OperationOutcomeIssue
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface OperationOutcomeIssue {

  /**
   * OperationOutcome.issue.id
   */
  id?: string;

  /**
   * OperationOutcome.issue.extension
   */
  extension?: Extension[];

  /**
   * OperationOutcome.issue.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * OperationOutcome.issue.severity
   */
  severity: string;

  /**
   * OperationOutcome.issue.code
   */
  code: string;

  /**
   * OperationOutcome.issue.details
   */
  details?: CodeableConcept;

  /**
   * OperationOutcome.issue.diagnostics
   */
  diagnostics?: string;

  /**
   * OperationOutcome.issue.location
   */
  location?: string[];

  /**
   * OperationOutcome.issue.expression
   */
  expression?: string[];
}

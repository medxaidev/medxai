import { CodeableConcept } from './CodeableConcept';
import { Extension } from './Extension';
import { Identifier } from './Identifier';
import { Immunization } from './Immunization';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { Organization } from './Organization';
import { Patient } from './Patient';
import { Reference } from './Reference';
import { Resource } from './Resource';

/**
 * FHIR R4 ImmunizationEvaluation
 * @see https://hl7.org/fhir/R4/immunizationevaluation.html
 */
export interface ImmunizationEvaluation {

  /**
   * This is a ImmunizationEvaluation resource
   */
  readonly resourceType: 'ImmunizationEvaluation';

  /**
   * ImmunizationEvaluation.id
   */
  id?: string;

  /**
   * ImmunizationEvaluation.meta
   */
  meta?: Meta;

  /**
   * ImmunizationEvaluation.implicitRules
   */
  implicitRules?: string;

  /**
   * ImmunizationEvaluation.language
   */
  language?: string;

  /**
   * ImmunizationEvaluation.text
   */
  text?: Narrative;

  /**
   * ImmunizationEvaluation.contained
   */
  contained?: Resource[];

  /**
   * ImmunizationEvaluation.extension
   */
  extension?: Extension[];

  /**
   * ImmunizationEvaluation.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * ImmunizationEvaluation.identifier
   */
  identifier?: Identifier[];

  /**
   * ImmunizationEvaluation.status
   */
  status: string;

  /**
   * ImmunizationEvaluation.patient
   */
  patient: Reference<Patient>;

  /**
   * ImmunizationEvaluation.date
   */
  date?: string;

  /**
   * ImmunizationEvaluation.authority
   */
  authority?: Reference<Organization>;

  /**
   * ImmunizationEvaluation.targetDisease
   */
  targetDisease: CodeableConcept;

  /**
   * ImmunizationEvaluation.immunizationEvent
   */
  immunizationEvent: Reference<Immunization>;

  /**
   * ImmunizationEvaluation.doseStatus
   */
  doseStatus: CodeableConcept;

  /**
   * ImmunizationEvaluation.doseStatusReason
   */
  doseStatusReason?: CodeableConcept[];

  /**
   * ImmunizationEvaluation.description
   */
  description?: string;

  /**
   * ImmunizationEvaluation.series
   */
  series?: string;

  /**
   * ImmunizationEvaluation.doseNumber[x]
   */
  doseNumberPositiveInt?: number;

  /**
   * ImmunizationEvaluation.doseNumber[x]
   */
  doseNumberString?: string;

  /**
   * ImmunizationEvaluation.seriesDoses[x]
   */
  seriesDosesPositiveInt?: number;

  /**
   * ImmunizationEvaluation.seriesDoses[x]
   */
  seriesDosesString?: string;
}

/**
 * ImmunizationEvaluation.doseNumber[x]
 */
export type ImmunizationEvaluationDoseNumber = number | string;
/**
 * ImmunizationEvaluation.seriesDoses[x]
 */
export type ImmunizationEvaluationSeriesDoses = number | string;

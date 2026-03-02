import { CodeableConcept } from './CodeableConcept';
import { Extension } from './Extension';
import { Identifier } from './Identifier';
import { Immunization } from './Immunization';
import { ImmunizationEvaluation } from './ImmunizationEvaluation';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { Organization } from './Organization';
import { Patient } from './Patient';
import { Reference } from './Reference';
import { Resource } from './Resource';

/**
 * FHIR R4 ImmunizationRecommendation
 * @see https://hl7.org/fhir/R4/immunizationrecommendation.html
 */
export interface ImmunizationRecommendation {

  /**
   * This is a ImmunizationRecommendation resource
   */
  readonly resourceType: 'ImmunizationRecommendation';

  /**
   * ImmunizationRecommendation.id
   */
  id?: string;

  /**
   * ImmunizationRecommendation.meta
   */
  meta?: Meta;

  /**
   * ImmunizationRecommendation.implicitRules
   */
  implicitRules?: string;

  /**
   * ImmunizationRecommendation.language
   */
  language?: string;

  /**
   * ImmunizationRecommendation.text
   */
  text?: Narrative;

  /**
   * ImmunizationRecommendation.contained
   */
  contained?: Resource[];

  /**
   * ImmunizationRecommendation.extension
   */
  extension?: Extension[];

  /**
   * ImmunizationRecommendation.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * ImmunizationRecommendation.identifier
   */
  identifier?: Identifier[];

  /**
   * ImmunizationRecommendation.patient
   */
  patient: Reference<Patient>;

  /**
   * ImmunizationRecommendation.date
   */
  date: string;

  /**
   * ImmunizationRecommendation.authority
   */
  authority?: Reference<Organization>;

  /**
   * ImmunizationRecommendation.recommendation
   */
  recommendation: ImmunizationRecommendationRecommendation[];
}

/**
 * FHIR R4 ImmunizationRecommendationRecommendation
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ImmunizationRecommendationRecommendation {

  /**
   * ImmunizationRecommendation.recommendation.id
   */
  id?: string;

  /**
   * ImmunizationRecommendation.recommendation.extension
   */
  extension?: Extension[];

  /**
   * ImmunizationRecommendation.recommendation.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * ImmunizationRecommendation.recommendation.vaccineCode
   */
  vaccineCode?: CodeableConcept[];

  /**
   * ImmunizationRecommendation.recommendation.targetDisease
   */
  targetDisease?: CodeableConcept;

  /**
   * ImmunizationRecommendation.recommendation.contraindicatedVaccineCode
   */
  contraindicatedVaccineCode?: CodeableConcept[];

  /**
   * ImmunizationRecommendation.recommendation.forecastStatus
   */
  forecastStatus: CodeableConcept;

  /**
   * ImmunizationRecommendation.recommendation.forecastReason
   */
  forecastReason?: CodeableConcept[];

  /**
   * ImmunizationRecommendation.recommendation.dateCriterion
   */
  dateCriterion?: ImmunizationRecommendationRecommendationDateCriterion[];

  /**
   * ImmunizationRecommendation.recommendation.description
   */
  description?: string;

  /**
   * ImmunizationRecommendation.recommendation.series
   */
  series?: string;

  /**
   * ImmunizationRecommendation.recommendation.doseNumber[x]
   */
  doseNumberPositiveInt?: number;

  /**
   * ImmunizationRecommendation.recommendation.doseNumber[x]
   */
  doseNumberString?: string;

  /**
   * ImmunizationRecommendation.recommendation.seriesDoses[x]
   */
  seriesDosesPositiveInt?: number;

  /**
   * ImmunizationRecommendation.recommendation.seriesDoses[x]
   */
  seriesDosesString?: string;

  /**
   * ImmunizationRecommendation.recommendation.supportingImmunization
   */
  supportingImmunization?: Reference<Immunization | ImmunizationEvaluation>[];

  /**
   * ImmunizationRecommendation.recommendation.supportingPatientInformation
   */
  supportingPatientInformation?: Reference[];
}

/**
 * FHIR R4 ImmunizationRecommendationRecommendationDateCriterion
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ImmunizationRecommendationRecommendationDateCriterion {

  /**
   * ImmunizationRecommendation.recommendation.dateCriterion.id
   */
  id?: string;

  /**
   * ImmunizationRecommendation.recommendation.dateCriterion.extension
   */
  extension?: Extension[];

  /**
   * ImmunizationRecommendation.recommendation.dateCriterion.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * ImmunizationRecommendation.recommendation.dateCriterion.code
   */
  code: CodeableConcept;

  /**
   * ImmunizationRecommendation.recommendation.dateCriterion.value
   */
  value: string;
}

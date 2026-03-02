import { CodeableConcept } from './CodeableConcept';
import { Coding } from './Coding';
import { Extension } from './Extension';
import { Group } from './Group';
import { HealthcareService } from './HealthcareService';
import { InsurancePlan } from './InsurancePlan';
import { Location } from './Location';
import { Organization } from './Organization';
import { PlanDefinition } from './PlanDefinition';
import { Quantity } from './Quantity';
import { Range } from './Range';
import { Reference } from './Reference';
import { ResearchStudy } from './ResearchStudy';

/**
 * FHIR R4 UsageContext
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface UsageContext {

  /**
   * UsageContext.id
   */
  id?: string;

  /**
   * UsageContext.extension
   */
  extension?: Extension[];

  /**
   * UsageContext.code
   */
  code: Coding;

  /**
   * UsageContext.value[x]
   */
  valueCodeableConcept: CodeableConcept;

  /**
   * UsageContext.value[x]
   */
  valueQuantity: Quantity;

  /**
   * UsageContext.value[x]
   */
  valueRange: Range;

  /**
   * UsageContext.value[x]
   */
  valueReference: Reference<PlanDefinition | ResearchStudy | InsurancePlan | HealthcareService | Group | Location | Organization>;
}

/**
 * UsageContext.value[x]
 */
export type UsageContextValue = CodeableConcept | Quantity | Range | Reference<PlanDefinition | ResearchStudy | InsurancePlan | HealthcareService | Group | Location | Organization>;

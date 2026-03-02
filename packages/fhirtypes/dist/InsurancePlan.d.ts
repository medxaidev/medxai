import { Address } from './Address';
import { CodeableConcept } from './CodeableConcept';
import { ContactPoint } from './ContactPoint';
import { Endpoint } from './Endpoint';
import { Extension } from './Extension';
import { HumanName } from './HumanName';
import { Identifier } from './Identifier';
import { Location } from './Location';
import { Meta } from './Meta';
import { Money } from './Money';
import { Narrative } from './Narrative';
import { Organization } from './Organization';
import { Period } from './Period';
import { Quantity } from './Quantity';
import { Reference } from './Reference';
import { Resource } from './Resource';

/**
 * FHIR R4 InsurancePlan
 * @see https://hl7.org/fhir/R4/insuranceplan.html
 */
export interface InsurancePlan {

  /**
   * This is a InsurancePlan resource
   */
  readonly resourceType: 'InsurancePlan';

  /**
   * InsurancePlan.id
   */
  id?: string;

  /**
   * InsurancePlan.meta
   */
  meta?: Meta;

  /**
   * InsurancePlan.implicitRules
   */
  implicitRules?: string;

  /**
   * InsurancePlan.language
   */
  language?: string;

  /**
   * InsurancePlan.text
   */
  text?: Narrative;

  /**
   * InsurancePlan.contained
   */
  contained?: Resource[];

  /**
   * InsurancePlan.extension
   */
  extension?: Extension[];

  /**
   * InsurancePlan.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * InsurancePlan.identifier
   */
  identifier?: Identifier[];

  /**
   * InsurancePlan.status
   */
  status?: 'draft' | 'active' | 'retired' | 'unknown';

  /**
   * InsurancePlan.type
   */
  type?: CodeableConcept[];

  /**
   * InsurancePlan.name
   */
  name?: string;

  /**
   * InsurancePlan.alias
   */
  alias?: string[];

  /**
   * InsurancePlan.period
   */
  period?: Period;

  /**
   * InsurancePlan.ownedBy
   */
  ownedBy?: Reference<Organization>;

  /**
   * InsurancePlan.administeredBy
   */
  administeredBy?: Reference<Organization>;

  /**
   * InsurancePlan.coverageArea
   */
  coverageArea?: Reference<Location>[];

  /**
   * InsurancePlan.contact
   */
  contact?: InsurancePlanContact[];

  /**
   * InsurancePlan.endpoint
   */
  endpoint?: Reference<Endpoint>[];

  /**
   * InsurancePlan.network
   */
  network?: Reference<Organization>[];

  /**
   * InsurancePlan.coverage
   */
  coverage?: InsurancePlanCoverage[];

  /**
   * InsurancePlan.plan
   */
  plan?: InsurancePlanPlan[];
}

/**
 * FHIR R4 InsurancePlanContact
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface InsurancePlanContact {

  /**
   * InsurancePlan.contact.id
   */
  id?: string;

  /**
   * InsurancePlan.contact.extension
   */
  extension?: Extension[];

  /**
   * InsurancePlan.contact.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * InsurancePlan.contact.purpose
   */
  purpose?: CodeableConcept;

  /**
   * InsurancePlan.contact.name
   */
  name?: HumanName;

  /**
   * InsurancePlan.contact.telecom
   */
  telecom?: ContactPoint[];

  /**
   * InsurancePlan.contact.address
   */
  address?: Address;
}

/**
 * FHIR R4 InsurancePlanCoverage
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface InsurancePlanCoverage {

  /**
   * InsurancePlan.coverage.id
   */
  id?: string;

  /**
   * InsurancePlan.coverage.extension
   */
  extension?: Extension[];

  /**
   * InsurancePlan.coverage.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * InsurancePlan.coverage.type
   */
  type: CodeableConcept;

  /**
   * InsurancePlan.coverage.network
   */
  network?: Reference<Organization>[];

  /**
   * InsurancePlan.coverage.benefit
   */
  benefit: InsurancePlanCoverageBenefit[];
}

/**
 * FHIR R4 InsurancePlanCoverageBenefit
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface InsurancePlanCoverageBenefit {

  /**
   * InsurancePlan.coverage.benefit.id
   */
  id?: string;

  /**
   * InsurancePlan.coverage.benefit.extension
   */
  extension?: Extension[];

  /**
   * InsurancePlan.coverage.benefit.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * InsurancePlan.coverage.benefit.type
   */
  type: CodeableConcept;

  /**
   * InsurancePlan.coverage.benefit.requirement
   */
  requirement?: string;

  /**
   * InsurancePlan.coverage.benefit.limit
   */
  limit?: InsurancePlanCoverageBenefitLimit[];
}

/**
 * FHIR R4 InsurancePlanCoverageBenefitLimit
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface InsurancePlanCoverageBenefitLimit {

  /**
   * InsurancePlan.coverage.benefit.limit.id
   */
  id?: string;

  /**
   * InsurancePlan.coverage.benefit.limit.extension
   */
  extension?: Extension[];

  /**
   * InsurancePlan.coverage.benefit.limit.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * InsurancePlan.coverage.benefit.limit.value
   */
  value?: Quantity;

  /**
   * InsurancePlan.coverage.benefit.limit.code
   */
  code?: CodeableConcept;
}

/**
 * FHIR R4 InsurancePlanPlan
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface InsurancePlanPlan {

  /**
   * InsurancePlan.plan.id
   */
  id?: string;

  /**
   * InsurancePlan.plan.extension
   */
  extension?: Extension[];

  /**
   * InsurancePlan.plan.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * InsurancePlan.plan.identifier
   */
  identifier?: Identifier[];

  /**
   * InsurancePlan.plan.type
   */
  type?: CodeableConcept;

  /**
   * InsurancePlan.plan.coverageArea
   */
  coverageArea?: Reference<Location>[];

  /**
   * InsurancePlan.plan.network
   */
  network?: Reference<Organization>[];

  /**
   * InsurancePlan.plan.generalCost
   */
  generalCost?: InsurancePlanPlanGeneralCost[];

  /**
   * InsurancePlan.plan.specificCost
   */
  specificCost?: InsurancePlanPlanSpecificCost[];
}

/**
 * FHIR R4 InsurancePlanPlanGeneralCost
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface InsurancePlanPlanGeneralCost {

  /**
   * InsurancePlan.plan.generalCost.id
   */
  id?: string;

  /**
   * InsurancePlan.plan.generalCost.extension
   */
  extension?: Extension[];

  /**
   * InsurancePlan.plan.generalCost.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * InsurancePlan.plan.generalCost.type
   */
  type?: CodeableConcept;

  /**
   * InsurancePlan.plan.generalCost.groupSize
   */
  groupSize?: number;

  /**
   * InsurancePlan.plan.generalCost.cost
   */
  cost?: Money;

  /**
   * InsurancePlan.plan.generalCost.comment
   */
  comment?: string;
}

/**
 * FHIR R4 InsurancePlanPlanSpecificCost
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface InsurancePlanPlanSpecificCost {

  /**
   * InsurancePlan.plan.specificCost.id
   */
  id?: string;

  /**
   * InsurancePlan.plan.specificCost.extension
   */
  extension?: Extension[];

  /**
   * InsurancePlan.plan.specificCost.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * InsurancePlan.plan.specificCost.category
   */
  category: CodeableConcept;

  /**
   * InsurancePlan.plan.specificCost.benefit
   */
  benefit?: InsurancePlanPlanSpecificCostBenefit[];
}

/**
 * FHIR R4 InsurancePlanPlanSpecificCostBenefit
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface InsurancePlanPlanSpecificCostBenefit {

  /**
   * InsurancePlan.plan.specificCost.benefit.id
   */
  id?: string;

  /**
   * InsurancePlan.plan.specificCost.benefit.extension
   */
  extension?: Extension[];

  /**
   * InsurancePlan.plan.specificCost.benefit.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * InsurancePlan.plan.specificCost.benefit.type
   */
  type: CodeableConcept;

  /**
   * InsurancePlan.plan.specificCost.benefit.cost
   */
  cost?: InsurancePlanPlanSpecificCostBenefitCost[];
}

/**
 * FHIR R4 InsurancePlanPlanSpecificCostBenefitCost
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface InsurancePlanPlanSpecificCostBenefitCost {

  /**
   * InsurancePlan.plan.specificCost.benefit.cost.id
   */
  id?: string;

  /**
   * InsurancePlan.plan.specificCost.benefit.cost.extension
   */
  extension?: Extension[];

  /**
   * InsurancePlan.plan.specificCost.benefit.cost.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * InsurancePlan.plan.specificCost.benefit.cost.type
   */
  type: CodeableConcept;

  /**
   * InsurancePlan.plan.specificCost.benefit.cost.applicability
   */
  applicability?: CodeableConcept;

  /**
   * InsurancePlan.plan.specificCost.benefit.cost.qualifiers
   */
  qualifiers?: CodeableConcept[];

  /**
   * InsurancePlan.plan.specificCost.benefit.cost.value
   */
  value?: Quantity;
}

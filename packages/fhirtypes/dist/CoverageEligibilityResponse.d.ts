import { CodeableConcept } from './CodeableConcept';
import { Coverage } from './Coverage';
import { CoverageEligibilityRequest } from './CoverageEligibilityRequest';
import { Extension } from './Extension';
import { Identifier } from './Identifier';
import { Meta } from './Meta';
import { Money } from './Money';
import { Narrative } from './Narrative';
import { Organization } from './Organization';
import { Patient } from './Patient';
import { Period } from './Period';
import { Practitioner } from './Practitioner';
import { PractitionerRole } from './PractitionerRole';
import { Reference } from './Reference';
import { Resource } from './Resource';

/**
 * FHIR R4 CoverageEligibilityResponse
 * @see https://hl7.org/fhir/R4/coverageeligibilityresponse.html
 */
export interface CoverageEligibilityResponse {

  /**
   * This is a CoverageEligibilityResponse resource
   */
  readonly resourceType: 'CoverageEligibilityResponse';

  /**
   * CoverageEligibilityResponse.id
   */
  id?: string;

  /**
   * CoverageEligibilityResponse.meta
   */
  meta?: Meta;

  /**
   * CoverageEligibilityResponse.implicitRules
   */
  implicitRules?: string;

  /**
   * CoverageEligibilityResponse.language
   */
  language?: string;

  /**
   * CoverageEligibilityResponse.text
   */
  text?: Narrative;

  /**
   * CoverageEligibilityResponse.contained
   */
  contained?: Resource[];

  /**
   * CoverageEligibilityResponse.extension
   */
  extension?: Extension[];

  /**
   * CoverageEligibilityResponse.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * CoverageEligibilityResponse.identifier
   */
  identifier?: Identifier[];

  /**
   * CoverageEligibilityResponse.status
   */
  status: 'active' | 'cancelled' | 'draft' | 'entered-in-error';

  /**
   * CoverageEligibilityResponse.purpose
   */
  purpose: string[];

  /**
   * CoverageEligibilityResponse.patient
   */
  patient: Reference<Patient>;

  /**
   * CoverageEligibilityResponse.serviced[x]
   */
  servicedDate?: string;

  /**
   * CoverageEligibilityResponse.serviced[x]
   */
  servicedPeriod?: Period;

  /**
   * CoverageEligibilityResponse.created
   */
  created: string;

  /**
   * CoverageEligibilityResponse.requestor
   */
  requestor?: Reference<Practitioner | PractitionerRole | Organization>;

  /**
   * CoverageEligibilityResponse.request
   */
  request: Reference<CoverageEligibilityRequest>;

  /**
   * CoverageEligibilityResponse.outcome
   */
  outcome: string;

  /**
   * CoverageEligibilityResponse.disposition
   */
  disposition?: string;

  /**
   * CoverageEligibilityResponse.insurer
   */
  insurer: Reference<Organization>;

  /**
   * CoverageEligibilityResponse.insurance
   */
  insurance?: CoverageEligibilityResponseInsurance[];

  /**
   * CoverageEligibilityResponse.preAuthRef
   */
  preAuthRef?: string;

  /**
   * CoverageEligibilityResponse.form
   */
  form?: CodeableConcept;

  /**
   * CoverageEligibilityResponse.error
   */
  error?: CoverageEligibilityResponseError[];
}

/**
 * CoverageEligibilityResponse.serviced[x]
 */
export type CoverageEligibilityResponseServiced = string | Period;

/**
 * FHIR R4 CoverageEligibilityResponseError
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface CoverageEligibilityResponseError {

  /**
   * CoverageEligibilityResponse.error.id
   */
  id?: string;

  /**
   * CoverageEligibilityResponse.error.extension
   */
  extension?: Extension[];

  /**
   * CoverageEligibilityResponse.error.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * CoverageEligibilityResponse.error.code
   */
  code: CodeableConcept;
}

/**
 * FHIR R4 CoverageEligibilityResponseInsurance
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface CoverageEligibilityResponseInsurance {

  /**
   * CoverageEligibilityResponse.insurance.id
   */
  id?: string;

  /**
   * CoverageEligibilityResponse.insurance.extension
   */
  extension?: Extension[];

  /**
   * CoverageEligibilityResponse.insurance.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * CoverageEligibilityResponse.insurance.coverage
   */
  coverage: Reference<Coverage>;

  /**
   * CoverageEligibilityResponse.insurance.inforce
   */
  inforce?: boolean;

  /**
   * CoverageEligibilityResponse.insurance.benefitPeriod
   */
  benefitPeriod?: Period;

  /**
   * CoverageEligibilityResponse.insurance.item
   */
  item?: CoverageEligibilityResponseInsuranceItem[];
}

/**
 * FHIR R4 CoverageEligibilityResponseInsuranceItem
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface CoverageEligibilityResponseInsuranceItem {

  /**
   * CoverageEligibilityResponse.insurance.item.id
   */
  id?: string;

  /**
   * CoverageEligibilityResponse.insurance.item.extension
   */
  extension?: Extension[];

  /**
   * CoverageEligibilityResponse.insurance.item.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * CoverageEligibilityResponse.insurance.item.category
   */
  category?: CodeableConcept;

  /**
   * CoverageEligibilityResponse.insurance.item.productOrService
   */
  productOrService?: CodeableConcept;

  /**
   * CoverageEligibilityResponse.insurance.item.modifier
   */
  modifier?: CodeableConcept[];

  /**
   * CoverageEligibilityResponse.insurance.item.provider
   */
  provider?: Reference<Practitioner | PractitionerRole>;

  /**
   * CoverageEligibilityResponse.insurance.item.excluded
   */
  excluded?: boolean;

  /**
   * CoverageEligibilityResponse.insurance.item.name
   */
  name?: string;

  /**
   * CoverageEligibilityResponse.insurance.item.description
   */
  description?: string;

  /**
   * CoverageEligibilityResponse.insurance.item.network
   */
  network?: CodeableConcept;

  /**
   * CoverageEligibilityResponse.insurance.item.unit
   */
  unit?: CodeableConcept;

  /**
   * CoverageEligibilityResponse.insurance.item.term
   */
  term?: CodeableConcept;

  /**
   * CoverageEligibilityResponse.insurance.item.benefit
   */
  benefit?: CoverageEligibilityResponseInsuranceItemBenefit[];

  /**
   * CoverageEligibilityResponse.insurance.item.authorizationRequired
   */
  authorizationRequired?: boolean;

  /**
   * CoverageEligibilityResponse.insurance.item.authorizationSupporting
   */
  authorizationSupporting?: CodeableConcept[];

  /**
   * CoverageEligibilityResponse.insurance.item.authorizationUrl
   */
  authorizationUrl?: string;
}

/**
 * FHIR R4 CoverageEligibilityResponseInsuranceItemBenefit
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface CoverageEligibilityResponseInsuranceItemBenefit {

  /**
   * CoverageEligibilityResponse.insurance.item.benefit.id
   */
  id?: string;

  /**
   * CoverageEligibilityResponse.insurance.item.benefit.extension
   */
  extension?: Extension[];

  /**
   * CoverageEligibilityResponse.insurance.item.benefit.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * CoverageEligibilityResponse.insurance.item.benefit.type
   */
  type: CodeableConcept;

  /**
   * CoverageEligibilityResponse.insurance.item.benefit.allowed[x]
   */
  allowedUnsignedInt?: number;

  /**
   * CoverageEligibilityResponse.insurance.item.benefit.allowed[x]
   */
  allowedString?: string;

  /**
   * CoverageEligibilityResponse.insurance.item.benefit.allowed[x]
   */
  allowedMoney?: Money;

  /**
   * CoverageEligibilityResponse.insurance.item.benefit.used[x]
   */
  usedUnsignedInt?: number;

  /**
   * CoverageEligibilityResponse.insurance.item.benefit.used[x]
   */
  usedString?: string;

  /**
   * CoverageEligibilityResponse.insurance.item.benefit.used[x]
   */
  usedMoney?: Money;
}

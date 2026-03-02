import { CodeableConcept } from './CodeableConcept';
import { Condition } from './Condition';
import { Coverage } from './Coverage';
import { Extension } from './Extension';
import { Identifier } from './Identifier';
import { Location } from './Location';
import { Meta } from './Meta';
import { Money } from './Money';
import { Narrative } from './Narrative';
import { Organization } from './Organization';
import { Patient } from './Patient';
import { Period } from './Period';
import { Practitioner } from './Practitioner';
import { PractitionerRole } from './PractitionerRole';
import { Quantity } from './Quantity';
import { Reference } from './Reference';
import { Resource } from './Resource';

/**
 * FHIR R4 CoverageEligibilityRequest
 * @see https://hl7.org/fhir/R4/coverageeligibilityrequest.html
 */
export interface CoverageEligibilityRequest {

  /**
   * This is a CoverageEligibilityRequest resource
   */
  readonly resourceType: 'CoverageEligibilityRequest';

  /**
   * CoverageEligibilityRequest.id
   */
  id?: string;

  /**
   * CoverageEligibilityRequest.meta
   */
  meta?: Meta;

  /**
   * CoverageEligibilityRequest.implicitRules
   */
  implicitRules?: string;

  /**
   * CoverageEligibilityRequest.language
   */
  language?: string;

  /**
   * CoverageEligibilityRequest.text
   */
  text?: Narrative;

  /**
   * CoverageEligibilityRequest.contained
   */
  contained?: Resource[];

  /**
   * CoverageEligibilityRequest.extension
   */
  extension?: Extension[];

  /**
   * CoverageEligibilityRequest.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * CoverageEligibilityRequest.identifier
   */
  identifier?: Identifier[];

  /**
   * CoverageEligibilityRequest.status
   */
  status: 'active' | 'cancelled' | 'draft' | 'entered-in-error';

  /**
   * CoverageEligibilityRequest.priority
   */
  priority?: CodeableConcept;

  /**
   * CoverageEligibilityRequest.purpose
   */
  purpose: string[];

  /**
   * CoverageEligibilityRequest.patient
   */
  patient: Reference<Patient>;

  /**
   * CoverageEligibilityRequest.serviced[x]
   */
  servicedDate?: string;

  /**
   * CoverageEligibilityRequest.serviced[x]
   */
  servicedPeriod?: Period;

  /**
   * CoverageEligibilityRequest.created
   */
  created: string;

  /**
   * CoverageEligibilityRequest.enterer
   */
  enterer?: Reference<Practitioner | PractitionerRole>;

  /**
   * CoverageEligibilityRequest.provider
   */
  provider?: Reference<Practitioner | PractitionerRole | Organization>;

  /**
   * CoverageEligibilityRequest.insurer
   */
  insurer: Reference<Organization>;

  /**
   * CoverageEligibilityRequest.facility
   */
  facility?: Reference<Location>;

  /**
   * CoverageEligibilityRequest.supportingInfo
   */
  supportingInfo?: CoverageEligibilityRequestSupportingInfo[];

  /**
   * CoverageEligibilityRequest.insurance
   */
  insurance?: CoverageEligibilityRequestInsurance[];

  /**
   * CoverageEligibilityRequest.item
   */
  item?: CoverageEligibilityRequestItem[];
}

/**
 * CoverageEligibilityRequest.serviced[x]
 */
export type CoverageEligibilityRequestServiced = string | Period;

/**
 * FHIR R4 CoverageEligibilityRequestInsurance
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface CoverageEligibilityRequestInsurance {

  /**
   * CoverageEligibilityRequest.insurance.id
   */
  id?: string;

  /**
   * CoverageEligibilityRequest.insurance.extension
   */
  extension?: Extension[];

  /**
   * CoverageEligibilityRequest.insurance.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * CoverageEligibilityRequest.insurance.focal
   */
  focal?: boolean;

  /**
   * CoverageEligibilityRequest.insurance.coverage
   */
  coverage: Reference<Coverage>;

  /**
   * CoverageEligibilityRequest.insurance.businessArrangement
   */
  businessArrangement?: string;
}

/**
 * FHIR R4 CoverageEligibilityRequestItem
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface CoverageEligibilityRequestItem {

  /**
   * CoverageEligibilityRequest.item.id
   */
  id?: string;

  /**
   * CoverageEligibilityRequest.item.extension
   */
  extension?: Extension[];

  /**
   * CoverageEligibilityRequest.item.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * CoverageEligibilityRequest.item.supportingInfoSequence
   */
  supportingInfoSequence?: number[];

  /**
   * CoverageEligibilityRequest.item.category
   */
  category?: CodeableConcept;

  /**
   * CoverageEligibilityRequest.item.productOrService
   */
  productOrService?: CodeableConcept;

  /**
   * CoverageEligibilityRequest.item.modifier
   */
  modifier?: CodeableConcept[];

  /**
   * CoverageEligibilityRequest.item.provider
   */
  provider?: Reference<Practitioner | PractitionerRole>;

  /**
   * CoverageEligibilityRequest.item.quantity
   */
  quantity?: Quantity;

  /**
   * CoverageEligibilityRequest.item.unitPrice
   */
  unitPrice?: Money;

  /**
   * CoverageEligibilityRequest.item.facility
   */
  facility?: Reference<Location | Organization>;

  /**
   * CoverageEligibilityRequest.item.diagnosis
   */
  diagnosis?: CoverageEligibilityRequestItemDiagnosis[];

  /**
   * CoverageEligibilityRequest.item.detail
   */
  detail?: Reference[];
}

/**
 * FHIR R4 CoverageEligibilityRequestItemDiagnosis
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface CoverageEligibilityRequestItemDiagnosis {

  /**
   * CoverageEligibilityRequest.item.diagnosis.id
   */
  id?: string;

  /**
   * CoverageEligibilityRequest.item.diagnosis.extension
   */
  extension?: Extension[];

  /**
   * CoverageEligibilityRequest.item.diagnosis.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * CoverageEligibilityRequest.item.diagnosis.diagnosis[x]
   */
  diagnosisCodeableConcept?: CodeableConcept;

  /**
   * CoverageEligibilityRequest.item.diagnosis.diagnosis[x]
   */
  diagnosisReference?: Reference<Condition>;
}

/**
 * FHIR R4 CoverageEligibilityRequestSupportingInfo
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface CoverageEligibilityRequestSupportingInfo {

  /**
   * CoverageEligibilityRequest.supportingInfo.id
   */
  id?: string;

  /**
   * CoverageEligibilityRequest.supportingInfo.extension
   */
  extension?: Extension[];

  /**
   * CoverageEligibilityRequest.supportingInfo.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * CoverageEligibilityRequest.supportingInfo.sequence
   */
  sequence: number;

  /**
   * CoverageEligibilityRequest.supportingInfo.information
   */
  information: Reference;

  /**
   * CoverageEligibilityRequest.supportingInfo.appliesToAll
   */
  appliesToAll?: boolean;
}

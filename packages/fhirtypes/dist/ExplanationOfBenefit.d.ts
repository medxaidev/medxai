import { Address } from './Address';
import { Attachment } from './Attachment';
import { Claim } from './Claim';
import { ClaimResponse } from './ClaimResponse';
import { CodeableConcept } from './CodeableConcept';
import { Coding } from './Coding';
import { Condition } from './Condition';
import { Coverage } from './Coverage';
import { Device } from './Device';
import { Encounter } from './Encounter';
import { Extension } from './Extension';
import { Identifier } from './Identifier';
import { Location } from './Location';
import { MedicationRequest } from './MedicationRequest';
import { Meta } from './Meta';
import { Money } from './Money';
import { Narrative } from './Narrative';
import { Organization } from './Organization';
import { Patient } from './Patient';
import { Period } from './Period';
import { Practitioner } from './Practitioner';
import { PractitionerRole } from './PractitionerRole';
import { Procedure } from './Procedure';
import { Quantity } from './Quantity';
import { Reference } from './Reference';
import { RelatedPerson } from './RelatedPerson';
import { Resource } from './Resource';
import { ServiceRequest } from './ServiceRequest';
import { VisionPrescription } from './VisionPrescription';

/**
 * FHIR R4 ExplanationOfBenefit
 * @see https://hl7.org/fhir/R4/explanationofbenefit.html
 */
export interface ExplanationOfBenefit {

  /**
   * This is a ExplanationOfBenefit resource
   */
  readonly resourceType: 'ExplanationOfBenefit';

  /**
   * ExplanationOfBenefit.id
   */
  id?: string;

  /**
   * ExplanationOfBenefit.meta
   */
  meta?: Meta;

  /**
   * ExplanationOfBenefit.implicitRules
   */
  implicitRules?: string;

  /**
   * ExplanationOfBenefit.language
   */
  language?: string;

  /**
   * ExplanationOfBenefit.text
   */
  text?: Narrative;

  /**
   * ExplanationOfBenefit.contained
   */
  contained?: Resource[];

  /**
   * ExplanationOfBenefit.extension
   */
  extension?: Extension[];

  /**
   * ExplanationOfBenefit.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * ExplanationOfBenefit.identifier
   */
  identifier?: Identifier[];

  /**
   * ExplanationOfBenefit.status
   */
  status: string;

  /**
   * ExplanationOfBenefit.type
   */
  type: CodeableConcept;

  /**
   * ExplanationOfBenefit.subType
   */
  subType?: CodeableConcept;

  /**
   * ExplanationOfBenefit.use
   */
  use: string;

  /**
   * ExplanationOfBenefit.patient
   */
  patient: Reference<Patient>;

  /**
   * ExplanationOfBenefit.billablePeriod
   */
  billablePeriod?: Period;

  /**
   * ExplanationOfBenefit.created
   */
  created: string;

  /**
   * ExplanationOfBenefit.enterer
   */
  enterer?: Reference<Practitioner | PractitionerRole>;

  /**
   * ExplanationOfBenefit.insurer
   */
  insurer: Reference<Organization>;

  /**
   * ExplanationOfBenefit.provider
   */
  provider: Reference<Practitioner | PractitionerRole | Organization>;

  /**
   * ExplanationOfBenefit.priority
   */
  priority?: CodeableConcept;

  /**
   * ExplanationOfBenefit.fundsReserveRequested
   */
  fundsReserveRequested?: CodeableConcept;

  /**
   * ExplanationOfBenefit.fundsReserve
   */
  fundsReserve?: CodeableConcept;

  /**
   * ExplanationOfBenefit.related
   */
  related?: ExplanationOfBenefitRelated[];

  /**
   * ExplanationOfBenefit.prescription
   */
  prescription?: Reference<MedicationRequest | VisionPrescription>;

  /**
   * ExplanationOfBenefit.originalPrescription
   */
  originalPrescription?: Reference<MedicationRequest>;

  /**
   * ExplanationOfBenefit.payee
   */
  payee?: ExplanationOfBenefitPayee;

  /**
   * ExplanationOfBenefit.referral
   */
  referral?: Reference<ServiceRequest>;

  /**
   * ExplanationOfBenefit.facility
   */
  facility?: Reference<Location>;

  /**
   * ExplanationOfBenefit.claim
   */
  claim?: Reference<Claim>;

  /**
   * ExplanationOfBenefit.claimResponse
   */
  claimResponse?: Reference<ClaimResponse>;

  /**
   * ExplanationOfBenefit.outcome
   */
  outcome: string;

  /**
   * ExplanationOfBenefit.disposition
   */
  disposition?: string;

  /**
   * ExplanationOfBenefit.preAuthRef
   */
  preAuthRef?: string[];

  /**
   * ExplanationOfBenefit.preAuthRefPeriod
   */
  preAuthRefPeriod?: Period[];

  /**
   * ExplanationOfBenefit.careTeam
   */
  careTeam?: ExplanationOfBenefitCareTeam[];

  /**
   * ExplanationOfBenefit.supportingInfo
   */
  supportingInfo?: ExplanationOfBenefitSupportingInfo[];

  /**
   * ExplanationOfBenefit.diagnosis
   */
  diagnosis?: ExplanationOfBenefitDiagnosis[];

  /**
   * ExplanationOfBenefit.procedure
   */
  procedure?: ExplanationOfBenefitProcedure[];

  /**
   * ExplanationOfBenefit.precedence
   */
  precedence?: number;

  /**
   * ExplanationOfBenefit.insurance
   */
  insurance: ExplanationOfBenefitInsurance[];

  /**
   * ExplanationOfBenefit.accident
   */
  accident?: ExplanationOfBenefitAccident;

  /**
   * ExplanationOfBenefit.item
   */
  item?: ExplanationOfBenefitItem[];

  /**
   * ExplanationOfBenefit.addItem
   */
  addItem?: ExplanationOfBenefitAddItem[];

  /**
   * ExplanationOfBenefit.total
   */
  total?: ExplanationOfBenefitTotal[];

  /**
   * ExplanationOfBenefit.payment
   */
  payment?: ExplanationOfBenefitPayment;

  /**
   * ExplanationOfBenefit.formCode
   */
  formCode?: CodeableConcept;

  /**
   * ExplanationOfBenefit.form
   */
  form?: Attachment;

  /**
   * ExplanationOfBenefit.processNote
   */
  processNote?: ExplanationOfBenefitProcessNote[];

  /**
   * ExplanationOfBenefit.benefitPeriod
   */
  benefitPeriod?: Period;

  /**
   * ExplanationOfBenefit.benefitBalance
   */
  benefitBalance?: ExplanationOfBenefitBenefitBalance[];
}

/**
 * FHIR R4 ExplanationOfBenefitAccident
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ExplanationOfBenefitAccident {

  /**
   * ExplanationOfBenefit.accident.id
   */
  id?: string;

  /**
   * ExplanationOfBenefit.accident.extension
   */
  extension?: Extension[];

  /**
   * ExplanationOfBenefit.accident.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * ExplanationOfBenefit.accident.date
   */
  date?: string;

  /**
   * ExplanationOfBenefit.accident.type
   */
  type?: CodeableConcept;

  /**
   * ExplanationOfBenefit.accident.location[x]
   */
  locationAddress?: Address;

  /**
   * ExplanationOfBenefit.accident.location[x]
   */
  locationReference?: Reference<Location>;
}

/**
 * FHIR R4 ExplanationOfBenefitAddItem
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ExplanationOfBenefitAddItem {

  /**
   * ExplanationOfBenefit.addItem.id
   */
  id?: string;

  /**
   * ExplanationOfBenefit.addItem.extension
   */
  extension?: Extension[];

  /**
   * ExplanationOfBenefit.addItem.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * ExplanationOfBenefit.addItem.itemSequence
   */
  itemSequence?: number[];

  /**
   * ExplanationOfBenefit.addItem.detailSequence
   */
  detailSequence?: number[];

  /**
   * ExplanationOfBenefit.addItem.subDetailSequence
   */
  subDetailSequence?: number[];

  /**
   * ExplanationOfBenefit.addItem.provider
   */
  provider?: Reference<Practitioner | PractitionerRole | Organization>[];

  /**
   * ExplanationOfBenefit.addItem.productOrService
   */
  productOrService: CodeableConcept;

  /**
   * ExplanationOfBenefit.addItem.modifier
   */
  modifier?: CodeableConcept[];

  /**
   * ExplanationOfBenefit.addItem.programCode
   */
  programCode?: CodeableConcept[];

  /**
   * ExplanationOfBenefit.addItem.serviced[x]
   */
  servicedDate?: string;

  /**
   * ExplanationOfBenefit.addItem.serviced[x]
   */
  servicedPeriod?: Period;

  /**
   * ExplanationOfBenefit.addItem.location[x]
   */
  locationCodeableConcept?: CodeableConcept;

  /**
   * ExplanationOfBenefit.addItem.location[x]
   */
  locationAddress?: Address;

  /**
   * ExplanationOfBenefit.addItem.location[x]
   */
  locationReference?: Reference<Location>;

  /**
   * ExplanationOfBenefit.addItem.quantity
   */
  quantity?: Quantity;

  /**
   * ExplanationOfBenefit.addItem.unitPrice
   */
  unitPrice?: Money;

  /**
   * ExplanationOfBenefit.addItem.factor
   */
  factor?: number;

  /**
   * ExplanationOfBenefit.addItem.net
   */
  net?: Money;

  /**
   * ExplanationOfBenefit.addItem.bodySite
   */
  bodySite?: CodeableConcept;

  /**
   * ExplanationOfBenefit.addItem.subSite
   */
  subSite?: CodeableConcept[];

  /**
   * ExplanationOfBenefit.addItem.noteNumber
   */
  noteNumber?: number[];

  /**
   * ExplanationOfBenefit.addItem.detail
   */
  detail?: ExplanationOfBenefitAddItemDetail[];
}

/**
 * FHIR R4 ExplanationOfBenefitAddItemDetail
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ExplanationOfBenefitAddItemDetail {

  /**
   * ExplanationOfBenefit.addItem.detail.id
   */
  id?: string;

  /**
   * ExplanationOfBenefit.addItem.detail.extension
   */
  extension?: Extension[];

  /**
   * ExplanationOfBenefit.addItem.detail.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * ExplanationOfBenefit.addItem.detail.productOrService
   */
  productOrService: CodeableConcept;

  /**
   * ExplanationOfBenefit.addItem.detail.modifier
   */
  modifier?: CodeableConcept[];

  /**
   * ExplanationOfBenefit.addItem.detail.quantity
   */
  quantity?: Quantity;

  /**
   * ExplanationOfBenefit.addItem.detail.unitPrice
   */
  unitPrice?: Money;

  /**
   * ExplanationOfBenefit.addItem.detail.factor
   */
  factor?: number;

  /**
   * ExplanationOfBenefit.addItem.detail.net
   */
  net?: Money;

  /**
   * ExplanationOfBenefit.addItem.detail.noteNumber
   */
  noteNumber?: number[];

  /**
   * ExplanationOfBenefit.addItem.detail.subDetail
   */
  subDetail?: ExplanationOfBenefitAddItemDetailSubDetail[];
}

/**
 * FHIR R4 ExplanationOfBenefitAddItemDetailSubDetail
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ExplanationOfBenefitAddItemDetailSubDetail {

  /**
   * ExplanationOfBenefit.addItem.detail.subDetail.id
   */
  id?: string;

  /**
   * ExplanationOfBenefit.addItem.detail.subDetail.extension
   */
  extension?: Extension[];

  /**
   * ExplanationOfBenefit.addItem.detail.subDetail.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * ExplanationOfBenefit.addItem.detail.subDetail.productOrService
   */
  productOrService: CodeableConcept;

  /**
   * ExplanationOfBenefit.addItem.detail.subDetail.modifier
   */
  modifier?: CodeableConcept[];

  /**
   * ExplanationOfBenefit.addItem.detail.subDetail.quantity
   */
  quantity?: Quantity;

  /**
   * ExplanationOfBenefit.addItem.detail.subDetail.unitPrice
   */
  unitPrice?: Money;

  /**
   * ExplanationOfBenefit.addItem.detail.subDetail.factor
   */
  factor?: number;

  /**
   * ExplanationOfBenefit.addItem.detail.subDetail.net
   */
  net?: Money;

  /**
   * ExplanationOfBenefit.addItem.detail.subDetail.noteNumber
   */
  noteNumber?: number[];
}

/**
 * FHIR R4 ExplanationOfBenefitBenefitBalance
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ExplanationOfBenefitBenefitBalance {

  /**
   * ExplanationOfBenefit.benefitBalance.id
   */
  id?: string;

  /**
   * ExplanationOfBenefit.benefitBalance.extension
   */
  extension?: Extension[];

  /**
   * ExplanationOfBenefit.benefitBalance.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * ExplanationOfBenefit.benefitBalance.category
   */
  category: CodeableConcept;

  /**
   * ExplanationOfBenefit.benefitBalance.excluded
   */
  excluded?: boolean;

  /**
   * ExplanationOfBenefit.benefitBalance.name
   */
  name?: string;

  /**
   * ExplanationOfBenefit.benefitBalance.description
   */
  description?: string;

  /**
   * ExplanationOfBenefit.benefitBalance.network
   */
  network?: CodeableConcept;

  /**
   * ExplanationOfBenefit.benefitBalance.unit
   */
  unit?: CodeableConcept;

  /**
   * ExplanationOfBenefit.benefitBalance.term
   */
  term?: CodeableConcept;

  /**
   * ExplanationOfBenefit.benefitBalance.financial
   */
  financial?: ExplanationOfBenefitBenefitBalanceFinancial[];
}

/**
 * FHIR R4 ExplanationOfBenefitBenefitBalanceFinancial
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ExplanationOfBenefitBenefitBalanceFinancial {

  /**
   * ExplanationOfBenefit.benefitBalance.financial.id
   */
  id?: string;

  /**
   * ExplanationOfBenefit.benefitBalance.financial.extension
   */
  extension?: Extension[];

  /**
   * ExplanationOfBenefit.benefitBalance.financial.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * ExplanationOfBenefit.benefitBalance.financial.type
   */
  type: CodeableConcept;

  /**
   * ExplanationOfBenefit.benefitBalance.financial.allowed[x]
   */
  allowedUnsignedInt?: number;

  /**
   * ExplanationOfBenefit.benefitBalance.financial.allowed[x]
   */
  allowedString?: string;

  /**
   * ExplanationOfBenefit.benefitBalance.financial.allowed[x]
   */
  allowedMoney?: Money;

  /**
   * ExplanationOfBenefit.benefitBalance.financial.used[x]
   */
  usedUnsignedInt?: number;

  /**
   * ExplanationOfBenefit.benefitBalance.financial.used[x]
   */
  usedMoney?: Money;
}

/**
 * FHIR R4 ExplanationOfBenefitCareTeam
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ExplanationOfBenefitCareTeam {

  /**
   * ExplanationOfBenefit.careTeam.id
   */
  id?: string;

  /**
   * ExplanationOfBenefit.careTeam.extension
   */
  extension?: Extension[];

  /**
   * ExplanationOfBenefit.careTeam.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * ExplanationOfBenefit.careTeam.sequence
   */
  sequence: number;

  /**
   * ExplanationOfBenefit.careTeam.provider
   */
  provider: Reference<Practitioner | PractitionerRole | Organization>;

  /**
   * ExplanationOfBenefit.careTeam.responsible
   */
  responsible?: boolean;

  /**
   * ExplanationOfBenefit.careTeam.role
   */
  role?: CodeableConcept;

  /**
   * ExplanationOfBenefit.careTeam.qualification
   */
  qualification?: CodeableConcept;
}

/**
 * FHIR R4 ExplanationOfBenefitDiagnosis
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ExplanationOfBenefitDiagnosis {

  /**
   * ExplanationOfBenefit.diagnosis.id
   */
  id?: string;

  /**
   * ExplanationOfBenefit.diagnosis.extension
   */
  extension?: Extension[];

  /**
   * ExplanationOfBenefit.diagnosis.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * ExplanationOfBenefit.diagnosis.sequence
   */
  sequence: number;

  /**
   * ExplanationOfBenefit.diagnosis.diagnosis[x]
   */
  diagnosisCodeableConcept: CodeableConcept;

  /**
   * ExplanationOfBenefit.diagnosis.diagnosis[x]
   */
  diagnosisReference: Reference<Condition>;

  /**
   * ExplanationOfBenefit.diagnosis.type
   */
  type?: CodeableConcept[];

  /**
   * ExplanationOfBenefit.diagnosis.onAdmission
   */
  onAdmission?: CodeableConcept;

  /**
   * ExplanationOfBenefit.diagnosis.packageCode
   */
  packageCode?: CodeableConcept;
}

/**
 * FHIR R4 ExplanationOfBenefitInsurance
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ExplanationOfBenefitInsurance {

  /**
   * ExplanationOfBenefit.insurance.id
   */
  id?: string;

  /**
   * ExplanationOfBenefit.insurance.extension
   */
  extension?: Extension[];

  /**
   * ExplanationOfBenefit.insurance.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * ExplanationOfBenefit.insurance.focal
   */
  focal: boolean;

  /**
   * ExplanationOfBenefit.insurance.coverage
   */
  coverage: Reference<Coverage>;

  /**
   * ExplanationOfBenefit.insurance.preAuthRef
   */
  preAuthRef?: string[];
}

/**
 * FHIR R4 ExplanationOfBenefitItem
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ExplanationOfBenefitItem {

  /**
   * ExplanationOfBenefit.item.id
   */
  id?: string;

  /**
   * ExplanationOfBenefit.item.extension
   */
  extension?: Extension[];

  /**
   * ExplanationOfBenefit.item.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * ExplanationOfBenefit.item.sequence
   */
  sequence: number;

  /**
   * ExplanationOfBenefit.item.careTeamSequence
   */
  careTeamSequence?: number[];

  /**
   * ExplanationOfBenefit.item.diagnosisSequence
   */
  diagnosisSequence?: number[];

  /**
   * ExplanationOfBenefit.item.procedureSequence
   */
  procedureSequence?: number[];

  /**
   * ExplanationOfBenefit.item.informationSequence
   */
  informationSequence?: number[];

  /**
   * ExplanationOfBenefit.item.revenue
   */
  revenue?: CodeableConcept;

  /**
   * ExplanationOfBenefit.item.category
   */
  category?: CodeableConcept;

  /**
   * ExplanationOfBenefit.item.productOrService
   */
  productOrService: CodeableConcept;

  /**
   * ExplanationOfBenefit.item.modifier
   */
  modifier?: CodeableConcept[];

  /**
   * ExplanationOfBenefit.item.programCode
   */
  programCode?: CodeableConcept[];

  /**
   * ExplanationOfBenefit.item.serviced[x]
   */
  servicedDate?: string;

  /**
   * ExplanationOfBenefit.item.serviced[x]
   */
  servicedPeriod?: Period;

  /**
   * ExplanationOfBenefit.item.location[x]
   */
  locationCodeableConcept?: CodeableConcept;

  /**
   * ExplanationOfBenefit.item.location[x]
   */
  locationAddress?: Address;

  /**
   * ExplanationOfBenefit.item.location[x]
   */
  locationReference?: Reference<Location>;

  /**
   * ExplanationOfBenefit.item.quantity
   */
  quantity?: Quantity;

  /**
   * ExplanationOfBenefit.item.unitPrice
   */
  unitPrice?: Money;

  /**
   * ExplanationOfBenefit.item.factor
   */
  factor?: number;

  /**
   * ExplanationOfBenefit.item.net
   */
  net?: Money;

  /**
   * ExplanationOfBenefit.item.udi
   */
  udi?: Reference<Device>[];

  /**
   * ExplanationOfBenefit.item.bodySite
   */
  bodySite?: CodeableConcept;

  /**
   * ExplanationOfBenefit.item.subSite
   */
  subSite?: CodeableConcept[];

  /**
   * ExplanationOfBenefit.item.encounter
   */
  encounter?: Reference<Encounter>[];

  /**
   * ExplanationOfBenefit.item.noteNumber
   */
  noteNumber?: number[];

  /**
   * ExplanationOfBenefit.item.adjudication
   */
  adjudication?: ExplanationOfBenefitItemAdjudication[];

  /**
   * ExplanationOfBenefit.item.detail
   */
  detail?: ExplanationOfBenefitItemDetail[];
}

/**
 * FHIR R4 ExplanationOfBenefitItemAdjudication
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ExplanationOfBenefitItemAdjudication {

  /**
   * ExplanationOfBenefit.item.adjudication.id
   */
  id?: string;

  /**
   * ExplanationOfBenefit.item.adjudication.extension
   */
  extension?: Extension[];

  /**
   * ExplanationOfBenefit.item.adjudication.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * ExplanationOfBenefit.item.adjudication.category
   */
  category: CodeableConcept;

  /**
   * ExplanationOfBenefit.item.adjudication.reason
   */
  reason?: CodeableConcept;

  /**
   * ExplanationOfBenefit.item.adjudication.amount
   */
  amount?: Money;

  /**
   * ExplanationOfBenefit.item.adjudication.value
   */
  value?: number;
}

/**
 * FHIR R4 ExplanationOfBenefitItemDetail
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ExplanationOfBenefitItemDetail {

  /**
   * ExplanationOfBenefit.item.detail.id
   */
  id?: string;

  /**
   * ExplanationOfBenefit.item.detail.extension
   */
  extension?: Extension[];

  /**
   * ExplanationOfBenefit.item.detail.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * ExplanationOfBenefit.item.detail.sequence
   */
  sequence: number;

  /**
   * ExplanationOfBenefit.item.detail.revenue
   */
  revenue?: CodeableConcept;

  /**
   * ExplanationOfBenefit.item.detail.category
   */
  category?: CodeableConcept;

  /**
   * ExplanationOfBenefit.item.detail.productOrService
   */
  productOrService: CodeableConcept;

  /**
   * ExplanationOfBenefit.item.detail.modifier
   */
  modifier?: CodeableConcept[];

  /**
   * ExplanationOfBenefit.item.detail.programCode
   */
  programCode?: CodeableConcept[];

  /**
   * ExplanationOfBenefit.item.detail.quantity
   */
  quantity?: Quantity;

  /**
   * ExplanationOfBenefit.item.detail.unitPrice
   */
  unitPrice?: Money;

  /**
   * ExplanationOfBenefit.item.detail.factor
   */
  factor?: number;

  /**
   * ExplanationOfBenefit.item.detail.net
   */
  net?: Money;

  /**
   * ExplanationOfBenefit.item.detail.udi
   */
  udi?: Reference<Device>[];

  /**
   * ExplanationOfBenefit.item.detail.noteNumber
   */
  noteNumber?: number[];

  /**
   * ExplanationOfBenefit.item.detail.subDetail
   */
  subDetail?: ExplanationOfBenefitItemDetailSubDetail[];
}

/**
 * FHIR R4 ExplanationOfBenefitItemDetailSubDetail
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ExplanationOfBenefitItemDetailSubDetail {

  /**
   * ExplanationOfBenefit.item.detail.subDetail.id
   */
  id?: string;

  /**
   * ExplanationOfBenefit.item.detail.subDetail.extension
   */
  extension?: Extension[];

  /**
   * ExplanationOfBenefit.item.detail.subDetail.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * ExplanationOfBenefit.item.detail.subDetail.sequence
   */
  sequence: number;

  /**
   * ExplanationOfBenefit.item.detail.subDetail.revenue
   */
  revenue?: CodeableConcept;

  /**
   * ExplanationOfBenefit.item.detail.subDetail.category
   */
  category?: CodeableConcept;

  /**
   * ExplanationOfBenefit.item.detail.subDetail.productOrService
   */
  productOrService: CodeableConcept;

  /**
   * ExplanationOfBenefit.item.detail.subDetail.modifier
   */
  modifier?: CodeableConcept[];

  /**
   * ExplanationOfBenefit.item.detail.subDetail.programCode
   */
  programCode?: CodeableConcept[];

  /**
   * ExplanationOfBenefit.item.detail.subDetail.quantity
   */
  quantity?: Quantity;

  /**
   * ExplanationOfBenefit.item.detail.subDetail.unitPrice
   */
  unitPrice?: Money;

  /**
   * ExplanationOfBenefit.item.detail.subDetail.factor
   */
  factor?: number;

  /**
   * ExplanationOfBenefit.item.detail.subDetail.net
   */
  net?: Money;

  /**
   * ExplanationOfBenefit.item.detail.subDetail.udi
   */
  udi?: Reference<Device>[];

  /**
   * ExplanationOfBenefit.item.detail.subDetail.noteNumber
   */
  noteNumber?: number[];
}

/**
 * FHIR R4 ExplanationOfBenefitPayee
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ExplanationOfBenefitPayee {

  /**
   * ExplanationOfBenefit.payee.id
   */
  id?: string;

  /**
   * ExplanationOfBenefit.payee.extension
   */
  extension?: Extension[];

  /**
   * ExplanationOfBenefit.payee.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * ExplanationOfBenefit.payee.type
   */
  type?: CodeableConcept;

  /**
   * ExplanationOfBenefit.payee.party
   */
  party?: Reference<Practitioner | PractitionerRole | Organization | Patient | RelatedPerson>;
}

/**
 * FHIR R4 ExplanationOfBenefitPayment
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ExplanationOfBenefitPayment {

  /**
   * ExplanationOfBenefit.payment.id
   */
  id?: string;

  /**
   * ExplanationOfBenefit.payment.extension
   */
  extension?: Extension[];

  /**
   * ExplanationOfBenefit.payment.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * ExplanationOfBenefit.payment.type
   */
  type?: CodeableConcept;

  /**
   * ExplanationOfBenefit.payment.adjustment
   */
  adjustment?: Money;

  /**
   * ExplanationOfBenefit.payment.adjustmentReason
   */
  adjustmentReason?: CodeableConcept;

  /**
   * ExplanationOfBenefit.payment.date
   */
  date?: string;

  /**
   * ExplanationOfBenefit.payment.amount
   */
  amount?: Money;

  /**
   * ExplanationOfBenefit.payment.identifier
   */
  identifier?: Identifier;
}

/**
 * FHIR R4 ExplanationOfBenefitProcedure
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ExplanationOfBenefitProcedure {

  /**
   * ExplanationOfBenefit.procedure.id
   */
  id?: string;

  /**
   * ExplanationOfBenefit.procedure.extension
   */
  extension?: Extension[];

  /**
   * ExplanationOfBenefit.procedure.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * ExplanationOfBenefit.procedure.sequence
   */
  sequence: number;

  /**
   * ExplanationOfBenefit.procedure.type
   */
  type?: CodeableConcept[];

  /**
   * ExplanationOfBenefit.procedure.date
   */
  date?: string;

  /**
   * ExplanationOfBenefit.procedure.procedure[x]
   */
  procedureCodeableConcept: CodeableConcept;

  /**
   * ExplanationOfBenefit.procedure.procedure[x]
   */
  procedureReference: Reference<Procedure>;

  /**
   * ExplanationOfBenefit.procedure.udi
   */
  udi?: Reference<Device>[];
}

/**
 * FHIR R4 ExplanationOfBenefitProcessNote
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ExplanationOfBenefitProcessNote {

  /**
   * ExplanationOfBenefit.processNote.id
   */
  id?: string;

  /**
   * ExplanationOfBenefit.processNote.extension
   */
  extension?: Extension[];

  /**
   * ExplanationOfBenefit.processNote.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * ExplanationOfBenefit.processNote.number
   */
  number?: number;

  /**
   * ExplanationOfBenefit.processNote.type
   */
  type?: string;

  /**
   * ExplanationOfBenefit.processNote.text
   */
  text?: string;

  /**
   * ExplanationOfBenefit.processNote.language
   */
  language?: CodeableConcept;
}

/**
 * FHIR R4 ExplanationOfBenefitRelated
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ExplanationOfBenefitRelated {

  /**
   * ExplanationOfBenefit.related.id
   */
  id?: string;

  /**
   * ExplanationOfBenefit.related.extension
   */
  extension?: Extension[];

  /**
   * ExplanationOfBenefit.related.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * ExplanationOfBenefit.related.claim
   */
  claim?: Reference<Claim>;

  /**
   * ExplanationOfBenefit.related.relationship
   */
  relationship?: CodeableConcept;

  /**
   * ExplanationOfBenefit.related.reference
   */
  reference?: Identifier;
}

/**
 * FHIR R4 ExplanationOfBenefitSupportingInfo
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ExplanationOfBenefitSupportingInfo {

  /**
   * ExplanationOfBenefit.supportingInfo.id
   */
  id?: string;

  /**
   * ExplanationOfBenefit.supportingInfo.extension
   */
  extension?: Extension[];

  /**
   * ExplanationOfBenefit.supportingInfo.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * ExplanationOfBenefit.supportingInfo.sequence
   */
  sequence: number;

  /**
   * ExplanationOfBenefit.supportingInfo.category
   */
  category: CodeableConcept;

  /**
   * ExplanationOfBenefit.supportingInfo.code
   */
  code?: CodeableConcept;

  /**
   * ExplanationOfBenefit.supportingInfo.timing[x]
   */
  timingDate?: string;

  /**
   * ExplanationOfBenefit.supportingInfo.timing[x]
   */
  timingPeriod?: Period;

  /**
   * ExplanationOfBenefit.supportingInfo.value[x]
   */
  valueBoolean?: boolean;

  /**
   * ExplanationOfBenefit.supportingInfo.value[x]
   */
  valueString?: string;

  /**
   * ExplanationOfBenefit.supportingInfo.value[x]
   */
  valueQuantity?: Quantity;

  /**
   * ExplanationOfBenefit.supportingInfo.value[x]
   */
  valueAttachment?: Attachment;

  /**
   * ExplanationOfBenefit.supportingInfo.value[x]
   */
  valueReference?: Reference;

  /**
   * ExplanationOfBenefit.supportingInfo.reason
   */
  reason?: Coding;
}

/**
 * FHIR R4 ExplanationOfBenefitTotal
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ExplanationOfBenefitTotal {

  /**
   * ExplanationOfBenefit.total.id
   */
  id?: string;

  /**
   * ExplanationOfBenefit.total.extension
   */
  extension?: Extension[];

  /**
   * ExplanationOfBenefit.total.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * ExplanationOfBenefit.total.category
   */
  category: CodeableConcept;

  /**
   * ExplanationOfBenefit.total.amount
   */
  amount: Money;
}

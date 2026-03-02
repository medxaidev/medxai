import { Address } from './Address';
import { Attachment } from './Attachment';
import { ClaimResponse } from './ClaimResponse';
import { CodeableConcept } from './CodeableConcept';
import { Condition } from './Condition';
import { Coverage } from './Coverage';
import { Device } from './Device';
import { DeviceRequest } from './DeviceRequest';
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
 * FHIR R4 Claim
 * @see https://hl7.org/fhir/R4/claim.html
 */
export interface Claim {

  /**
   * This is a Claim resource
   */
  readonly resourceType: 'Claim';

  /**
   * Claim.id
   */
  id?: string;

  /**
   * Claim.meta
   */
  meta?: Meta;

  /**
   * Claim.implicitRules
   */
  implicitRules?: string;

  /**
   * Claim.language
   */
  language?: string;

  /**
   * Claim.text
   */
  text?: Narrative;

  /**
   * Claim.contained
   */
  contained?: Resource[];

  /**
   * Claim.extension
   */
  extension?: Extension[];

  /**
   * Claim.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Claim.identifier
   */
  identifier?: Identifier[];

  /**
   * Claim.status
   */
  status: 'active' | 'cancelled' | 'draft' | 'entered-in-error';

  /**
   * Claim.type
   */
  type: CodeableConcept;

  /**
   * Claim.subType
   */
  subType?: CodeableConcept;

  /**
   * Claim.use
   */
  use: string;

  /**
   * Claim.patient
   */
  patient: Reference<Patient>;

  /**
   * Claim.billablePeriod
   */
  billablePeriod?: Period;

  /**
   * Claim.created
   */
  created: string;

  /**
   * Claim.enterer
   */
  enterer?: Reference<Practitioner | PractitionerRole>;

  /**
   * Claim.insurer
   */
  insurer?: Reference<Organization>;

  /**
   * Claim.provider
   */
  provider: Reference<Practitioner | PractitionerRole | Organization>;

  /**
   * Claim.priority
   */
  priority: CodeableConcept;

  /**
   * Claim.fundsReserve
   */
  fundsReserve?: CodeableConcept;

  /**
   * Claim.related
   */
  related?: ClaimRelated[];

  /**
   * Claim.prescription
   */
  prescription?: Reference<DeviceRequest | MedicationRequest | VisionPrescription>;

  /**
   * Claim.originalPrescription
   */
  originalPrescription?: Reference<DeviceRequest | MedicationRequest | VisionPrescription>;

  /**
   * Claim.payee
   */
  payee?: ClaimPayee;

  /**
   * Claim.referral
   */
  referral?: Reference<ServiceRequest>;

  /**
   * Claim.facility
   */
  facility?: Reference<Location>;

  /**
   * Claim.careTeam
   */
  careTeam?: ClaimCareTeam[];

  /**
   * Claim.supportingInfo
   */
  supportingInfo?: ClaimSupportingInfo[];

  /**
   * Claim.diagnosis
   */
  diagnosis?: ClaimDiagnosis[];

  /**
   * Claim.procedure
   */
  procedure?: ClaimProcedure[];

  /**
   * Claim.insurance
   */
  insurance: ClaimInsurance[];

  /**
   * Claim.accident
   */
  accident?: ClaimAccident;

  /**
   * Claim.item
   */
  item?: ClaimItem[];

  /**
   * Claim.total
   */
  total?: Money;
}

/**
 * FHIR R4 ClaimAccident
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ClaimAccident {

  /**
   * Claim.accident.id
   */
  id?: string;

  /**
   * Claim.accident.extension
   */
  extension?: Extension[];

  /**
   * Claim.accident.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Claim.accident.date
   */
  date: string;

  /**
   * Claim.accident.type
   */
  type?: CodeableConcept;

  /**
   * Claim.accident.location[x]
   */
  locationAddress?: Address;

  /**
   * Claim.accident.location[x]
   */
  locationReference?: Reference<Location>;
}

/**
 * FHIR R4 ClaimCareTeam
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ClaimCareTeam {

  /**
   * Claim.careTeam.id
   */
  id?: string;

  /**
   * Claim.careTeam.extension
   */
  extension?: Extension[];

  /**
   * Claim.careTeam.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Claim.careTeam.sequence
   */
  sequence: number;

  /**
   * Claim.careTeam.provider
   */
  provider: Reference<Practitioner | PractitionerRole | Organization>;

  /**
   * Claim.careTeam.responsible
   */
  responsible?: boolean;

  /**
   * Claim.careTeam.role
   */
  role?: CodeableConcept;

  /**
   * Claim.careTeam.qualification
   */
  qualification?: CodeableConcept;
}

/**
 * FHIR R4 ClaimDiagnosis
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ClaimDiagnosis {

  /**
   * Claim.diagnosis.id
   */
  id?: string;

  /**
   * Claim.diagnosis.extension
   */
  extension?: Extension[];

  /**
   * Claim.diagnosis.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Claim.diagnosis.sequence
   */
  sequence: number;

  /**
   * Claim.diagnosis.diagnosis[x]
   */
  diagnosisCodeableConcept: CodeableConcept;

  /**
   * Claim.diagnosis.diagnosis[x]
   */
  diagnosisReference: Reference<Condition>;

  /**
   * Claim.diagnosis.type
   */
  type?: CodeableConcept[];

  /**
   * Claim.diagnosis.onAdmission
   */
  onAdmission?: CodeableConcept;

  /**
   * Claim.diagnosis.packageCode
   */
  packageCode?: CodeableConcept;
}

/**
 * FHIR R4 ClaimInsurance
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ClaimInsurance {

  /**
   * Claim.insurance.id
   */
  id?: string;

  /**
   * Claim.insurance.extension
   */
  extension?: Extension[];

  /**
   * Claim.insurance.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Claim.insurance.sequence
   */
  sequence: number;

  /**
   * Claim.insurance.focal
   */
  focal: boolean;

  /**
   * Claim.insurance.identifier
   */
  identifier?: Identifier;

  /**
   * Claim.insurance.coverage
   */
  coverage: Reference<Coverage>;

  /**
   * Claim.insurance.businessArrangement
   */
  businessArrangement?: string;

  /**
   * Claim.insurance.preAuthRef
   */
  preAuthRef?: string[];

  /**
   * Claim.insurance.claimResponse
   */
  claimResponse?: Reference<ClaimResponse>;
}

/**
 * FHIR R4 ClaimItem
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ClaimItem {

  /**
   * Claim.item.id
   */
  id?: string;

  /**
   * Claim.item.extension
   */
  extension?: Extension[];

  /**
   * Claim.item.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Claim.item.sequence
   */
  sequence: number;

  /**
   * Claim.item.careTeamSequence
   */
  careTeamSequence?: number[];

  /**
   * Claim.item.diagnosisSequence
   */
  diagnosisSequence?: number[];

  /**
   * Claim.item.procedureSequence
   */
  procedureSequence?: number[];

  /**
   * Claim.item.informationSequence
   */
  informationSequence?: number[];

  /**
   * Claim.item.revenue
   */
  revenue?: CodeableConcept;

  /**
   * Claim.item.category
   */
  category?: CodeableConcept;

  /**
   * Claim.item.productOrService
   */
  productOrService: CodeableConcept;

  /**
   * Claim.item.modifier
   */
  modifier?: CodeableConcept[];

  /**
   * Claim.item.programCode
   */
  programCode?: CodeableConcept[];

  /**
   * Claim.item.serviced[x]
   */
  servicedDate?: string;

  /**
   * Claim.item.serviced[x]
   */
  servicedPeriod?: Period;

  /**
   * Claim.item.location[x]
   */
  locationCodeableConcept?: CodeableConcept;

  /**
   * Claim.item.location[x]
   */
  locationAddress?: Address;

  /**
   * Claim.item.location[x]
   */
  locationReference?: Reference<Location>;

  /**
   * Claim.item.quantity
   */
  quantity?: Quantity;

  /**
   * Claim.item.unitPrice
   */
  unitPrice?: Money;

  /**
   * Claim.item.factor
   */
  factor?: number;

  /**
   * Claim.item.net
   */
  net?: Money;

  /**
   * Claim.item.udi
   */
  udi?: Reference<Device>[];

  /**
   * Claim.item.bodySite
   */
  bodySite?: CodeableConcept;

  /**
   * Claim.item.subSite
   */
  subSite?: CodeableConcept[];

  /**
   * Claim.item.encounter
   */
  encounter?: Reference<Encounter>[];

  /**
   * Claim.item.detail
   */
  detail?: ClaimItemDetail[];
}

/**
 * FHIR R4 ClaimItemDetail
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ClaimItemDetail {

  /**
   * Claim.item.detail.id
   */
  id?: string;

  /**
   * Claim.item.detail.extension
   */
  extension?: Extension[];

  /**
   * Claim.item.detail.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Claim.item.detail.sequence
   */
  sequence: number;

  /**
   * Claim.item.detail.revenue
   */
  revenue?: CodeableConcept;

  /**
   * Claim.item.detail.category
   */
  category?: CodeableConcept;

  /**
   * Claim.item.detail.productOrService
   */
  productOrService: CodeableConcept;

  /**
   * Claim.item.detail.modifier
   */
  modifier?: CodeableConcept[];

  /**
   * Claim.item.detail.programCode
   */
  programCode?: CodeableConcept[];

  /**
   * Claim.item.detail.quantity
   */
  quantity?: Quantity;

  /**
   * Claim.item.detail.unitPrice
   */
  unitPrice?: Money;

  /**
   * Claim.item.detail.factor
   */
  factor?: number;

  /**
   * Claim.item.detail.net
   */
  net?: Money;

  /**
   * Claim.item.detail.udi
   */
  udi?: Reference<Device>[];

  /**
   * Claim.item.detail.subDetail
   */
  subDetail?: ClaimItemDetailSubDetail[];
}

/**
 * FHIR R4 ClaimItemDetailSubDetail
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ClaimItemDetailSubDetail {

  /**
   * Claim.item.detail.subDetail.id
   */
  id?: string;

  /**
   * Claim.item.detail.subDetail.extension
   */
  extension?: Extension[];

  /**
   * Claim.item.detail.subDetail.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Claim.item.detail.subDetail.sequence
   */
  sequence: number;

  /**
   * Claim.item.detail.subDetail.revenue
   */
  revenue?: CodeableConcept;

  /**
   * Claim.item.detail.subDetail.category
   */
  category?: CodeableConcept;

  /**
   * Claim.item.detail.subDetail.productOrService
   */
  productOrService: CodeableConcept;

  /**
   * Claim.item.detail.subDetail.modifier
   */
  modifier?: CodeableConcept[];

  /**
   * Claim.item.detail.subDetail.programCode
   */
  programCode?: CodeableConcept[];

  /**
   * Claim.item.detail.subDetail.quantity
   */
  quantity?: Quantity;

  /**
   * Claim.item.detail.subDetail.unitPrice
   */
  unitPrice?: Money;

  /**
   * Claim.item.detail.subDetail.factor
   */
  factor?: number;

  /**
   * Claim.item.detail.subDetail.net
   */
  net?: Money;

  /**
   * Claim.item.detail.subDetail.udi
   */
  udi?: Reference<Device>[];
}

/**
 * FHIR R4 ClaimPayee
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ClaimPayee {

  /**
   * Claim.payee.id
   */
  id?: string;

  /**
   * Claim.payee.extension
   */
  extension?: Extension[];

  /**
   * Claim.payee.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Claim.payee.type
   */
  type: CodeableConcept;

  /**
   * Claim.payee.party
   */
  party?: Reference<Practitioner | PractitionerRole | Organization | Patient | RelatedPerson>;
}

/**
 * FHIR R4 ClaimProcedure
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ClaimProcedure {

  /**
   * Claim.procedure.id
   */
  id?: string;

  /**
   * Claim.procedure.extension
   */
  extension?: Extension[];

  /**
   * Claim.procedure.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Claim.procedure.sequence
   */
  sequence: number;

  /**
   * Claim.procedure.type
   */
  type?: CodeableConcept[];

  /**
   * Claim.procedure.date
   */
  date?: string;

  /**
   * Claim.procedure.procedure[x]
   */
  procedureCodeableConcept: CodeableConcept;

  /**
   * Claim.procedure.procedure[x]
   */
  procedureReference: Reference<Procedure>;

  /**
   * Claim.procedure.udi
   */
  udi?: Reference<Device>[];
}

/**
 * FHIR R4 ClaimRelated
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ClaimRelated {

  /**
   * Claim.related.id
   */
  id?: string;

  /**
   * Claim.related.extension
   */
  extension?: Extension[];

  /**
   * Claim.related.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Claim.related.claim
   */
  claim?: Reference<Claim>;

  /**
   * Claim.related.relationship
   */
  relationship?: CodeableConcept;

  /**
   * Claim.related.reference
   */
  reference?: Identifier;
}

/**
 * FHIR R4 ClaimSupportingInfo
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ClaimSupportingInfo {

  /**
   * Claim.supportingInfo.id
   */
  id?: string;

  /**
   * Claim.supportingInfo.extension
   */
  extension?: Extension[];

  /**
   * Claim.supportingInfo.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Claim.supportingInfo.sequence
   */
  sequence: number;

  /**
   * Claim.supportingInfo.category
   */
  category: CodeableConcept;

  /**
   * Claim.supportingInfo.code
   */
  code?: CodeableConcept;

  /**
   * Claim.supportingInfo.timing[x]
   */
  timingDate?: string;

  /**
   * Claim.supportingInfo.timing[x]
   */
  timingPeriod?: Period;

  /**
   * Claim.supportingInfo.value[x]
   */
  valueBoolean?: boolean;

  /**
   * Claim.supportingInfo.value[x]
   */
  valueString?: string;

  /**
   * Claim.supportingInfo.value[x]
   */
  valueQuantity?: Quantity;

  /**
   * Claim.supportingInfo.value[x]
   */
  valueAttachment?: Attachment;

  /**
   * Claim.supportingInfo.value[x]
   */
  valueReference?: Reference;

  /**
   * Claim.supportingInfo.reason
   */
  reason?: CodeableConcept;
}

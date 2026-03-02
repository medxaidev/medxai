import { Address } from './Address';
import { Attachment } from './Attachment';
import { Claim } from './Claim';
import { CodeableConcept } from './CodeableConcept';
import { CommunicationRequest } from './CommunicationRequest';
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
 * FHIR R4 ClaimResponse
 * @see https://hl7.org/fhir/R4/claimresponse.html
 */
export interface ClaimResponse {

  /**
   * This is a ClaimResponse resource
   */
  readonly resourceType: 'ClaimResponse';

  /**
   * ClaimResponse.id
   */
  id?: string;

  /**
   * ClaimResponse.meta
   */
  meta?: Meta;

  /**
   * ClaimResponse.implicitRules
   */
  implicitRules?: string;

  /**
   * ClaimResponse.language
   */
  language?: string;

  /**
   * ClaimResponse.text
   */
  text?: Narrative;

  /**
   * ClaimResponse.contained
   */
  contained?: Resource[];

  /**
   * ClaimResponse.extension
   */
  extension?: Extension[];

  /**
   * ClaimResponse.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * ClaimResponse.identifier
   */
  identifier?: Identifier[];

  /**
   * ClaimResponse.status
   */
  status: 'active' | 'cancelled' | 'draft' | 'entered-in-error';

  /**
   * ClaimResponse.type
   */
  type: CodeableConcept;

  /**
   * ClaimResponse.subType
   */
  subType?: CodeableConcept;

  /**
   * ClaimResponse.use
   */
  use: string;

  /**
   * ClaimResponse.patient
   */
  patient: Reference<Patient>;

  /**
   * ClaimResponse.created
   */
  created: string;

  /**
   * ClaimResponse.insurer
   */
  insurer: Reference<Organization>;

  /**
   * ClaimResponse.requestor
   */
  requestor?: Reference<Practitioner | PractitionerRole | Organization>;

  /**
   * ClaimResponse.request
   */
  request?: Reference<Claim>;

  /**
   * ClaimResponse.outcome
   */
  outcome: string;

  /**
   * ClaimResponse.disposition
   */
  disposition?: string;

  /**
   * ClaimResponse.preAuthRef
   */
  preAuthRef?: string;

  /**
   * ClaimResponse.preAuthPeriod
   */
  preAuthPeriod?: Period;

  /**
   * ClaimResponse.payeeType
   */
  payeeType?: CodeableConcept;

  /**
   * ClaimResponse.item
   */
  item?: ClaimResponseItem[];

  /**
   * ClaimResponse.addItem
   */
  addItem?: ClaimResponseAddItem[];

  /**
   * ClaimResponse.total
   */
  total?: ClaimResponseTotal[];

  /**
   * ClaimResponse.payment
   */
  payment?: ClaimResponsePayment;

  /**
   * ClaimResponse.fundsReserve
   */
  fundsReserve?: CodeableConcept;

  /**
   * ClaimResponse.formCode
   */
  formCode?: CodeableConcept;

  /**
   * ClaimResponse.form
   */
  form?: Attachment;

  /**
   * ClaimResponse.processNote
   */
  processNote?: ClaimResponseProcessNote[];

  /**
   * ClaimResponse.communicationRequest
   */
  communicationRequest?: Reference<CommunicationRequest>[];

  /**
   * ClaimResponse.insurance
   */
  insurance?: ClaimResponseInsurance[];

  /**
   * ClaimResponse.error
   */
  error?: ClaimResponseError[];
}

/**
 * FHIR R4 ClaimResponseAddItem
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ClaimResponseAddItem {

  /**
   * ClaimResponse.addItem.id
   */
  id?: string;

  /**
   * ClaimResponse.addItem.extension
   */
  extension?: Extension[];

  /**
   * ClaimResponse.addItem.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * ClaimResponse.addItem.itemSequence
   */
  itemSequence?: number[];

  /**
   * ClaimResponse.addItem.detailSequence
   */
  detailSequence?: number[];

  /**
   * ClaimResponse.addItem.subdetailSequence
   */
  subdetailSequence?: number[];

  /**
   * ClaimResponse.addItem.provider
   */
  provider?: Reference<Practitioner | PractitionerRole | Organization>[];

  /**
   * ClaimResponse.addItem.productOrService
   */
  productOrService: CodeableConcept;

  /**
   * ClaimResponse.addItem.modifier
   */
  modifier?: CodeableConcept[];

  /**
   * ClaimResponse.addItem.programCode
   */
  programCode?: CodeableConcept[];

  /**
   * ClaimResponse.addItem.serviced[x]
   */
  servicedDate?: string;

  /**
   * ClaimResponse.addItem.serviced[x]
   */
  servicedPeriod?: Period;

  /**
   * ClaimResponse.addItem.location[x]
   */
  locationCodeableConcept?: CodeableConcept;

  /**
   * ClaimResponse.addItem.location[x]
   */
  locationAddress?: Address;

  /**
   * ClaimResponse.addItem.location[x]
   */
  locationReference?: Reference<Location>;

  /**
   * ClaimResponse.addItem.quantity
   */
  quantity?: Quantity;

  /**
   * ClaimResponse.addItem.unitPrice
   */
  unitPrice?: Money;

  /**
   * ClaimResponse.addItem.factor
   */
  factor?: number;

  /**
   * ClaimResponse.addItem.net
   */
  net?: Money;

  /**
   * ClaimResponse.addItem.bodySite
   */
  bodySite?: CodeableConcept;

  /**
   * ClaimResponse.addItem.subSite
   */
  subSite?: CodeableConcept[];

  /**
   * ClaimResponse.addItem.noteNumber
   */
  noteNumber?: number[];

  /**
   * ClaimResponse.addItem.detail
   */
  detail?: ClaimResponseAddItemDetail[];
}

/**
 * FHIR R4 ClaimResponseAddItemDetail
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ClaimResponseAddItemDetail {

  /**
   * ClaimResponse.addItem.detail.id
   */
  id?: string;

  /**
   * ClaimResponse.addItem.detail.extension
   */
  extension?: Extension[];

  /**
   * ClaimResponse.addItem.detail.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * ClaimResponse.addItem.detail.productOrService
   */
  productOrService: CodeableConcept;

  /**
   * ClaimResponse.addItem.detail.modifier
   */
  modifier?: CodeableConcept[];

  /**
   * ClaimResponse.addItem.detail.quantity
   */
  quantity?: Quantity;

  /**
   * ClaimResponse.addItem.detail.unitPrice
   */
  unitPrice?: Money;

  /**
   * ClaimResponse.addItem.detail.factor
   */
  factor?: number;

  /**
   * ClaimResponse.addItem.detail.net
   */
  net?: Money;

  /**
   * ClaimResponse.addItem.detail.noteNumber
   */
  noteNumber?: number[];

  /**
   * ClaimResponse.addItem.detail.subDetail
   */
  subDetail?: ClaimResponseAddItemDetailSubDetail[];
}

/**
 * FHIR R4 ClaimResponseAddItemDetailSubDetail
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ClaimResponseAddItemDetailSubDetail {

  /**
   * ClaimResponse.addItem.detail.subDetail.id
   */
  id?: string;

  /**
   * ClaimResponse.addItem.detail.subDetail.extension
   */
  extension?: Extension[];

  /**
   * ClaimResponse.addItem.detail.subDetail.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * ClaimResponse.addItem.detail.subDetail.productOrService
   */
  productOrService: CodeableConcept;

  /**
   * ClaimResponse.addItem.detail.subDetail.modifier
   */
  modifier?: CodeableConcept[];

  /**
   * ClaimResponse.addItem.detail.subDetail.quantity
   */
  quantity?: Quantity;

  /**
   * ClaimResponse.addItem.detail.subDetail.unitPrice
   */
  unitPrice?: Money;

  /**
   * ClaimResponse.addItem.detail.subDetail.factor
   */
  factor?: number;

  /**
   * ClaimResponse.addItem.detail.subDetail.net
   */
  net?: Money;

  /**
   * ClaimResponse.addItem.detail.subDetail.noteNumber
   */
  noteNumber?: number[];
}

/**
 * FHIR R4 ClaimResponseError
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ClaimResponseError {

  /**
   * ClaimResponse.error.id
   */
  id?: string;

  /**
   * ClaimResponse.error.extension
   */
  extension?: Extension[];

  /**
   * ClaimResponse.error.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * ClaimResponse.error.itemSequence
   */
  itemSequence?: number;

  /**
   * ClaimResponse.error.detailSequence
   */
  detailSequence?: number;

  /**
   * ClaimResponse.error.subDetailSequence
   */
  subDetailSequence?: number;

  /**
   * ClaimResponse.error.code
   */
  code: CodeableConcept;
}

/**
 * FHIR R4 ClaimResponseInsurance
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ClaimResponseInsurance {

  /**
   * ClaimResponse.insurance.id
   */
  id?: string;

  /**
   * ClaimResponse.insurance.extension
   */
  extension?: Extension[];

  /**
   * ClaimResponse.insurance.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * ClaimResponse.insurance.sequence
   */
  sequence: number;

  /**
   * ClaimResponse.insurance.focal
   */
  focal: boolean;

  /**
   * ClaimResponse.insurance.coverage
   */
  coverage: Reference<Coverage>;

  /**
   * ClaimResponse.insurance.businessArrangement
   */
  businessArrangement?: string;

  /**
   * ClaimResponse.insurance.claimResponse
   */
  claimResponse?: Reference<ClaimResponse>;
}

/**
 * FHIR R4 ClaimResponseItem
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ClaimResponseItem {

  /**
   * ClaimResponse.item.id
   */
  id?: string;

  /**
   * ClaimResponse.item.extension
   */
  extension?: Extension[];

  /**
   * ClaimResponse.item.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * ClaimResponse.item.itemSequence
   */
  itemSequence: number;

  /**
   * ClaimResponse.item.noteNumber
   */
  noteNumber?: number[];

  /**
   * ClaimResponse.item.adjudication
   */
  adjudication: ClaimResponseItemAdjudication[];

  /**
   * ClaimResponse.item.detail
   */
  detail?: ClaimResponseItemDetail[];
}

/**
 * FHIR R4 ClaimResponseItemAdjudication
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ClaimResponseItemAdjudication {

  /**
   * ClaimResponse.item.adjudication.id
   */
  id?: string;

  /**
   * ClaimResponse.item.adjudication.extension
   */
  extension?: Extension[];

  /**
   * ClaimResponse.item.adjudication.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * ClaimResponse.item.adjudication.category
   */
  category: CodeableConcept;

  /**
   * ClaimResponse.item.adjudication.reason
   */
  reason?: CodeableConcept;

  /**
   * ClaimResponse.item.adjudication.amount
   */
  amount?: Money;

  /**
   * ClaimResponse.item.adjudication.value
   */
  value?: number;
}

/**
 * FHIR R4 ClaimResponseItemDetail
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ClaimResponseItemDetail {

  /**
   * ClaimResponse.item.detail.id
   */
  id?: string;

  /**
   * ClaimResponse.item.detail.extension
   */
  extension?: Extension[];

  /**
   * ClaimResponse.item.detail.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * ClaimResponse.item.detail.detailSequence
   */
  detailSequence: number;

  /**
   * ClaimResponse.item.detail.noteNumber
   */
  noteNumber?: number[];

  /**
   * ClaimResponse.item.detail.subDetail
   */
  subDetail?: ClaimResponseItemDetailSubDetail[];
}

/**
 * FHIR R4 ClaimResponseItemDetailSubDetail
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ClaimResponseItemDetailSubDetail {

  /**
   * ClaimResponse.item.detail.subDetail.id
   */
  id?: string;

  /**
   * ClaimResponse.item.detail.subDetail.extension
   */
  extension?: Extension[];

  /**
   * ClaimResponse.item.detail.subDetail.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * ClaimResponse.item.detail.subDetail.subDetailSequence
   */
  subDetailSequence: number;

  /**
   * ClaimResponse.item.detail.subDetail.noteNumber
   */
  noteNumber?: number[];
}

/**
 * FHIR R4 ClaimResponsePayment
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ClaimResponsePayment {

  /**
   * ClaimResponse.payment.id
   */
  id?: string;

  /**
   * ClaimResponse.payment.extension
   */
  extension?: Extension[];

  /**
   * ClaimResponse.payment.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * ClaimResponse.payment.type
   */
  type: CodeableConcept;

  /**
   * ClaimResponse.payment.adjustment
   */
  adjustment?: Money;

  /**
   * ClaimResponse.payment.adjustmentReason
   */
  adjustmentReason?: CodeableConcept;

  /**
   * ClaimResponse.payment.date
   */
  date?: string;

  /**
   * ClaimResponse.payment.amount
   */
  amount: Money;

  /**
   * ClaimResponse.payment.identifier
   */
  identifier?: Identifier;
}

/**
 * FHIR R4 ClaimResponseProcessNote
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ClaimResponseProcessNote {

  /**
   * ClaimResponse.processNote.id
   */
  id?: string;

  /**
   * ClaimResponse.processNote.extension
   */
  extension?: Extension[];

  /**
   * ClaimResponse.processNote.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * ClaimResponse.processNote.number
   */
  number?: number;

  /**
   * ClaimResponse.processNote.type
   */
  type?: string;

  /**
   * ClaimResponse.processNote.text
   */
  text: string;

  /**
   * ClaimResponse.processNote.language
   */
  language?: CodeableConcept;
}

/**
 * FHIR R4 ClaimResponseTotal
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ClaimResponseTotal {

  /**
   * ClaimResponse.total.id
   */
  id?: string;

  /**
   * ClaimResponse.total.extension
   */
  extension?: Extension[];

  /**
   * ClaimResponse.total.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * ClaimResponse.total.category
   */
  category: CodeableConcept;

  /**
   * ClaimResponse.total.amount
   */
  amount: Money;
}

import { CodeableConcept } from './CodeableConcept';
import { Extension } from './Extension';
import { Identifier } from './Identifier';
import { Meta } from './Meta';
import { Money } from './Money';
import { Narrative } from './Narrative';
import { Organization } from './Organization';
import { Period } from './Period';
import { Practitioner } from './Practitioner';
import { PractitionerRole } from './PractitionerRole';
import { Reference } from './Reference';
import { Resource } from './Resource';
import { Task } from './Task';

/**
 * FHIR R4 PaymentReconciliation
 * @see https://hl7.org/fhir/R4/paymentreconciliation.html
 */
export interface PaymentReconciliation {

  /**
   * This is a PaymentReconciliation resource
   */
  readonly resourceType: 'PaymentReconciliation';

  /**
   * PaymentReconciliation.id
   */
  id?: string;

  /**
   * PaymentReconciliation.meta
   */
  meta?: Meta;

  /**
   * PaymentReconciliation.implicitRules
   */
  implicitRules?: string;

  /**
   * PaymentReconciliation.language
   */
  language?: string;

  /**
   * PaymentReconciliation.text
   */
  text?: Narrative;

  /**
   * PaymentReconciliation.contained
   */
  contained?: Resource[];

  /**
   * PaymentReconciliation.extension
   */
  extension?: Extension[];

  /**
   * PaymentReconciliation.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * PaymentReconciliation.identifier
   */
  identifier?: Identifier[];

  /**
   * PaymentReconciliation.status
   */
  status: 'active' | 'cancelled' | 'draft' | 'entered-in-error';

  /**
   * PaymentReconciliation.period
   */
  period?: Period;

  /**
   * PaymentReconciliation.created
   */
  created: string;

  /**
   * PaymentReconciliation.paymentIssuer
   */
  paymentIssuer?: Reference<Organization>;

  /**
   * PaymentReconciliation.request
   */
  request?: Reference<Task>;

  /**
   * PaymentReconciliation.requestor
   */
  requestor?: Reference<Practitioner | PractitionerRole | Organization>;

  /**
   * PaymentReconciliation.outcome
   */
  outcome?: string;

  /**
   * PaymentReconciliation.disposition
   */
  disposition?: string;

  /**
   * PaymentReconciliation.paymentDate
   */
  paymentDate: string;

  /**
   * PaymentReconciliation.paymentAmount
   */
  paymentAmount: Money;

  /**
   * PaymentReconciliation.paymentIdentifier
   */
  paymentIdentifier?: Identifier;

  /**
   * PaymentReconciliation.detail
   */
  detail?: PaymentReconciliationDetail[];

  /**
   * PaymentReconciliation.formCode
   */
  formCode?: CodeableConcept;

  /**
   * PaymentReconciliation.processNote
   */
  processNote?: PaymentReconciliationProcessNote[];
}

/**
 * FHIR R4 PaymentReconciliationDetail
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface PaymentReconciliationDetail {

  /**
   * PaymentReconciliation.detail.id
   */
  id?: string;

  /**
   * PaymentReconciliation.detail.extension
   */
  extension?: Extension[];

  /**
   * PaymentReconciliation.detail.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * PaymentReconciliation.detail.identifier
   */
  identifier?: Identifier;

  /**
   * PaymentReconciliation.detail.predecessor
   */
  predecessor?: Identifier;

  /**
   * PaymentReconciliation.detail.type
   */
  type: CodeableConcept;

  /**
   * PaymentReconciliation.detail.request
   */
  request?: Reference;

  /**
   * PaymentReconciliation.detail.submitter
   */
  submitter?: Reference<Practitioner | PractitionerRole | Organization>;

  /**
   * PaymentReconciliation.detail.response
   */
  response?: Reference;

  /**
   * PaymentReconciliation.detail.date
   */
  date?: string;

  /**
   * PaymentReconciliation.detail.responsible
   */
  responsible?: Reference<PractitionerRole>;

  /**
   * PaymentReconciliation.detail.payee
   */
  payee?: Reference<Practitioner | PractitionerRole | Organization>;

  /**
   * PaymentReconciliation.detail.amount
   */
  amount?: Money;
}

/**
 * FHIR R4 PaymentReconciliationProcessNote
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface PaymentReconciliationProcessNote {

  /**
   * PaymentReconciliation.processNote.id
   */
  id?: string;

  /**
   * PaymentReconciliation.processNote.extension
   */
  extension?: Extension[];

  /**
   * PaymentReconciliation.processNote.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * PaymentReconciliation.processNote.type
   */
  type?: string;

  /**
   * PaymentReconciliation.processNote.text
   */
  text?: string;
}

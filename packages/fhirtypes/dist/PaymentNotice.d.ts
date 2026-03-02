import { CodeableConcept } from './CodeableConcept';
import { Extension } from './Extension';
import { Identifier } from './Identifier';
import { Meta } from './Meta';
import { Money } from './Money';
import { Narrative } from './Narrative';
import { Organization } from './Organization';
import { PaymentReconciliation } from './PaymentReconciliation';
import { Practitioner } from './Practitioner';
import { PractitionerRole } from './PractitionerRole';
import { Reference } from './Reference';
import { Resource } from './Resource';

/**
 * FHIR R4 PaymentNotice
 * @see https://hl7.org/fhir/R4/paymentnotice.html
 */
export interface PaymentNotice {

  /**
   * This is a PaymentNotice resource
   */
  readonly resourceType: 'PaymentNotice';

  /**
   * PaymentNotice.id
   */
  id?: string;

  /**
   * PaymentNotice.meta
   */
  meta?: Meta;

  /**
   * PaymentNotice.implicitRules
   */
  implicitRules?: string;

  /**
   * PaymentNotice.language
   */
  language?: string;

  /**
   * PaymentNotice.text
   */
  text?: Narrative;

  /**
   * PaymentNotice.contained
   */
  contained?: Resource[];

  /**
   * PaymentNotice.extension
   */
  extension?: Extension[];

  /**
   * PaymentNotice.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * PaymentNotice.identifier
   */
  identifier?: Identifier[];

  /**
   * PaymentNotice.status
   */
  status: 'active' | 'cancelled' | 'draft' | 'entered-in-error';

  /**
   * PaymentNotice.request
   */
  request?: Reference;

  /**
   * PaymentNotice.response
   */
  response?: Reference;

  /**
   * PaymentNotice.created
   */
  created: string;

  /**
   * PaymentNotice.provider
   */
  provider?: Reference<Practitioner | PractitionerRole | Organization>;

  /**
   * PaymentNotice.payment
   */
  payment: Reference<PaymentReconciliation>;

  /**
   * PaymentNotice.paymentDate
   */
  paymentDate?: string;

  /**
   * PaymentNotice.payee
   */
  payee?: Reference<Practitioner | PractitionerRole | Organization>;

  /**
   * PaymentNotice.recipient
   */
  recipient: Reference<Organization>;

  /**
   * PaymentNotice.amount
   */
  amount: Money;

  /**
   * PaymentNotice.paymentStatus
   */
  paymentStatus?: CodeableConcept;
}

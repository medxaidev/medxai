import { Account } from './Account';
import { Annotation } from './Annotation';
import { ChargeItem } from './ChargeItem';
import { CodeableConcept } from './CodeableConcept';
import { Device } from './Device';
import { Extension } from './Extension';
import { Group } from './Group';
import { Identifier } from './Identifier';
import { Meta } from './Meta';
import { Money } from './Money';
import { Narrative } from './Narrative';
import { Organization } from './Organization';
import { Patient } from './Patient';
import { Practitioner } from './Practitioner';
import { PractitionerRole } from './PractitionerRole';
import { Reference } from './Reference';
import { RelatedPerson } from './RelatedPerson';
import { Resource } from './Resource';

/**
 * FHIR R4 Invoice
 * @see https://hl7.org/fhir/R4/invoice.html
 */
export interface Invoice {

  /**
   * This is a Invoice resource
   */
  readonly resourceType: 'Invoice';

  /**
   * Invoice.id
   */
  id?: string;

  /**
   * Invoice.meta
   */
  meta?: Meta;

  /**
   * Invoice.implicitRules
   */
  implicitRules?: string;

  /**
   * Invoice.language
   */
  language?: string;

  /**
   * Invoice.text
   */
  text?: Narrative;

  /**
   * Invoice.contained
   */
  contained?: Resource[];

  /**
   * Invoice.extension
   */
  extension?: Extension[];

  /**
   * Invoice.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Invoice.identifier
   */
  identifier?: Identifier[];

  /**
   * Invoice.status
   */
  status: string;

  /**
   * Invoice.cancelledReason
   */
  cancelledReason?: string;

  /**
   * Invoice.type
   */
  type?: CodeableConcept;

  /**
   * Invoice.subject
   */
  subject?: Reference<Patient | Group>;

  /**
   * Invoice.recipient
   */
  recipient?: Reference<Organization | Patient | RelatedPerson>;

  /**
   * Invoice.date
   */
  date?: string;

  /**
   * Invoice.participant
   */
  participant?: InvoiceParticipant[];

  /**
   * Invoice.issuer
   */
  issuer?: Reference<Organization>;

  /**
   * Invoice.account
   */
  account?: Reference<Account>;

  /**
   * Invoice.lineItem
   */
  lineItem?: InvoiceLineItem[];

  /**
   * Invoice.totalNet
   */
  totalNet?: Money;

  /**
   * Invoice.totalGross
   */
  totalGross?: Money;

  /**
   * Invoice.paymentTerms
   */
  paymentTerms?: string;

  /**
   * Invoice.note
   */
  note?: Annotation[];
}

/**
 * FHIR R4 InvoiceLineItem
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface InvoiceLineItem {

  /**
   * Invoice.lineItem.id
   */
  id?: string;

  /**
   * Invoice.lineItem.extension
   */
  extension?: Extension[];

  /**
   * Invoice.lineItem.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Invoice.lineItem.sequence
   */
  sequence?: number;

  /**
   * Invoice.lineItem.chargeItem[x]
   */
  chargeItemReference: Reference<ChargeItem>;

  /**
   * Invoice.lineItem.chargeItem[x]
   */
  chargeItemCodeableConcept: CodeableConcept;

  /**
   * Invoice.lineItem.priceComponent
   */
  priceComponent?: InvoiceLineItemPriceComponent[];
}

/**
 * FHIR R4 InvoiceLineItemPriceComponent
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface InvoiceLineItemPriceComponent {

  /**
   * Invoice.lineItem.priceComponent.id
   */
  id?: string;

  /**
   * Invoice.lineItem.priceComponent.extension
   */
  extension?: Extension[];

  /**
   * Invoice.lineItem.priceComponent.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Invoice.lineItem.priceComponent.type
   */
  type: string;

  /**
   * Invoice.lineItem.priceComponent.code
   */
  code?: CodeableConcept;

  /**
   * Invoice.lineItem.priceComponent.factor
   */
  factor?: number;

  /**
   * Invoice.lineItem.priceComponent.amount
   */
  amount?: Money;
}

/**
 * FHIR R4 InvoiceParticipant
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface InvoiceParticipant {

  /**
   * Invoice.participant.id
   */
  id?: string;

  /**
   * Invoice.participant.extension
   */
  extension?: Extension[];

  /**
   * Invoice.participant.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Invoice.participant.role
   */
  role?: CodeableConcept;

  /**
   * Invoice.participant.actor
   */
  actor: Reference<Practitioner | Organization | Patient | PractitionerRole | Device | RelatedPerson>;
}

import { Annotation } from './Annotation';
import { Attachment } from './Attachment';
import { CareTeam } from './CareTeam';
import { CodeableConcept } from './CodeableConcept';
import { Coding } from './Coding';
import { Composition } from './Composition';
import { Condition } from './Condition';
import { Device } from './Device';
import { DiagnosticReport } from './DiagnosticReport';
import { DocumentReference } from './DocumentReference';
import { Encounter } from './Encounter';
import { EpisodeOfCare } from './EpisodeOfCare';
import { Extension } from './Extension';
import { Group } from './Group';
import { Identifier } from './Identifier';
import { Location } from './Location';
import { Meta } from './Meta';
import { Money } from './Money';
import { Narrative } from './Narrative';
import { Observation } from './Observation';
import { Organization } from './Organization';
import { Patient } from './Patient';
import { Period } from './Period';
import { Practitioner } from './Practitioner';
import { PractitionerRole } from './PractitionerRole';
import { Provenance } from './Provenance';
import { Quantity } from './Quantity';
import { Questionnaire } from './Questionnaire';
import { QuestionnaireResponse } from './QuestionnaireResponse';
import { Reference } from './Reference';
import { RelatedPerson } from './RelatedPerson';
import { Resource } from './Resource';
import { Signature } from './Signature';
import { Substance } from './Substance';
import { Timing } from './Timing';

/**
 * FHIR R4 Contract
 * @see https://hl7.org/fhir/R4/contract.html
 */
export interface Contract {

  /**
   * This is a Contract resource
   */
  readonly resourceType: 'Contract';

  /**
   * Contract.id
   */
  id?: string;

  /**
   * Contract.meta
   */
  meta?: Meta;

  /**
   * Contract.implicitRules
   */
  implicitRules?: string;

  /**
   * Contract.language
   */
  language?: string;

  /**
   * Contract.text
   */
  text?: Narrative;

  /**
   * Contract.contained
   */
  contained?: Resource[];

  /**
   * Contract.extension
   */
  extension?: Extension[];

  /**
   * Contract.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Contract.identifier
   */
  identifier?: Identifier[];

  /**
   * Contract.url
   */
  url?: string;

  /**
   * Contract.version
   */
  version?: string;

  /**
   * Contract.status
   */
  status?: string;

  /**
   * Contract.legalState
   */
  legalState?: CodeableConcept;

  /**
   * Contract.instantiatesCanonical
   */
  instantiatesCanonical?: Reference<Contract>;

  /**
   * Contract.instantiatesUri
   */
  instantiatesUri?: string;

  /**
   * Contract.contentDerivative
   */
  contentDerivative?: CodeableConcept;

  /**
   * Contract.issued
   */
  issued?: string;

  /**
   * Contract.applies
   */
  applies?: Period;

  /**
   * Contract.expirationType
   */
  expirationType?: CodeableConcept;

  /**
   * Contract.subject
   */
  subject?: Reference[];

  /**
   * Contract.authority
   */
  authority?: Reference<Organization>[];

  /**
   * Contract.domain
   */
  domain?: Reference<Location>[];

  /**
   * Contract.site
   */
  site?: Reference<Location>[];

  /**
   * Contract.name
   */
  name?: string;

  /**
   * Contract.title
   */
  title?: string;

  /**
   * Contract.subtitle
   */
  subtitle?: string;

  /**
   * Contract.alias
   */
  alias?: string[];

  /**
   * Contract.author
   */
  author?: Reference<Patient | Practitioner | PractitionerRole | Organization>;

  /**
   * Contract.scope
   */
  scope?: CodeableConcept;

  /**
   * Contract.topic[x]
   */
  topicCodeableConcept?: CodeableConcept;

  /**
   * Contract.topic[x]
   */
  topicReference?: Reference;

  /**
   * Contract.type
   */
  type?: CodeableConcept;

  /**
   * Contract.subType
   */
  subType?: CodeableConcept[];

  /**
   * Contract.contentDefinition
   */
  contentDefinition?: ContractContentDefinition;

  /**
   * Contract.term
   */
  term?: ContractTerm[];

  /**
   * Contract.supportingInfo
   */
  supportingInfo?: Reference[];

  /**
   * Contract.relevantHistory
   */
  relevantHistory?: Reference<Provenance>[];

  /**
   * Contract.signer
   */
  signer?: ContractSigner[];

  /**
   * Contract.friendly
   */
  friendly?: ContractFriendly[];

  /**
   * Contract.legal
   */
  legal?: ContractLegal[];

  /**
   * Contract.rule
   */
  rule?: ContractRule[];

  /**
   * Contract.legallyBinding[x]
   */
  legallyBindingAttachment?: Attachment;

  /**
   * Contract.legallyBinding[x]
   */
  legallyBindingReference?: Reference<Composition | DocumentReference | QuestionnaireResponse | Contract>;
}

/**
 * Contract.topic[x]
 */
export type ContractTopic = CodeableConcept | Reference;
/**
 * Contract.legallyBinding[x]
 */
export type ContractLegallyBinding = Attachment | Reference<Composition | DocumentReference | QuestionnaireResponse | Contract>;

/**
 * FHIR R4 ContractContentDefinition
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ContractContentDefinition {

  /**
   * Contract.contentDefinition.id
   */
  id?: string;

  /**
   * Contract.contentDefinition.extension
   */
  extension?: Extension[];

  /**
   * Contract.contentDefinition.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Contract.contentDefinition.type
   */
  type: CodeableConcept;

  /**
   * Contract.contentDefinition.subType
   */
  subType?: CodeableConcept;

  /**
   * Contract.contentDefinition.publisher
   */
  publisher?: Reference<Practitioner | PractitionerRole | Organization>;

  /**
   * Contract.contentDefinition.publicationDate
   */
  publicationDate?: string;

  /**
   * Contract.contentDefinition.publicationStatus
   */
  publicationStatus: string;

  /**
   * Contract.contentDefinition.copyright
   */
  copyright?: string;
}

/**
 * FHIR R4 ContractFriendly
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ContractFriendly {

  /**
   * Contract.friendly.id
   */
  id?: string;

  /**
   * Contract.friendly.extension
   */
  extension?: Extension[];

  /**
   * Contract.friendly.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Contract.friendly.content[x]
   */
  contentAttachment: Attachment;

  /**
   * Contract.friendly.content[x]
   */
  contentReference: Reference<Composition | DocumentReference | QuestionnaireResponse>;
}

/**
 * FHIR R4 ContractLegal
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ContractLegal {

  /**
   * Contract.legal.id
   */
  id?: string;

  /**
   * Contract.legal.extension
   */
  extension?: Extension[];

  /**
   * Contract.legal.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Contract.legal.content[x]
   */
  contentAttachment: Attachment;

  /**
   * Contract.legal.content[x]
   */
  contentReference: Reference<Composition | DocumentReference | QuestionnaireResponse>;
}

/**
 * FHIR R4 ContractRule
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ContractRule {

  /**
   * Contract.rule.id
   */
  id?: string;

  /**
   * Contract.rule.extension
   */
  extension?: Extension[];

  /**
   * Contract.rule.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Contract.rule.content[x]
   */
  contentAttachment: Attachment;

  /**
   * Contract.rule.content[x]
   */
  contentReference: Reference<DocumentReference>;
}

/**
 * FHIR R4 ContractSigner
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ContractSigner {

  /**
   * Contract.signer.id
   */
  id?: string;

  /**
   * Contract.signer.extension
   */
  extension?: Extension[];

  /**
   * Contract.signer.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Contract.signer.type
   */
  type: Coding;

  /**
   * Contract.signer.party
   */
  party: Reference<Organization | Patient | Practitioner | PractitionerRole | RelatedPerson>;

  /**
   * Contract.signer.signature
   */
  signature: Signature[];
}

/**
 * FHIR R4 ContractTerm
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ContractTerm {

  /**
   * Contract.term.id
   */
  id?: string;

  /**
   * Contract.term.extension
   */
  extension?: Extension[];

  /**
   * Contract.term.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Contract.term.identifier
   */
  identifier?: Identifier;

  /**
   * Contract.term.issued
   */
  issued?: string;

  /**
   * Contract.term.applies
   */
  applies?: Period;

  /**
   * Contract.term.topic[x]
   */
  topicCodeableConcept?: CodeableConcept;

  /**
   * Contract.term.topic[x]
   */
  topicReference?: Reference;

  /**
   * Contract.term.type
   */
  type?: CodeableConcept;

  /**
   * Contract.term.subType
   */
  subType?: CodeableConcept;

  /**
   * Contract.term.text
   */
  text?: string;

  /**
   * Contract.term.securityLabel
   */
  securityLabel?: ContractTermSecurityLabel[];

  /**
   * Contract.term.offer
   */
  offer: ContractTermOffer;

  /**
   * Contract.term.asset
   */
  asset?: ContractTermAsset[];

  /**
   * Contract.term.action
   */
  action?: ContractTermAction[];
}

/**
 * FHIR R4 ContractTermAction
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ContractTermAction {

  /**
   * Contract.term.action.id
   */
  id?: string;

  /**
   * Contract.term.action.extension
   */
  extension?: Extension[];

  /**
   * Contract.term.action.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Contract.term.action.doNotPerform
   */
  doNotPerform?: boolean;

  /**
   * Contract.term.action.type
   */
  type: CodeableConcept;

  /**
   * Contract.term.action.subject
   */
  subject?: ContractTermActionSubject[];

  /**
   * Contract.term.action.intent
   */
  intent: CodeableConcept;

  /**
   * Contract.term.action.linkId
   */
  linkId?: string[];

  /**
   * Contract.term.action.status
   */
  status: CodeableConcept;

  /**
   * Contract.term.action.context
   */
  context?: Reference<Encounter | EpisodeOfCare>;

  /**
   * Contract.term.action.contextLinkId
   */
  contextLinkId?: string[];

  /**
   * Contract.term.action.occurrence[x]
   */
  occurrenceDateTime?: string;

  /**
   * Contract.term.action.occurrence[x]
   */
  occurrencePeriod?: Period;

  /**
   * Contract.term.action.occurrence[x]
   */
  occurrenceTiming?: Timing;

  /**
   * Contract.term.action.requester
   */
  requester?: Reference<Patient | RelatedPerson | Practitioner | PractitionerRole | Device | Group | Organization>[];

  /**
   * Contract.term.action.requesterLinkId
   */
  requesterLinkId?: string[];

  /**
   * Contract.term.action.performerType
   */
  performerType?: CodeableConcept[];

  /**
   * Contract.term.action.performerRole
   */
  performerRole?: CodeableConcept;

  /**
   * Contract.term.action.performer
   */
  performer?: Reference<RelatedPerson | Patient | Practitioner | PractitionerRole | CareTeam | Device | Substance | Organization | Location>;

  /**
   * Contract.term.action.performerLinkId
   */
  performerLinkId?: string[];

  /**
   * Contract.term.action.reasonCode
   */
  reasonCode?: CodeableConcept[];

  /**
   * Contract.term.action.reasonReference
   */
  reasonReference?: Reference<Condition | Observation | DiagnosticReport | DocumentReference | Questionnaire | QuestionnaireResponse>[];

  /**
   * Contract.term.action.reason
   */
  reason?: string[];

  /**
   * Contract.term.action.reasonLinkId
   */
  reasonLinkId?: string[];

  /**
   * Contract.term.action.note
   */
  note?: Annotation[];

  /**
   * Contract.term.action.securityLabelNumber
   */
  securityLabelNumber?: number[];
}

/**
 * FHIR R4 ContractTermActionSubject
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ContractTermActionSubject {

  /**
   * Contract.term.action.subject.id
   */
  id?: string;

  /**
   * Contract.term.action.subject.extension
   */
  extension?: Extension[];

  /**
   * Contract.term.action.subject.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Contract.term.action.subject.reference
   */
  reference: Reference<Patient | RelatedPerson | Practitioner | PractitionerRole | Device | Group | Organization>[];

  /**
   * Contract.term.action.subject.role
   */
  role?: CodeableConcept;
}

/**
 * FHIR R4 ContractTermAsset
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ContractTermAsset {

  /**
   * Contract.term.asset.id
   */
  id?: string;

  /**
   * Contract.term.asset.extension
   */
  extension?: Extension[];

  /**
   * Contract.term.asset.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Contract.term.asset.scope
   */
  scope?: CodeableConcept;

  /**
   * Contract.term.asset.type
   */
  type?: CodeableConcept[];

  /**
   * Contract.term.asset.typeReference
   */
  typeReference?: Reference[];

  /**
   * Contract.term.asset.subtype
   */
  subtype?: CodeableConcept[];

  /**
   * Contract.term.asset.relationship
   */
  relationship?: Coding;

  /**
   * Contract.term.asset.context
   */
  context?: ContractTermAssetContext[];

  /**
   * Contract.term.asset.condition
   */
  condition?: string;

  /**
   * Contract.term.asset.periodType
   */
  periodType?: CodeableConcept[];

  /**
   * Contract.term.asset.period
   */
  period?: Period[];

  /**
   * Contract.term.asset.usePeriod
   */
  usePeriod?: Period[];

  /**
   * Contract.term.asset.text
   */
  text?: string;

  /**
   * Contract.term.asset.linkId
   */
  linkId?: string[];

  /**
   * Contract.term.asset.securityLabelNumber
   */
  securityLabelNumber?: number[];

  /**
   * Contract.term.asset.valuedItem
   */
  valuedItem?: ContractTermAssetValuedItem[];
}

/**
 * FHIR R4 ContractTermAssetContext
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ContractTermAssetContext {

  /**
   * Contract.term.asset.context.id
   */
  id?: string;

  /**
   * Contract.term.asset.context.extension
   */
  extension?: Extension[];

  /**
   * Contract.term.asset.context.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Contract.term.asset.context.reference
   */
  reference?: Reference;

  /**
   * Contract.term.asset.context.code
   */
  code?: CodeableConcept[];

  /**
   * Contract.term.asset.context.text
   */
  text?: string;
}

/**
 * FHIR R4 ContractTermAssetValuedItem
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ContractTermAssetValuedItem {

  /**
   * Contract.term.asset.valuedItem.id
   */
  id?: string;

  /**
   * Contract.term.asset.valuedItem.extension
   */
  extension?: Extension[];

  /**
   * Contract.term.asset.valuedItem.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Contract.term.asset.valuedItem.entity[x]
   */
  entityCodeableConcept?: CodeableConcept;

  /**
   * Contract.term.asset.valuedItem.entity[x]
   */
  entityReference?: Reference;

  /**
   * Contract.term.asset.valuedItem.identifier
   */
  identifier?: Identifier;

  /**
   * Contract.term.asset.valuedItem.effectiveTime
   */
  effectiveTime?: string;

  /**
   * Contract.term.asset.valuedItem.quantity
   */
  quantity?: Quantity;

  /**
   * Contract.term.asset.valuedItem.unitPrice
   */
  unitPrice?: Money;

  /**
   * Contract.term.asset.valuedItem.factor
   */
  factor?: number;

  /**
   * Contract.term.asset.valuedItem.points
   */
  points?: number;

  /**
   * Contract.term.asset.valuedItem.net
   */
  net?: Money;

  /**
   * Contract.term.asset.valuedItem.payment
   */
  payment?: string;

  /**
   * Contract.term.asset.valuedItem.paymentDate
   */
  paymentDate?: string;

  /**
   * Contract.term.asset.valuedItem.responsible
   */
  responsible?: Reference<Organization | Patient | Practitioner | PractitionerRole | RelatedPerson>;

  /**
   * Contract.term.asset.valuedItem.recipient
   */
  recipient?: Reference<Organization | Patient | Practitioner | PractitionerRole | RelatedPerson>;

  /**
   * Contract.term.asset.valuedItem.linkId
   */
  linkId?: string[];

  /**
   * Contract.term.asset.valuedItem.securityLabelNumber
   */
  securityLabelNumber?: number[];
}

/**
 * FHIR R4 ContractTermOffer
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ContractTermOffer {

  /**
   * Contract.term.offer.id
   */
  id?: string;

  /**
   * Contract.term.offer.extension
   */
  extension?: Extension[];

  /**
   * Contract.term.offer.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Contract.term.offer.identifier
   */
  identifier?: Identifier[];

  /**
   * Contract.term.offer.party
   */
  party?: ContractTermOfferParty[];

  /**
   * Contract.term.offer.topic
   */
  topic?: Reference;

  /**
   * Contract.term.offer.type
   */
  type?: CodeableConcept;

  /**
   * Contract.term.offer.decision
   */
  decision?: CodeableConcept;

  /**
   * Contract.term.offer.decisionMode
   */
  decisionMode?: CodeableConcept[];

  /**
   * Contract.term.offer.answer
   */
  answer?: ContractTermOfferAnswer[];

  /**
   * Contract.term.offer.text
   */
  text?: string;

  /**
   * Contract.term.offer.linkId
   */
  linkId?: string[];

  /**
   * Contract.term.offer.securityLabelNumber
   */
  securityLabelNumber?: number[];
}

/**
 * FHIR R4 ContractTermOfferAnswer
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ContractTermOfferAnswer {

  /**
   * Contract.term.offer.answer.id
   */
  id?: string;

  /**
   * Contract.term.offer.answer.extension
   */
  extension?: Extension[];

  /**
   * Contract.term.offer.answer.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Contract.term.offer.answer.value[x]
   */
  valueBoolean: boolean;

  /**
   * Contract.term.offer.answer.value[x]
   */
  valueDecimal: number;

  /**
   * Contract.term.offer.answer.value[x]
   */
  valueInteger: number;

  /**
   * Contract.term.offer.answer.value[x]
   */
  valueDate: string;

  /**
   * Contract.term.offer.answer.value[x]
   */
  valueDateTime: string;

  /**
   * Contract.term.offer.answer.value[x]
   */
  valueTime: string;

  /**
   * Contract.term.offer.answer.value[x]
   */
  valueString: string;

  /**
   * Contract.term.offer.answer.value[x]
   */
  valueUri: string;

  /**
   * Contract.term.offer.answer.value[x]
   */
  valueAttachment: Attachment;

  /**
   * Contract.term.offer.answer.value[x]
   */
  valueCoding: Coding;

  /**
   * Contract.term.offer.answer.value[x]
   */
  valueQuantity: Quantity;

  /**
   * Contract.term.offer.answer.value[x]
   */
  valueReference: Reference;
}

/**
 * FHIR R4 ContractTermOfferParty
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ContractTermOfferParty {

  /**
   * Contract.term.offer.party.id
   */
  id?: string;

  /**
   * Contract.term.offer.party.extension
   */
  extension?: Extension[];

  /**
   * Contract.term.offer.party.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Contract.term.offer.party.reference
   */
  reference: Reference<Patient | RelatedPerson | Practitioner | PractitionerRole | Device | Group | Organization>[];

  /**
   * Contract.term.offer.party.role
   */
  role: CodeableConcept;
}

/**
 * FHIR R4 ContractTermSecurityLabel
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ContractTermSecurityLabel {

  /**
   * Contract.term.securityLabel.id
   */
  id?: string;

  /**
   * Contract.term.securityLabel.extension
   */
  extension?: Extension[];

  /**
   * Contract.term.securityLabel.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Contract.term.securityLabel.number
   */
  number?: number[];

  /**
   * Contract.term.securityLabel.classification
   */
  classification: Coding;

  /**
   * Contract.term.securityLabel.category
   */
  category?: Coding[];

  /**
   * Contract.term.securityLabel.control
   */
  control?: Coding[];
}

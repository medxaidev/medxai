import { Attachment } from './Attachment';
import { CareTeam } from './CareTeam';
import { CodeableConcept } from './CodeableConcept';
import { Coding } from './Coding';
import { Contract } from './Contract';
import { Device } from './Device';
import { DocumentReference } from './DocumentReference';
import { Extension } from './Extension';
import { Group } from './Group';
import { Identifier } from './Identifier';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { Organization } from './Organization';
import { Patient } from './Patient';
import { Period } from './Period';
import { Practitioner } from './Practitioner';
import { PractitionerRole } from './PractitionerRole';
import { QuestionnaireResponse } from './QuestionnaireResponse';
import { Reference } from './Reference';
import { RelatedPerson } from './RelatedPerson';
import { Resource } from './Resource';

/**
 * FHIR R4 Consent
 * @see https://hl7.org/fhir/R4/consent.html
 */
export interface Consent {

  /**
   * This is a Consent resource
   */
  readonly resourceType: 'Consent';

  /**
   * Consent.id
   */
  id?: string;

  /**
   * Consent.meta
   */
  meta?: Meta;

  /**
   * Consent.implicitRules
   */
  implicitRules?: string;

  /**
   * Consent.language
   */
  language?: string;

  /**
   * Consent.text
   */
  text?: Narrative;

  /**
   * Consent.contained
   */
  contained?: Resource[];

  /**
   * Consent.extension
   */
  extension?: Extension[];

  /**
   * Consent.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Consent.identifier
   */
  identifier?: Identifier[];

  /**
   * Consent.status
   */
  status: string;

  /**
   * Consent.scope
   */
  scope: CodeableConcept;

  /**
   * Consent.category
   */
  category: CodeableConcept[];

  /**
   * Consent.patient
   */
  patient?: Reference<Patient>;

  /**
   * Consent.dateTime
   */
  dateTime?: string;

  /**
   * Consent.performer
   */
  performer?: Reference<Organization | Patient | Practitioner | RelatedPerson | PractitionerRole>[];

  /**
   * Consent.organization
   */
  organization?: Reference<Organization>[];

  /**
   * Consent.source[x]
   */
  sourceAttachment?: Attachment;

  /**
   * Consent.source[x]
   */
  sourceReference?: Reference<Consent | DocumentReference | Contract | QuestionnaireResponse>;

  /**
   * Consent.policy
   */
  policy?: ConsentPolicy[];

  /**
   * Consent.policyRule
   */
  policyRule?: CodeableConcept;

  /**
   * Consent.verification
   */
  verification?: ConsentVerification[];

  /**
   * Consent.provision
   */
  provision?: ConsentProvision;
}

/**
 * Consent.source[x]
 */
export type ConsentSource = Attachment | Reference<Consent | DocumentReference | Contract | QuestionnaireResponse>;

/**
 * FHIR R4 ConsentPolicy
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ConsentPolicy {

  /**
   * Consent.policy.id
   */
  id?: string;

  /**
   * Consent.policy.extension
   */
  extension?: Extension[];

  /**
   * Consent.policy.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Consent.policy.authority
   */
  authority?: string;

  /**
   * Consent.policy.uri
   */
  uri?: string;
}

/**
 * FHIR R4 ConsentProvision
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ConsentProvision {

  /**
   * Consent.provision.id
   */
  id?: string;

  /**
   * Consent.provision.extension
   */
  extension?: Extension[];

  /**
   * Consent.provision.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Consent.provision.type
   */
  type?: string;

  /**
   * Consent.provision.period
   */
  period?: Period;

  /**
   * Consent.provision.actor
   */
  actor?: ConsentProvisionActor[];

  /**
   * Consent.provision.action
   */
  action?: CodeableConcept[];

  /**
   * Consent.provision.securityLabel
   */
  securityLabel?: Coding[];

  /**
   * Consent.provision.purpose
   */
  purpose?: Coding[];

  /**
   * Consent.provision.class
   */
  class?: Coding[];

  /**
   * Consent.provision.code
   */
  code?: CodeableConcept[];

  /**
   * Consent.provision.dataPeriod
   */
  dataPeriod?: Period;

  /**
   * Consent.provision.data
   */
  data?: ConsentProvisionData[];
}

/**
 * FHIR R4 ConsentProvisionActor
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ConsentProvisionActor {

  /**
   * Consent.provision.actor.id
   */
  id?: string;

  /**
   * Consent.provision.actor.extension
   */
  extension?: Extension[];

  /**
   * Consent.provision.actor.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Consent.provision.actor.role
   */
  role: CodeableConcept;

  /**
   * Consent.provision.actor.reference
   */
  reference: Reference<Device | Group | CareTeam | Organization | Patient | Practitioner | RelatedPerson | PractitionerRole>;
}

/**
 * FHIR R4 ConsentProvisionData
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ConsentProvisionData {

  /**
   * Consent.provision.data.id
   */
  id?: string;

  /**
   * Consent.provision.data.extension
   */
  extension?: Extension[];

  /**
   * Consent.provision.data.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Consent.provision.data.meaning
   */
  meaning: string;

  /**
   * Consent.provision.data.reference
   */
  reference: Reference;
}

/**
 * FHIR R4 ConsentVerification
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ConsentVerification {

  /**
   * Consent.verification.id
   */
  id?: string;

  /**
   * Consent.verification.extension
   */
  extension?: Extension[];

  /**
   * Consent.verification.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Consent.verification.verified
   */
  verified: boolean;

  /**
   * Consent.verification.verifiedWith
   */
  verifiedWith?: Reference<Patient | RelatedPerson>;

  /**
   * Consent.verification.verificationDate
   */
  verificationDate?: string;
}

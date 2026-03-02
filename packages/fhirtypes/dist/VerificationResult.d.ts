import { CodeableConcept } from './CodeableConcept';
import { Extension } from './Extension';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { Organization } from './Organization';
import { Practitioner } from './Practitioner';
import { PractitionerRole } from './PractitionerRole';
import { Reference } from './Reference';
import { Resource } from './Resource';
import { Signature } from './Signature';
import { Timing } from './Timing';

/**
 * FHIR R4 VerificationResult
 * @see https://hl7.org/fhir/R4/verificationresult.html
 */
export interface VerificationResult {

  /**
   * This is a VerificationResult resource
   */
  readonly resourceType: 'VerificationResult';

  /**
   * VerificationResult.id
   */
  id?: string;

  /**
   * VerificationResult.meta
   */
  meta?: Meta;

  /**
   * VerificationResult.implicitRules
   */
  implicitRules?: string;

  /**
   * VerificationResult.language
   */
  language?: string;

  /**
   * VerificationResult.text
   */
  text?: Narrative;

  /**
   * VerificationResult.contained
   */
  contained?: Resource[];

  /**
   * VerificationResult.extension
   */
  extension?: Extension[];

  /**
   * VerificationResult.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * VerificationResult.target
   */
  target?: Reference[];

  /**
   * VerificationResult.targetLocation
   */
  targetLocation?: string[];

  /**
   * VerificationResult.need
   */
  need?: CodeableConcept;

  /**
   * VerificationResult.status
   */
  status: string;

  /**
   * VerificationResult.statusDate
   */
  statusDate?: string;

  /**
   * VerificationResult.validationType
   */
  validationType?: CodeableConcept;

  /**
   * VerificationResult.validationProcess
   */
  validationProcess?: CodeableConcept[];

  /**
   * VerificationResult.frequency
   */
  frequency?: Timing;

  /**
   * VerificationResult.lastPerformed
   */
  lastPerformed?: string;

  /**
   * VerificationResult.nextScheduled
   */
  nextScheduled?: string;

  /**
   * VerificationResult.failureAction
   */
  failureAction?: CodeableConcept;

  /**
   * VerificationResult.primarySource
   */
  primarySource?: VerificationResultPrimarySource[];

  /**
   * VerificationResult.attestation
   */
  attestation?: VerificationResultAttestation;

  /**
   * VerificationResult.validator
   */
  validator?: VerificationResultValidator[];
}

/**
 * FHIR R4 VerificationResultAttestation
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface VerificationResultAttestation {

  /**
   * VerificationResult.attestation.id
   */
  id?: string;

  /**
   * VerificationResult.attestation.extension
   */
  extension?: Extension[];

  /**
   * VerificationResult.attestation.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * VerificationResult.attestation.who
   */
  who?: Reference<Practitioner | PractitionerRole | Organization>;

  /**
   * VerificationResult.attestation.onBehalfOf
   */
  onBehalfOf?: Reference<Organization | Practitioner | PractitionerRole>;

  /**
   * VerificationResult.attestation.communicationMethod
   */
  communicationMethod?: CodeableConcept;

  /**
   * VerificationResult.attestation.date
   */
  date?: string;

  /**
   * VerificationResult.attestation.sourceIdentityCertificate
   */
  sourceIdentityCertificate?: string;

  /**
   * VerificationResult.attestation.proxyIdentityCertificate
   */
  proxyIdentityCertificate?: string;

  /**
   * VerificationResult.attestation.proxySignature
   */
  proxySignature?: Signature;

  /**
   * VerificationResult.attestation.sourceSignature
   */
  sourceSignature?: Signature;
}

/**
 * FHIR R4 VerificationResultPrimarySource
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface VerificationResultPrimarySource {

  /**
   * VerificationResult.primarySource.id
   */
  id?: string;

  /**
   * VerificationResult.primarySource.extension
   */
  extension?: Extension[];

  /**
   * VerificationResult.primarySource.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * VerificationResult.primarySource.who
   */
  who?: Reference<Organization | Practitioner | PractitionerRole>;

  /**
   * VerificationResult.primarySource.type
   */
  type?: CodeableConcept[];

  /**
   * VerificationResult.primarySource.communicationMethod
   */
  communicationMethod?: CodeableConcept[];

  /**
   * VerificationResult.primarySource.validationStatus
   */
  validationStatus?: CodeableConcept;

  /**
   * VerificationResult.primarySource.validationDate
   */
  validationDate?: string;

  /**
   * VerificationResult.primarySource.canPushUpdates
   */
  canPushUpdates?: CodeableConcept;

  /**
   * VerificationResult.primarySource.pushTypeAvailable
   */
  pushTypeAvailable?: CodeableConcept[];
}

/**
 * FHIR R4 VerificationResultValidator
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface VerificationResultValidator {

  /**
   * VerificationResult.validator.id
   */
  id?: string;

  /**
   * VerificationResult.validator.extension
   */
  extension?: Extension[];

  /**
   * VerificationResult.validator.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * VerificationResult.validator.organization
   */
  organization: Reference<Organization>;

  /**
   * VerificationResult.validator.identityCertificate
   */
  identityCertificate?: string;

  /**
   * VerificationResult.validator.attestationSignature
   */
  attestationSignature?: Signature;
}

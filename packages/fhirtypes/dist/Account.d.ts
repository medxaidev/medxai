import { CodeableConcept } from './CodeableConcept';
import { Coverage } from './Coverage';
import { Device } from './Device';
import { Extension } from './Extension';
import { HealthcareService } from './HealthcareService';
import { Identifier } from './Identifier';
import { Location } from './Location';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { Organization } from './Organization';
import { Patient } from './Patient';
import { Period } from './Period';
import { Practitioner } from './Practitioner';
import { PractitionerRole } from './PractitionerRole';
import { Reference } from './Reference';
import { RelatedPerson } from './RelatedPerson';
import { Resource } from './Resource';

/**
 * FHIR R4 Account
 * @see https://hl7.org/fhir/R4/account.html
 */
export interface Account {

  /**
   * This is a Account resource
   */
  readonly resourceType: 'Account';

  /**
   * Account.id
   */
  id?: string;

  /**
   * Account.meta
   */
  meta?: Meta;

  /**
   * Account.implicitRules
   */
  implicitRules?: string;

  /**
   * Account.language
   */
  language?: string;

  /**
   * Account.text
   */
  text?: Narrative;

  /**
   * Account.contained
   */
  contained?: Resource[];

  /**
   * Account.extension
   */
  extension?: Extension[];

  /**
   * Account.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Account.identifier
   */
  identifier?: Identifier[];

  /**
   * Account.status
   */
  status: string;

  /**
   * Account.type
   */
  type?: CodeableConcept;

  /**
   * Account.name
   */
  name?: string;

  /**
   * Account.subject
   */
  subject?: Reference<Patient | Device | Practitioner | PractitionerRole | Location | HealthcareService | Organization>[];

  /**
   * Account.servicePeriod
   */
  servicePeriod?: Period;

  /**
   * Account.coverage
   */
  coverage?: AccountCoverage[];

  /**
   * Account.owner
   */
  owner?: Reference<Organization>;

  /**
   * Account.description
   */
  description?: string;

  /**
   * Account.guarantor
   */
  guarantor?: AccountGuarantor[];

  /**
   * Account.partOf
   */
  partOf?: Reference<Account>;
}

/**
 * FHIR R4 AccountCoverage
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface AccountCoverage {

  /**
   * Account.coverage.id
   */
  id?: string;

  /**
   * Account.coverage.extension
   */
  extension?: Extension[];

  /**
   * Account.coverage.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Account.coverage.coverage
   */
  coverage: Reference<Coverage>;

  /**
   * Account.coverage.priority
   */
  priority?: number;
}

/**
 * FHIR R4 AccountGuarantor
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface AccountGuarantor {

  /**
   * Account.guarantor.id
   */
  id?: string;

  /**
   * Account.guarantor.extension
   */
  extension?: Extension[];

  /**
   * Account.guarantor.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Account.guarantor.party
   */
  party: Reference<Patient | RelatedPerson | Organization>;

  /**
   * Account.guarantor.onHold
   */
  onHold?: boolean;

  /**
   * Account.guarantor.period
   */
  period?: Period;
}

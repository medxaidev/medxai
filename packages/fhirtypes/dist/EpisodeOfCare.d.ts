import { Account } from './Account';
import { CareTeam } from './CareTeam';
import { CodeableConcept } from './CodeableConcept';
import { Condition } from './Condition';
import { Extension } from './Extension';
import { Identifier } from './Identifier';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { Organization } from './Organization';
import { Patient } from './Patient';
import { Period } from './Period';
import { Practitioner } from './Practitioner';
import { PractitionerRole } from './PractitionerRole';
import { Reference } from './Reference';
import { Resource } from './Resource';
import { ServiceRequest } from './ServiceRequest';

/**
 * FHIR R4 EpisodeOfCare
 * @see https://hl7.org/fhir/R4/episodeofcare.html
 */
export interface EpisodeOfCare {

  /**
   * This is a EpisodeOfCare resource
   */
  readonly resourceType: 'EpisodeOfCare';

  /**
   * EpisodeOfCare.id
   */
  id?: string;

  /**
   * EpisodeOfCare.meta
   */
  meta?: Meta;

  /**
   * EpisodeOfCare.implicitRules
   */
  implicitRules?: string;

  /**
   * EpisodeOfCare.language
   */
  language?: string;

  /**
   * EpisodeOfCare.text
   */
  text?: Narrative;

  /**
   * EpisodeOfCare.contained
   */
  contained?: Resource[];

  /**
   * EpisodeOfCare.extension
   */
  extension?: Extension[];

  /**
   * EpisodeOfCare.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * EpisodeOfCare.identifier
   */
  identifier?: Identifier[];

  /**
   * EpisodeOfCare.status
   */
  status: 'planned' | 'waitlist' | 'active' | 'onhold' | 'finished' | 'cancelled' | 'entered-in-error';

  /**
   * EpisodeOfCare.statusHistory
   */
  statusHistory?: EpisodeOfCareStatusHistory[];

  /**
   * EpisodeOfCare.type
   */
  type?: CodeableConcept[];

  /**
   * EpisodeOfCare.diagnosis
   */
  diagnosis?: EpisodeOfCareDiagnosis[];

  /**
   * EpisodeOfCare.patient
   */
  patient: Reference<Patient>;

  /**
   * EpisodeOfCare.managingOrganization
   */
  managingOrganization?: Reference<Organization>;

  /**
   * EpisodeOfCare.period
   */
  period?: Period;

  /**
   * EpisodeOfCare.referralRequest
   */
  referralRequest?: Reference<ServiceRequest>[];

  /**
   * EpisodeOfCare.careManager
   */
  careManager?: Reference<Practitioner | PractitionerRole>;

  /**
   * EpisodeOfCare.team
   */
  team?: Reference<CareTeam>[];

  /**
   * EpisodeOfCare.account
   */
  account?: Reference<Account>[];
}

/**
 * FHIR R4 EpisodeOfCareDiagnosis
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface EpisodeOfCareDiagnosis {

  /**
   * EpisodeOfCare.diagnosis.id
   */
  id?: string;

  /**
   * EpisodeOfCare.diagnosis.extension
   */
  extension?: Extension[];

  /**
   * EpisodeOfCare.diagnosis.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * EpisodeOfCare.diagnosis.condition
   */
  condition: Reference<Condition>;

  /**
   * EpisodeOfCare.diagnosis.role
   */
  role?: CodeableConcept;

  /**
   * EpisodeOfCare.diagnosis.rank
   */
  rank?: number;
}

/**
 * FHIR R4 EpisodeOfCareStatusHistory
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface EpisodeOfCareStatusHistory {

  /**
   * EpisodeOfCare.statusHistory.id
   */
  id?: string;

  /**
   * EpisodeOfCare.statusHistory.extension
   */
  extension?: Extension[];

  /**
   * EpisodeOfCare.statusHistory.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * EpisodeOfCare.statusHistory.status
   */
  status: 'planned' | 'waitlist' | 'active' | 'onhold' | 'finished' | 'cancelled' | 'entered-in-error';

  /**
   * EpisodeOfCare.statusHistory.period
   */
  period: Period;
}

import { Annotation } from './Annotation';
import { CodeableConcept } from './CodeableConcept';
import { Condition } from './Condition';
import { ContactPoint } from './ContactPoint';
import { Encounter } from './Encounter';
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
import { Reference } from './Reference';
import { RelatedPerson } from './RelatedPerson';
import { Resource } from './Resource';

/**
 * FHIR R4 CareTeam
 * @see https://hl7.org/fhir/R4/careteam.html
 */
export interface CareTeam {

  /**
   * This is a CareTeam resource
   */
  readonly resourceType: 'CareTeam';

  /**
   * CareTeam.id
   */
  id?: string;

  /**
   * CareTeam.meta
   */
  meta?: Meta;

  /**
   * CareTeam.implicitRules
   */
  implicitRules?: string;

  /**
   * CareTeam.language
   */
  language?: string;

  /**
   * CareTeam.text
   */
  text?: Narrative;

  /**
   * CareTeam.contained
   */
  contained?: Resource[];

  /**
   * CareTeam.extension
   */
  extension?: Extension[];

  /**
   * CareTeam.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * CareTeam.identifier
   */
  identifier?: Identifier[];

  /**
   * CareTeam.status
   */
  status?: string;

  /**
   * CareTeam.category
   */
  category?: CodeableConcept[];

  /**
   * CareTeam.name
   */
  name?: string;

  /**
   * CareTeam.subject
   */
  subject?: Reference<Patient | Group>;

  /**
   * CareTeam.encounter
   */
  encounter?: Reference<Encounter>;

  /**
   * CareTeam.period
   */
  period?: Period;

  /**
   * CareTeam.participant
   */
  participant?: CareTeamParticipant[];

  /**
   * CareTeam.reasonCode
   */
  reasonCode?: CodeableConcept[];

  /**
   * CareTeam.reasonReference
   */
  reasonReference?: Reference<Condition>[];

  /**
   * CareTeam.managingOrganization
   */
  managingOrganization?: Reference<Organization>[];

  /**
   * CareTeam.telecom
   */
  telecom?: ContactPoint[];

  /**
   * CareTeam.note
   */
  note?: Annotation[];
}

/**
 * FHIR R4 CareTeamParticipant
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface CareTeamParticipant {

  /**
   * CareTeam.participant.id
   */
  id?: string;

  /**
   * CareTeam.participant.extension
   */
  extension?: Extension[];

  /**
   * CareTeam.participant.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * CareTeam.participant.role
   */
  role?: CodeableConcept[];

  /**
   * CareTeam.participant.member
   */
  member?: Reference<Practitioner | PractitionerRole | RelatedPerson | Patient | Organization | CareTeam>;

  /**
   * CareTeam.participant.onBehalfOf
   */
  onBehalfOf?: Reference<Organization>;

  /**
   * CareTeam.participant.period
   */
  period?: Period;
}

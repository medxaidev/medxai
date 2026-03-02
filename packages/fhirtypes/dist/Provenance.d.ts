import { CodeableConcept } from './CodeableConcept';
import { Device } from './Device';
import { Extension } from './Extension';
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
import { Signature } from './Signature';

/**
 * FHIR R4 Provenance
 * @see https://hl7.org/fhir/R4/provenance.html
 */
export interface Provenance {

  /**
   * This is a Provenance resource
   */
  readonly resourceType: 'Provenance';

  /**
   * Provenance.id
   */
  id?: string;

  /**
   * Provenance.meta
   */
  meta?: Meta;

  /**
   * Provenance.implicitRules
   */
  implicitRules?: string;

  /**
   * Provenance.language
   */
  language?: string;

  /**
   * Provenance.text
   */
  text?: Narrative;

  /**
   * Provenance.contained
   */
  contained?: Resource[];

  /**
   * Provenance.extension
   */
  extension?: Extension[];

  /**
   * Provenance.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Provenance.target
   */
  target: Reference[];

  /**
   * Provenance.occurred[x]
   */
  occurredPeriod?: Period;

  /**
   * Provenance.occurred[x]
   */
  occurredDateTime?: string;

  /**
   * Provenance.recorded
   */
  recorded: string;

  /**
   * Provenance.policy
   */
  policy?: string[];

  /**
   * Provenance.location
   */
  location?: Reference<Location>;

  /**
   * Provenance.reason
   */
  reason?: CodeableConcept[];

  /**
   * Provenance.activity
   */
  activity?: CodeableConcept;

  /**
   * Provenance.agent
   */
  agent: ProvenanceAgent[];

  /**
   * Provenance.entity
   */
  entity?: ProvenanceEntity[];

  /**
   * Provenance.signature
   */
  signature?: Signature[];
}

/**
 * Provenance.occurred[x]
 */
export type ProvenanceOccurred = Period | string;

/**
 * FHIR R4 ProvenanceAgent
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ProvenanceAgent {

  /**
   * Provenance.agent.id
   */
  id?: string;

  /**
   * Provenance.agent.extension
   */
  extension?: Extension[];

  /**
   * Provenance.agent.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Provenance.agent.type
   */
  type?: CodeableConcept;

  /**
   * Provenance.agent.role
   */
  role?: CodeableConcept[];

  /**
   * Provenance.agent.who
   */
  who: Reference<Practitioner | PractitionerRole | RelatedPerson | Patient | Device | Organization>;

  /**
   * Provenance.agent.onBehalfOf
   */
  onBehalfOf?: Reference<Practitioner | PractitionerRole | RelatedPerson | Patient | Device | Organization>;
}

/**
 * FHIR R4 ProvenanceEntity
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ProvenanceEntity {

  /**
   * Provenance.entity.id
   */
  id?: string;

  /**
   * Provenance.entity.extension
   */
  extension?: Extension[];

  /**
   * Provenance.entity.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Provenance.entity.role
   */
  role: string;

  /**
   * Provenance.entity.what
   */
  what: Reference;
}

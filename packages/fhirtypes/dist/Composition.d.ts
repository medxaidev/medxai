import { CodeableConcept } from './CodeableConcept';
import { Device } from './Device';
import { Encounter } from './Encounter';
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
import { RelatedPerson } from './RelatedPerson';
import { Resource } from './Resource';

/**
 * FHIR R4 Composition
 * @see https://hl7.org/fhir/R4/composition.html
 */
export interface Composition {

  /**
   * This is a Composition resource
   */
  readonly resourceType: 'Composition';

  /**
   * Composition.id
   */
  id?: string;

  /**
   * Composition.meta
   */
  meta?: Meta;

  /**
   * Composition.implicitRules
   */
  implicitRules?: string;

  /**
   * Composition.language
   */
  language?: string;

  /**
   * Composition.text
   */
  text?: Narrative;

  /**
   * Composition.contained
   */
  contained?: Resource[];

  /**
   * Composition.extension
   */
  extension?: Extension[];

  /**
   * Composition.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Composition.identifier
   */
  identifier?: Identifier;

  /**
   * Composition.status
   */
  status: 'preliminary' | 'final' | 'amended' | 'entered-in-error';

  /**
   * Composition.type
   */
  type: CodeableConcept;

  /**
   * Composition.category
   */
  category?: CodeableConcept[];

  /**
   * Composition.subject
   */
  subject?: Reference;

  /**
   * Composition.encounter
   */
  encounter?: Reference<Encounter>;

  /**
   * Composition.date
   */
  date: string;

  /**
   * Composition.author
   */
  author: Reference<Practitioner | PractitionerRole | Device | Patient | RelatedPerson | Organization>[];

  /**
   * Composition.title
   */
  title: string;

  /**
   * Composition.confidentiality
   */
  confidentiality?: string;

  /**
   * Composition.attester
   */
  attester?: CompositionAttester[];

  /**
   * Composition.custodian
   */
  custodian?: Reference<Organization>;

  /**
   * Composition.relatesTo
   */
  relatesTo?: CompositionRelatesTo[];

  /**
   * Composition.event
   */
  event?: CompositionEvent[];

  /**
   * Composition.section
   */
  section?: CompositionSection[];
}

/**
 * FHIR R4 CompositionAttester
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface CompositionAttester {

  /**
   * Composition.attester.id
   */
  id?: string;

  /**
   * Composition.attester.extension
   */
  extension?: Extension[];

  /**
   * Composition.attester.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Composition.attester.mode
   */
  mode: string;

  /**
   * Composition.attester.time
   */
  time?: string;

  /**
   * Composition.attester.party
   */
  party?: Reference<Patient | RelatedPerson | Practitioner | PractitionerRole | Organization>;
}

/**
 * FHIR R4 CompositionEvent
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface CompositionEvent {

  /**
   * Composition.event.id
   */
  id?: string;

  /**
   * Composition.event.extension
   */
  extension?: Extension[];

  /**
   * Composition.event.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Composition.event.code
   */
  code?: CodeableConcept[];

  /**
   * Composition.event.period
   */
  period?: Period;

  /**
   * Composition.event.detail
   */
  detail?: Reference[];
}

/**
 * FHIR R4 CompositionRelatesTo
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface CompositionRelatesTo {

  /**
   * Composition.relatesTo.id
   */
  id?: string;

  /**
   * Composition.relatesTo.extension
   */
  extension?: Extension[];

  /**
   * Composition.relatesTo.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Composition.relatesTo.code
   */
  code: string;

  /**
   * Composition.relatesTo.target[x]
   */
  targetIdentifier: Identifier;

  /**
   * Composition.relatesTo.target[x]
   */
  targetReference: Reference<Composition>;
}

/**
 * FHIR R4 CompositionSection
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface CompositionSection {

  /**
   * Composition.section.id
   */
  id?: string;

  /**
   * Composition.section.extension
   */
  extension?: Extension[];

  /**
   * Composition.section.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Composition.section.title
   */
  title?: string;

  /**
   * Composition.section.code
   */
  code?: CodeableConcept;

  /**
   * Composition.section.author
   */
  author?: Reference<Practitioner | PractitionerRole | Device | Patient | RelatedPerson | Organization>[];

  /**
   * Composition.section.focus
   */
  focus?: Reference;

  /**
   * Composition.section.text
   */
  text?: Narrative;

  /**
   * Composition.section.mode
   */
  mode?: string;

  /**
   * Composition.section.orderedBy
   */
  orderedBy?: CodeableConcept;

  /**
   * Composition.section.entry
   */
  entry?: Reference[];

  /**
   * Composition.section.emptyReason
   */
  emptyReason?: CodeableConcept;
}

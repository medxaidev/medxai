import { Annotation } from './Annotation';
import { CodeableConcept } from './CodeableConcept';
import { Device } from './Device';
import { Encounter } from './Encounter';
import { Extension } from './Extension';
import { Group } from './Group';
import { Identifier } from './Identifier';
import { Location } from './Location';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { Patient } from './Patient';
import { Practitioner } from './Practitioner';
import { PractitionerRole } from './PractitionerRole';
import { Reference } from './Reference';
import { Resource } from './Resource';

/**
 * FHIR R4 List
 * @see https://hl7.org/fhir/R4/list.html
 */
export interface List {

  /**
   * This is a List resource
   */
  readonly resourceType: 'List';

  /**
   * List.id
   */
  id?: string;

  /**
   * List.meta
   */
  meta?: Meta;

  /**
   * List.implicitRules
   */
  implicitRules?: string;

  /**
   * List.language
   */
  language?: string;

  /**
   * List.text
   */
  text?: Narrative;

  /**
   * List.contained
   */
  contained?: Resource[];

  /**
   * List.extension
   */
  extension?: Extension[];

  /**
   * List.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * List.identifier
   */
  identifier?: Identifier[];

  /**
   * List.status
   */
  status: string;

  /**
   * List.mode
   */
  mode: string;

  /**
   * List.title
   */
  title?: string;

  /**
   * List.code
   */
  code?: CodeableConcept;

  /**
   * List.subject
   */
  subject?: Reference<Patient | Group | Device | Location>;

  /**
   * List.encounter
   */
  encounter?: Reference<Encounter>;

  /**
   * List.date
   */
  date?: string;

  /**
   * List.source
   */
  source?: Reference<Practitioner | PractitionerRole | Patient | Device>;

  /**
   * List.orderedBy
   */
  orderedBy?: CodeableConcept;

  /**
   * List.note
   */
  note?: Annotation[];

  /**
   * List.entry
   */
  entry?: ListEntry[];

  /**
   * List.emptyReason
   */
  emptyReason?: CodeableConcept;
}

/**
 * FHIR R4 ListEntry
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ListEntry {

  /**
   * List.entry.id
   */
  id?: string;

  /**
   * List.entry.extension
   */
  extension?: Extension[];

  /**
   * List.entry.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * List.entry.flag
   */
  flag?: CodeableConcept;

  /**
   * List.entry.deleted
   */
  deleted?: boolean;

  /**
   * List.entry.date
   */
  date?: string;

  /**
   * List.entry.item
   */
  item: Reference;
}

import { Age } from './Age';
import { Annotation } from './Annotation';
import { CodeableConcept } from './CodeableConcept';
import { Encounter } from './Encounter';
import { Extension } from './Extension';
import { Identifier } from './Identifier';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { Patient } from './Patient';
import { Period } from './Period';
import { Practitioner } from './Practitioner';
import { PractitionerRole } from './PractitionerRole';
import { Range } from './Range';
import { Reference } from './Reference';
import { RelatedPerson } from './RelatedPerson';
import { Resource } from './Resource';

/**
 * FHIR R4 AllergyIntolerance
 * @see https://hl7.org/fhir/R4/allergyintolerance.html
 */
export interface AllergyIntolerance {

  /**
   * This is a AllergyIntolerance resource
   */
  readonly resourceType: 'AllergyIntolerance';

  /**
   * AllergyIntolerance.id
   */
  id?: string;

  /**
   * AllergyIntolerance.meta
   */
  meta?: Meta;

  /**
   * AllergyIntolerance.implicitRules
   */
  implicitRules?: string;

  /**
   * AllergyIntolerance.language
   */
  language?: string;

  /**
   * AllergyIntolerance.text
   */
  text?: Narrative;

  /**
   * AllergyIntolerance.contained
   */
  contained?: Resource[];

  /**
   * AllergyIntolerance.extension
   */
  extension?: Extension[];

  /**
   * AllergyIntolerance.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * AllergyIntolerance.identifier
   */
  identifier?: Identifier[];

  /**
   * AllergyIntolerance.clinicalStatus
   */
  clinicalStatus?: CodeableConcept;

  /**
   * AllergyIntolerance.verificationStatus
   */
  verificationStatus?: CodeableConcept;

  /**
   * AllergyIntolerance.type
   */
  type?: string;

  /**
   * AllergyIntolerance.category
   */
  category?: string[];

  /**
   * AllergyIntolerance.criticality
   */
  criticality?: string;

  /**
   * AllergyIntolerance.code
   */
  code?: CodeableConcept;

  /**
   * AllergyIntolerance.patient
   */
  patient: Reference<Patient>;

  /**
   * AllergyIntolerance.encounter
   */
  encounter?: Reference<Encounter>;

  /**
   * AllergyIntolerance.onset[x]
   */
  onsetDateTime?: string;

  /**
   * AllergyIntolerance.onset[x]
   */
  onsetAge?: Age;

  /**
   * AllergyIntolerance.onset[x]
   */
  onsetPeriod?: Period;

  /**
   * AllergyIntolerance.onset[x]
   */
  onsetRange?: Range;

  /**
   * AllergyIntolerance.onset[x]
   */
  onsetString?: string;

  /**
   * AllergyIntolerance.recordedDate
   */
  recordedDate?: string;

  /**
   * AllergyIntolerance.recorder
   */
  recorder?: Reference<Practitioner | PractitionerRole | Patient | RelatedPerson>;

  /**
   * AllergyIntolerance.asserter
   */
  asserter?: Reference<Patient | RelatedPerson | Practitioner | PractitionerRole>;

  /**
   * AllergyIntolerance.lastOccurrence
   */
  lastOccurrence?: string;

  /**
   * AllergyIntolerance.note
   */
  note?: Annotation[];

  /**
   * AllergyIntolerance.reaction
   */
  reaction?: AllergyIntoleranceReaction[];
}

/**
 * AllergyIntolerance.onset[x]
 */
export type AllergyIntoleranceOnset = string | Age | Period | Range;

/**
 * FHIR R4 AllergyIntoleranceReaction
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface AllergyIntoleranceReaction {

  /**
   * AllergyIntolerance.reaction.id
   */
  id?: string;

  /**
   * AllergyIntolerance.reaction.extension
   */
  extension?: Extension[];

  /**
   * AllergyIntolerance.reaction.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * AllergyIntolerance.reaction.substance
   */
  substance?: CodeableConcept;

  /**
   * AllergyIntolerance.reaction.manifestation
   */
  manifestation: CodeableConcept[];

  /**
   * AllergyIntolerance.reaction.description
   */
  description?: string;

  /**
   * AllergyIntolerance.reaction.onset
   */
  onset?: string;

  /**
   * AllergyIntolerance.reaction.severity
   */
  severity?: string;

  /**
   * AllergyIntolerance.reaction.exposureRoute
   */
  exposureRoute?: CodeableConcept;

  /**
   * AllergyIntolerance.reaction.note
   */
  note?: Annotation[];
}

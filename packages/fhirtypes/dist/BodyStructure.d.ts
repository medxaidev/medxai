import { Attachment } from './Attachment';
import { CodeableConcept } from './CodeableConcept';
import { Extension } from './Extension';
import { Identifier } from './Identifier';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { Patient } from './Patient';
import { Reference } from './Reference';
import { Resource } from './Resource';

/**
 * FHIR R4 BodyStructure
 * @see https://hl7.org/fhir/R4/bodystructure.html
 */
export interface BodyStructure {

  /**
   * This is a BodyStructure resource
   */
  readonly resourceType: 'BodyStructure';

  /**
   * BodyStructure.id
   */
  id?: string;

  /**
   * BodyStructure.meta
   */
  meta?: Meta;

  /**
   * BodyStructure.implicitRules
   */
  implicitRules?: string;

  /**
   * BodyStructure.language
   */
  language?: string;

  /**
   * BodyStructure.text
   */
  text?: Narrative;

  /**
   * BodyStructure.contained
   */
  contained?: Resource[];

  /**
   * BodyStructure.extension
   */
  extension?: Extension[];

  /**
   * BodyStructure.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * BodyStructure.identifier
   */
  identifier?: Identifier[];

  /**
   * BodyStructure.active
   */
  active?: boolean;

  /**
   * BodyStructure.morphology
   */
  morphology?: CodeableConcept;

  /**
   * BodyStructure.location
   */
  location?: CodeableConcept;

  /**
   * BodyStructure.locationQualifier
   */
  locationQualifier?: CodeableConcept[];

  /**
   * BodyStructure.description
   */
  description?: string;

  /**
   * BodyStructure.image
   */
  image?: Attachment[];

  /**
   * BodyStructure.patient
   */
  patient: Reference<Patient>;
}

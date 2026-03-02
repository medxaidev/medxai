import { Extension } from './Extension';
import { Organization } from './Organization';
import { Patient } from './Patient';
import { Practitioner } from './Practitioner';
import { Reference } from './Reference';
import { RelatedPerson } from './RelatedPerson';

/**
 * FHIR R4 Annotation
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface Annotation {

  /**
   * Annotation.id
   */
  id?: string;

  /**
   * Annotation.extension
   */
  extension?: Extension[];

  /**
   * Annotation.author[x]
   */
  authorReference?: Reference<Practitioner | Patient | RelatedPerson | Organization>;

  /**
   * Annotation.author[x]
   */
  authorString?: string;

  /**
   * Annotation.time
   */
  time?: string;

  /**
   * Annotation.text
   */
  text: string;
}

/**
 * Annotation.author[x]
 */
export type AnnotationAuthor = Reference<Practitioner | Patient | RelatedPerson | Organization> | string;

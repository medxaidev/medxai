import { CodeableConcept } from './CodeableConcept';
import { Extension } from './Extension';
import { Identifier } from './Identifier';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { Organization } from './Organization';
import { Patient } from './Patient';
import { Practitioner } from './Practitioner';
import { PractitionerRole } from './PractitionerRole';
import { Reference } from './Reference';
import { RelatedPerson } from './RelatedPerson';
import { Resource } from './Resource';

/**
 * FHIR R4 Basic
 * @see https://hl7.org/fhir/R4/basic.html
 */
export interface Basic {

  /**
   * This is a Basic resource
   */
  readonly resourceType: 'Basic';

  /**
   * Basic.id
   */
  id?: string;

  /**
   * Basic.meta
   */
  meta?: Meta;

  /**
   * Basic.implicitRules
   */
  implicitRules?: string;

  /**
   * Basic.language
   */
  language?: string;

  /**
   * Basic.text
   */
  text?: Narrative;

  /**
   * Basic.contained
   */
  contained?: Resource[];

  /**
   * Basic.extension
   */
  extension?: Extension[];

  /**
   * Basic.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Basic.identifier
   */
  identifier?: Identifier[];

  /**
   * Basic.code
   */
  code: CodeableConcept;

  /**
   * Basic.subject
   */
  subject?: Reference;

  /**
   * Basic.created
   */
  created?: string;

  /**
   * Basic.author
   */
  author?: Reference<Practitioner | PractitionerRole | Patient | RelatedPerson | Organization>;
}

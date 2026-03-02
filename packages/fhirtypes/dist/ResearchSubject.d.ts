import { Consent } from './Consent';
import { Extension } from './Extension';
import { Identifier } from './Identifier';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { Patient } from './Patient';
import { Period } from './Period';
import { Reference } from './Reference';
import { ResearchStudy } from './ResearchStudy';
import { Resource } from './Resource';

/**
 * FHIR R4 ResearchSubject
 * @see https://hl7.org/fhir/R4/researchsubject.html
 */
export interface ResearchSubject {

  /**
   * This is a ResearchSubject resource
   */
  readonly resourceType: 'ResearchSubject';

  /**
   * ResearchSubject.id
   */
  id?: string;

  /**
   * ResearchSubject.meta
   */
  meta?: Meta;

  /**
   * ResearchSubject.implicitRules
   */
  implicitRules?: string;

  /**
   * ResearchSubject.language
   */
  language?: string;

  /**
   * ResearchSubject.text
   */
  text?: Narrative;

  /**
   * ResearchSubject.contained
   */
  contained?: Resource[];

  /**
   * ResearchSubject.extension
   */
  extension?: Extension[];

  /**
   * ResearchSubject.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * ResearchSubject.identifier
   */
  identifier?: Identifier[];

  /**
   * ResearchSubject.status
   */
  status: string;

  /**
   * ResearchSubject.period
   */
  period?: Period;

  /**
   * ResearchSubject.study
   */
  study: Reference<ResearchStudy>;

  /**
   * ResearchSubject.individual
   */
  individual: Reference<Patient>;

  /**
   * ResearchSubject.assignedArm
   */
  assignedArm?: string;

  /**
   * ResearchSubject.actualArm
   */
  actualArm?: string;

  /**
   * ResearchSubject.consent
   */
  consent?: Reference<Consent>;
}

import { CodeableConcept } from './CodeableConcept';
import { Device } from './Device';
import { Encounter } from './Encounter';
import { Extension } from './Extension';
import { Group } from './Group';
import { Identifier } from './Identifier';
import { Location } from './Location';
import { Medication } from './Medication';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { Organization } from './Organization';
import { Patient } from './Patient';
import { Period } from './Period';
import { PlanDefinition } from './PlanDefinition';
import { Practitioner } from './Practitioner';
import { PractitionerRole } from './PractitionerRole';
import { Procedure } from './Procedure';
import { Reference } from './Reference';
import { Resource } from './Resource';

/**
 * FHIR R4 Flag
 * @see https://hl7.org/fhir/R4/flag.html
 */
export interface Flag {

  /**
   * This is a Flag resource
   */
  readonly resourceType: 'Flag';

  /**
   * Flag.id
   */
  id?: string;

  /**
   * Flag.meta
   */
  meta?: Meta;

  /**
   * Flag.implicitRules
   */
  implicitRules?: string;

  /**
   * Flag.language
   */
  language?: string;

  /**
   * Flag.text
   */
  text?: Narrative;

  /**
   * Flag.contained
   */
  contained?: Resource[];

  /**
   * Flag.extension
   */
  extension?: Extension[];

  /**
   * Flag.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Flag.identifier
   */
  identifier?: Identifier[];

  /**
   * Flag.status
   */
  status: string;

  /**
   * Flag.category
   */
  category?: CodeableConcept[];

  /**
   * Flag.code
   */
  code: CodeableConcept;

  /**
   * Flag.subject
   */
  subject: Reference<Patient | Location | Group | Organization | Practitioner | PlanDefinition | Medication | Procedure>;

  /**
   * Flag.period
   */
  period?: Period;

  /**
   * Flag.encounter
   */
  encounter?: Reference<Encounter>;

  /**
   * Flag.author
   */
  author?: Reference<Device | Organization | Patient | Practitioner | PractitionerRole>;
}

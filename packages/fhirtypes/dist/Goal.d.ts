import { Annotation } from './Annotation';
import { CodeableConcept } from './CodeableConcept';
import { Condition } from './Condition';
import { Duration } from './Duration';
import { Extension } from './Extension';
import { Group } from './Group';
import { Identifier } from './Identifier';
import { MedicationStatement } from './MedicationStatement';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { NutritionOrder } from './NutritionOrder';
import { Observation } from './Observation';
import { Organization } from './Organization';
import { Patient } from './Patient';
import { Practitioner } from './Practitioner';
import { PractitionerRole } from './PractitionerRole';
import { Quantity } from './Quantity';
import { Range } from './Range';
import { Ratio } from './Ratio';
import { Reference } from './Reference';
import { RelatedPerson } from './RelatedPerson';
import { Resource } from './Resource';
import { RiskAssessment } from './RiskAssessment';
import { ServiceRequest } from './ServiceRequest';

/**
 * FHIR R4 Goal
 * @see https://hl7.org/fhir/R4/goal.html
 */
export interface Goal {

  /**
   * This is a Goal resource
   */
  readonly resourceType: 'Goal';

  /**
   * Goal.id
   */
  id?: string;

  /**
   * Goal.meta
   */
  meta?: Meta;

  /**
   * Goal.implicitRules
   */
  implicitRules?: string;

  /**
   * Goal.language
   */
  language?: string;

  /**
   * Goal.text
   */
  text?: Narrative;

  /**
   * Goal.contained
   */
  contained?: Resource[];

  /**
   * Goal.extension
   */
  extension?: Extension[];

  /**
   * Goal.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Goal.identifier
   */
  identifier?: Identifier[];

  /**
   * Goal.lifecycleStatus
   */
  lifecycleStatus: string;

  /**
   * Goal.achievementStatus
   */
  achievementStatus?: CodeableConcept;

  /**
   * Goal.category
   */
  category?: CodeableConcept[];

  /**
   * Goal.priority
   */
  priority?: CodeableConcept;

  /**
   * Goal.description
   */
  description: CodeableConcept;

  /**
   * Goal.subject
   */
  subject: Reference<Patient | Group | Organization>;

  /**
   * Goal.start[x]
   */
  startDate?: string;

  /**
   * Goal.start[x]
   */
  startCodeableConcept?: CodeableConcept;

  /**
   * Goal.target
   */
  target?: GoalTarget[];

  /**
   * Goal.statusDate
   */
  statusDate?: string;

  /**
   * Goal.statusReason
   */
  statusReason?: string;

  /**
   * Goal.expressedBy
   */
  expressedBy?: Reference<Patient | Practitioner | PractitionerRole | RelatedPerson>;

  /**
   * Goal.addresses
   */
  addresses?: Reference<Condition | Observation | MedicationStatement | NutritionOrder | ServiceRequest | RiskAssessment>[];

  /**
   * Goal.note
   */
  note?: Annotation[];

  /**
   * Goal.outcomeCode
   */
  outcomeCode?: CodeableConcept[];

  /**
   * Goal.outcomeReference
   */
  outcomeReference?: Reference<Observation>[];
}

/**
 * Goal.start[x]
 */
export type GoalStart = string | CodeableConcept;

/**
 * FHIR R4 GoalTarget
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface GoalTarget {

  /**
   * Goal.target.id
   */
  id?: string;

  /**
   * Goal.target.extension
   */
  extension?: Extension[];

  /**
   * Goal.target.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Goal.target.measure
   */
  measure?: CodeableConcept;

  /**
   * Goal.target.detail[x]
   */
  detailQuantity?: Quantity;

  /**
   * Goal.target.detail[x]
   */
  detailRange?: Range;

  /**
   * Goal.target.detail[x]
   */
  detailCodeableConcept?: CodeableConcept;

  /**
   * Goal.target.detail[x]
   */
  detailString?: string;

  /**
   * Goal.target.detail[x]
   */
  detailBoolean?: boolean;

  /**
   * Goal.target.detail[x]
   */
  detailInteger?: number;

  /**
   * Goal.target.detail[x]
   */
  detailRatio?: Ratio;

  /**
   * Goal.target.due[x]
   */
  dueDate?: string;

  /**
   * Goal.target.due[x]
   */
  dueDuration?: Duration;
}

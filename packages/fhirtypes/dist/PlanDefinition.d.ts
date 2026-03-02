import { Age } from './Age';
import { CodeableConcept } from './CodeableConcept';
import { ContactDetail } from './ContactDetail';
import { DataRequirement } from './DataRequirement';
import { Duration } from './Duration';
import { Expression } from './Expression';
import { Extension } from './Extension';
import { Group } from './Group';
import { Identifier } from './Identifier';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { Period } from './Period';
import { Quantity } from './Quantity';
import { Range } from './Range';
import { Reference } from './Reference';
import { RelatedArtifact } from './RelatedArtifact';
import { Resource } from './Resource';
import { Timing } from './Timing';
import { TriggerDefinition } from './TriggerDefinition';
import { UsageContext } from './UsageContext';

/**
 * FHIR R4 PlanDefinition
 * @see https://hl7.org/fhir/R4/plandefinition.html
 */
export interface PlanDefinition {

  /**
   * This is a PlanDefinition resource
   */
  readonly resourceType: 'PlanDefinition';

  /**
   * PlanDefinition.id
   */
  id?: string;

  /**
   * PlanDefinition.meta
   */
  meta?: Meta;

  /**
   * PlanDefinition.implicitRules
   */
  implicitRules?: string;

  /**
   * PlanDefinition.language
   */
  language?: string;

  /**
   * PlanDefinition.text
   */
  text?: Narrative;

  /**
   * PlanDefinition.contained
   */
  contained?: Resource[];

  /**
   * PlanDefinition.extension
   */
  extension?: Extension[];

  /**
   * PlanDefinition.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * PlanDefinition.url
   */
  url?: string;

  /**
   * PlanDefinition.identifier
   */
  identifier?: Identifier[];

  /**
   * PlanDefinition.version
   */
  version?: string;

  /**
   * PlanDefinition.name
   */
  name?: string;

  /**
   * PlanDefinition.title
   */
  title?: string;

  /**
   * PlanDefinition.subtitle
   */
  subtitle?: string;

  /**
   * PlanDefinition.type
   */
  type?: CodeableConcept;

  /**
   * PlanDefinition.status
   */
  status: 'draft' | 'active' | 'retired' | 'unknown';

  /**
   * PlanDefinition.experimental
   */
  experimental?: boolean;

  /**
   * PlanDefinition.subject[x]
   */
  subjectCodeableConcept?: CodeableConcept;

  /**
   * PlanDefinition.subject[x]
   */
  subjectReference?: Reference<Group>;

  /**
   * PlanDefinition.date
   */
  date?: string;

  /**
   * PlanDefinition.publisher
   */
  publisher?: string;

  /**
   * PlanDefinition.contact
   */
  contact?: ContactDetail[];

  /**
   * PlanDefinition.description
   */
  description?: string;

  /**
   * PlanDefinition.useContext
   */
  useContext?: UsageContext[];

  /**
   * PlanDefinition.jurisdiction
   */
  jurisdiction?: CodeableConcept[];

  /**
   * PlanDefinition.purpose
   */
  purpose?: string;

  /**
   * PlanDefinition.usage
   */
  usage?: string;

  /**
   * PlanDefinition.copyright
   */
  copyright?: string;

  /**
   * PlanDefinition.approvalDate
   */
  approvalDate?: string;

  /**
   * PlanDefinition.lastReviewDate
   */
  lastReviewDate?: string;

  /**
   * PlanDefinition.effectivePeriod
   */
  effectivePeriod?: Period;

  /**
   * PlanDefinition.topic
   */
  topic?: CodeableConcept[];

  /**
   * PlanDefinition.author
   */
  author?: ContactDetail[];

  /**
   * PlanDefinition.editor
   */
  editor?: ContactDetail[];

  /**
   * PlanDefinition.reviewer
   */
  reviewer?: ContactDetail[];

  /**
   * PlanDefinition.endorser
   */
  endorser?: ContactDetail[];

  /**
   * PlanDefinition.relatedArtifact
   */
  relatedArtifact?: RelatedArtifact[];

  /**
   * PlanDefinition.library
   */
  library?: string[];

  /**
   * PlanDefinition.goal
   */
  goal?: PlanDefinitionGoal[];

  /**
   * PlanDefinition.action
   */
  action?: PlanDefinitionAction[];
}

/**
 * PlanDefinition.subject[x]
 */
export type PlanDefinitionSubject = CodeableConcept | Reference<Group>;

/**
 * FHIR R4 PlanDefinitionAction
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface PlanDefinitionAction {

  /**
   * PlanDefinition.action.id
   */
  id?: string;

  /**
   * PlanDefinition.action.extension
   */
  extension?: Extension[];

  /**
   * PlanDefinition.action.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * PlanDefinition.action.prefix
   */
  prefix?: string;

  /**
   * PlanDefinition.action.title
   */
  title?: string;

  /**
   * PlanDefinition.action.description
   */
  description?: string;

  /**
   * PlanDefinition.action.textEquivalent
   */
  textEquivalent?: string;

  /**
   * PlanDefinition.action.priority
   */
  priority?: 'routine' | 'urgent' | 'asap' | 'stat';

  /**
   * PlanDefinition.action.code
   */
  code?: CodeableConcept[];

  /**
   * PlanDefinition.action.reason
   */
  reason?: CodeableConcept[];

  /**
   * PlanDefinition.action.documentation
   */
  documentation?: RelatedArtifact[];

  /**
   * PlanDefinition.action.goalId
   */
  goalId?: string[];

  /**
   * PlanDefinition.action.subject[x]
   */
  subjectCodeableConcept?: CodeableConcept;

  /**
   * PlanDefinition.action.subject[x]
   */
  subjectReference?: Reference<Group>;

  /**
   * PlanDefinition.action.trigger
   */
  trigger?: TriggerDefinition[];

  /**
   * PlanDefinition.action.condition
   */
  condition?: PlanDefinitionActionCondition[];

  /**
   * PlanDefinition.action.input
   */
  input?: DataRequirement[];

  /**
   * PlanDefinition.action.output
   */
  output?: DataRequirement[];

  /**
   * PlanDefinition.action.relatedAction
   */
  relatedAction?: PlanDefinitionActionRelatedAction[];

  /**
   * PlanDefinition.action.timing[x]
   */
  timingDateTime?: string;

  /**
   * PlanDefinition.action.timing[x]
   */
  timingAge?: Age;

  /**
   * PlanDefinition.action.timing[x]
   */
  timingPeriod?: Period;

  /**
   * PlanDefinition.action.timing[x]
   */
  timingDuration?: Duration;

  /**
   * PlanDefinition.action.timing[x]
   */
  timingRange?: Range;

  /**
   * PlanDefinition.action.timing[x]
   */
  timingTiming?: Timing;

  /**
   * PlanDefinition.action.participant
   */
  participant?: PlanDefinitionActionParticipant[];

  /**
   * PlanDefinition.action.type
   */
  type?: CodeableConcept;

  /**
   * PlanDefinition.action.groupingBehavior
   */
  groupingBehavior?: string;

  /**
   * PlanDefinition.action.selectionBehavior
   */
  selectionBehavior?: string;

  /**
   * PlanDefinition.action.requiredBehavior
   */
  requiredBehavior?: string;

  /**
   * PlanDefinition.action.precheckBehavior
   */
  precheckBehavior?: string;

  /**
   * PlanDefinition.action.cardinalityBehavior
   */
  cardinalityBehavior?: string;

  /**
   * PlanDefinition.action.definition[x]
   */
  definitionCanonical?: string;

  /**
   * PlanDefinition.action.definition[x]
   */
  definitionUri?: string;

  /**
   * PlanDefinition.action.transform
   */
  transform?: string;

  /**
   * PlanDefinition.action.dynamicValue
   */
  dynamicValue?: PlanDefinitionActionDynamicValue[];
}

/**
 * FHIR R4 PlanDefinitionActionCondition
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface PlanDefinitionActionCondition {

  /**
   * PlanDefinition.action.condition.id
   */
  id?: string;

  /**
   * PlanDefinition.action.condition.extension
   */
  extension?: Extension[];

  /**
   * PlanDefinition.action.condition.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * PlanDefinition.action.condition.kind
   */
  kind: string;

  /**
   * PlanDefinition.action.condition.expression
   */
  expression?: Expression;
}

/**
 * FHIR R4 PlanDefinitionActionDynamicValue
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface PlanDefinitionActionDynamicValue {

  /**
   * PlanDefinition.action.dynamicValue.id
   */
  id?: string;

  /**
   * PlanDefinition.action.dynamicValue.extension
   */
  extension?: Extension[];

  /**
   * PlanDefinition.action.dynamicValue.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * PlanDefinition.action.dynamicValue.path
   */
  path?: string;

  /**
   * PlanDefinition.action.dynamicValue.expression
   */
  expression?: Expression;
}

/**
 * FHIR R4 PlanDefinitionActionParticipant
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface PlanDefinitionActionParticipant {

  /**
   * PlanDefinition.action.participant.id
   */
  id?: string;

  /**
   * PlanDefinition.action.participant.extension
   */
  extension?: Extension[];

  /**
   * PlanDefinition.action.participant.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * PlanDefinition.action.participant.type
   */
  type: string;

  /**
   * PlanDefinition.action.participant.role
   */
  role?: CodeableConcept;
}

/**
 * FHIR R4 PlanDefinitionActionRelatedAction
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface PlanDefinitionActionRelatedAction {

  /**
   * PlanDefinition.action.relatedAction.id
   */
  id?: string;

  /**
   * PlanDefinition.action.relatedAction.extension
   */
  extension?: Extension[];

  /**
   * PlanDefinition.action.relatedAction.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * PlanDefinition.action.relatedAction.actionId
   */
  actionId: string;

  /**
   * PlanDefinition.action.relatedAction.relationship
   */
  relationship: string;

  /**
   * PlanDefinition.action.relatedAction.offset[x]
   */
  offsetDuration?: Duration;

  /**
   * PlanDefinition.action.relatedAction.offset[x]
   */
  offsetRange?: Range;
}

/**
 * FHIR R4 PlanDefinitionGoal
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface PlanDefinitionGoal {

  /**
   * PlanDefinition.goal.id
   */
  id?: string;

  /**
   * PlanDefinition.goal.extension
   */
  extension?: Extension[];

  /**
   * PlanDefinition.goal.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * PlanDefinition.goal.category
   */
  category?: CodeableConcept;

  /**
   * PlanDefinition.goal.description
   */
  description: CodeableConcept;

  /**
   * PlanDefinition.goal.priority
   */
  priority?: CodeableConcept;

  /**
   * PlanDefinition.goal.start
   */
  start?: CodeableConcept;

  /**
   * PlanDefinition.goal.addresses
   */
  addresses?: CodeableConcept[];

  /**
   * PlanDefinition.goal.documentation
   */
  documentation?: RelatedArtifact[];

  /**
   * PlanDefinition.goal.target
   */
  target?: PlanDefinitionGoalTarget[];
}

/**
 * FHIR R4 PlanDefinitionGoalTarget
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface PlanDefinitionGoalTarget {

  /**
   * PlanDefinition.goal.target.id
   */
  id?: string;

  /**
   * PlanDefinition.goal.target.extension
   */
  extension?: Extension[];

  /**
   * PlanDefinition.goal.target.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * PlanDefinition.goal.target.measure
   */
  measure?: CodeableConcept;

  /**
   * PlanDefinition.goal.target.detail[x]
   */
  detailQuantity?: Quantity;

  /**
   * PlanDefinition.goal.target.detail[x]
   */
  detailRange?: Range;

  /**
   * PlanDefinition.goal.target.detail[x]
   */
  detailCodeableConcept?: CodeableConcept;

  /**
   * PlanDefinition.goal.target.due
   */
  due?: Duration;
}

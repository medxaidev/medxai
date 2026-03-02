import { Age } from './Age';
import { Annotation } from './Annotation';
import { CodeableConcept } from './CodeableConcept';
import { Condition } from './Condition';
import { Device } from './Device';
import { DiagnosticReport } from './DiagnosticReport';
import { DocumentReference } from './DocumentReference';
import { Duration } from './Duration';
import { Encounter } from './Encounter';
import { Expression } from './Expression';
import { Extension } from './Extension';
import { Group } from './Group';
import { Identifier } from './Identifier';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { Observation } from './Observation';
import { Patient } from './Patient';
import { Period } from './Period';
import { Practitioner } from './Practitioner';
import { PractitionerRole } from './PractitionerRole';
import { Range } from './Range';
import { Reference } from './Reference';
import { RelatedArtifact } from './RelatedArtifact';
import { RelatedPerson } from './RelatedPerson';
import { Resource } from './Resource';
import { Timing } from './Timing';

/**
 * FHIR R4 RequestGroup
 * @see https://hl7.org/fhir/R4/requestgroup.html
 */
export interface RequestGroup {

  /**
   * This is a RequestGroup resource
   */
  readonly resourceType: 'RequestGroup';

  /**
   * RequestGroup.id
   */
  id?: string;

  /**
   * RequestGroup.meta
   */
  meta?: Meta;

  /**
   * RequestGroup.implicitRules
   */
  implicitRules?: string;

  /**
   * RequestGroup.language
   */
  language?: string;

  /**
   * RequestGroup.text
   */
  text?: Narrative;

  /**
   * RequestGroup.contained
   */
  contained?: Resource[];

  /**
   * RequestGroup.extension
   */
  extension?: Extension[];

  /**
   * RequestGroup.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * RequestGroup.identifier
   */
  identifier?: Identifier[];

  /**
   * RequestGroup.instantiatesCanonical
   */
  instantiatesCanonical?: string[];

  /**
   * RequestGroup.instantiatesUri
   */
  instantiatesUri?: string[];

  /**
   * RequestGroup.basedOn
   */
  basedOn?: Reference[];

  /**
   * RequestGroup.replaces
   */
  replaces?: Reference[];

  /**
   * RequestGroup.groupIdentifier
   */
  groupIdentifier?: Identifier;

  /**
   * RequestGroup.status
   */
  status: 'draft' | 'active' | 'on-hold' | 'revoked' | 'completed' | 'entered-in-error' | 'unknown';

  /**
   * RequestGroup.intent
   */
  intent: 'proposal' | 'plan' | 'directive' | 'order' | 'original-order' | 'reflex-order' | 'filler-order' | 'instance-order' | 'option';

  /**
   * RequestGroup.priority
   */
  priority?: 'routine' | 'urgent' | 'asap' | 'stat';

  /**
   * RequestGroup.code
   */
  code?: CodeableConcept;

  /**
   * RequestGroup.subject
   */
  subject?: Reference<Patient | Group>;

  /**
   * RequestGroup.encounter
   */
  encounter?: Reference<Encounter>;

  /**
   * RequestGroup.authoredOn
   */
  authoredOn?: string;

  /**
   * RequestGroup.author
   */
  author?: Reference<Device | Practitioner | PractitionerRole>;

  /**
   * RequestGroup.reasonCode
   */
  reasonCode?: CodeableConcept[];

  /**
   * RequestGroup.reasonReference
   */
  reasonReference?: Reference<Condition | Observation | DiagnosticReport | DocumentReference>[];

  /**
   * RequestGroup.note
   */
  note?: Annotation[];

  /**
   * RequestGroup.action
   */
  action?: RequestGroupAction[];
}

/**
 * FHIR R4 RequestGroupAction
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface RequestGroupAction {

  /**
   * RequestGroup.action.id
   */
  id?: string;

  /**
   * RequestGroup.action.extension
   */
  extension?: Extension[];

  /**
   * RequestGroup.action.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * RequestGroup.action.prefix
   */
  prefix?: string;

  /**
   * RequestGroup.action.title
   */
  title?: string;

  /**
   * RequestGroup.action.description
   */
  description?: string;

  /**
   * RequestGroup.action.textEquivalent
   */
  textEquivalent?: string;

  /**
   * RequestGroup.action.priority
   */
  priority?: 'routine' | 'urgent' | 'asap' | 'stat';

  /**
   * RequestGroup.action.code
   */
  code?: CodeableConcept[];

  /**
   * RequestGroup.action.documentation
   */
  documentation?: RelatedArtifact[];

  /**
   * RequestGroup.action.condition
   */
  condition?: RequestGroupActionCondition[];

  /**
   * RequestGroup.action.relatedAction
   */
  relatedAction?: RequestGroupActionRelatedAction[];

  /**
   * RequestGroup.action.timing[x]
   */
  timingDateTime?: string;

  /**
   * RequestGroup.action.timing[x]
   */
  timingAge?: Age;

  /**
   * RequestGroup.action.timing[x]
   */
  timingPeriod?: Period;

  /**
   * RequestGroup.action.timing[x]
   */
  timingDuration?: Duration;

  /**
   * RequestGroup.action.timing[x]
   */
  timingRange?: Range;

  /**
   * RequestGroup.action.timing[x]
   */
  timingTiming?: Timing;

  /**
   * RequestGroup.action.participant
   */
  participant?: Reference<Patient | Practitioner | PractitionerRole | RelatedPerson | Device>[];

  /**
   * RequestGroup.action.type
   */
  type?: CodeableConcept;

  /**
   * RequestGroup.action.groupingBehavior
   */
  groupingBehavior?: string;

  /**
   * RequestGroup.action.selectionBehavior
   */
  selectionBehavior?: string;

  /**
   * RequestGroup.action.requiredBehavior
   */
  requiredBehavior?: string;

  /**
   * RequestGroup.action.precheckBehavior
   */
  precheckBehavior?: string;

  /**
   * RequestGroup.action.cardinalityBehavior
   */
  cardinalityBehavior?: string;

  /**
   * RequestGroup.action.resource
   */
  resource?: Reference;
}

/**
 * FHIR R4 RequestGroupActionCondition
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface RequestGroupActionCondition {

  /**
   * RequestGroup.action.condition.id
   */
  id?: string;

  /**
   * RequestGroup.action.condition.extension
   */
  extension?: Extension[];

  /**
   * RequestGroup.action.condition.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * RequestGroup.action.condition.kind
   */
  kind: string;

  /**
   * RequestGroup.action.condition.expression
   */
  expression?: Expression;
}

/**
 * FHIR R4 RequestGroupActionRelatedAction
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface RequestGroupActionRelatedAction {

  /**
   * RequestGroup.action.relatedAction.id
   */
  id?: string;

  /**
   * RequestGroup.action.relatedAction.extension
   */
  extension?: Extension[];

  /**
   * RequestGroup.action.relatedAction.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * RequestGroup.action.relatedAction.actionId
   */
  actionId: string;

  /**
   * RequestGroup.action.relatedAction.relationship
   */
  relationship: string;

  /**
   * RequestGroup.action.relatedAction.offset[x]
   */
  offsetDuration?: Duration;

  /**
   * RequestGroup.action.relatedAction.offset[x]
   */
  offsetRange?: Range;
}

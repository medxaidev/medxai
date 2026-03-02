import { CodeableConcept } from './CodeableConcept';
import { ContactDetail } from './ContactDetail';
import { Extension } from './Extension';
import { Identifier } from './Identifier';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { Resource } from './Resource';
import { UsageContext } from './UsageContext';

/**
 * FHIR R4 ExampleScenario
 * @see https://hl7.org/fhir/R4/examplescenario.html
 */
export interface ExampleScenario {

  /**
   * This is a ExampleScenario resource
   */
  readonly resourceType: 'ExampleScenario';

  /**
   * ExampleScenario.id
   */
  id?: string;

  /**
   * ExampleScenario.meta
   */
  meta?: Meta;

  /**
   * ExampleScenario.implicitRules
   */
  implicitRules?: string;

  /**
   * ExampleScenario.language
   */
  language?: string;

  /**
   * ExampleScenario.text
   */
  text?: Narrative;

  /**
   * ExampleScenario.contained
   */
  contained?: Resource[];

  /**
   * ExampleScenario.extension
   */
  extension?: Extension[];

  /**
   * ExampleScenario.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * ExampleScenario.url
   */
  url?: string;

  /**
   * ExampleScenario.identifier
   */
  identifier?: Identifier[];

  /**
   * ExampleScenario.version
   */
  version?: string;

  /**
   * ExampleScenario.name
   */
  name?: string;

  /**
   * ExampleScenario.status
   */
  status: 'draft' | 'active' | 'retired' | 'unknown';

  /**
   * ExampleScenario.experimental
   */
  experimental?: boolean;

  /**
   * ExampleScenario.date
   */
  date?: string;

  /**
   * ExampleScenario.publisher
   */
  publisher?: string;

  /**
   * ExampleScenario.contact
   */
  contact?: ContactDetail[];

  /**
   * ExampleScenario.useContext
   */
  useContext?: UsageContext[];

  /**
   * ExampleScenario.jurisdiction
   */
  jurisdiction?: CodeableConcept[];

  /**
   * ExampleScenario.copyright
   */
  copyright?: string;

  /**
   * ExampleScenario.purpose
   */
  purpose?: string;

  /**
   * ExampleScenario.actor
   */
  actor?: ExampleScenarioActor[];

  /**
   * ExampleScenario.instance
   */
  instance?: ExampleScenarioInstance[];

  /**
   * ExampleScenario.process
   */
  process?: ExampleScenarioProcess[];

  /**
   * ExampleScenario.workflow
   */
  workflow?: string[];
}

/**
 * FHIR R4 ExampleScenarioActor
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ExampleScenarioActor {

  /**
   * ExampleScenario.actor.id
   */
  id?: string;

  /**
   * ExampleScenario.actor.extension
   */
  extension?: Extension[];

  /**
   * ExampleScenario.actor.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * ExampleScenario.actor.actorId
   */
  actorId: string;

  /**
   * ExampleScenario.actor.type
   */
  type: string;

  /**
   * ExampleScenario.actor.name
   */
  name?: string;

  /**
   * ExampleScenario.actor.description
   */
  description?: string;
}

/**
 * FHIR R4 ExampleScenarioInstance
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ExampleScenarioInstance {

  /**
   * ExampleScenario.instance.id
   */
  id?: string;

  /**
   * ExampleScenario.instance.extension
   */
  extension?: Extension[];

  /**
   * ExampleScenario.instance.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * ExampleScenario.instance.resourceId
   */
  resourceId: string;

  /**
   * ExampleScenario.instance.resourceType
   */
  resourceType: string;

  /**
   * ExampleScenario.instance.name
   */
  name?: string;

  /**
   * ExampleScenario.instance.description
   */
  description?: string;

  /**
   * ExampleScenario.instance.version
   */
  version?: ExampleScenarioInstanceVersion[];

  /**
   * ExampleScenario.instance.containedInstance
   */
  containedInstance?: ExampleScenarioInstanceContainedInstance[];
}

/**
 * FHIR R4 ExampleScenarioInstanceContainedInstance
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ExampleScenarioInstanceContainedInstance {

  /**
   * ExampleScenario.instance.containedInstance.id
   */
  id?: string;

  /**
   * ExampleScenario.instance.containedInstance.extension
   */
  extension?: Extension[];

  /**
   * ExampleScenario.instance.containedInstance.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * ExampleScenario.instance.containedInstance.resourceId
   */
  resourceId: string;

  /**
   * ExampleScenario.instance.containedInstance.versionId
   */
  versionId?: string;
}

/**
 * FHIR R4 ExampleScenarioInstanceVersion
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ExampleScenarioInstanceVersion {

  /**
   * ExampleScenario.instance.version.id
   */
  id?: string;

  /**
   * ExampleScenario.instance.version.extension
   */
  extension?: Extension[];

  /**
   * ExampleScenario.instance.version.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * ExampleScenario.instance.version.versionId
   */
  versionId: string;

  /**
   * ExampleScenario.instance.version.description
   */
  description: string;
}

/**
 * FHIR R4 ExampleScenarioProcess
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ExampleScenarioProcess {

  /**
   * ExampleScenario.process.id
   */
  id?: string;

  /**
   * ExampleScenario.process.extension
   */
  extension?: Extension[];

  /**
   * ExampleScenario.process.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * ExampleScenario.process.title
   */
  title: string;

  /**
   * ExampleScenario.process.description
   */
  description?: string;

  /**
   * ExampleScenario.process.preConditions
   */
  preConditions?: string;

  /**
   * ExampleScenario.process.postConditions
   */
  postConditions?: string;

  /**
   * ExampleScenario.process.step
   */
  step?: ExampleScenarioProcessStep[];
}

/**
 * FHIR R4 ExampleScenarioProcessStep
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ExampleScenarioProcessStep {

  /**
   * ExampleScenario.process.step.id
   */
  id?: string;

  /**
   * ExampleScenario.process.step.extension
   */
  extension?: Extension[];

  /**
   * ExampleScenario.process.step.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * ExampleScenario.process.step.pause
   */
  pause?: boolean;

  /**
   * ExampleScenario.process.step.operation
   */
  operation?: ExampleScenarioProcessStepOperation;

  /**
   * ExampleScenario.process.step.alternative
   */
  alternative?: ExampleScenarioProcessStepAlternative[];
}

/**
 * FHIR R4 ExampleScenarioProcessStepAlternative
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ExampleScenarioProcessStepAlternative {

  /**
   * ExampleScenario.process.step.alternative.id
   */
  id?: string;

  /**
   * ExampleScenario.process.step.alternative.extension
   */
  extension?: Extension[];

  /**
   * ExampleScenario.process.step.alternative.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * ExampleScenario.process.step.alternative.title
   */
  title: string;

  /**
   * ExampleScenario.process.step.alternative.description
   */
  description?: string;
}

/**
 * FHIR R4 ExampleScenarioProcessStepOperation
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ExampleScenarioProcessStepOperation {

  /**
   * ExampleScenario.process.step.operation.id
   */
  id?: string;

  /**
   * ExampleScenario.process.step.operation.extension
   */
  extension?: Extension[];

  /**
   * ExampleScenario.process.step.operation.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * ExampleScenario.process.step.operation.number
   */
  number: string;

  /**
   * ExampleScenario.process.step.operation.type
   */
  type?: string;

  /**
   * ExampleScenario.process.step.operation.name
   */
  name?: string;

  /**
   * ExampleScenario.process.step.operation.initiator
   */
  initiator?: string;

  /**
   * ExampleScenario.process.step.operation.receiver
   */
  receiver?: string;

  /**
   * ExampleScenario.process.step.operation.description
   */
  description?: string;

  /**
   * ExampleScenario.process.step.operation.initiatorActive
   */
  initiatorActive?: boolean;

  /**
   * ExampleScenario.process.step.operation.receiverActive
   */
  receiverActive?: boolean;
}

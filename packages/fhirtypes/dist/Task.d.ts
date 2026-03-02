import { Address } from './Address';
import { Age } from './Age';
import { Annotation } from './Annotation';
import { Attachment } from './Attachment';
import { CareTeam } from './CareTeam';
import { ClaimResponse } from './ClaimResponse';
import { CodeableConcept } from './CodeableConcept';
import { Coding } from './Coding';
import { ContactDetail } from './ContactDetail';
import { ContactPoint } from './ContactPoint';
import { Contributor } from './Contributor';
import { Count } from './Count';
import { Coverage } from './Coverage';
import { DataRequirement } from './DataRequirement';
import { Device } from './Device';
import { Distance } from './Distance';
import { Dosage } from './Dosage';
import { Duration } from './Duration';
import { Encounter } from './Encounter';
import { Expression } from './Expression';
import { Extension } from './Extension';
import { Group } from './Group';
import { HealthcareService } from './HealthcareService';
import { HumanName } from './HumanName';
import { Identifier } from './Identifier';
import { Location } from './Location';
import { Meta } from './Meta';
import { Money } from './Money';
import { Narrative } from './Narrative';
import { Organization } from './Organization';
import { ParameterDefinition } from './ParameterDefinition';
import { Patient } from './Patient';
import { Period } from './Period';
import { Practitioner } from './Practitioner';
import { PractitionerRole } from './PractitionerRole';
import { Provenance } from './Provenance';
import { Quantity } from './Quantity';
import { Range } from './Range';
import { Ratio } from './Ratio';
import { Reference } from './Reference';
import { RelatedArtifact } from './RelatedArtifact';
import { RelatedPerson } from './RelatedPerson';
import { Resource } from './Resource';
import { SampledData } from './SampledData';
import { Signature } from './Signature';
import { Timing } from './Timing';
import { TriggerDefinition } from './TriggerDefinition';
import { UsageContext } from './UsageContext';

/**
 * FHIR R4 Task
 * @see https://hl7.org/fhir/R4/task.html
 */
export interface Task {

  /**
   * This is a Task resource
   */
  readonly resourceType: 'Task';

  /**
   * Task.id
   */
  id?: string;

  /**
   * Task.meta
   */
  meta?: Meta;

  /**
   * Task.implicitRules
   */
  implicitRules?: string;

  /**
   * Task.language
   */
  language?: string;

  /**
   * Task.text
   */
  text?: Narrative;

  /**
   * Task.contained
   */
  contained?: Resource[];

  /**
   * Task.extension
   */
  extension?: Extension[];

  /**
   * Task.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Task.identifier
   */
  identifier?: Identifier[];

  /**
   * Task.instantiatesCanonical
   */
  instantiatesCanonical?: string;

  /**
   * Task.instantiatesUri
   */
  instantiatesUri?: string;

  /**
   * Task.basedOn
   */
  basedOn?: Reference[];

  /**
   * Task.groupIdentifier
   */
  groupIdentifier?: Identifier;

  /**
   * Task.partOf
   */
  partOf?: Reference<Task>[];

  /**
   * Task.status
   */
  status: string;

  /**
   * Task.statusReason
   */
  statusReason?: CodeableConcept;

  /**
   * Task.businessStatus
   */
  businessStatus?: CodeableConcept;

  /**
   * Task.intent
   */
  intent: string;

  /**
   * Task.priority
   */
  priority?: 'routine' | 'urgent' | 'asap' | 'stat';

  /**
   * Task.code
   */
  code?: CodeableConcept;

  /**
   * Task.description
   */
  description?: string;

  /**
   * Task.focus
   */
  focus?: Reference;

  /**
   * Task.for
   */
  for?: Reference;

  /**
   * Task.encounter
   */
  encounter?: Reference<Encounter>;

  /**
   * Task.executionPeriod
   */
  executionPeriod?: Period;

  /**
   * Task.authoredOn
   */
  authoredOn?: string;

  /**
   * Task.lastModified
   */
  lastModified?: string;

  /**
   * Task.requester
   */
  requester?: Reference<Device | Organization | Patient | Practitioner | PractitionerRole | RelatedPerson>;

  /**
   * Task.performerType
   */
  performerType?: CodeableConcept[];

  /**
   * Task.owner
   */
  owner?: Reference<Practitioner | PractitionerRole | Organization | CareTeam | HealthcareService | Patient | Device | RelatedPerson>;

  /**
   * Task.location
   */
  location?: Reference<Location>;

  /**
   * Task.reasonCode
   */
  reasonCode?: CodeableConcept;

  /**
   * Task.reasonReference
   */
  reasonReference?: Reference;

  /**
   * Task.insurance
   */
  insurance?: Reference<Coverage | ClaimResponse>[];

  /**
   * Task.note
   */
  note?: Annotation[];

  /**
   * Task.relevantHistory
   */
  relevantHistory?: Reference<Provenance>[];

  /**
   * Task.restriction
   */
  restriction?: TaskRestriction;

  /**
   * Task.input
   */
  input?: TaskInput[];

  /**
   * Task.output
   */
  output?: TaskOutput[];
}

/**
 * FHIR R4 TaskInput
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface TaskInput {

  /**
   * Task.input.id
   */
  id?: string;

  /**
   * Task.input.extension
   */
  extension?: Extension[];

  /**
   * Task.input.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Task.input.type
   */
  type: CodeableConcept;

  /**
   * Task.input.value[x]
   */
  valueBase64Binary: string;

  /**
   * Task.input.value[x]
   */
  valueBoolean: boolean;

  /**
   * Task.input.value[x]
   */
  valueCanonical: string;

  /**
   * Task.input.value[x]
   */
  valueCode: string;

  /**
   * Task.input.value[x]
   */
  valueDate: string;

  /**
   * Task.input.value[x]
   */
  valueDateTime: string;

  /**
   * Task.input.value[x]
   */
  valueDecimal: number;

  /**
   * Task.input.value[x]
   */
  valueId: string;

  /**
   * Task.input.value[x]
   */
  valueInstant: string;

  /**
   * Task.input.value[x]
   */
  valueInteger: number;

  /**
   * Task.input.value[x]
   */
  valueMarkdown: string;

  /**
   * Task.input.value[x]
   */
  valueOid: string;

  /**
   * Task.input.value[x]
   */
  valuePositiveInt: number;

  /**
   * Task.input.value[x]
   */
  valueString: string;

  /**
   * Task.input.value[x]
   */
  valueTime: string;

  /**
   * Task.input.value[x]
   */
  valueUnsignedInt: number;

  /**
   * Task.input.value[x]
   */
  valueUri: string;

  /**
   * Task.input.value[x]
   */
  valueUrl: string;

  /**
   * Task.input.value[x]
   */
  valueUuid: string;

  /**
   * Task.input.value[x]
   */
  valueAddress: Address;

  /**
   * Task.input.value[x]
   */
  valueAge: Age;

  /**
   * Task.input.value[x]
   */
  valueAnnotation: Annotation;

  /**
   * Task.input.value[x]
   */
  valueAttachment: Attachment;

  /**
   * Task.input.value[x]
   */
  valueCodeableConcept: CodeableConcept;

  /**
   * Task.input.value[x]
   */
  valueCoding: Coding;

  /**
   * Task.input.value[x]
   */
  valueContactPoint: ContactPoint;

  /**
   * Task.input.value[x]
   */
  valueCount: Count;

  /**
   * Task.input.value[x]
   */
  valueDistance: Distance;

  /**
   * Task.input.value[x]
   */
  valueDuration: Duration;

  /**
   * Task.input.value[x]
   */
  valueHumanName: HumanName;

  /**
   * Task.input.value[x]
   */
  valueIdentifier: Identifier;

  /**
   * Task.input.value[x]
   */
  valueMoney: Money;

  /**
   * Task.input.value[x]
   */
  valuePeriod: Period;

  /**
   * Task.input.value[x]
   */
  valueQuantity: Quantity;

  /**
   * Task.input.value[x]
   */
  valueRange: Range;

  /**
   * Task.input.value[x]
   */
  valueRatio: Ratio;

  /**
   * Task.input.value[x]
   */
  valueReference: Reference;

  /**
   * Task.input.value[x]
   */
  valueSampledData: SampledData;

  /**
   * Task.input.value[x]
   */
  valueSignature: Signature;

  /**
   * Task.input.value[x]
   */
  valueTiming: Timing;

  /**
   * Task.input.value[x]
   */
  valueContactDetail: ContactDetail;

  /**
   * Task.input.value[x]
   */
  valueContributor: Contributor;

  /**
   * Task.input.value[x]
   */
  valueDataRequirement: DataRequirement;

  /**
   * Task.input.value[x]
   */
  valueExpression: Expression;

  /**
   * Task.input.value[x]
   */
  valueParameterDefinition: ParameterDefinition;

  /**
   * Task.input.value[x]
   */
  valueRelatedArtifact: RelatedArtifact;

  /**
   * Task.input.value[x]
   */
  valueTriggerDefinition: TriggerDefinition;

  /**
   * Task.input.value[x]
   */
  valueUsageContext: UsageContext;

  /**
   * Task.input.value[x]
   */
  valueDosage: Dosage;

  /**
   * Task.input.value[x]
   */
  valueMeta: Meta;
}

/**
 * FHIR R4 TaskOutput
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface TaskOutput {

  /**
   * Task.output.id
   */
  id?: string;

  /**
   * Task.output.extension
   */
  extension?: Extension[];

  /**
   * Task.output.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Task.output.type
   */
  type: CodeableConcept;

  /**
   * Task.output.value[x]
   */
  valueBase64Binary: string;

  /**
   * Task.output.value[x]
   */
  valueBoolean: boolean;

  /**
   * Task.output.value[x]
   */
  valueCanonical: string;

  /**
   * Task.output.value[x]
   */
  valueCode: string;

  /**
   * Task.output.value[x]
   */
  valueDate: string;

  /**
   * Task.output.value[x]
   */
  valueDateTime: string;

  /**
   * Task.output.value[x]
   */
  valueDecimal: number;

  /**
   * Task.output.value[x]
   */
  valueId: string;

  /**
   * Task.output.value[x]
   */
  valueInstant: string;

  /**
   * Task.output.value[x]
   */
  valueInteger: number;

  /**
   * Task.output.value[x]
   */
  valueMarkdown: string;

  /**
   * Task.output.value[x]
   */
  valueOid: string;

  /**
   * Task.output.value[x]
   */
  valuePositiveInt: number;

  /**
   * Task.output.value[x]
   */
  valueString: string;

  /**
   * Task.output.value[x]
   */
  valueTime: string;

  /**
   * Task.output.value[x]
   */
  valueUnsignedInt: number;

  /**
   * Task.output.value[x]
   */
  valueUri: string;

  /**
   * Task.output.value[x]
   */
  valueUrl: string;

  /**
   * Task.output.value[x]
   */
  valueUuid: string;

  /**
   * Task.output.value[x]
   */
  valueAddress: Address;

  /**
   * Task.output.value[x]
   */
  valueAge: Age;

  /**
   * Task.output.value[x]
   */
  valueAnnotation: Annotation;

  /**
   * Task.output.value[x]
   */
  valueAttachment: Attachment;

  /**
   * Task.output.value[x]
   */
  valueCodeableConcept: CodeableConcept;

  /**
   * Task.output.value[x]
   */
  valueCoding: Coding;

  /**
   * Task.output.value[x]
   */
  valueContactPoint: ContactPoint;

  /**
   * Task.output.value[x]
   */
  valueCount: Count;

  /**
   * Task.output.value[x]
   */
  valueDistance: Distance;

  /**
   * Task.output.value[x]
   */
  valueDuration: Duration;

  /**
   * Task.output.value[x]
   */
  valueHumanName: HumanName;

  /**
   * Task.output.value[x]
   */
  valueIdentifier: Identifier;

  /**
   * Task.output.value[x]
   */
  valueMoney: Money;

  /**
   * Task.output.value[x]
   */
  valuePeriod: Period;

  /**
   * Task.output.value[x]
   */
  valueQuantity: Quantity;

  /**
   * Task.output.value[x]
   */
  valueRange: Range;

  /**
   * Task.output.value[x]
   */
  valueRatio: Ratio;

  /**
   * Task.output.value[x]
   */
  valueReference: Reference;

  /**
   * Task.output.value[x]
   */
  valueSampledData: SampledData;

  /**
   * Task.output.value[x]
   */
  valueSignature: Signature;

  /**
   * Task.output.value[x]
   */
  valueTiming: Timing;

  /**
   * Task.output.value[x]
   */
  valueContactDetail: ContactDetail;

  /**
   * Task.output.value[x]
   */
  valueContributor: Contributor;

  /**
   * Task.output.value[x]
   */
  valueDataRequirement: DataRequirement;

  /**
   * Task.output.value[x]
   */
  valueExpression: Expression;

  /**
   * Task.output.value[x]
   */
  valueParameterDefinition: ParameterDefinition;

  /**
   * Task.output.value[x]
   */
  valueRelatedArtifact: RelatedArtifact;

  /**
   * Task.output.value[x]
   */
  valueTriggerDefinition: TriggerDefinition;

  /**
   * Task.output.value[x]
   */
  valueUsageContext: UsageContext;

  /**
   * Task.output.value[x]
   */
  valueDosage: Dosage;

  /**
   * Task.output.value[x]
   */
  valueMeta: Meta;
}

/**
 * FHIR R4 TaskRestriction
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface TaskRestriction {

  /**
   * Task.restriction.id
   */
  id?: string;

  /**
   * Task.restriction.extension
   */
  extension?: Extension[];

  /**
   * Task.restriction.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Task.restriction.repetitions
   */
  repetitions?: number;

  /**
   * Task.restriction.period
   */
  period?: Period;

  /**
   * Task.restriction.recipient
   */
  recipient?: Reference<Patient | Practitioner | PractitionerRole | RelatedPerson | Group | Organization>[];
}

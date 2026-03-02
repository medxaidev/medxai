import { Annotation } from './Annotation';
import { CarePlan } from './CarePlan';
import { CodeableConcept } from './CodeableConcept';
import { Condition } from './Condition';
import { DataRequirement } from './DataRequirement';
import { Device } from './Device';
import { DiagnosticReport } from './DiagnosticReport';
import { DocumentReference } from './DocumentReference';
import { Encounter } from './Encounter';
import { Extension } from './Extension';
import { Group } from './Group';
import { Identifier } from './Identifier';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { Observation } from './Observation';
import { OperationOutcome } from './OperationOutcome';
import { Parameters } from './Parameters';
import { Patient } from './Patient';
import { Reference } from './Reference';
import { RequestGroup } from './RequestGroup';
import { Resource } from './Resource';

/**
 * FHIR R4 GuidanceResponse
 * @see https://hl7.org/fhir/R4/guidanceresponse.html
 */
export interface GuidanceResponse {

  /**
   * This is a GuidanceResponse resource
   */
  readonly resourceType: 'GuidanceResponse';

  /**
   * GuidanceResponse.id
   */
  id?: string;

  /**
   * GuidanceResponse.meta
   */
  meta?: Meta;

  /**
   * GuidanceResponse.implicitRules
   */
  implicitRules?: string;

  /**
   * GuidanceResponse.language
   */
  language?: string;

  /**
   * GuidanceResponse.text
   */
  text?: Narrative;

  /**
   * GuidanceResponse.contained
   */
  contained?: Resource[];

  /**
   * GuidanceResponse.extension
   */
  extension?: Extension[];

  /**
   * GuidanceResponse.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * GuidanceResponse.requestIdentifier
   */
  requestIdentifier?: Identifier;

  /**
   * GuidanceResponse.identifier
   */
  identifier?: Identifier[];

  /**
   * GuidanceResponse.module[x]
   */
  moduleUri: string;

  /**
   * GuidanceResponse.module[x]
   */
  moduleCanonical: string;

  /**
   * GuidanceResponse.module[x]
   */
  moduleCodeableConcept: CodeableConcept;

  /**
   * GuidanceResponse.status
   */
  status: string;

  /**
   * GuidanceResponse.subject
   */
  subject?: Reference<Patient | Group>;

  /**
   * GuidanceResponse.encounter
   */
  encounter?: Reference<Encounter>;

  /**
   * GuidanceResponse.occurrenceDateTime
   */
  occurrenceDateTime?: string;

  /**
   * GuidanceResponse.performer
   */
  performer?: Reference<Device>;

  /**
   * GuidanceResponse.reasonCode
   */
  reasonCode?: CodeableConcept[];

  /**
   * GuidanceResponse.reasonReference
   */
  reasonReference?: Reference<Condition | Observation | DiagnosticReport | DocumentReference>[];

  /**
   * GuidanceResponse.note
   */
  note?: Annotation[];

  /**
   * GuidanceResponse.evaluationMessage
   */
  evaluationMessage?: Reference<OperationOutcome>[];

  /**
   * GuidanceResponse.outputParameters
   */
  outputParameters?: Reference<Parameters>;

  /**
   * GuidanceResponse.result
   */
  result?: Reference<CarePlan | RequestGroup>;

  /**
   * GuidanceResponse.dataRequirement
   */
  dataRequirement?: DataRequirement[];
}

/**
 * GuidanceResponse.module[x]
 */
export type GuidanceResponseModule = string | CodeableConcept;

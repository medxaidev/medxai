import { Annotation } from './Annotation';
import { Claim } from './Claim';
import { CodeableConcept } from './CodeableConcept';
import { Condition } from './Condition';
import { Device } from './Device';
import { DiagnosticReport } from './DiagnosticReport';
import { DocumentReference } from './DocumentReference';
import { Extension } from './Extension';
import { Group } from './Group';
import { Identifier } from './Identifier';
import { Media } from './Media';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { Observation } from './Observation';
import { Patient } from './Patient';
import { Period } from './Period';
import { Practitioner } from './Practitioner';
import { PractitionerRole } from './PractitionerRole';
import { Procedure } from './Procedure';
import { QuestionnaireResponse } from './QuestionnaireResponse';
import { Reference } from './Reference';
import { RelatedPerson } from './RelatedPerson';
import { Resource } from './Resource';
import { ServiceRequest } from './ServiceRequest';
import { Timing } from './Timing';

/**
 * FHIR R4 DeviceUseStatement
 * @see https://hl7.org/fhir/R4/deviceusestatement.html
 */
export interface DeviceUseStatement {

  /**
   * This is a DeviceUseStatement resource
   */
  readonly resourceType: 'DeviceUseStatement';

  /**
   * DeviceUseStatement.id
   */
  id?: string;

  /**
   * DeviceUseStatement.meta
   */
  meta?: Meta;

  /**
   * DeviceUseStatement.implicitRules
   */
  implicitRules?: string;

  /**
   * DeviceUseStatement.language
   */
  language?: string;

  /**
   * DeviceUseStatement.text
   */
  text?: Narrative;

  /**
   * DeviceUseStatement.contained
   */
  contained?: Resource[];

  /**
   * DeviceUseStatement.extension
   */
  extension?: Extension[];

  /**
   * DeviceUseStatement.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * DeviceUseStatement.identifier
   */
  identifier?: Identifier[];

  /**
   * DeviceUseStatement.basedOn
   */
  basedOn?: Reference<ServiceRequest>[];

  /**
   * DeviceUseStatement.status
   */
  status: string;

  /**
   * DeviceUseStatement.subject
   */
  subject: Reference<Patient | Group>;

  /**
   * DeviceUseStatement.derivedFrom
   */
  derivedFrom?: Reference<ServiceRequest | Procedure | Claim | Observation | QuestionnaireResponse | DocumentReference>[];

  /**
   * DeviceUseStatement.timing[x]
   */
  timingTiming?: Timing;

  /**
   * DeviceUseStatement.timing[x]
   */
  timingPeriod?: Period;

  /**
   * DeviceUseStatement.timing[x]
   */
  timingDateTime?: string;

  /**
   * DeviceUseStatement.recordedOn
   */
  recordedOn?: string;

  /**
   * DeviceUseStatement.source
   */
  source?: Reference<Patient | Practitioner | PractitionerRole | RelatedPerson>;

  /**
   * DeviceUseStatement.device
   */
  device: Reference<Device>;

  /**
   * DeviceUseStatement.reasonCode
   */
  reasonCode?: CodeableConcept[];

  /**
   * DeviceUseStatement.reasonReference
   */
  reasonReference?: Reference<Condition | Observation | DiagnosticReport | DocumentReference | Media>[];

  /**
   * DeviceUseStatement.bodySite
   */
  bodySite?: CodeableConcept;

  /**
   * DeviceUseStatement.note
   */
  note?: Annotation[];
}

/**
 * DeviceUseStatement.timing[x]
 */
export type DeviceUseStatementTiming = Timing | Period | string;

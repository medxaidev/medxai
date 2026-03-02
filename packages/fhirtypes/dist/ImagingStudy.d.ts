import { Annotation } from './Annotation';
import { Appointment } from './Appointment';
import { AppointmentResponse } from './AppointmentResponse';
import { CarePlan } from './CarePlan';
import { CareTeam } from './CareTeam';
import { CodeableConcept } from './CodeableConcept';
import { Coding } from './Coding';
import { Condition } from './Condition';
import { Device } from './Device';
import { DiagnosticReport } from './DiagnosticReport';
import { DocumentReference } from './DocumentReference';
import { Encounter } from './Encounter';
import { Endpoint } from './Endpoint';
import { Extension } from './Extension';
import { Group } from './Group';
import { Identifier } from './Identifier';
import { Location } from './Location';
import { Media } from './Media';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { Observation } from './Observation';
import { Organization } from './Organization';
import { Patient } from './Patient';
import { Practitioner } from './Practitioner';
import { PractitionerRole } from './PractitionerRole';
import { Procedure } from './Procedure';
import { Reference } from './Reference';
import { RelatedPerson } from './RelatedPerson';
import { Resource } from './Resource';
import { ServiceRequest } from './ServiceRequest';
import { Specimen } from './Specimen';
import { Task } from './Task';

/**
 * FHIR R4 ImagingStudy
 * @see https://hl7.org/fhir/R4/imagingstudy.html
 */
export interface ImagingStudy {

  /**
   * This is a ImagingStudy resource
   */
  readonly resourceType: 'ImagingStudy';

  /**
   * ImagingStudy.id
   */
  id?: string;

  /**
   * ImagingStudy.meta
   */
  meta?: Meta;

  /**
   * ImagingStudy.implicitRules
   */
  implicitRules?: string;

  /**
   * ImagingStudy.language
   */
  language?: string;

  /**
   * ImagingStudy.text
   */
  text?: Narrative;

  /**
   * ImagingStudy.contained
   */
  contained?: Resource[];

  /**
   * ImagingStudy.extension
   */
  extension?: Extension[];

  /**
   * ImagingStudy.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * ImagingStudy.identifier
   */
  identifier?: Identifier[];

  /**
   * ImagingStudy.status
   */
  status: string;

  /**
   * ImagingStudy.modality
   */
  modality?: Coding[];

  /**
   * ImagingStudy.subject
   */
  subject: Reference<Patient | Device | Group>;

  /**
   * ImagingStudy.encounter
   */
  encounter?: Reference<Encounter>;

  /**
   * ImagingStudy.started
   */
  started?: string;

  /**
   * ImagingStudy.basedOn
   */
  basedOn?: Reference<CarePlan | ServiceRequest | Appointment | AppointmentResponse | Task>[];

  /**
   * ImagingStudy.referrer
   */
  referrer?: Reference<Practitioner | PractitionerRole>;

  /**
   * ImagingStudy.interpreter
   */
  interpreter?: Reference<Practitioner | PractitionerRole>[];

  /**
   * ImagingStudy.endpoint
   */
  endpoint?: Reference<Endpoint>[];

  /**
   * ImagingStudy.numberOfSeries
   */
  numberOfSeries?: number;

  /**
   * ImagingStudy.numberOfInstances
   */
  numberOfInstances?: number;

  /**
   * ImagingStudy.procedureReference
   */
  procedureReference?: Reference<Procedure>;

  /**
   * ImagingStudy.procedureCode
   */
  procedureCode?: CodeableConcept[];

  /**
   * ImagingStudy.location
   */
  location?: Reference<Location>;

  /**
   * ImagingStudy.reasonCode
   */
  reasonCode?: CodeableConcept[];

  /**
   * ImagingStudy.reasonReference
   */
  reasonReference?: Reference<Condition | Observation | Media | DiagnosticReport | DocumentReference>[];

  /**
   * ImagingStudy.note
   */
  note?: Annotation[];

  /**
   * ImagingStudy.description
   */
  description?: string;

  /**
   * ImagingStudy.series
   */
  series?: ImagingStudySeries[];
}

/**
 * FHIR R4 ImagingStudySeries
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ImagingStudySeries {

  /**
   * ImagingStudy.series.id
   */
  id?: string;

  /**
   * ImagingStudy.series.extension
   */
  extension?: Extension[];

  /**
   * ImagingStudy.series.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * ImagingStudy.series.uid
   */
  uid: string;

  /**
   * ImagingStudy.series.number
   */
  number?: number;

  /**
   * ImagingStudy.series.modality
   */
  modality: Coding;

  /**
   * ImagingStudy.series.description
   */
  description?: string;

  /**
   * ImagingStudy.series.numberOfInstances
   */
  numberOfInstances?: number;

  /**
   * ImagingStudy.series.endpoint
   */
  endpoint?: Reference<Endpoint>[];

  /**
   * ImagingStudy.series.bodySite
   */
  bodySite?: Coding;

  /**
   * ImagingStudy.series.laterality
   */
  laterality?: Coding;

  /**
   * ImagingStudy.series.specimen
   */
  specimen?: Reference<Specimen>[];

  /**
   * ImagingStudy.series.started
   */
  started?: string;

  /**
   * ImagingStudy.series.performer
   */
  performer?: ImagingStudySeriesPerformer[];

  /**
   * ImagingStudy.series.instance
   */
  instance?: ImagingStudySeriesInstance[];
}

/**
 * FHIR R4 ImagingStudySeriesInstance
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ImagingStudySeriesInstance {

  /**
   * ImagingStudy.series.instance.id
   */
  id?: string;

  /**
   * ImagingStudy.series.instance.extension
   */
  extension?: Extension[];

  /**
   * ImagingStudy.series.instance.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * ImagingStudy.series.instance.uid
   */
  uid: string;

  /**
   * ImagingStudy.series.instance.sopClass
   */
  sopClass: Coding;

  /**
   * ImagingStudy.series.instance.number
   */
  number?: number;

  /**
   * ImagingStudy.series.instance.title
   */
  title?: string;
}

/**
 * FHIR R4 ImagingStudySeriesPerformer
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ImagingStudySeriesPerformer {

  /**
   * ImagingStudy.series.performer.id
   */
  id?: string;

  /**
   * ImagingStudy.series.performer.extension
   */
  extension?: Extension[];

  /**
   * ImagingStudy.series.performer.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * ImagingStudy.series.performer.function
   */
  function?: CodeableConcept;

  /**
   * ImagingStudy.series.performer.actor
   */
  actor: Reference<Practitioner | PractitionerRole | Organization | CareTeam | Patient | Device | RelatedPerson>;
}

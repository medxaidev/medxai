import { AllergyIntolerance } from './AllergyIntolerance';
import { CodeableConcept } from './CodeableConcept';
import { Condition } from './Condition';
import { Device } from './Device';
import { DocumentReference } from './DocumentReference';
import { Encounter } from './Encounter';
import { Extension } from './Extension';
import { FamilyMemberHistory } from './FamilyMemberHistory';
import { Group } from './Group';
import { Identifier } from './Identifier';
import { Immunization } from './Immunization';
import { Location } from './Location';
import { Media } from './Media';
import { Medication } from './Medication';
import { MedicationAdministration } from './MedicationAdministration';
import { MedicationStatement } from './MedicationStatement';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { Observation } from './Observation';
import { Patient } from './Patient';
import { Practitioner } from './Practitioner';
import { PractitionerRole } from './PractitionerRole';
import { Procedure } from './Procedure';
import { Reference } from './Reference';
import { RelatedPerson } from './RelatedPerson';
import { ResearchStudy } from './ResearchStudy';
import { Resource } from './Resource';
import { Substance } from './Substance';

/**
 * FHIR R4 AdverseEvent
 * @see https://hl7.org/fhir/R4/adverseevent.html
 */
export interface AdverseEvent {

  /**
   * This is a AdverseEvent resource
   */
  readonly resourceType: 'AdverseEvent';

  /**
   * AdverseEvent.id
   */
  id?: string;

  /**
   * AdverseEvent.meta
   */
  meta?: Meta;

  /**
   * AdverseEvent.implicitRules
   */
  implicitRules?: string;

  /**
   * AdverseEvent.language
   */
  language?: string;

  /**
   * AdverseEvent.text
   */
  text?: Narrative;

  /**
   * AdverseEvent.contained
   */
  contained?: Resource[];

  /**
   * AdverseEvent.extension
   */
  extension?: Extension[];

  /**
   * AdverseEvent.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * AdverseEvent.identifier
   */
  identifier?: Identifier;

  /**
   * AdverseEvent.actuality
   */
  actuality: string;

  /**
   * AdverseEvent.category
   */
  category?: CodeableConcept[];

  /**
   * AdverseEvent.event
   */
  event?: CodeableConcept;

  /**
   * AdverseEvent.subject
   */
  subject: Reference<Patient | Group | Practitioner | RelatedPerson>;

  /**
   * AdverseEvent.encounter
   */
  encounter?: Reference<Encounter>;

  /**
   * AdverseEvent.date
   */
  date?: string;

  /**
   * AdverseEvent.detected
   */
  detected?: string;

  /**
   * AdverseEvent.recordedDate
   */
  recordedDate?: string;

  /**
   * AdverseEvent.resultingCondition
   */
  resultingCondition?: Reference<Condition>[];

  /**
   * AdverseEvent.location
   */
  location?: Reference<Location>;

  /**
   * AdverseEvent.seriousness
   */
  seriousness?: CodeableConcept;

  /**
   * AdverseEvent.severity
   */
  severity?: CodeableConcept;

  /**
   * AdverseEvent.outcome
   */
  outcome?: CodeableConcept;

  /**
   * AdverseEvent.recorder
   */
  recorder?: Reference<Patient | Practitioner | PractitionerRole | RelatedPerson>;

  /**
   * AdverseEvent.contributor
   */
  contributor?: Reference<Practitioner | PractitionerRole | Device>[];

  /**
   * AdverseEvent.suspectEntity
   */
  suspectEntity?: AdverseEventSuspectEntity[];

  /**
   * AdverseEvent.subjectMedicalHistory
   */
  subjectMedicalHistory?: Reference<Condition | Observation | AllergyIntolerance | FamilyMemberHistory | Immunization | Procedure | Media | DocumentReference>[];

  /**
   * AdverseEvent.referenceDocument
   */
  referenceDocument?: Reference<DocumentReference>[];

  /**
   * AdverseEvent.study
   */
  study?: Reference<ResearchStudy>[];
}

/**
 * FHIR R4 AdverseEventSuspectEntity
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface AdverseEventSuspectEntity {

  /**
   * AdverseEvent.suspectEntity.id
   */
  id?: string;

  /**
   * AdverseEvent.suspectEntity.extension
   */
  extension?: Extension[];

  /**
   * AdverseEvent.suspectEntity.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * AdverseEvent.suspectEntity.instance
   */
  instance: Reference<Immunization | Procedure | Substance | Medication | MedicationAdministration | MedicationStatement | Device>;

  /**
   * AdverseEvent.suspectEntity.causality
   */
  causality?: AdverseEventSuspectEntityCausality[];
}

/**
 * FHIR R4 AdverseEventSuspectEntityCausality
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface AdverseEventSuspectEntityCausality {

  /**
   * AdverseEvent.suspectEntity.causality.id
   */
  id?: string;

  /**
   * AdverseEvent.suspectEntity.causality.extension
   */
  extension?: Extension[];

  /**
   * AdverseEvent.suspectEntity.causality.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * AdverseEvent.suspectEntity.causality.assessment
   */
  assessment?: CodeableConcept;

  /**
   * AdverseEvent.suspectEntity.causality.productRelatedness
   */
  productRelatedness?: string;

  /**
   * AdverseEvent.suspectEntity.causality.author
   */
  author?: Reference<Practitioner | PractitionerRole>;

  /**
   * AdverseEvent.suspectEntity.causality.method
   */
  method?: CodeableConcept;
}

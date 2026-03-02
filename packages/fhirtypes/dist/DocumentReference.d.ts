import { Attachment } from './Attachment';
import { CodeableConcept } from './CodeableConcept';
import { Coding } from './Coding';
import { Device } from './Device';
import { Encounter } from './Encounter';
import { EpisodeOfCare } from './EpisodeOfCare';
import { Extension } from './Extension';
import { Group } from './Group';
import { Identifier } from './Identifier';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { Organization } from './Organization';
import { Patient } from './Patient';
import { Period } from './Period';
import { Practitioner } from './Practitioner';
import { PractitionerRole } from './PractitionerRole';
import { Reference } from './Reference';
import { RelatedPerson } from './RelatedPerson';
import { Resource } from './Resource';

/**
 * FHIR R4 DocumentReference
 * @see https://hl7.org/fhir/R4/documentreference.html
 */
export interface DocumentReference {

  /**
   * This is a DocumentReference resource
   */
  readonly resourceType: 'DocumentReference';

  /**
   * DocumentReference.id
   */
  id?: string;

  /**
   * DocumentReference.meta
   */
  meta?: Meta;

  /**
   * DocumentReference.implicitRules
   */
  implicitRules?: string;

  /**
   * DocumentReference.language
   */
  language?: string;

  /**
   * DocumentReference.text
   */
  text?: Narrative;

  /**
   * DocumentReference.contained
   */
  contained?: Resource[];

  /**
   * DocumentReference.extension
   */
  extension?: Extension[];

  /**
   * DocumentReference.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * DocumentReference.masterIdentifier
   */
  masterIdentifier?: Identifier;

  /**
   * DocumentReference.identifier
   */
  identifier?: Identifier[];

  /**
   * DocumentReference.status
   */
  status: 'current' | 'superseded' | 'entered-in-error';

  /**
   * DocumentReference.docStatus
   */
  docStatus?: 'preliminary' | 'final' | 'amended' | 'entered-in-error';

  /**
   * DocumentReference.type
   */
  type?: CodeableConcept;

  /**
   * DocumentReference.category
   */
  category?: CodeableConcept[];

  /**
   * DocumentReference.subject
   */
  subject?: Reference<Patient | Practitioner | Group | Device>;

  /**
   * DocumentReference.date
   */
  date?: string;

  /**
   * DocumentReference.author
   */
  author?: Reference<Practitioner | PractitionerRole | Organization | Device | Patient | RelatedPerson>[];

  /**
   * DocumentReference.authenticator
   */
  authenticator?: Reference<Practitioner | PractitionerRole | Organization>;

  /**
   * DocumentReference.custodian
   */
  custodian?: Reference<Organization>;

  /**
   * DocumentReference.relatesTo
   */
  relatesTo?: DocumentReferenceRelatesTo[];

  /**
   * DocumentReference.description
   */
  description?: string;

  /**
   * DocumentReference.securityLabel
   */
  securityLabel?: CodeableConcept[];

  /**
   * DocumentReference.content
   */
  content: DocumentReferenceContent[];

  /**
   * DocumentReference.context
   */
  context?: DocumentReferenceContext;
}

/**
 * FHIR R4 DocumentReferenceContent
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface DocumentReferenceContent {

  /**
   * DocumentReference.content.id
   */
  id?: string;

  /**
   * DocumentReference.content.extension
   */
  extension?: Extension[];

  /**
   * DocumentReference.content.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * DocumentReference.content.attachment
   */
  attachment: Attachment;

  /**
   * DocumentReference.content.format
   */
  format?: Coding;
}

/**
 * FHIR R4 DocumentReferenceContext
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface DocumentReferenceContext {

  /**
   * DocumentReference.context.id
   */
  id?: string;

  /**
   * DocumentReference.context.extension
   */
  extension?: Extension[];

  /**
   * DocumentReference.context.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * DocumentReference.context.encounter
   */
  encounter?: Reference<Encounter | EpisodeOfCare>[];

  /**
   * DocumentReference.context.event
   */
  event?: CodeableConcept[];

  /**
   * DocumentReference.context.period
   */
  period?: Period;

  /**
   * DocumentReference.context.facilityType
   */
  facilityType?: CodeableConcept;

  /**
   * DocumentReference.context.practiceSetting
   */
  practiceSetting?: CodeableConcept;

  /**
   * DocumentReference.context.sourcePatientInfo
   */
  sourcePatientInfo?: Reference<Patient>;

  /**
   * DocumentReference.context.related
   */
  related?: Reference[];
}

/**
 * FHIR R4 DocumentReferenceRelatesTo
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface DocumentReferenceRelatesTo {

  /**
   * DocumentReference.relatesTo.id
   */
  id?: string;

  /**
   * DocumentReference.relatesTo.extension
   */
  extension?: Extension[];

  /**
   * DocumentReference.relatesTo.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * DocumentReference.relatesTo.code
   */
  code: string;

  /**
   * DocumentReference.relatesTo.target
   */
  target: Reference<DocumentReference>;
}

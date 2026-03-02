import { Annotation } from './Annotation';
import { Attachment } from './Attachment';
import { CarePlan } from './CarePlan';
import { CareTeam } from './CareTeam';
import { CodeableConcept } from './CodeableConcept';
import { Device } from './Device';
import { DeviceMetric } from './DeviceMetric';
import { Encounter } from './Encounter';
import { Extension } from './Extension';
import { Group } from './Group';
import { Identifier } from './Identifier';
import { Location } from './Location';
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
import { ServiceRequest } from './ServiceRequest';
import { Specimen } from './Specimen';

/**
 * FHIR R4 Media
 * @see https://hl7.org/fhir/R4/media.html
 */
export interface Media {

  /**
   * This is a Media resource
   */
  readonly resourceType: 'Media';

  /**
   * Media.id
   */
  id?: string;

  /**
   * Media.meta
   */
  meta?: Meta;

  /**
   * Media.implicitRules
   */
  implicitRules?: string;

  /**
   * Media.language
   */
  language?: string;

  /**
   * Media.text
   */
  text?: Narrative;

  /**
   * Media.contained
   */
  contained?: Resource[];

  /**
   * Media.extension
   */
  extension?: Extension[];

  /**
   * Media.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Media.identifier
   */
  identifier?: Identifier[];

  /**
   * Media.basedOn
   */
  basedOn?: Reference<ServiceRequest | CarePlan>[];

  /**
   * Media.partOf
   */
  partOf?: Reference[];

  /**
   * Media.status
   */
  status: 'preparation' | 'in-progress' | 'not-done' | 'on-hold' | 'stopped' | 'completed' | 'entered-in-error' | 'unknown';

  /**
   * Media.type
   */
  type?: CodeableConcept;

  /**
   * Media.modality
   */
  modality?: CodeableConcept;

  /**
   * Media.view
   */
  view?: CodeableConcept;

  /**
   * Media.subject
   */
  subject?: Reference<Patient | Practitioner | PractitionerRole | Group | Device | Specimen | Location>;

  /**
   * Media.encounter
   */
  encounter?: Reference<Encounter>;

  /**
   * Media.created[x]
   */
  createdDateTime?: string;

  /**
   * Media.created[x]
   */
  createdPeriod?: Period;

  /**
   * Media.issued
   */
  issued?: string;

  /**
   * Media.operator
   */
  operator?: Reference<Practitioner | PractitionerRole | Organization | CareTeam | Patient | Device | RelatedPerson>;

  /**
   * Media.reasonCode
   */
  reasonCode?: CodeableConcept[];

  /**
   * Media.bodySite
   */
  bodySite?: CodeableConcept;

  /**
   * Media.deviceName
   */
  deviceName?: string;

  /**
   * Media.device
   */
  device?: Reference<Device | DeviceMetric | Device>;

  /**
   * Media.height
   */
  height?: number;

  /**
   * Media.width
   */
  width?: number;

  /**
   * Media.frames
   */
  frames?: number;

  /**
   * Media.duration
   */
  duration?: number;

  /**
   * Media.content
   */
  content: Attachment;

  /**
   * Media.note
   */
  note?: Annotation[];
}

/**
 * Media.created[x]
 */
export type MediaCreated = string | Period;

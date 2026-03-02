import { Annotation } from './Annotation';
import { CodeableConcept } from './CodeableConcept';
import { Device } from './Device';
import { Duration } from './Duration';
import { Extension } from './Extension';
import { Group } from './Group';
import { Identifier } from './Identifier';
import { Location } from './Location';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { Patient } from './Patient';
import { Period } from './Period';
import { Practitioner } from './Practitioner';
import { PractitionerRole } from './PractitionerRole';
import { Quantity } from './Quantity';
import { Reference } from './Reference';
import { Resource } from './Resource';
import { ServiceRequest } from './ServiceRequest';
import { Substance } from './Substance';

/**
 * FHIR R4 Specimen
 * @see https://hl7.org/fhir/R4/specimen.html
 */
export interface Specimen {

  /**
   * This is a Specimen resource
   */
  readonly resourceType: 'Specimen';

  /**
   * Specimen.id
   */
  id?: string;

  /**
   * Specimen.meta
   */
  meta?: Meta;

  /**
   * Specimen.implicitRules
   */
  implicitRules?: string;

  /**
   * Specimen.language
   */
  language?: string;

  /**
   * Specimen.text
   */
  text?: Narrative;

  /**
   * Specimen.contained
   */
  contained?: Resource[];

  /**
   * Specimen.extension
   */
  extension?: Extension[];

  /**
   * Specimen.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Specimen.identifier
   */
  identifier?: Identifier[];

  /**
   * Specimen.accessionIdentifier
   */
  accessionIdentifier?: Identifier;

  /**
   * Specimen.status
   */
  status?: string;

  /**
   * Specimen.type
   */
  type?: CodeableConcept;

  /**
   * Specimen.subject
   */
  subject?: Reference<Patient | Group | Device | Substance | Location>;

  /**
   * Specimen.receivedTime
   */
  receivedTime?: string;

  /**
   * Specimen.parent
   */
  parent?: Reference<Specimen>[];

  /**
   * Specimen.request
   */
  request?: Reference<ServiceRequest>[];

  /**
   * Specimen.collection
   */
  collection?: SpecimenCollection;

  /**
   * Specimen.processing
   */
  processing?: SpecimenProcessing[];

  /**
   * Specimen.container
   */
  container?: SpecimenContainer[];

  /**
   * Specimen.condition
   */
  condition?: CodeableConcept[];

  /**
   * Specimen.note
   */
  note?: Annotation[];
}

/**
 * FHIR R4 SpecimenCollection
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface SpecimenCollection {

  /**
   * Specimen.collection.id
   */
  id?: string;

  /**
   * Specimen.collection.extension
   */
  extension?: Extension[];

  /**
   * Specimen.collection.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Specimen.collection.collector
   */
  collector?: Reference<Practitioner | PractitionerRole>;

  /**
   * Specimen.collection.collected[x]
   */
  collectedDateTime?: string;

  /**
   * Specimen.collection.collected[x]
   */
  collectedPeriod?: Period;

  /**
   * Specimen.collection.duration
   */
  duration?: Duration;

  /**
   * Specimen.collection.quantity
   */
  quantity?: Quantity;

  /**
   * Specimen.collection.method
   */
  method?: CodeableConcept;

  /**
   * Specimen.collection.bodySite
   */
  bodySite?: CodeableConcept;

  /**
   * Specimen.collection.fastingStatus[x]
   */
  fastingStatusCodeableConcept?: CodeableConcept;

  /**
   * Specimen.collection.fastingStatus[x]
   */
  fastingStatusDuration?: Duration;
}

/**
 * FHIR R4 SpecimenContainer
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface SpecimenContainer {

  /**
   * Specimen.container.id
   */
  id?: string;

  /**
   * Specimen.container.extension
   */
  extension?: Extension[];

  /**
   * Specimen.container.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Specimen.container.identifier
   */
  identifier?: Identifier[];

  /**
   * Specimen.container.description
   */
  description?: string;

  /**
   * Specimen.container.type
   */
  type?: CodeableConcept;

  /**
   * Specimen.container.capacity
   */
  capacity?: Quantity;

  /**
   * Specimen.container.specimenQuantity
   */
  specimenQuantity?: Quantity;

  /**
   * Specimen.container.additive[x]
   */
  additiveCodeableConcept?: CodeableConcept;

  /**
   * Specimen.container.additive[x]
   */
  additiveReference?: Reference<Substance>;
}

/**
 * FHIR R4 SpecimenProcessing
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface SpecimenProcessing {

  /**
   * Specimen.processing.id
   */
  id?: string;

  /**
   * Specimen.processing.extension
   */
  extension?: Extension[];

  /**
   * Specimen.processing.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Specimen.processing.description
   */
  description?: string;

  /**
   * Specimen.processing.procedure
   */
  procedure?: CodeableConcept;

  /**
   * Specimen.processing.additive
   */
  additive?: Reference<Substance>[];

  /**
   * Specimen.processing.time[x]
   */
  timeDateTime?: string;

  /**
   * Specimen.processing.time[x]
   */
  timePeriod?: Period;
}

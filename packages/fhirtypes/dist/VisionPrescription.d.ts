import { Annotation } from './Annotation';
import { CodeableConcept } from './CodeableConcept';
import { Encounter } from './Encounter';
import { Extension } from './Extension';
import { Identifier } from './Identifier';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { Patient } from './Patient';
import { Practitioner } from './Practitioner';
import { PractitionerRole } from './PractitionerRole';
import { Quantity } from './Quantity';
import { Reference } from './Reference';
import { Resource } from './Resource';

/**
 * FHIR R4 VisionPrescription
 * @see https://hl7.org/fhir/R4/visionprescription.html
 */
export interface VisionPrescription {

  /**
   * This is a VisionPrescription resource
   */
  readonly resourceType: 'VisionPrescription';

  /**
   * VisionPrescription.id
   */
  id?: string;

  /**
   * VisionPrescription.meta
   */
  meta?: Meta;

  /**
   * VisionPrescription.implicitRules
   */
  implicitRules?: string;

  /**
   * VisionPrescription.language
   */
  language?: string;

  /**
   * VisionPrescription.text
   */
  text?: Narrative;

  /**
   * VisionPrescription.contained
   */
  contained?: Resource[];

  /**
   * VisionPrescription.extension
   */
  extension?: Extension[];

  /**
   * VisionPrescription.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * VisionPrescription.identifier
   */
  identifier?: Identifier[];

  /**
   * VisionPrescription.status
   */
  status: 'active' | 'cancelled' | 'draft' | 'entered-in-error';

  /**
   * VisionPrescription.created
   */
  created: string;

  /**
   * VisionPrescription.patient
   */
  patient: Reference<Patient>;

  /**
   * VisionPrescription.encounter
   */
  encounter?: Reference<Encounter>;

  /**
   * VisionPrescription.dateWritten
   */
  dateWritten: string;

  /**
   * VisionPrescription.prescriber
   */
  prescriber: Reference<Practitioner | PractitionerRole>;

  /**
   * VisionPrescription.lensSpecification
   */
  lensSpecification: VisionPrescriptionLensSpecification[];
}

/**
 * FHIR R4 VisionPrescriptionLensSpecification
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface VisionPrescriptionLensSpecification {

  /**
   * VisionPrescription.lensSpecification.id
   */
  id?: string;

  /**
   * VisionPrescription.lensSpecification.extension
   */
  extension?: Extension[];

  /**
   * VisionPrescription.lensSpecification.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * VisionPrescription.lensSpecification.product
   */
  product: CodeableConcept;

  /**
   * VisionPrescription.lensSpecification.eye
   */
  eye: string;

  /**
   * VisionPrescription.lensSpecification.sphere
   */
  sphere?: number;

  /**
   * VisionPrescription.lensSpecification.cylinder
   */
  cylinder?: number;

  /**
   * VisionPrescription.lensSpecification.axis
   */
  axis?: number;

  /**
   * VisionPrescription.lensSpecification.prism
   */
  prism?: VisionPrescriptionLensSpecificationPrism[];

  /**
   * VisionPrescription.lensSpecification.add
   */
  add?: number;

  /**
   * VisionPrescription.lensSpecification.power
   */
  power?: number;

  /**
   * VisionPrescription.lensSpecification.backCurve
   */
  backCurve?: number;

  /**
   * VisionPrescription.lensSpecification.diameter
   */
  diameter?: number;

  /**
   * VisionPrescription.lensSpecification.duration
   */
  duration?: Quantity;

  /**
   * VisionPrescription.lensSpecification.color
   */
  color?: string;

  /**
   * VisionPrescription.lensSpecification.brand
   */
  brand?: string;

  /**
   * VisionPrescription.lensSpecification.note
   */
  note?: Annotation[];
}

/**
 * FHIR R4 VisionPrescriptionLensSpecificationPrism
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface VisionPrescriptionLensSpecificationPrism {

  /**
   * VisionPrescription.lensSpecification.prism.id
   */
  id?: string;

  /**
   * VisionPrescription.lensSpecification.prism.extension
   */
  extension?: Extension[];

  /**
   * VisionPrescription.lensSpecification.prism.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * VisionPrescription.lensSpecification.prism.amount
   */
  amount: number;

  /**
   * VisionPrescription.lensSpecification.prism.base
   */
  base: string;
}

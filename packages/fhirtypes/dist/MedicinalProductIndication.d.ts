import { CodeableConcept } from './CodeableConcept';
import { Extension } from './Extension';
import { Medication } from './Medication';
import { MedicinalProduct } from './MedicinalProduct';
import { MedicinalProductUndesirableEffect } from './MedicinalProductUndesirableEffect';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { Population } from './Population';
import { Quantity } from './Quantity';
import { Reference } from './Reference';
import { Resource } from './Resource';
import { Substance } from './Substance';
import { SubstanceSpecification } from './SubstanceSpecification';

/**
 * FHIR R4 MedicinalProductIndication
 * @see https://hl7.org/fhir/R4/medicinalproductindication.html
 */
export interface MedicinalProductIndication {

  /**
   * This is a MedicinalProductIndication resource
   */
  readonly resourceType: 'MedicinalProductIndication';

  /**
   * MedicinalProductIndication.id
   */
  id?: string;

  /**
   * MedicinalProductIndication.meta
   */
  meta?: Meta;

  /**
   * MedicinalProductIndication.implicitRules
   */
  implicitRules?: string;

  /**
   * MedicinalProductIndication.language
   */
  language?: string;

  /**
   * MedicinalProductIndication.text
   */
  text?: Narrative;

  /**
   * MedicinalProductIndication.contained
   */
  contained?: Resource[];

  /**
   * MedicinalProductIndication.extension
   */
  extension?: Extension[];

  /**
   * MedicinalProductIndication.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * MedicinalProductIndication.subject
   */
  subject?: Reference<MedicinalProduct | Medication>[];

  /**
   * MedicinalProductIndication.diseaseSymptomProcedure
   */
  diseaseSymptomProcedure?: CodeableConcept;

  /**
   * MedicinalProductIndication.diseaseStatus
   */
  diseaseStatus?: CodeableConcept;

  /**
   * MedicinalProductIndication.comorbidity
   */
  comorbidity?: CodeableConcept[];

  /**
   * MedicinalProductIndication.intendedEffect
   */
  intendedEffect?: CodeableConcept;

  /**
   * MedicinalProductIndication.duration
   */
  duration?: Quantity;

  /**
   * MedicinalProductIndication.otherTherapy
   */
  otherTherapy?: MedicinalProductIndicationOtherTherapy[];

  /**
   * MedicinalProductIndication.undesirableEffect
   */
  undesirableEffect?: Reference<MedicinalProductUndesirableEffect>[];

  /**
   * MedicinalProductIndication.population
   */
  population?: Population[];
}

/**
 * FHIR R4 MedicinalProductIndicationOtherTherapy
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface MedicinalProductIndicationOtherTherapy {

  /**
   * MedicinalProductIndication.otherTherapy.id
   */
  id?: string;

  /**
   * MedicinalProductIndication.otherTherapy.extension
   */
  extension?: Extension[];

  /**
   * MedicinalProductIndication.otherTherapy.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * MedicinalProductIndication.otherTherapy.therapyRelationshipType
   */
  therapyRelationshipType: CodeableConcept;

  /**
   * MedicinalProductIndication.otherTherapy.medication[x]
   */
  medicationCodeableConcept: CodeableConcept;

  /**
   * MedicinalProductIndication.otherTherapy.medication[x]
   */
  medicationReference: Reference<MedicinalProduct | Medication | Substance | SubstanceSpecification>;
}

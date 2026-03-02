import { CodeableConcept } from './CodeableConcept';
import { Extension } from './Extension';
import { Medication } from './Medication';
import { MedicinalProduct } from './MedicinalProduct';
import { MedicinalProductIndication } from './MedicinalProductIndication';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { Population } from './Population';
import { Reference } from './Reference';
import { Resource } from './Resource';
import { Substance } from './Substance';
import { SubstanceSpecification } from './SubstanceSpecification';

/**
 * FHIR R4 MedicinalProductContraindication
 * @see https://hl7.org/fhir/R4/medicinalproductcontraindication.html
 */
export interface MedicinalProductContraindication {

  /**
   * This is a MedicinalProductContraindication resource
   */
  readonly resourceType: 'MedicinalProductContraindication';

  /**
   * MedicinalProductContraindication.id
   */
  id?: string;

  /**
   * MedicinalProductContraindication.meta
   */
  meta?: Meta;

  /**
   * MedicinalProductContraindication.implicitRules
   */
  implicitRules?: string;

  /**
   * MedicinalProductContraindication.language
   */
  language?: string;

  /**
   * MedicinalProductContraindication.text
   */
  text?: Narrative;

  /**
   * MedicinalProductContraindication.contained
   */
  contained?: Resource[];

  /**
   * MedicinalProductContraindication.extension
   */
  extension?: Extension[];

  /**
   * MedicinalProductContraindication.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * MedicinalProductContraindication.subject
   */
  subject?: Reference<MedicinalProduct | Medication>[];

  /**
   * MedicinalProductContraindication.disease
   */
  disease?: CodeableConcept;

  /**
   * MedicinalProductContraindication.diseaseStatus
   */
  diseaseStatus?: CodeableConcept;

  /**
   * MedicinalProductContraindication.comorbidity
   */
  comorbidity?: CodeableConcept[];

  /**
   * MedicinalProductContraindication.therapeuticIndication
   */
  therapeuticIndication?: Reference<MedicinalProductIndication>[];

  /**
   * MedicinalProductContraindication.otherTherapy
   */
  otherTherapy?: MedicinalProductContraindicationOtherTherapy[];

  /**
   * MedicinalProductContraindication.population
   */
  population?: Population[];
}

/**
 * FHIR R4 MedicinalProductContraindicationOtherTherapy
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface MedicinalProductContraindicationOtherTherapy {

  /**
   * MedicinalProductContraindication.otherTherapy.id
   */
  id?: string;

  /**
   * MedicinalProductContraindication.otherTherapy.extension
   */
  extension?: Extension[];

  /**
   * MedicinalProductContraindication.otherTherapy.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * MedicinalProductContraindication.otherTherapy.therapyRelationshipType
   */
  therapyRelationshipType: CodeableConcept;

  /**
   * MedicinalProductContraindication.otherTherapy.medication[x]
   */
  medicationCodeableConcept: CodeableConcept;

  /**
   * MedicinalProductContraindication.otherTherapy.medication[x]
   */
  medicationReference: Reference<MedicinalProduct | Medication | Substance | SubstanceSpecification>;
}

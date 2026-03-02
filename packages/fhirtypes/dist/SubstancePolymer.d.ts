import { Attachment } from './Attachment';
import { CodeableConcept } from './CodeableConcept';
import { Extension } from './Extension';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { Resource } from './Resource';
import { SubstanceAmount } from './SubstanceAmount';

/**
 * FHIR R4 SubstancePolymer
 * @see https://hl7.org/fhir/R4/substancepolymer.html
 */
export interface SubstancePolymer {

  /**
   * This is a SubstancePolymer resource
   */
  readonly resourceType: 'SubstancePolymer';

  /**
   * SubstancePolymer.id
   */
  id?: string;

  /**
   * SubstancePolymer.meta
   */
  meta?: Meta;

  /**
   * SubstancePolymer.implicitRules
   */
  implicitRules?: string;

  /**
   * SubstancePolymer.language
   */
  language?: string;

  /**
   * SubstancePolymer.text
   */
  text?: Narrative;

  /**
   * SubstancePolymer.contained
   */
  contained?: Resource[];

  /**
   * SubstancePolymer.extension
   */
  extension?: Extension[];

  /**
   * SubstancePolymer.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * SubstancePolymer.class
   */
  class?: CodeableConcept;

  /**
   * SubstancePolymer.geometry
   */
  geometry?: CodeableConcept;

  /**
   * SubstancePolymer.copolymerConnectivity
   */
  copolymerConnectivity?: CodeableConcept[];

  /**
   * SubstancePolymer.modification
   */
  modification?: string[];

  /**
   * SubstancePolymer.monomerSet
   */
  monomerSet?: SubstancePolymerMonomerSet[];

  /**
   * SubstancePolymer.repeat
   */
  repeat?: SubstancePolymerRepeat[];
}

/**
 * FHIR R4 SubstancePolymerMonomerSet
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface SubstancePolymerMonomerSet {

  /**
   * SubstancePolymer.monomerSet.id
   */
  id?: string;

  /**
   * SubstancePolymer.monomerSet.extension
   */
  extension?: Extension[];

  /**
   * SubstancePolymer.monomerSet.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * SubstancePolymer.monomerSet.ratioType
   */
  ratioType?: CodeableConcept;

  /**
   * SubstancePolymer.monomerSet.startingMaterial
   */
  startingMaterial?: SubstancePolymerMonomerSetStartingMaterial[];
}

/**
 * FHIR R4 SubstancePolymerMonomerSetStartingMaterial
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface SubstancePolymerMonomerSetStartingMaterial {

  /**
   * SubstancePolymer.monomerSet.startingMaterial.id
   */
  id?: string;

  /**
   * SubstancePolymer.monomerSet.startingMaterial.extension
   */
  extension?: Extension[];

  /**
   * SubstancePolymer.monomerSet.startingMaterial.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * SubstancePolymer.monomerSet.startingMaterial.material
   */
  material?: CodeableConcept;

  /**
   * SubstancePolymer.monomerSet.startingMaterial.type
   */
  type?: CodeableConcept;

  /**
   * SubstancePolymer.monomerSet.startingMaterial.isDefining
   */
  isDefining?: boolean;

  /**
   * SubstancePolymer.monomerSet.startingMaterial.amount
   */
  amount?: SubstanceAmount;
}

/**
 * FHIR R4 SubstancePolymerRepeat
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface SubstancePolymerRepeat {

  /**
   * SubstancePolymer.repeat.id
   */
  id?: string;

  /**
   * SubstancePolymer.repeat.extension
   */
  extension?: Extension[];

  /**
   * SubstancePolymer.repeat.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * SubstancePolymer.repeat.numberOfUnits
   */
  numberOfUnits?: number;

  /**
   * SubstancePolymer.repeat.averageMolecularFormula
   */
  averageMolecularFormula?: string;

  /**
   * SubstancePolymer.repeat.repeatUnitAmountType
   */
  repeatUnitAmountType?: CodeableConcept;

  /**
   * SubstancePolymer.repeat.repeatUnit
   */
  repeatUnit?: SubstancePolymerRepeatRepeatUnit[];
}

/**
 * FHIR R4 SubstancePolymerRepeatRepeatUnit
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface SubstancePolymerRepeatRepeatUnit {

  /**
   * SubstancePolymer.repeat.repeatUnit.id
   */
  id?: string;

  /**
   * SubstancePolymer.repeat.repeatUnit.extension
   */
  extension?: Extension[];

  /**
   * SubstancePolymer.repeat.repeatUnit.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * SubstancePolymer.repeat.repeatUnit.orientationOfPolymerisation
   */
  orientationOfPolymerisation?: CodeableConcept;

  /**
   * SubstancePolymer.repeat.repeatUnit.repeatUnit
   */
  repeatUnit?: string;

  /**
   * SubstancePolymer.repeat.repeatUnit.amount
   */
  amount?: SubstanceAmount;

  /**
   * SubstancePolymer.repeat.repeatUnit.degreeOfPolymerisation
   */
  degreeOfPolymerisation?: SubstancePolymerRepeatRepeatUnitDegreeOfPolymerisation[];

  /**
   * SubstancePolymer.repeat.repeatUnit.structuralRepresentation
   */
  structuralRepresentation?: SubstancePolymerRepeatRepeatUnitStructuralRepresentation[];
}

/**
 * FHIR R4 SubstancePolymerRepeatRepeatUnitDegreeOfPolymerisation
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface SubstancePolymerRepeatRepeatUnitDegreeOfPolymerisation {

  /**
   * SubstancePolymer.repeat.repeatUnit.degreeOfPolymerisation.id
   */
  id?: string;

  /**
   * SubstancePolymer.repeat.repeatUnit.degreeOfPolymerisation.extension
   */
  extension?: Extension[];

  /**
   * SubstancePolymer.repeat.repeatUnit.degreeOfPolymerisation.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * SubstancePolymer.repeat.repeatUnit.degreeOfPolymerisation.degree
   */
  degree?: CodeableConcept;

  /**
   * SubstancePolymer.repeat.repeatUnit.degreeOfPolymerisation.amount
   */
  amount?: SubstanceAmount;
}

/**
 * FHIR R4 SubstancePolymerRepeatRepeatUnitStructuralRepresentation
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface SubstancePolymerRepeatRepeatUnitStructuralRepresentation {

  /**
   * SubstancePolymer.repeat.repeatUnit.structuralRepresentation.id
   */
  id?: string;

  /**
   * SubstancePolymer.repeat.repeatUnit.structuralRepresentation.extension
   */
  extension?: Extension[];

  /**
   * SubstancePolymer.repeat.repeatUnit.structuralRepresentation.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * SubstancePolymer.repeat.repeatUnit.structuralRepresentation.type
   */
  type?: CodeableConcept;

  /**
   * SubstancePolymer.repeat.repeatUnit.structuralRepresentation.representation
   */
  representation?: string;

  /**
   * SubstancePolymer.repeat.repeatUnit.structuralRepresentation.attachment
   */
  attachment?: Attachment;
}

import { CodeableConcept } from './CodeableConcept';
import { DocumentReference } from './DocumentReference';
import { Extension } from './Extension';
import { Identifier } from './Identifier';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { Quantity } from './Quantity';
import { Range } from './Range';
import { Reference } from './Reference';
import { Resource } from './Resource';

/**
 * FHIR R4 SubstanceReferenceInformation
 * @see https://hl7.org/fhir/R4/substancereferenceinformation.html
 */
export interface SubstanceReferenceInformation {

  /**
   * This is a SubstanceReferenceInformation resource
   */
  readonly resourceType: 'SubstanceReferenceInformation';

  /**
   * SubstanceReferenceInformation.id
   */
  id?: string;

  /**
   * SubstanceReferenceInformation.meta
   */
  meta?: Meta;

  /**
   * SubstanceReferenceInformation.implicitRules
   */
  implicitRules?: string;

  /**
   * SubstanceReferenceInformation.language
   */
  language?: string;

  /**
   * SubstanceReferenceInformation.text
   */
  text?: Narrative;

  /**
   * SubstanceReferenceInformation.contained
   */
  contained?: Resource[];

  /**
   * SubstanceReferenceInformation.extension
   */
  extension?: Extension[];

  /**
   * SubstanceReferenceInformation.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * SubstanceReferenceInformation.comment
   */
  comment?: string;

  /**
   * SubstanceReferenceInformation.gene
   */
  gene?: SubstanceReferenceInformationGene[];

  /**
   * SubstanceReferenceInformation.geneElement
   */
  geneElement?: SubstanceReferenceInformationGeneElement[];

  /**
   * SubstanceReferenceInformation.classification
   */
  classification?: SubstanceReferenceInformationClassification[];

  /**
   * SubstanceReferenceInformation.target
   */
  target?: SubstanceReferenceInformationTarget[];
}

/**
 * FHIR R4 SubstanceReferenceInformationClassification
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface SubstanceReferenceInformationClassification {

  /**
   * SubstanceReferenceInformation.classification.id
   */
  id?: string;

  /**
   * SubstanceReferenceInformation.classification.extension
   */
  extension?: Extension[];

  /**
   * SubstanceReferenceInformation.classification.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * SubstanceReferenceInformation.classification.domain
   */
  domain?: CodeableConcept;

  /**
   * SubstanceReferenceInformation.classification.classification
   */
  classification?: CodeableConcept;

  /**
   * SubstanceReferenceInformation.classification.subtype
   */
  subtype?: CodeableConcept[];

  /**
   * SubstanceReferenceInformation.classification.source
   */
  source?: Reference<DocumentReference>[];
}

/**
 * FHIR R4 SubstanceReferenceInformationGene
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface SubstanceReferenceInformationGene {

  /**
   * SubstanceReferenceInformation.gene.id
   */
  id?: string;

  /**
   * SubstanceReferenceInformation.gene.extension
   */
  extension?: Extension[];

  /**
   * SubstanceReferenceInformation.gene.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * SubstanceReferenceInformation.gene.geneSequenceOrigin
   */
  geneSequenceOrigin?: CodeableConcept;

  /**
   * SubstanceReferenceInformation.gene.gene
   */
  gene?: CodeableConcept;

  /**
   * SubstanceReferenceInformation.gene.source
   */
  source?: Reference<DocumentReference>[];
}

/**
 * FHIR R4 SubstanceReferenceInformationGeneElement
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface SubstanceReferenceInformationGeneElement {

  /**
   * SubstanceReferenceInformation.geneElement.id
   */
  id?: string;

  /**
   * SubstanceReferenceInformation.geneElement.extension
   */
  extension?: Extension[];

  /**
   * SubstanceReferenceInformation.geneElement.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * SubstanceReferenceInformation.geneElement.type
   */
  type?: CodeableConcept;

  /**
   * SubstanceReferenceInformation.geneElement.element
   */
  element?: Identifier;

  /**
   * SubstanceReferenceInformation.geneElement.source
   */
  source?: Reference<DocumentReference>[];
}

/**
 * FHIR R4 SubstanceReferenceInformationTarget
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface SubstanceReferenceInformationTarget {

  /**
   * SubstanceReferenceInformation.target.id
   */
  id?: string;

  /**
   * SubstanceReferenceInformation.target.extension
   */
  extension?: Extension[];

  /**
   * SubstanceReferenceInformation.target.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * SubstanceReferenceInformation.target.target
   */
  target?: Identifier;

  /**
   * SubstanceReferenceInformation.target.type
   */
  type?: CodeableConcept;

  /**
   * SubstanceReferenceInformation.target.interaction
   */
  interaction?: CodeableConcept;

  /**
   * SubstanceReferenceInformation.target.organism
   */
  organism?: CodeableConcept;

  /**
   * SubstanceReferenceInformation.target.organismType
   */
  organismType?: CodeableConcept;

  /**
   * SubstanceReferenceInformation.target.amount[x]
   */
  amountQuantity?: Quantity;

  /**
   * SubstanceReferenceInformation.target.amount[x]
   */
  amountRange?: Range;

  /**
   * SubstanceReferenceInformation.target.amount[x]
   */
  amountString?: string;

  /**
   * SubstanceReferenceInformation.target.amountType
   */
  amountType?: CodeableConcept;

  /**
   * SubstanceReferenceInformation.target.source
   */
  source?: Reference<DocumentReference>[];
}

import { Attachment } from './Attachment';
import { CodeableConcept } from './CodeableConcept';
import { DocumentReference } from './DocumentReference';
import { Extension } from './Extension';
import { Identifier } from './Identifier';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { Quantity } from './Quantity';
import { Range } from './Range';
import { Ratio } from './Ratio';
import { Reference } from './Reference';
import { Resource } from './Resource';
import { Substance } from './Substance';
import { SubstanceNucleicAcid } from './SubstanceNucleicAcid';
import { SubstancePolymer } from './SubstancePolymer';
import { SubstanceProtein } from './SubstanceProtein';
import { SubstanceReferenceInformation } from './SubstanceReferenceInformation';
import { SubstanceSourceMaterial } from './SubstanceSourceMaterial';

/**
 * FHIR R4 SubstanceSpecification
 * @see https://hl7.org/fhir/R4/substancespecification.html
 */
export interface SubstanceSpecification {

  /**
   * This is a SubstanceSpecification resource
   */
  readonly resourceType: 'SubstanceSpecification';

  /**
   * SubstanceSpecification.id
   */
  id?: string;

  /**
   * SubstanceSpecification.meta
   */
  meta?: Meta;

  /**
   * SubstanceSpecification.implicitRules
   */
  implicitRules?: string;

  /**
   * SubstanceSpecification.language
   */
  language?: string;

  /**
   * SubstanceSpecification.text
   */
  text?: Narrative;

  /**
   * SubstanceSpecification.contained
   */
  contained?: Resource[];

  /**
   * SubstanceSpecification.extension
   */
  extension?: Extension[];

  /**
   * SubstanceSpecification.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * SubstanceSpecification.identifier
   */
  identifier?: Identifier;

  /**
   * SubstanceSpecification.type
   */
  type?: CodeableConcept;

  /**
   * SubstanceSpecification.status
   */
  status?: CodeableConcept;

  /**
   * SubstanceSpecification.domain
   */
  domain?: CodeableConcept;

  /**
   * SubstanceSpecification.description
   */
  description?: string;

  /**
   * SubstanceSpecification.source
   */
  source?: Reference<DocumentReference>[];

  /**
   * SubstanceSpecification.comment
   */
  comment?: string;

  /**
   * SubstanceSpecification.moiety
   */
  moiety?: SubstanceSpecificationMoiety[];

  /**
   * SubstanceSpecification.property
   */
  property?: SubstanceSpecificationProperty[];

  /**
   * SubstanceSpecification.referenceInformation
   */
  referenceInformation?: Reference<SubstanceReferenceInformation>;

  /**
   * SubstanceSpecification.structure
   */
  structure?: SubstanceSpecificationStructure;

  /**
   * SubstanceSpecification.code
   */
  code?: SubstanceSpecificationCode[];

  /**
   * SubstanceSpecification.name
   */
  name?: SubstanceSpecificationName[];

  /**
   * SubstanceSpecification.relationship
   */
  relationship?: SubstanceSpecificationRelationship[];

  /**
   * SubstanceSpecification.nucleicAcid
   */
  nucleicAcid?: Reference<SubstanceNucleicAcid>;

  /**
   * SubstanceSpecification.polymer
   */
  polymer?: Reference<SubstancePolymer>;

  /**
   * SubstanceSpecification.protein
   */
  protein?: Reference<SubstanceProtein>;

  /**
   * SubstanceSpecification.sourceMaterial
   */
  sourceMaterial?: Reference<SubstanceSourceMaterial>;
}

/**
 * FHIR R4 SubstanceSpecificationCode
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface SubstanceSpecificationCode {

  /**
   * SubstanceSpecification.code.id
   */
  id?: string;

  /**
   * SubstanceSpecification.code.extension
   */
  extension?: Extension[];

  /**
   * SubstanceSpecification.code.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * SubstanceSpecification.code.code
   */
  code?: CodeableConcept;

  /**
   * SubstanceSpecification.code.status
   */
  status?: CodeableConcept;

  /**
   * SubstanceSpecification.code.statusDate
   */
  statusDate?: string;

  /**
   * SubstanceSpecification.code.comment
   */
  comment?: string;

  /**
   * SubstanceSpecification.code.source
   */
  source?: Reference<DocumentReference>[];
}

/**
 * FHIR R4 SubstanceSpecificationMoiety
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface SubstanceSpecificationMoiety {

  /**
   * SubstanceSpecification.moiety.id
   */
  id?: string;

  /**
   * SubstanceSpecification.moiety.extension
   */
  extension?: Extension[];

  /**
   * SubstanceSpecification.moiety.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * SubstanceSpecification.moiety.role
   */
  role?: CodeableConcept;

  /**
   * SubstanceSpecification.moiety.identifier
   */
  identifier?: Identifier;

  /**
   * SubstanceSpecification.moiety.name
   */
  name?: string;

  /**
   * SubstanceSpecification.moiety.stereochemistry
   */
  stereochemistry?: CodeableConcept;

  /**
   * SubstanceSpecification.moiety.opticalActivity
   */
  opticalActivity?: CodeableConcept;

  /**
   * SubstanceSpecification.moiety.molecularFormula
   */
  molecularFormula?: string;

  /**
   * SubstanceSpecification.moiety.amount[x]
   */
  amountQuantity?: Quantity;

  /**
   * SubstanceSpecification.moiety.amount[x]
   */
  amountString?: string;
}

/**
 * FHIR R4 SubstanceSpecificationName
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface SubstanceSpecificationName {

  /**
   * SubstanceSpecification.name.id
   */
  id?: string;

  /**
   * SubstanceSpecification.name.extension
   */
  extension?: Extension[];

  /**
   * SubstanceSpecification.name.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * SubstanceSpecification.name.name
   */
  name: string;

  /**
   * SubstanceSpecification.name.type
   */
  type?: CodeableConcept;

  /**
   * SubstanceSpecification.name.status
   */
  status?: CodeableConcept;

  /**
   * SubstanceSpecification.name.preferred
   */
  preferred?: boolean;

  /**
   * SubstanceSpecification.name.language
   */
  language?: CodeableConcept[];

  /**
   * SubstanceSpecification.name.domain
   */
  domain?: CodeableConcept[];

  /**
   * SubstanceSpecification.name.jurisdiction
   */
  jurisdiction?: CodeableConcept[];

  /**
   * SubstanceSpecification.name.official
   */
  official?: SubstanceSpecificationNameOfficial[];

  /**
   * SubstanceSpecification.name.source
   */
  source?: Reference<DocumentReference>[];
}

/**
 * FHIR R4 SubstanceSpecificationNameOfficial
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface SubstanceSpecificationNameOfficial {

  /**
   * SubstanceSpecification.name.official.id
   */
  id?: string;

  /**
   * SubstanceSpecification.name.official.extension
   */
  extension?: Extension[];

  /**
   * SubstanceSpecification.name.official.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * SubstanceSpecification.name.official.authority
   */
  authority?: CodeableConcept;

  /**
   * SubstanceSpecification.name.official.status
   */
  status?: CodeableConcept;

  /**
   * SubstanceSpecification.name.official.date
   */
  date?: string;
}

/**
 * FHIR R4 SubstanceSpecificationProperty
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface SubstanceSpecificationProperty {

  /**
   * SubstanceSpecification.property.id
   */
  id?: string;

  /**
   * SubstanceSpecification.property.extension
   */
  extension?: Extension[];

  /**
   * SubstanceSpecification.property.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * SubstanceSpecification.property.category
   */
  category?: CodeableConcept;

  /**
   * SubstanceSpecification.property.code
   */
  code?: CodeableConcept;

  /**
   * SubstanceSpecification.property.parameters
   */
  parameters?: string;

  /**
   * SubstanceSpecification.property.definingSubstance[x]
   */
  definingSubstanceReference?: Reference<SubstanceSpecification | Substance>;

  /**
   * SubstanceSpecification.property.definingSubstance[x]
   */
  definingSubstanceCodeableConcept?: CodeableConcept;

  /**
   * SubstanceSpecification.property.amount[x]
   */
  amountQuantity?: Quantity;

  /**
   * SubstanceSpecification.property.amount[x]
   */
  amountString?: string;
}

/**
 * FHIR R4 SubstanceSpecificationRelationship
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface SubstanceSpecificationRelationship {

  /**
   * SubstanceSpecification.relationship.id
   */
  id?: string;

  /**
   * SubstanceSpecification.relationship.extension
   */
  extension?: Extension[];

  /**
   * SubstanceSpecification.relationship.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * SubstanceSpecification.relationship.substance[x]
   */
  substanceReference?: Reference<SubstanceSpecification>;

  /**
   * SubstanceSpecification.relationship.substance[x]
   */
  substanceCodeableConcept?: CodeableConcept;

  /**
   * SubstanceSpecification.relationship.relationship
   */
  relationship?: CodeableConcept;

  /**
   * SubstanceSpecification.relationship.isDefining
   */
  isDefining?: boolean;

  /**
   * SubstanceSpecification.relationship.amount[x]
   */
  amountQuantity?: Quantity;

  /**
   * SubstanceSpecification.relationship.amount[x]
   */
  amountRange?: Range;

  /**
   * SubstanceSpecification.relationship.amount[x]
   */
  amountRatio?: Ratio;

  /**
   * SubstanceSpecification.relationship.amount[x]
   */
  amountString?: string;

  /**
   * SubstanceSpecification.relationship.amountRatioLowLimit
   */
  amountRatioLowLimit?: Ratio;

  /**
   * SubstanceSpecification.relationship.amountType
   */
  amountType?: CodeableConcept;

  /**
   * SubstanceSpecification.relationship.source
   */
  source?: Reference<DocumentReference>[];
}

/**
 * FHIR R4 SubstanceSpecificationStructure
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface SubstanceSpecificationStructure {

  /**
   * SubstanceSpecification.structure.id
   */
  id?: string;

  /**
   * SubstanceSpecification.structure.extension
   */
  extension?: Extension[];

  /**
   * SubstanceSpecification.structure.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * SubstanceSpecification.structure.stereochemistry
   */
  stereochemistry?: CodeableConcept;

  /**
   * SubstanceSpecification.structure.opticalActivity
   */
  opticalActivity?: CodeableConcept;

  /**
   * SubstanceSpecification.structure.molecularFormula
   */
  molecularFormula?: string;

  /**
   * SubstanceSpecification.structure.molecularFormulaByMoiety
   */
  molecularFormulaByMoiety?: string;

  /**
   * SubstanceSpecification.structure.isotope
   */
  isotope?: SubstanceSpecificationStructureIsotope[];

  /**
   * SubstanceSpecification.structure.source
   */
  source?: Reference<DocumentReference>[];

  /**
   * SubstanceSpecification.structure.representation
   */
  representation?: SubstanceSpecificationStructureRepresentation[];
}

/**
 * FHIR R4 SubstanceSpecificationStructureIsotope
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface SubstanceSpecificationStructureIsotope {

  /**
   * SubstanceSpecification.structure.isotope.id
   */
  id?: string;

  /**
   * SubstanceSpecification.structure.isotope.extension
   */
  extension?: Extension[];

  /**
   * SubstanceSpecification.structure.isotope.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * SubstanceSpecification.structure.isotope.identifier
   */
  identifier?: Identifier;

  /**
   * SubstanceSpecification.structure.isotope.name
   */
  name?: CodeableConcept;

  /**
   * SubstanceSpecification.structure.isotope.substitution
   */
  substitution?: CodeableConcept;

  /**
   * SubstanceSpecification.structure.isotope.halfLife
   */
  halfLife?: Quantity;

  /**
   * SubstanceSpecification.structure.isotope.molecularWeight
   */
  molecularWeight?: SubstanceSpecificationStructureIsotopeMolecularWeight;
}

/**
 * FHIR R4 SubstanceSpecificationStructureIsotopeMolecularWeight
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface SubstanceSpecificationStructureIsotopeMolecularWeight {

  /**
   * SubstanceSpecification.structure.isotope.molecularWeight.id
   */
  id?: string;

  /**
   * SubstanceSpecification.structure.isotope.molecularWeight.extension
   */
  extension?: Extension[];

  /**
   * SubstanceSpecification.structure.isotope.molecularWeight.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * SubstanceSpecification.structure.isotope.molecularWeight.method
   */
  method?: CodeableConcept;

  /**
   * SubstanceSpecification.structure.isotope.molecularWeight.type
   */
  type?: CodeableConcept;

  /**
   * SubstanceSpecification.structure.isotope.molecularWeight.amount
   */
  amount?: Quantity;
}

/**
 * FHIR R4 SubstanceSpecificationStructureRepresentation
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface SubstanceSpecificationStructureRepresentation {

  /**
   * SubstanceSpecification.structure.representation.id
   */
  id?: string;

  /**
   * SubstanceSpecification.structure.representation.extension
   */
  extension?: Extension[];

  /**
   * SubstanceSpecification.structure.representation.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * SubstanceSpecification.structure.representation.type
   */
  type?: CodeableConcept;

  /**
   * SubstanceSpecification.structure.representation.representation
   */
  representation?: string;

  /**
   * SubstanceSpecification.structure.representation.attachment
   */
  attachment?: Attachment;
}

import { CodeableConcept } from './CodeableConcept';
import { Extension } from './Extension';
import { Identifier } from './Identifier';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { Resource } from './Resource';

/**
 * FHIR R4 SubstanceSourceMaterial
 * @see https://hl7.org/fhir/R4/substancesourcematerial.html
 */
export interface SubstanceSourceMaterial {

  /**
   * This is a SubstanceSourceMaterial resource
   */
  readonly resourceType: 'SubstanceSourceMaterial';

  /**
   * SubstanceSourceMaterial.id
   */
  id?: string;

  /**
   * SubstanceSourceMaterial.meta
   */
  meta?: Meta;

  /**
   * SubstanceSourceMaterial.implicitRules
   */
  implicitRules?: string;

  /**
   * SubstanceSourceMaterial.language
   */
  language?: string;

  /**
   * SubstanceSourceMaterial.text
   */
  text?: Narrative;

  /**
   * SubstanceSourceMaterial.contained
   */
  contained?: Resource[];

  /**
   * SubstanceSourceMaterial.extension
   */
  extension?: Extension[];

  /**
   * SubstanceSourceMaterial.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * SubstanceSourceMaterial.sourceMaterialClass
   */
  sourceMaterialClass?: CodeableConcept;

  /**
   * SubstanceSourceMaterial.sourceMaterialType
   */
  sourceMaterialType?: CodeableConcept;

  /**
   * SubstanceSourceMaterial.sourceMaterialState
   */
  sourceMaterialState?: CodeableConcept;

  /**
   * SubstanceSourceMaterial.organismId
   */
  organismId?: Identifier;

  /**
   * SubstanceSourceMaterial.organismName
   */
  organismName?: string;

  /**
   * SubstanceSourceMaterial.parentSubstanceId
   */
  parentSubstanceId?: Identifier[];

  /**
   * SubstanceSourceMaterial.parentSubstanceName
   */
  parentSubstanceName?: string[];

  /**
   * SubstanceSourceMaterial.countryOfOrigin
   */
  countryOfOrigin?: CodeableConcept[];

  /**
   * SubstanceSourceMaterial.geographicalLocation
   */
  geographicalLocation?: string[];

  /**
   * SubstanceSourceMaterial.developmentStage
   */
  developmentStage?: CodeableConcept;

  /**
   * SubstanceSourceMaterial.fractionDescription
   */
  fractionDescription?: SubstanceSourceMaterialFractionDescription[];

  /**
   * SubstanceSourceMaterial.organism
   */
  organism?: SubstanceSourceMaterialOrganism;

  /**
   * SubstanceSourceMaterial.partDescription
   */
  partDescription?: SubstanceSourceMaterialPartDescription[];
}

/**
 * FHIR R4 SubstanceSourceMaterialFractionDescription
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface SubstanceSourceMaterialFractionDescription {

  /**
   * SubstanceSourceMaterial.fractionDescription.id
   */
  id?: string;

  /**
   * SubstanceSourceMaterial.fractionDescription.extension
   */
  extension?: Extension[];

  /**
   * SubstanceSourceMaterial.fractionDescription.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * SubstanceSourceMaterial.fractionDescription.fraction
   */
  fraction?: string;

  /**
   * SubstanceSourceMaterial.fractionDescription.materialType
   */
  materialType?: CodeableConcept;
}

/**
 * FHIR R4 SubstanceSourceMaterialOrganism
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface SubstanceSourceMaterialOrganism {

  /**
   * SubstanceSourceMaterial.organism.id
   */
  id?: string;

  /**
   * SubstanceSourceMaterial.organism.extension
   */
  extension?: Extension[];

  /**
   * SubstanceSourceMaterial.organism.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * SubstanceSourceMaterial.organism.family
   */
  family?: CodeableConcept;

  /**
   * SubstanceSourceMaterial.organism.genus
   */
  genus?: CodeableConcept;

  /**
   * SubstanceSourceMaterial.organism.species
   */
  species?: CodeableConcept;

  /**
   * SubstanceSourceMaterial.organism.intraspecificType
   */
  intraspecificType?: CodeableConcept;

  /**
   * SubstanceSourceMaterial.organism.intraspecificDescription
   */
  intraspecificDescription?: string;

  /**
   * SubstanceSourceMaterial.organism.author
   */
  author?: SubstanceSourceMaterialOrganismAuthor[];

  /**
   * SubstanceSourceMaterial.organism.hybrid
   */
  hybrid?: SubstanceSourceMaterialOrganismHybrid;

  /**
   * SubstanceSourceMaterial.organism.organismGeneral
   */
  organismGeneral?: SubstanceSourceMaterialOrganismOrganismGeneral;
}

/**
 * FHIR R4 SubstanceSourceMaterialOrganismAuthor
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface SubstanceSourceMaterialOrganismAuthor {

  /**
   * SubstanceSourceMaterial.organism.author.id
   */
  id?: string;

  /**
   * SubstanceSourceMaterial.organism.author.extension
   */
  extension?: Extension[];

  /**
   * SubstanceSourceMaterial.organism.author.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * SubstanceSourceMaterial.organism.author.authorType
   */
  authorType?: CodeableConcept;

  /**
   * SubstanceSourceMaterial.organism.author.authorDescription
   */
  authorDescription?: string;
}

/**
 * FHIR R4 SubstanceSourceMaterialOrganismHybrid
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface SubstanceSourceMaterialOrganismHybrid {

  /**
   * SubstanceSourceMaterial.organism.hybrid.id
   */
  id?: string;

  /**
   * SubstanceSourceMaterial.organism.hybrid.extension
   */
  extension?: Extension[];

  /**
   * SubstanceSourceMaterial.organism.hybrid.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * SubstanceSourceMaterial.organism.hybrid.maternalOrganismId
   */
  maternalOrganismId?: string;

  /**
   * SubstanceSourceMaterial.organism.hybrid.maternalOrganismName
   */
  maternalOrganismName?: string;

  /**
   * SubstanceSourceMaterial.organism.hybrid.paternalOrganismId
   */
  paternalOrganismId?: string;

  /**
   * SubstanceSourceMaterial.organism.hybrid.paternalOrganismName
   */
  paternalOrganismName?: string;

  /**
   * SubstanceSourceMaterial.organism.hybrid.hybridType
   */
  hybridType?: CodeableConcept;
}

/**
 * FHIR R4 SubstanceSourceMaterialOrganismOrganismGeneral
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface SubstanceSourceMaterialOrganismOrganismGeneral {

  /**
   * SubstanceSourceMaterial.organism.organismGeneral.id
   */
  id?: string;

  /**
   * SubstanceSourceMaterial.organism.organismGeneral.extension
   */
  extension?: Extension[];

  /**
   * SubstanceSourceMaterial.organism.organismGeneral.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * SubstanceSourceMaterial.organism.organismGeneral.kingdom
   */
  kingdom?: CodeableConcept;

  /**
   * SubstanceSourceMaterial.organism.organismGeneral.phylum
   */
  phylum?: CodeableConcept;

  /**
   * SubstanceSourceMaterial.organism.organismGeneral.class
   */
  class?: CodeableConcept;

  /**
   * SubstanceSourceMaterial.organism.organismGeneral.order
   */
  order?: CodeableConcept;
}

/**
 * FHIR R4 SubstanceSourceMaterialPartDescription
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface SubstanceSourceMaterialPartDescription {

  /**
   * SubstanceSourceMaterial.partDescription.id
   */
  id?: string;

  /**
   * SubstanceSourceMaterial.partDescription.extension
   */
  extension?: Extension[];

  /**
   * SubstanceSourceMaterial.partDescription.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * SubstanceSourceMaterial.partDescription.part
   */
  part?: CodeableConcept;

  /**
   * SubstanceSourceMaterial.partDescription.partLocation
   */
  partLocation?: CodeableConcept;
}

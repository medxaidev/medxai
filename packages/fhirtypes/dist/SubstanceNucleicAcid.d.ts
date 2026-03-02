import { Attachment } from './Attachment';
import { CodeableConcept } from './CodeableConcept';
import { Extension } from './Extension';
import { Identifier } from './Identifier';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { Resource } from './Resource';

/**
 * FHIR R4 SubstanceNucleicAcid
 * @see https://hl7.org/fhir/R4/substancenucleicacid.html
 */
export interface SubstanceNucleicAcid {

  /**
   * This is a SubstanceNucleicAcid resource
   */
  readonly resourceType: 'SubstanceNucleicAcid';

  /**
   * SubstanceNucleicAcid.id
   */
  id?: string;

  /**
   * SubstanceNucleicAcid.meta
   */
  meta?: Meta;

  /**
   * SubstanceNucleicAcid.implicitRules
   */
  implicitRules?: string;

  /**
   * SubstanceNucleicAcid.language
   */
  language?: string;

  /**
   * SubstanceNucleicAcid.text
   */
  text?: Narrative;

  /**
   * SubstanceNucleicAcid.contained
   */
  contained?: Resource[];

  /**
   * SubstanceNucleicAcid.extension
   */
  extension?: Extension[];

  /**
   * SubstanceNucleicAcid.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * SubstanceNucleicAcid.sequenceType
   */
  sequenceType?: CodeableConcept;

  /**
   * SubstanceNucleicAcid.numberOfSubunits
   */
  numberOfSubunits?: number;

  /**
   * SubstanceNucleicAcid.areaOfHybridisation
   */
  areaOfHybridisation?: string;

  /**
   * SubstanceNucleicAcid.oligoNucleotideType
   */
  oligoNucleotideType?: CodeableConcept;

  /**
   * SubstanceNucleicAcid.subunit
   */
  subunit?: SubstanceNucleicAcidSubunit[];
}

/**
 * FHIR R4 SubstanceNucleicAcidSubunit
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface SubstanceNucleicAcidSubunit {

  /**
   * SubstanceNucleicAcid.subunit.id
   */
  id?: string;

  /**
   * SubstanceNucleicAcid.subunit.extension
   */
  extension?: Extension[];

  /**
   * SubstanceNucleicAcid.subunit.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * SubstanceNucleicAcid.subunit.subunit
   */
  subunit?: number;

  /**
   * SubstanceNucleicAcid.subunit.sequence
   */
  sequence?: string;

  /**
   * SubstanceNucleicAcid.subunit.length
   */
  length?: number;

  /**
   * SubstanceNucleicAcid.subunit.sequenceAttachment
   */
  sequenceAttachment?: Attachment;

  /**
   * SubstanceNucleicAcid.subunit.fivePrime
   */
  fivePrime?: CodeableConcept;

  /**
   * SubstanceNucleicAcid.subunit.threePrime
   */
  threePrime?: CodeableConcept;

  /**
   * SubstanceNucleicAcid.subunit.linkage
   */
  linkage?: SubstanceNucleicAcidSubunitLinkage[];

  /**
   * SubstanceNucleicAcid.subunit.sugar
   */
  sugar?: SubstanceNucleicAcidSubunitSugar[];
}

/**
 * FHIR R4 SubstanceNucleicAcidSubunitLinkage
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface SubstanceNucleicAcidSubunitLinkage {

  /**
   * SubstanceNucleicAcid.subunit.linkage.id
   */
  id?: string;

  /**
   * SubstanceNucleicAcid.subunit.linkage.extension
   */
  extension?: Extension[];

  /**
   * SubstanceNucleicAcid.subunit.linkage.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * SubstanceNucleicAcid.subunit.linkage.connectivity
   */
  connectivity?: string;

  /**
   * SubstanceNucleicAcid.subunit.linkage.identifier
   */
  identifier?: Identifier;

  /**
   * SubstanceNucleicAcid.subunit.linkage.name
   */
  name?: string;

  /**
   * SubstanceNucleicAcid.subunit.linkage.residueSite
   */
  residueSite?: string;
}

/**
 * FHIR R4 SubstanceNucleicAcidSubunitSugar
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface SubstanceNucleicAcidSubunitSugar {

  /**
   * SubstanceNucleicAcid.subunit.sugar.id
   */
  id?: string;

  /**
   * SubstanceNucleicAcid.subunit.sugar.extension
   */
  extension?: Extension[];

  /**
   * SubstanceNucleicAcid.subunit.sugar.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * SubstanceNucleicAcid.subunit.sugar.identifier
   */
  identifier?: Identifier;

  /**
   * SubstanceNucleicAcid.subunit.sugar.name
   */
  name?: string;

  /**
   * SubstanceNucleicAcid.subunit.sugar.residueSite
   */
  residueSite?: string;
}

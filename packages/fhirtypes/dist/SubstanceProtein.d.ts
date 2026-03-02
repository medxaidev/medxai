import { Attachment } from './Attachment';
import { CodeableConcept } from './CodeableConcept';
import { Extension } from './Extension';
import { Identifier } from './Identifier';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { Resource } from './Resource';

/**
 * FHIR R4 SubstanceProtein
 * @see https://hl7.org/fhir/R4/substanceprotein.html
 */
export interface SubstanceProtein {

  /**
   * This is a SubstanceProtein resource
   */
  readonly resourceType: 'SubstanceProtein';

  /**
   * SubstanceProtein.id
   */
  id?: string;

  /**
   * SubstanceProtein.meta
   */
  meta?: Meta;

  /**
   * SubstanceProtein.implicitRules
   */
  implicitRules?: string;

  /**
   * SubstanceProtein.language
   */
  language?: string;

  /**
   * SubstanceProtein.text
   */
  text?: Narrative;

  /**
   * SubstanceProtein.contained
   */
  contained?: Resource[];

  /**
   * SubstanceProtein.extension
   */
  extension?: Extension[];

  /**
   * SubstanceProtein.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * SubstanceProtein.sequenceType
   */
  sequenceType?: CodeableConcept;

  /**
   * SubstanceProtein.numberOfSubunits
   */
  numberOfSubunits?: number;

  /**
   * SubstanceProtein.disulfideLinkage
   */
  disulfideLinkage?: string[];

  /**
   * SubstanceProtein.subunit
   */
  subunit?: SubstanceProteinSubunit[];
}

/**
 * FHIR R4 SubstanceProteinSubunit
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface SubstanceProteinSubunit {

  /**
   * SubstanceProtein.subunit.id
   */
  id?: string;

  /**
   * SubstanceProtein.subunit.extension
   */
  extension?: Extension[];

  /**
   * SubstanceProtein.subunit.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * SubstanceProtein.subunit.subunit
   */
  subunit?: number;

  /**
   * SubstanceProtein.subunit.sequence
   */
  sequence?: string;

  /**
   * SubstanceProtein.subunit.length
   */
  length?: number;

  /**
   * SubstanceProtein.subunit.sequenceAttachment
   */
  sequenceAttachment?: Attachment;

  /**
   * SubstanceProtein.subunit.nTerminalModificationId
   */
  nTerminalModificationId?: Identifier;

  /**
   * SubstanceProtein.subunit.nTerminalModification
   */
  nTerminalModification?: string;

  /**
   * SubstanceProtein.subunit.cTerminalModificationId
   */
  cTerminalModificationId?: Identifier;

  /**
   * SubstanceProtein.subunit.cTerminalModification
   */
  cTerminalModification?: string;
}

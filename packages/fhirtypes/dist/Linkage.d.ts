import { Extension } from './Extension';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { Organization } from './Organization';
import { Practitioner } from './Practitioner';
import { PractitionerRole } from './PractitionerRole';
import { Reference } from './Reference';
import { Resource } from './Resource';

/**
 * FHIR R4 Linkage
 * @see https://hl7.org/fhir/R4/linkage.html
 */
export interface Linkage {

  /**
   * This is a Linkage resource
   */
  readonly resourceType: 'Linkage';

  /**
   * Linkage.id
   */
  id?: string;

  /**
   * Linkage.meta
   */
  meta?: Meta;

  /**
   * Linkage.implicitRules
   */
  implicitRules?: string;

  /**
   * Linkage.language
   */
  language?: string;

  /**
   * Linkage.text
   */
  text?: Narrative;

  /**
   * Linkage.contained
   */
  contained?: Resource[];

  /**
   * Linkage.extension
   */
  extension?: Extension[];

  /**
   * Linkage.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Linkage.active
   */
  active?: boolean;

  /**
   * Linkage.author
   */
  author?: Reference<Practitioner | PractitionerRole | Organization>;

  /**
   * Linkage.item
   */
  item: LinkageItem[];
}

/**
 * FHIR R4 LinkageItem
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface LinkageItem {

  /**
   * Linkage.item.id
   */
  id?: string;

  /**
   * Linkage.item.extension
   */
  extension?: Extension[];

  /**
   * Linkage.item.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Linkage.item.type
   */
  type: string;

  /**
   * Linkage.item.resource
   */
  resource: Reference;
}

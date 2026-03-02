import { CodeableConcept } from './CodeableConcept';
import { Device } from './Device';
import { Extension } from './Extension';
import { Group } from './Group';
import { Identifier } from './Identifier';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { Organization } from './Organization';
import { Patient } from './Patient';
import { Practitioner } from './Practitioner';
import { PractitionerRole } from './PractitionerRole';
import { Reference } from './Reference';
import { RelatedPerson } from './RelatedPerson';
import { Resource } from './Resource';

/**
 * FHIR R4 DocumentManifest
 * @see https://hl7.org/fhir/R4/documentmanifest.html
 */
export interface DocumentManifest {

  /**
   * This is a DocumentManifest resource
   */
  readonly resourceType: 'DocumentManifest';

  /**
   * DocumentManifest.id
   */
  id?: string;

  /**
   * DocumentManifest.meta
   */
  meta?: Meta;

  /**
   * DocumentManifest.implicitRules
   */
  implicitRules?: string;

  /**
   * DocumentManifest.language
   */
  language?: string;

  /**
   * DocumentManifest.text
   */
  text?: Narrative;

  /**
   * DocumentManifest.contained
   */
  contained?: Resource[];

  /**
   * DocumentManifest.extension
   */
  extension?: Extension[];

  /**
   * DocumentManifest.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * DocumentManifest.masterIdentifier
   */
  masterIdentifier?: Identifier;

  /**
   * DocumentManifest.identifier
   */
  identifier?: Identifier[];

  /**
   * DocumentManifest.status
   */
  status: 'current' | 'superseded' | 'entered-in-error';

  /**
   * DocumentManifest.type
   */
  type?: CodeableConcept;

  /**
   * DocumentManifest.subject
   */
  subject?: Reference<Patient | Practitioner | Group | Device>;

  /**
   * DocumentManifest.created
   */
  created?: string;

  /**
   * DocumentManifest.author
   */
  author?: Reference<Practitioner | PractitionerRole | Organization | Device | Patient | RelatedPerson>[];

  /**
   * DocumentManifest.recipient
   */
  recipient?: Reference<Patient | Practitioner | PractitionerRole | RelatedPerson | Organization>[];

  /**
   * DocumentManifest.source
   */
  source?: string;

  /**
   * DocumentManifest.description
   */
  description?: string;

  /**
   * DocumentManifest.content
   */
  content: Reference[];

  /**
   * DocumentManifest.related
   */
  related?: DocumentManifestRelated[];
}

/**
 * FHIR R4 DocumentManifestRelated
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface DocumentManifestRelated {

  /**
   * DocumentManifest.related.id
   */
  id?: string;

  /**
   * DocumentManifest.related.extension
   */
  extension?: Extension[];

  /**
   * DocumentManifest.related.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * DocumentManifest.related.identifier
   */
  identifier?: Identifier;

  /**
   * DocumentManifest.related.ref
   */
  ref?: Reference;
}

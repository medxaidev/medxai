import { ActivityDefinition } from './ActivityDefinition';
import { Binary } from './Binary';
import { CodeableConcept } from './CodeableConcept';
import { Device } from './Device';
import { Extension } from './Extension';
import { HealthcareService } from './HealthcareService';
import { Identifier } from './Identifier';
import { Medication } from './Medication';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { ObservationDefinition } from './ObservationDefinition';
import { Organization } from './Organization';
import { Period } from './Period';
import { PlanDefinition } from './PlanDefinition';
import { Practitioner } from './Practitioner';
import { PractitionerRole } from './PractitionerRole';
import { Reference } from './Reference';
import { Resource } from './Resource';
import { SpecimenDefinition } from './SpecimenDefinition';

/**
 * FHIR R4 CatalogEntry
 * @see https://hl7.org/fhir/R4/catalogentry.html
 */
export interface CatalogEntry {

  /**
   * This is a CatalogEntry resource
   */
  readonly resourceType: 'CatalogEntry';

  /**
   * CatalogEntry.id
   */
  id?: string;

  /**
   * CatalogEntry.meta
   */
  meta?: Meta;

  /**
   * CatalogEntry.implicitRules
   */
  implicitRules?: string;

  /**
   * CatalogEntry.language
   */
  language?: string;

  /**
   * CatalogEntry.text
   */
  text?: Narrative;

  /**
   * CatalogEntry.contained
   */
  contained?: Resource[];

  /**
   * CatalogEntry.extension
   */
  extension?: Extension[];

  /**
   * CatalogEntry.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * CatalogEntry.identifier
   */
  identifier?: Identifier[];

  /**
   * CatalogEntry.type
   */
  type?: CodeableConcept;

  /**
   * CatalogEntry.orderable
   */
  orderable: boolean;

  /**
   * CatalogEntry.referencedItem
   */
  referencedItem: Reference<Medication | Device | Organization | Practitioner | PractitionerRole | HealthcareService | ActivityDefinition | PlanDefinition | SpecimenDefinition | ObservationDefinition | Binary>;

  /**
   * CatalogEntry.additionalIdentifier
   */
  additionalIdentifier?: Identifier[];

  /**
   * CatalogEntry.classification
   */
  classification?: CodeableConcept[];

  /**
   * CatalogEntry.status
   */
  status?: 'draft' | 'active' | 'retired' | 'unknown';

  /**
   * CatalogEntry.validityPeriod
   */
  validityPeriod?: Period;

  /**
   * CatalogEntry.validTo
   */
  validTo?: string;

  /**
   * CatalogEntry.lastUpdated
   */
  lastUpdated?: string;

  /**
   * CatalogEntry.additionalCharacteristic
   */
  additionalCharacteristic?: CodeableConcept[];

  /**
   * CatalogEntry.additionalClassification
   */
  additionalClassification?: CodeableConcept[];

  /**
   * CatalogEntry.relatedEntry
   */
  relatedEntry?: CatalogEntryRelatedEntry[];
}

/**
 * FHIR R4 CatalogEntryRelatedEntry
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface CatalogEntryRelatedEntry {

  /**
   * CatalogEntry.relatedEntry.id
   */
  id?: string;

  /**
   * CatalogEntry.relatedEntry.extension
   */
  extension?: Extension[];

  /**
   * CatalogEntry.relatedEntry.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * CatalogEntry.relatedEntry.relationtype
   */
  relationtype: string;

  /**
   * CatalogEntry.relatedEntry.item
   */
  item: Reference<CatalogEntry>;
}

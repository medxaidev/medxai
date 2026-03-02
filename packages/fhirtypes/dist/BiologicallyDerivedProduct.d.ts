import { CodeableConcept } from './CodeableConcept';
import { Extension } from './Extension';
import { Identifier } from './Identifier';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { Organization } from './Organization';
import { Patient } from './Patient';
import { Period } from './Period';
import { Practitioner } from './Practitioner';
import { PractitionerRole } from './PractitionerRole';
import { Reference } from './Reference';
import { Resource } from './Resource';
import { ServiceRequest } from './ServiceRequest';
import { Substance } from './Substance';

/**
 * FHIR R4 BiologicallyDerivedProduct
 * @see https://hl7.org/fhir/R4/biologicallyderivedproduct.html
 */
export interface BiologicallyDerivedProduct {

  /**
   * This is a BiologicallyDerivedProduct resource
   */
  readonly resourceType: 'BiologicallyDerivedProduct';

  /**
   * BiologicallyDerivedProduct.id
   */
  id?: string;

  /**
   * BiologicallyDerivedProduct.meta
   */
  meta?: Meta;

  /**
   * BiologicallyDerivedProduct.implicitRules
   */
  implicitRules?: string;

  /**
   * BiologicallyDerivedProduct.language
   */
  language?: string;

  /**
   * BiologicallyDerivedProduct.text
   */
  text?: Narrative;

  /**
   * BiologicallyDerivedProduct.contained
   */
  contained?: Resource[];

  /**
   * BiologicallyDerivedProduct.extension
   */
  extension?: Extension[];

  /**
   * BiologicallyDerivedProduct.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * BiologicallyDerivedProduct.identifier
   */
  identifier?: Identifier[];

  /**
   * BiologicallyDerivedProduct.productCategory
   */
  productCategory?: string;

  /**
   * BiologicallyDerivedProduct.productCode
   */
  productCode?: CodeableConcept;

  /**
   * BiologicallyDerivedProduct.status
   */
  status?: string;

  /**
   * BiologicallyDerivedProduct.request
   */
  request?: Reference<ServiceRequest>[];

  /**
   * BiologicallyDerivedProduct.quantity
   */
  quantity?: number;

  /**
   * BiologicallyDerivedProduct.parent
   */
  parent?: Reference<BiologicallyDerivedProduct>[];

  /**
   * BiologicallyDerivedProduct.collection
   */
  collection?: BiologicallyDerivedProductCollection;

  /**
   * BiologicallyDerivedProduct.processing
   */
  processing?: BiologicallyDerivedProductProcessing[];

  /**
   * BiologicallyDerivedProduct.manipulation
   */
  manipulation?: BiologicallyDerivedProductManipulation;

  /**
   * BiologicallyDerivedProduct.storage
   */
  storage?: BiologicallyDerivedProductStorage[];
}

/**
 * FHIR R4 BiologicallyDerivedProductCollection
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface BiologicallyDerivedProductCollection {

  /**
   * BiologicallyDerivedProduct.collection.id
   */
  id?: string;

  /**
   * BiologicallyDerivedProduct.collection.extension
   */
  extension?: Extension[];

  /**
   * BiologicallyDerivedProduct.collection.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * BiologicallyDerivedProduct.collection.collector
   */
  collector?: Reference<Practitioner | PractitionerRole>;

  /**
   * BiologicallyDerivedProduct.collection.source
   */
  source?: Reference<Patient | Organization>;

  /**
   * BiologicallyDerivedProduct.collection.collected[x]
   */
  collectedDateTime?: string;

  /**
   * BiologicallyDerivedProduct.collection.collected[x]
   */
  collectedPeriod?: Period;
}

/**
 * FHIR R4 BiologicallyDerivedProductManipulation
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface BiologicallyDerivedProductManipulation {

  /**
   * BiologicallyDerivedProduct.manipulation.id
   */
  id?: string;

  /**
   * BiologicallyDerivedProduct.manipulation.extension
   */
  extension?: Extension[];

  /**
   * BiologicallyDerivedProduct.manipulation.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * BiologicallyDerivedProduct.manipulation.description
   */
  description?: string;

  /**
   * BiologicallyDerivedProduct.manipulation.time[x]
   */
  timeDateTime?: string;

  /**
   * BiologicallyDerivedProduct.manipulation.time[x]
   */
  timePeriod?: Period;
}

/**
 * FHIR R4 BiologicallyDerivedProductProcessing
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface BiologicallyDerivedProductProcessing {

  /**
   * BiologicallyDerivedProduct.processing.id
   */
  id?: string;

  /**
   * BiologicallyDerivedProduct.processing.extension
   */
  extension?: Extension[];

  /**
   * BiologicallyDerivedProduct.processing.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * BiologicallyDerivedProduct.processing.description
   */
  description?: string;

  /**
   * BiologicallyDerivedProduct.processing.procedure
   */
  procedure?: CodeableConcept;

  /**
   * BiologicallyDerivedProduct.processing.additive
   */
  additive?: Reference<Substance>;

  /**
   * BiologicallyDerivedProduct.processing.time[x]
   */
  timeDateTime?: string;

  /**
   * BiologicallyDerivedProduct.processing.time[x]
   */
  timePeriod?: Period;
}

/**
 * FHIR R4 BiologicallyDerivedProductStorage
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface BiologicallyDerivedProductStorage {

  /**
   * BiologicallyDerivedProduct.storage.id
   */
  id?: string;

  /**
   * BiologicallyDerivedProduct.storage.extension
   */
  extension?: Extension[];

  /**
   * BiologicallyDerivedProduct.storage.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * BiologicallyDerivedProduct.storage.description
   */
  description?: string;

  /**
   * BiologicallyDerivedProduct.storage.temperature
   */
  temperature?: number;

  /**
   * BiologicallyDerivedProduct.storage.scale
   */
  scale?: string;

  /**
   * BiologicallyDerivedProduct.storage.duration
   */
  duration?: Period;
}

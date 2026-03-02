import { CodeableConcept } from './CodeableConcept';
import { Coding } from './Coding';
import { DocumentReference } from './DocumentReference';
import { Extension } from './Extension';
import { Identifier } from './Identifier';
import { MarketingStatus } from './MarketingStatus';
import { MedicinalProductIndication } from './MedicinalProductIndication';
import { MedicinalProductPackaged } from './MedicinalProductPackaged';
import { MedicinalProductPharmaceutical } from './MedicinalProductPharmaceutical';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { Organization } from './Organization';
import { PractitionerRole } from './PractitionerRole';
import { Reference } from './Reference';
import { ResearchStudy } from './ResearchStudy';
import { Resource } from './Resource';

/**
 * FHIR R4 MedicinalProduct
 * @see https://hl7.org/fhir/R4/medicinalproduct.html
 */
export interface MedicinalProduct {

  /**
   * This is a MedicinalProduct resource
   */
  readonly resourceType: 'MedicinalProduct';

  /**
   * MedicinalProduct.id
   */
  id?: string;

  /**
   * MedicinalProduct.meta
   */
  meta?: Meta;

  /**
   * MedicinalProduct.implicitRules
   */
  implicitRules?: string;

  /**
   * MedicinalProduct.language
   */
  language?: string;

  /**
   * MedicinalProduct.text
   */
  text?: Narrative;

  /**
   * MedicinalProduct.contained
   */
  contained?: Resource[];

  /**
   * MedicinalProduct.extension
   */
  extension?: Extension[];

  /**
   * MedicinalProduct.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * MedicinalProduct.identifier
   */
  identifier?: Identifier[];

  /**
   * MedicinalProduct.type
   */
  type?: CodeableConcept;

  /**
   * MedicinalProduct.domain
   */
  domain?: Coding;

  /**
   * MedicinalProduct.combinedPharmaceuticalDoseForm
   */
  combinedPharmaceuticalDoseForm?: CodeableConcept;

  /**
   * MedicinalProduct.legalStatusOfSupply
   */
  legalStatusOfSupply?: CodeableConcept;

  /**
   * MedicinalProduct.additionalMonitoringIndicator
   */
  additionalMonitoringIndicator?: CodeableConcept;

  /**
   * MedicinalProduct.specialMeasures
   */
  specialMeasures?: string[];

  /**
   * MedicinalProduct.paediatricUseIndicator
   */
  paediatricUseIndicator?: CodeableConcept;

  /**
   * MedicinalProduct.productClassification
   */
  productClassification?: CodeableConcept[];

  /**
   * MedicinalProduct.marketingStatus
   */
  marketingStatus?: MarketingStatus[];

  /**
   * MedicinalProduct.pharmaceuticalProduct
   */
  pharmaceuticalProduct?: Reference<MedicinalProductPharmaceutical>[];

  /**
   * MedicinalProduct.packagedMedicinalProduct
   */
  packagedMedicinalProduct?: Reference<MedicinalProductPackaged>[];

  /**
   * MedicinalProduct.attachedDocument
   */
  attachedDocument?: Reference<DocumentReference>[];

  /**
   * MedicinalProduct.masterFile
   */
  masterFile?: Reference<DocumentReference>[];

  /**
   * MedicinalProduct.contact
   */
  contact?: Reference<Organization | PractitionerRole>[];

  /**
   * MedicinalProduct.clinicalTrial
   */
  clinicalTrial?: Reference<ResearchStudy>[];

  /**
   * MedicinalProduct.name
   */
  name: MedicinalProductName[];

  /**
   * MedicinalProduct.crossReference
   */
  crossReference?: Identifier[];

  /**
   * MedicinalProduct.manufacturingBusinessOperation
   */
  manufacturingBusinessOperation?: MedicinalProductManufacturingBusinessOperation[];

  /**
   * MedicinalProduct.specialDesignation
   */
  specialDesignation?: MedicinalProductSpecialDesignation[];
}

/**
 * FHIR R4 MedicinalProductManufacturingBusinessOperation
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface MedicinalProductManufacturingBusinessOperation {

  /**
   * MedicinalProduct.manufacturingBusinessOperation.id
   */
  id?: string;

  /**
   * MedicinalProduct.manufacturingBusinessOperation.extension
   */
  extension?: Extension[];

  /**
   * MedicinalProduct.manufacturingBusinessOperation.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * MedicinalProduct.manufacturingBusinessOperation.operationType
   */
  operationType?: CodeableConcept;

  /**
   * MedicinalProduct.manufacturingBusinessOperation.authorisationReferenceNumber
   */
  authorisationReferenceNumber?: Identifier;

  /**
   * MedicinalProduct.manufacturingBusinessOperation.effectiveDate
   */
  effectiveDate?: string;

  /**
   * MedicinalProduct.manufacturingBusinessOperation.confidentialityIndicator
   */
  confidentialityIndicator?: CodeableConcept;

  /**
   * MedicinalProduct.manufacturingBusinessOperation.manufacturer
   */
  manufacturer?: Reference<Organization>[];

  /**
   * MedicinalProduct.manufacturingBusinessOperation.regulator
   */
  regulator?: Reference<Organization>;
}

/**
 * FHIR R4 MedicinalProductName
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface MedicinalProductName {

  /**
   * MedicinalProduct.name.id
   */
  id?: string;

  /**
   * MedicinalProduct.name.extension
   */
  extension?: Extension[];

  /**
   * MedicinalProduct.name.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * MedicinalProduct.name.productName
   */
  productName: string;

  /**
   * MedicinalProduct.name.namePart
   */
  namePart?: MedicinalProductNameNamePart[];

  /**
   * MedicinalProduct.name.countryLanguage
   */
  countryLanguage?: MedicinalProductNameCountryLanguage[];
}

/**
 * FHIR R4 MedicinalProductNameCountryLanguage
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface MedicinalProductNameCountryLanguage {

  /**
   * MedicinalProduct.name.countryLanguage.id
   */
  id?: string;

  /**
   * MedicinalProduct.name.countryLanguage.extension
   */
  extension?: Extension[];

  /**
   * MedicinalProduct.name.countryLanguage.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * MedicinalProduct.name.countryLanguage.country
   */
  country: CodeableConcept;

  /**
   * MedicinalProduct.name.countryLanguage.jurisdiction
   */
  jurisdiction?: CodeableConcept;

  /**
   * MedicinalProduct.name.countryLanguage.language
   */
  language: CodeableConcept;
}

/**
 * FHIR R4 MedicinalProductNameNamePart
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface MedicinalProductNameNamePart {

  /**
   * MedicinalProduct.name.namePart.id
   */
  id?: string;

  /**
   * MedicinalProduct.name.namePart.extension
   */
  extension?: Extension[];

  /**
   * MedicinalProduct.name.namePart.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * MedicinalProduct.name.namePart.part
   */
  part: string;

  /**
   * MedicinalProduct.name.namePart.type
   */
  type: Coding;
}

/**
 * FHIR R4 MedicinalProductSpecialDesignation
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface MedicinalProductSpecialDesignation {

  /**
   * MedicinalProduct.specialDesignation.id
   */
  id?: string;

  /**
   * MedicinalProduct.specialDesignation.extension
   */
  extension?: Extension[];

  /**
   * MedicinalProduct.specialDesignation.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * MedicinalProduct.specialDesignation.identifier
   */
  identifier?: Identifier[];

  /**
   * MedicinalProduct.specialDesignation.type
   */
  type?: CodeableConcept;

  /**
   * MedicinalProduct.specialDesignation.intendedUse
   */
  intendedUse?: CodeableConcept;

  /**
   * MedicinalProduct.specialDesignation.indication[x]
   */
  indicationCodeableConcept?: CodeableConcept;

  /**
   * MedicinalProduct.specialDesignation.indication[x]
   */
  indicationReference?: Reference<MedicinalProductIndication>;

  /**
   * MedicinalProduct.specialDesignation.status
   */
  status?: CodeableConcept;

  /**
   * MedicinalProduct.specialDesignation.date
   */
  date?: string;

  /**
   * MedicinalProduct.specialDesignation.species
   */
  species?: CodeableConcept;
}

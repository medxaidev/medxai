import { CodeableConcept } from './CodeableConcept';
import { Extension } from './Extension';
import { Identifier } from './Identifier';
import { MedicinalProduct } from './MedicinalProduct';
import { MedicinalProductPackaged } from './MedicinalProductPackaged';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { Organization } from './Organization';
import { Period } from './Period';
import { Reference } from './Reference';
import { Resource } from './Resource';

/**
 * FHIR R4 MedicinalProductAuthorization
 * @see https://hl7.org/fhir/R4/medicinalproductauthorization.html
 */
export interface MedicinalProductAuthorization {

  /**
   * This is a MedicinalProductAuthorization resource
   */
  readonly resourceType: 'MedicinalProductAuthorization';

  /**
   * MedicinalProductAuthorization.id
   */
  id?: string;

  /**
   * MedicinalProductAuthorization.meta
   */
  meta?: Meta;

  /**
   * MedicinalProductAuthorization.implicitRules
   */
  implicitRules?: string;

  /**
   * MedicinalProductAuthorization.language
   */
  language?: string;

  /**
   * MedicinalProductAuthorization.text
   */
  text?: Narrative;

  /**
   * MedicinalProductAuthorization.contained
   */
  contained?: Resource[];

  /**
   * MedicinalProductAuthorization.extension
   */
  extension?: Extension[];

  /**
   * MedicinalProductAuthorization.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * MedicinalProductAuthorization.identifier
   */
  identifier?: Identifier[];

  /**
   * MedicinalProductAuthorization.subject
   */
  subject?: Reference<MedicinalProduct | MedicinalProductPackaged>;

  /**
   * MedicinalProductAuthorization.country
   */
  country?: CodeableConcept[];

  /**
   * MedicinalProductAuthorization.jurisdiction
   */
  jurisdiction?: CodeableConcept[];

  /**
   * MedicinalProductAuthorization.status
   */
  status?: CodeableConcept;

  /**
   * MedicinalProductAuthorization.statusDate
   */
  statusDate?: string;

  /**
   * MedicinalProductAuthorization.restoreDate
   */
  restoreDate?: string;

  /**
   * MedicinalProductAuthorization.validityPeriod
   */
  validityPeriod?: Period;

  /**
   * MedicinalProductAuthorization.dataExclusivityPeriod
   */
  dataExclusivityPeriod?: Period;

  /**
   * MedicinalProductAuthorization.dateOfFirstAuthorization
   */
  dateOfFirstAuthorization?: string;

  /**
   * MedicinalProductAuthorization.internationalBirthDate
   */
  internationalBirthDate?: string;

  /**
   * MedicinalProductAuthorization.legalBasis
   */
  legalBasis?: CodeableConcept;

  /**
   * MedicinalProductAuthorization.jurisdictionalAuthorization
   */
  jurisdictionalAuthorization?: MedicinalProductAuthorizationJurisdictionalAuthorization[];

  /**
   * MedicinalProductAuthorization.holder
   */
  holder?: Reference<Organization>;

  /**
   * MedicinalProductAuthorization.regulator
   */
  regulator?: Reference<Organization>;

  /**
   * MedicinalProductAuthorization.procedure
   */
  procedure?: MedicinalProductAuthorizationProcedure;
}

/**
 * FHIR R4 MedicinalProductAuthorizationJurisdictionalAuthorization
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface MedicinalProductAuthorizationJurisdictionalAuthorization {

  /**
   * MedicinalProductAuthorization.jurisdictionalAuthorization.id
   */
  id?: string;

  /**
   * MedicinalProductAuthorization.jurisdictionalAuthorization.extension
   */
  extension?: Extension[];

  /**
   * MedicinalProductAuthorization.jurisdictionalAuthorization.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * MedicinalProductAuthorization.jurisdictionalAuthorization.identifier
   */
  identifier?: Identifier[];

  /**
   * MedicinalProductAuthorization.jurisdictionalAuthorization.country
   */
  country?: CodeableConcept;

  /**
   * MedicinalProductAuthorization.jurisdictionalAuthorization.jurisdiction
   */
  jurisdiction?: CodeableConcept[];

  /**
   * MedicinalProductAuthorization.jurisdictionalAuthorization.legalStatusOfSupply
   */
  legalStatusOfSupply?: CodeableConcept;

  /**
   * MedicinalProductAuthorization.jurisdictionalAuthorization.validityPeriod
   */
  validityPeriod?: Period;
}

/**
 * FHIR R4 MedicinalProductAuthorizationProcedure
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface MedicinalProductAuthorizationProcedure {

  /**
   * MedicinalProductAuthorization.procedure.id
   */
  id?: string;

  /**
   * MedicinalProductAuthorization.procedure.extension
   */
  extension?: Extension[];

  /**
   * MedicinalProductAuthorization.procedure.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * MedicinalProductAuthorization.procedure.identifier
   */
  identifier?: Identifier;

  /**
   * MedicinalProductAuthorization.procedure.type
   */
  type: CodeableConcept;

  /**
   * MedicinalProductAuthorization.procedure.date[x]
   */
  datePeriod?: Period;

  /**
   * MedicinalProductAuthorization.procedure.date[x]
   */
  dateDateTime?: string;
}

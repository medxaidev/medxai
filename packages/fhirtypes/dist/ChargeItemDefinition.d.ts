import { CodeableConcept } from './CodeableConcept';
import { ContactDetail } from './ContactDetail';
import { Device } from './Device';
import { Extension } from './Extension';
import { Identifier } from './Identifier';
import { Medication } from './Medication';
import { Meta } from './Meta';
import { Money } from './Money';
import { Narrative } from './Narrative';
import { Period } from './Period';
import { Reference } from './Reference';
import { Resource } from './Resource';
import { Substance } from './Substance';
import { UsageContext } from './UsageContext';

/**
 * FHIR R4 ChargeItemDefinition
 * @see https://hl7.org/fhir/R4/chargeitemdefinition.html
 */
export interface ChargeItemDefinition {

  /**
   * This is a ChargeItemDefinition resource
   */
  readonly resourceType: 'ChargeItemDefinition';

  /**
   * ChargeItemDefinition.id
   */
  id?: string;

  /**
   * ChargeItemDefinition.meta
   */
  meta?: Meta;

  /**
   * ChargeItemDefinition.implicitRules
   */
  implicitRules?: string;

  /**
   * ChargeItemDefinition.language
   */
  language?: string;

  /**
   * ChargeItemDefinition.text
   */
  text?: Narrative;

  /**
   * ChargeItemDefinition.contained
   */
  contained?: Resource[];

  /**
   * ChargeItemDefinition.extension
   */
  extension?: Extension[];

  /**
   * ChargeItemDefinition.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * ChargeItemDefinition.url
   */
  url: string;

  /**
   * ChargeItemDefinition.identifier
   */
  identifier?: Identifier[];

  /**
   * ChargeItemDefinition.version
   */
  version?: string;

  /**
   * ChargeItemDefinition.title
   */
  title?: string;

  /**
   * ChargeItemDefinition.derivedFromUri
   */
  derivedFromUri?: string[];

  /**
   * ChargeItemDefinition.partOf
   */
  partOf?: string[];

  /**
   * ChargeItemDefinition.replaces
   */
  replaces?: string[];

  /**
   * ChargeItemDefinition.status
   */
  status: 'draft' | 'active' | 'retired' | 'unknown';

  /**
   * ChargeItemDefinition.experimental
   */
  experimental?: boolean;

  /**
   * ChargeItemDefinition.date
   */
  date?: string;

  /**
   * ChargeItemDefinition.publisher
   */
  publisher?: string;

  /**
   * ChargeItemDefinition.contact
   */
  contact?: ContactDetail[];

  /**
   * ChargeItemDefinition.description
   */
  description?: string;

  /**
   * ChargeItemDefinition.useContext
   */
  useContext?: UsageContext[];

  /**
   * ChargeItemDefinition.jurisdiction
   */
  jurisdiction?: CodeableConcept[];

  /**
   * ChargeItemDefinition.copyright
   */
  copyright?: string;

  /**
   * ChargeItemDefinition.approvalDate
   */
  approvalDate?: string;

  /**
   * ChargeItemDefinition.lastReviewDate
   */
  lastReviewDate?: string;

  /**
   * ChargeItemDefinition.effectivePeriod
   */
  effectivePeriod?: Period;

  /**
   * ChargeItemDefinition.code
   */
  code?: CodeableConcept;

  /**
   * ChargeItemDefinition.instance
   */
  instance?: Reference<Medication | Substance | Device>[];

  /**
   * ChargeItemDefinition.applicability
   */
  applicability?: ChargeItemDefinitionApplicability[];

  /**
   * ChargeItemDefinition.propertyGroup
   */
  propertyGroup?: ChargeItemDefinitionPropertyGroup[];
}

/**
 * FHIR R4 ChargeItemDefinitionApplicability
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ChargeItemDefinitionApplicability {

  /**
   * ChargeItemDefinition.applicability.id
   */
  id?: string;

  /**
   * ChargeItemDefinition.applicability.extension
   */
  extension?: Extension[];

  /**
   * ChargeItemDefinition.applicability.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * ChargeItemDefinition.applicability.description
   */
  description?: string;

  /**
   * ChargeItemDefinition.applicability.language
   */
  language?: string;

  /**
   * ChargeItemDefinition.applicability.expression
   */
  expression?: string;
}

/**
 * FHIR R4 ChargeItemDefinitionPropertyGroup
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ChargeItemDefinitionPropertyGroup {

  /**
   * ChargeItemDefinition.propertyGroup.id
   */
  id?: string;

  /**
   * ChargeItemDefinition.propertyGroup.extension
   */
  extension?: Extension[];

  /**
   * ChargeItemDefinition.propertyGroup.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * ChargeItemDefinition.propertyGroup.priceComponent
   */
  priceComponent?: ChargeItemDefinitionPropertyGroupPriceComponent[];
}

/**
 * FHIR R4 ChargeItemDefinitionPropertyGroupPriceComponent
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ChargeItemDefinitionPropertyGroupPriceComponent {

  /**
   * ChargeItemDefinition.propertyGroup.priceComponent.id
   */
  id?: string;

  /**
   * ChargeItemDefinition.propertyGroup.priceComponent.extension
   */
  extension?: Extension[];

  /**
   * ChargeItemDefinition.propertyGroup.priceComponent.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * ChargeItemDefinition.propertyGroup.priceComponent.type
   */
  type: string;

  /**
   * ChargeItemDefinition.propertyGroup.priceComponent.code
   */
  code?: CodeableConcept;

  /**
   * ChargeItemDefinition.propertyGroup.priceComponent.factor
   */
  factor?: number;

  /**
   * ChargeItemDefinition.propertyGroup.priceComponent.amount
   */
  amount?: Money;
}

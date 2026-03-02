import { CodeableConcept } from './CodeableConcept';
import { Contract } from './Contract';
import { Extension } from './Extension';
import { Identifier } from './Identifier';
import { Meta } from './Meta';
import { Money } from './Money';
import { Narrative } from './Narrative';
import { Organization } from './Organization';
import { Patient } from './Patient';
import { Period } from './Period';
import { Quantity } from './Quantity';
import { Reference } from './Reference';
import { RelatedPerson } from './RelatedPerson';
import { Resource } from './Resource';

/**
 * FHIR R4 Coverage
 * @see https://hl7.org/fhir/R4/coverage.html
 */
export interface Coverage {

  /**
   * This is a Coverage resource
   */
  readonly resourceType: 'Coverage';

  /**
   * Coverage.id
   */
  id?: string;

  /**
   * Coverage.meta
   */
  meta?: Meta;

  /**
   * Coverage.implicitRules
   */
  implicitRules?: string;

  /**
   * Coverage.language
   */
  language?: string;

  /**
   * Coverage.text
   */
  text?: Narrative;

  /**
   * Coverage.contained
   */
  contained?: Resource[];

  /**
   * Coverage.extension
   */
  extension?: Extension[];

  /**
   * Coverage.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Coverage.identifier
   */
  identifier?: Identifier[];

  /**
   * Coverage.status
   */
  status: 'active' | 'cancelled' | 'draft' | 'entered-in-error';

  /**
   * Coverage.type
   */
  type?: CodeableConcept;

  /**
   * Coverage.policyHolder
   */
  policyHolder?: Reference<Patient | RelatedPerson | Organization>;

  /**
   * Coverage.subscriber
   */
  subscriber?: Reference<Patient | RelatedPerson>;

  /**
   * Coverage.subscriberId
   */
  subscriberId?: string;

  /**
   * Coverage.beneficiary
   */
  beneficiary: Reference<Patient>;

  /**
   * Coverage.dependent
   */
  dependent?: string;

  /**
   * Coverage.relationship
   */
  relationship?: CodeableConcept;

  /**
   * Coverage.period
   */
  period?: Period;

  /**
   * Coverage.payor
   */
  payor: Reference<Organization | Patient | RelatedPerson>[];

  /**
   * Coverage.class
   */
  class?: CoverageClass[];

  /**
   * Coverage.order
   */
  order?: number;

  /**
   * Coverage.network
   */
  network?: string;

  /**
   * Coverage.costToBeneficiary
   */
  costToBeneficiary?: CoverageCostToBeneficiary[];

  /**
   * Coverage.subrogation
   */
  subrogation?: boolean;

  /**
   * Coverage.contract
   */
  contract?: Reference<Contract>[];
}

/**
 * FHIR R4 CoverageClass
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface CoverageClass {

  /**
   * Coverage.class.id
   */
  id?: string;

  /**
   * Coverage.class.extension
   */
  extension?: Extension[];

  /**
   * Coverage.class.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Coverage.class.type
   */
  type: CodeableConcept;

  /**
   * Coverage.class.value
   */
  value: string;

  /**
   * Coverage.class.name
   */
  name?: string;
}

/**
 * FHIR R4 CoverageCostToBeneficiary
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface CoverageCostToBeneficiary {

  /**
   * Coverage.costToBeneficiary.id
   */
  id?: string;

  /**
   * Coverage.costToBeneficiary.extension
   */
  extension?: Extension[];

  /**
   * Coverage.costToBeneficiary.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Coverage.costToBeneficiary.type
   */
  type?: CodeableConcept;

  /**
   * Coverage.costToBeneficiary.value[x]
   */
  valueQuantity: Quantity;

  /**
   * Coverage.costToBeneficiary.value[x]
   */
  valueMoney: Money;

  /**
   * Coverage.costToBeneficiary.exception
   */
  exception?: CoverageCostToBeneficiaryException[];
}

/**
 * FHIR R4 CoverageCostToBeneficiaryException
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface CoverageCostToBeneficiaryException {

  /**
   * Coverage.costToBeneficiary.exception.id
   */
  id?: string;

  /**
   * Coverage.costToBeneficiary.exception.extension
   */
  extension?: Extension[];

  /**
   * Coverage.costToBeneficiary.exception.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Coverage.costToBeneficiary.exception.type
   */
  type: CodeableConcept;

  /**
   * Coverage.costToBeneficiary.exception.period
   */
  period?: Period;
}

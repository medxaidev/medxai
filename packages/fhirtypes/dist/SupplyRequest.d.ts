import { CodeableConcept } from './CodeableConcept';
import { Condition } from './Condition';
import { Device } from './Device';
import { DiagnosticReport } from './DiagnosticReport';
import { DocumentReference } from './DocumentReference';
import { Extension } from './Extension';
import { HealthcareService } from './HealthcareService';
import { Identifier } from './Identifier';
import { Location } from './Location';
import { Medication } from './Medication';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { Observation } from './Observation';
import { Organization } from './Organization';
import { Patient } from './Patient';
import { Period } from './Period';
import { Practitioner } from './Practitioner';
import { PractitionerRole } from './PractitionerRole';
import { Quantity } from './Quantity';
import { Range } from './Range';
import { Reference } from './Reference';
import { RelatedPerson } from './RelatedPerson';
import { Resource } from './Resource';
import { Substance } from './Substance';
import { Timing } from './Timing';

/**
 * FHIR R4 SupplyRequest
 * @see https://hl7.org/fhir/R4/supplyrequest.html
 */
export interface SupplyRequest {

  /**
   * This is a SupplyRequest resource
   */
  readonly resourceType: 'SupplyRequest';

  /**
   * SupplyRequest.id
   */
  id?: string;

  /**
   * SupplyRequest.meta
   */
  meta?: Meta;

  /**
   * SupplyRequest.implicitRules
   */
  implicitRules?: string;

  /**
   * SupplyRequest.language
   */
  language?: string;

  /**
   * SupplyRequest.text
   */
  text?: Narrative;

  /**
   * SupplyRequest.contained
   */
  contained?: Resource[];

  /**
   * SupplyRequest.extension
   */
  extension?: Extension[];

  /**
   * SupplyRequest.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * SupplyRequest.identifier
   */
  identifier?: Identifier[];

  /**
   * SupplyRequest.status
   */
  status?: string;

  /**
   * SupplyRequest.category
   */
  category?: CodeableConcept;

  /**
   * SupplyRequest.priority
   */
  priority?: 'routine' | 'urgent' | 'asap' | 'stat';

  /**
   * SupplyRequest.item[x]
   */
  itemCodeableConcept: CodeableConcept;

  /**
   * SupplyRequest.item[x]
   */
  itemReference: Reference<Medication | Substance | Device>;

  /**
   * SupplyRequest.quantity
   */
  quantity: Quantity;

  /**
   * SupplyRequest.parameter
   */
  parameter?: SupplyRequestParameter[];

  /**
   * SupplyRequest.occurrence[x]
   */
  occurrenceDateTime?: string;

  /**
   * SupplyRequest.occurrence[x]
   */
  occurrencePeriod?: Period;

  /**
   * SupplyRequest.occurrence[x]
   */
  occurrenceTiming?: Timing;

  /**
   * SupplyRequest.authoredOn
   */
  authoredOn?: string;

  /**
   * SupplyRequest.requester
   */
  requester?: Reference<Practitioner | PractitionerRole | Organization | Patient | RelatedPerson | Device>;

  /**
   * SupplyRequest.supplier
   */
  supplier?: Reference<Organization | HealthcareService>[];

  /**
   * SupplyRequest.reasonCode
   */
  reasonCode?: CodeableConcept[];

  /**
   * SupplyRequest.reasonReference
   */
  reasonReference?: Reference<Condition | Observation | DiagnosticReport | DocumentReference>[];

  /**
   * SupplyRequest.deliverFrom
   */
  deliverFrom?: Reference<Organization | Location>;

  /**
   * SupplyRequest.deliverTo
   */
  deliverTo?: Reference<Organization | Location | Patient>;
}

/**
 * SupplyRequest.item[x]
 */
export type SupplyRequestItem = CodeableConcept | Reference<Medication | Substance | Device>;
/**
 * SupplyRequest.occurrence[x]
 */
export type SupplyRequestOccurrence = string | Period | Timing;

/**
 * FHIR R4 SupplyRequestParameter
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface SupplyRequestParameter {

  /**
   * SupplyRequest.parameter.id
   */
  id?: string;

  /**
   * SupplyRequest.parameter.extension
   */
  extension?: Extension[];

  /**
   * SupplyRequest.parameter.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * SupplyRequest.parameter.code
   */
  code?: CodeableConcept;

  /**
   * SupplyRequest.parameter.value[x]
   */
  valueCodeableConcept?: CodeableConcept;

  /**
   * SupplyRequest.parameter.value[x]
   */
  valueQuantity?: Quantity;

  /**
   * SupplyRequest.parameter.value[x]
   */
  valueRange?: Range;

  /**
   * SupplyRequest.parameter.value[x]
   */
  valueBoolean?: boolean;
}

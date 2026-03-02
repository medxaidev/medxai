import { Annotation } from './Annotation';
import { CarePlan } from './CarePlan';
import { CareTeam } from './CareTeam';
import { CodeableConcept } from './CodeableConcept';
import { Device } from './Device';
import { DeviceMetric } from './DeviceMetric';
import { DeviceRequest } from './DeviceRequest';
import { DocumentReference } from './DocumentReference';
import { Encounter } from './Encounter';
import { Extension } from './Extension';
import { Group } from './Group';
import { Identifier } from './Identifier';
import { ImagingStudy } from './ImagingStudy';
import { Immunization } from './Immunization';
import { ImmunizationRecommendation } from './ImmunizationRecommendation';
import { Location } from './Location';
import { Media } from './Media';
import { MedicationAdministration } from './MedicationAdministration';
import { MedicationDispense } from './MedicationDispense';
import { MedicationRequest } from './MedicationRequest';
import { MedicationStatement } from './MedicationStatement';
import { Meta } from './Meta';
import { MolecularSequence } from './MolecularSequence';
import { Narrative } from './Narrative';
import { NutritionOrder } from './NutritionOrder';
import { Organization } from './Organization';
import { Patient } from './Patient';
import { Period } from './Period';
import { Practitioner } from './Practitioner';
import { PractitionerRole } from './PractitionerRole';
import { Procedure } from './Procedure';
import { Quantity } from './Quantity';
import { QuestionnaireResponse } from './QuestionnaireResponse';
import { Range } from './Range';
import { Ratio } from './Ratio';
import { Reference } from './Reference';
import { RelatedPerson } from './RelatedPerson';
import { Resource } from './Resource';
import { SampledData } from './SampledData';
import { ServiceRequest } from './ServiceRequest';
import { Specimen } from './Specimen';
import { Timing } from './Timing';

/**
 * FHIR R4 Observation
 * @see https://hl7.org/fhir/R4/observation.html
 */
export interface Observation {

  /**
   * This is a Observation resource
   */
  readonly resourceType: 'Observation';

  /**
   * Observation.id
   */
  id?: string;

  /**
   * Observation.meta
   */
  meta?: Meta;

  /**
   * Observation.implicitRules
   */
  implicitRules?: string;

  /**
   * Observation.language
   */
  language?: string;

  /**
   * Observation.text
   */
  text?: Narrative;

  /**
   * Observation.contained
   */
  contained?: Resource[];

  /**
   * Observation.extension
   */
  extension?: Extension[];

  /**
   * Observation.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Observation.identifier
   */
  identifier?: Identifier[];

  /**
   * Observation.basedOn
   */
  basedOn?: Reference<CarePlan | DeviceRequest | ImmunizationRecommendation | MedicationRequest | NutritionOrder | ServiceRequest>[];

  /**
   * Observation.partOf
   */
  partOf?: Reference<MedicationAdministration | MedicationDispense | MedicationStatement | Procedure | Immunization | ImagingStudy>[];

  /**
   * Observation.status
   */
  status: 'registered' | 'preliminary' | 'final' | 'amended' | 'corrected' | 'cancelled' | 'entered-in-error' | 'unknown';

  /**
   * Observation.category
   */
  category?: CodeableConcept[];

  /**
   * Observation.code
   */
  code: CodeableConcept;

  /**
   * Observation.subject
   */
  subject?: Reference<Patient | Group | Device | Location>;

  /**
   * Observation.focus
   */
  focus?: Reference[];

  /**
   * Observation.encounter
   */
  encounter?: Reference<Encounter>;

  /**
   * Observation.effective[x]
   */
  effectiveDateTime?: string;

  /**
   * Observation.effective[x]
   */
  effectivePeriod?: Period;

  /**
   * Observation.effective[x]
   */
  effectiveTiming?: Timing;

  /**
   * Observation.effective[x]
   */
  effectiveInstant?: string;

  /**
   * Observation.issued
   */
  issued?: string;

  /**
   * Observation.performer
   */
  performer?: Reference<Practitioner | PractitionerRole | Organization | CareTeam | Patient | RelatedPerson>[];

  /**
   * Observation.value[x]
   */
  valueQuantity?: Quantity;

  /**
   * Observation.value[x]
   */
  valueCodeableConcept?: CodeableConcept;

  /**
   * Observation.value[x]
   */
  valueString?: string;

  /**
   * Observation.value[x]
   */
  valueBoolean?: boolean;

  /**
   * Observation.value[x]
   */
  valueInteger?: number;

  /**
   * Observation.value[x]
   */
  valueRange?: Range;

  /**
   * Observation.value[x]
   */
  valueRatio?: Ratio;

  /**
   * Observation.value[x]
   */
  valueSampledData?: SampledData;

  /**
   * Observation.value[x]
   */
  valueTime?: string;

  /**
   * Observation.value[x]
   */
  valueDateTime?: string;

  /**
   * Observation.value[x]
   */
  valuePeriod?: Period;

  /**
   * Observation.dataAbsentReason
   */
  dataAbsentReason?: CodeableConcept;

  /**
   * Observation.interpretation
   */
  interpretation?: CodeableConcept[];

  /**
   * Observation.note
   */
  note?: Annotation[];

  /**
   * Observation.bodySite
   */
  bodySite?: CodeableConcept;

  /**
   * Observation.method
   */
  method?: CodeableConcept;

  /**
   * Observation.specimen
   */
  specimen?: Reference<Specimen>;

  /**
   * Observation.device
   */
  device?: Reference<Device | DeviceMetric>;

  /**
   * Observation.referenceRange
   */
  referenceRange?: ObservationReferenceRange[];

  /**
   * Observation.hasMember
   */
  hasMember?: Reference<Observation | QuestionnaireResponse | MolecularSequence>[];

  /**
   * Observation.derivedFrom
   */
  derivedFrom?: Reference<DocumentReference | ImagingStudy | Media | QuestionnaireResponse | Observation | MolecularSequence>[];

  /**
   * Observation.component
   */
  component?: ObservationComponent[];
}

/**
 * Observation.effective[x]
 */
export type ObservationEffective = string | Period | Timing;
/**
 * Observation.value[x]
 */
export type ObservationValue = Quantity | CodeableConcept | string | boolean | number | Range | Ratio | SampledData | Period;

/**
 * FHIR R4 ObservationComponent
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ObservationComponent {

  /**
   * Observation.component.id
   */
  id?: string;

  /**
   * Observation.component.extension
   */
  extension?: Extension[];

  /**
   * Observation.component.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Observation.component.code
   */
  code: CodeableConcept;

  /**
   * Observation.component.value[x]
   */
  valueQuantity?: Quantity;

  /**
   * Observation.component.value[x]
   */
  valueCodeableConcept?: CodeableConcept;

  /**
   * Observation.component.value[x]
   */
  valueString?: string;

  /**
   * Observation.component.value[x]
   */
  valueBoolean?: boolean;

  /**
   * Observation.component.value[x]
   */
  valueInteger?: number;

  /**
   * Observation.component.value[x]
   */
  valueRange?: Range;

  /**
   * Observation.component.value[x]
   */
  valueRatio?: Ratio;

  /**
   * Observation.component.value[x]
   */
  valueSampledData?: SampledData;

  /**
   * Observation.component.value[x]
   */
  valueTime?: string;

  /**
   * Observation.component.value[x]
   */
  valueDateTime?: string;

  /**
   * Observation.component.value[x]
   */
  valuePeriod?: Period;

  /**
   * Observation.component.dataAbsentReason
   */
  dataAbsentReason?: CodeableConcept;

  /**
   * Observation.component.interpretation
   */
  interpretation?: CodeableConcept[];
}

/**
 * FHIR R4 ObservationReferenceRange
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ObservationReferenceRange {

  /**
   * Observation.referenceRange.id
   */
  id?: string;

  /**
   * Observation.referenceRange.extension
   */
  extension?: Extension[];

  /**
   * Observation.referenceRange.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Observation.referenceRange.low
   */
  low?: Quantity;

  /**
   * Observation.referenceRange.high
   */
  high?: Quantity;

  /**
   * Observation.referenceRange.type
   */
  type?: CodeableConcept;

  /**
   * Observation.referenceRange.appliesTo
   */
  appliesTo?: CodeableConcept[];

  /**
   * Observation.referenceRange.age
   */
  age?: Range;

  /**
   * Observation.referenceRange.text
   */
  text?: string;
}

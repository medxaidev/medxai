import { CodeableConcept } from './CodeableConcept';
import { Device } from './Device';
import { Extension } from './Extension';
import { Group } from './Group';
import { Identifier } from './Identifier';
import { List } from './List';
import { Location } from './Location';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { Organization } from './Organization';
import { Patient } from './Patient';
import { Period } from './Period';
import { Practitioner } from './Practitioner';
import { PractitionerRole } from './PractitionerRole';
import { Quantity } from './Quantity';
import { Reference } from './Reference';
import { RelatedPerson } from './RelatedPerson';
import { Resource } from './Resource';

/**
 * FHIR R4 MeasureReport
 * @see https://hl7.org/fhir/R4/measurereport.html
 */
export interface MeasureReport {

  /**
   * This is a MeasureReport resource
   */
  readonly resourceType: 'MeasureReport';

  /**
   * MeasureReport.id
   */
  id?: string;

  /**
   * MeasureReport.meta
   */
  meta?: Meta;

  /**
   * MeasureReport.implicitRules
   */
  implicitRules?: string;

  /**
   * MeasureReport.language
   */
  language?: string;

  /**
   * MeasureReport.text
   */
  text?: Narrative;

  /**
   * MeasureReport.contained
   */
  contained?: Resource[];

  /**
   * MeasureReport.extension
   */
  extension?: Extension[];

  /**
   * MeasureReport.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * MeasureReport.identifier
   */
  identifier?: Identifier[];

  /**
   * MeasureReport.status
   */
  status: string;

  /**
   * MeasureReport.type
   */
  type: string;

  /**
   * MeasureReport.measure
   */
  measure: string;

  /**
   * MeasureReport.subject
   */
  subject?: Reference<Patient | Practitioner | PractitionerRole | Location | Device | RelatedPerson | Group>;

  /**
   * MeasureReport.date
   */
  date?: string;

  /**
   * MeasureReport.reporter
   */
  reporter?: Reference<Practitioner | PractitionerRole | Location | Organization>;

  /**
   * MeasureReport.period
   */
  period: Period;

  /**
   * MeasureReport.improvementNotation
   */
  improvementNotation?: CodeableConcept;

  /**
   * MeasureReport.group
   */
  group?: MeasureReportGroup[];

  /**
   * MeasureReport.evaluatedResource
   */
  evaluatedResource?: Reference[];
}

/**
 * FHIR R4 MeasureReportGroup
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface MeasureReportGroup {

  /**
   * MeasureReport.group.id
   */
  id?: string;

  /**
   * MeasureReport.group.extension
   */
  extension?: Extension[];

  /**
   * MeasureReport.group.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * MeasureReport.group.code
   */
  code?: CodeableConcept;

  /**
   * MeasureReport.group.population
   */
  population?: MeasureReportGroupPopulation[];

  /**
   * MeasureReport.group.measureScore
   */
  measureScore?: Quantity;

  /**
   * MeasureReport.group.stratifier
   */
  stratifier?: MeasureReportGroupStratifier[];
}

/**
 * FHIR R4 MeasureReportGroupPopulation
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface MeasureReportGroupPopulation {

  /**
   * MeasureReport.group.population.id
   */
  id?: string;

  /**
   * MeasureReport.group.population.extension
   */
  extension?: Extension[];

  /**
   * MeasureReport.group.population.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * MeasureReport.group.population.code
   */
  code?: CodeableConcept;

  /**
   * MeasureReport.group.population.count
   */
  count?: number;

  /**
   * MeasureReport.group.population.subjectResults
   */
  subjectResults?: Reference<List>;
}

/**
 * FHIR R4 MeasureReportGroupStratifier
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface MeasureReportGroupStratifier {

  /**
   * MeasureReport.group.stratifier.id
   */
  id?: string;

  /**
   * MeasureReport.group.stratifier.extension
   */
  extension?: Extension[];

  /**
   * MeasureReport.group.stratifier.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * MeasureReport.group.stratifier.code
   */
  code?: CodeableConcept[];

  /**
   * MeasureReport.group.stratifier.stratum
   */
  stratum?: MeasureReportGroupStratifierStratum[];
}

/**
 * FHIR R4 MeasureReportGroupStratifierStratum
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface MeasureReportGroupStratifierStratum {

  /**
   * MeasureReport.group.stratifier.stratum.id
   */
  id?: string;

  /**
   * MeasureReport.group.stratifier.stratum.extension
   */
  extension?: Extension[];

  /**
   * MeasureReport.group.stratifier.stratum.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * MeasureReport.group.stratifier.stratum.value
   */
  value?: CodeableConcept;

  /**
   * MeasureReport.group.stratifier.stratum.component
   */
  component?: MeasureReportGroupStratifierStratumComponent[];

  /**
   * MeasureReport.group.stratifier.stratum.population
   */
  population?: MeasureReportGroupStratifierStratumPopulation[];

  /**
   * MeasureReport.group.stratifier.stratum.measureScore
   */
  measureScore?: Quantity;
}

/**
 * FHIR R4 MeasureReportGroupStratifierStratumComponent
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface MeasureReportGroupStratifierStratumComponent {

  /**
   * MeasureReport.group.stratifier.stratum.component.id
   */
  id?: string;

  /**
   * MeasureReport.group.stratifier.stratum.component.extension
   */
  extension?: Extension[];

  /**
   * MeasureReport.group.stratifier.stratum.component.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * MeasureReport.group.stratifier.stratum.component.code
   */
  code: CodeableConcept;

  /**
   * MeasureReport.group.stratifier.stratum.component.value
   */
  value: CodeableConcept;
}

/**
 * FHIR R4 MeasureReportGroupStratifierStratumPopulation
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface MeasureReportGroupStratifierStratumPopulation {

  /**
   * MeasureReport.group.stratifier.stratum.population.id
   */
  id?: string;

  /**
   * MeasureReport.group.stratifier.stratum.population.extension
   */
  extension?: Extension[];

  /**
   * MeasureReport.group.stratifier.stratum.population.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * MeasureReport.group.stratifier.stratum.population.code
   */
  code?: CodeableConcept;

  /**
   * MeasureReport.group.stratifier.stratum.population.count
   */
  count?: number;

  /**
   * MeasureReport.group.stratifier.stratum.population.subjectResults
   */
  subjectResults?: Reference<List>;
}

import { CodeableConcept } from './CodeableConcept';
import { ContactDetail } from './ContactDetail';
import { Expression } from './Expression';
import { Extension } from './Extension';
import { Group } from './Group';
import { Identifier } from './Identifier';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { Period } from './Period';
import { Reference } from './Reference';
import { RelatedArtifact } from './RelatedArtifact';
import { Resource } from './Resource';
import { UsageContext } from './UsageContext';

/**
 * FHIR R4 Measure
 * @see https://hl7.org/fhir/R4/measure.html
 */
export interface Measure {

  /**
   * This is a Measure resource
   */
  readonly resourceType: 'Measure';

  /**
   * Measure.id
   */
  id?: string;

  /**
   * Measure.meta
   */
  meta?: Meta;

  /**
   * Measure.implicitRules
   */
  implicitRules?: string;

  /**
   * Measure.language
   */
  language?: string;

  /**
   * Measure.text
   */
  text?: Narrative;

  /**
   * Measure.contained
   */
  contained?: Resource[];

  /**
   * Measure.extension
   */
  extension?: Extension[];

  /**
   * Measure.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Measure.url
   */
  url?: string;

  /**
   * Measure.identifier
   */
  identifier?: Identifier[];

  /**
   * Measure.version
   */
  version?: string;

  /**
   * Measure.name
   */
  name?: string;

  /**
   * Measure.title
   */
  title?: string;

  /**
   * Measure.subtitle
   */
  subtitle?: string;

  /**
   * Measure.status
   */
  status: 'draft' | 'active' | 'retired' | 'unknown';

  /**
   * Measure.experimental
   */
  experimental?: boolean;

  /**
   * Measure.subject[x]
   */
  subjectCodeableConcept?: CodeableConcept;

  /**
   * Measure.subject[x]
   */
  subjectReference?: Reference<Group>;

  /**
   * Measure.date
   */
  date?: string;

  /**
   * Measure.publisher
   */
  publisher?: string;

  /**
   * Measure.contact
   */
  contact?: ContactDetail[];

  /**
   * Measure.description
   */
  description?: string;

  /**
   * Measure.useContext
   */
  useContext?: UsageContext[];

  /**
   * Measure.jurisdiction
   */
  jurisdiction?: CodeableConcept[];

  /**
   * Measure.purpose
   */
  purpose?: string;

  /**
   * Measure.usage
   */
  usage?: string;

  /**
   * Measure.copyright
   */
  copyright?: string;

  /**
   * Measure.approvalDate
   */
  approvalDate?: string;

  /**
   * Measure.lastReviewDate
   */
  lastReviewDate?: string;

  /**
   * Measure.effectivePeriod
   */
  effectivePeriod?: Period;

  /**
   * Measure.topic
   */
  topic?: CodeableConcept[];

  /**
   * Measure.author
   */
  author?: ContactDetail[];

  /**
   * Measure.editor
   */
  editor?: ContactDetail[];

  /**
   * Measure.reviewer
   */
  reviewer?: ContactDetail[];

  /**
   * Measure.endorser
   */
  endorser?: ContactDetail[];

  /**
   * Measure.relatedArtifact
   */
  relatedArtifact?: RelatedArtifact[];

  /**
   * Measure.library
   */
  library?: string[];

  /**
   * Measure.disclaimer
   */
  disclaimer?: string;

  /**
   * Measure.scoring
   */
  scoring?: CodeableConcept;

  /**
   * Measure.compositeScoring
   */
  compositeScoring?: CodeableConcept;

  /**
   * Measure.type
   */
  type?: CodeableConcept[];

  /**
   * Measure.riskAdjustment
   */
  riskAdjustment?: string;

  /**
   * Measure.rateAggregation
   */
  rateAggregation?: string;

  /**
   * Measure.rationale
   */
  rationale?: string;

  /**
   * Measure.clinicalRecommendationStatement
   */
  clinicalRecommendationStatement?: string;

  /**
   * Measure.improvementNotation
   */
  improvementNotation?: CodeableConcept;

  /**
   * Measure.definition
   */
  definition?: string[];

  /**
   * Measure.guidance
   */
  guidance?: string;

  /**
   * Measure.group
   */
  group?: MeasureGroup[];

  /**
   * Measure.supplementalData
   */
  supplementalData?: MeasureSupplementalData[];
}

/**
 * Measure.subject[x]
 */
export type MeasureSubject = CodeableConcept | Reference<Group>;

/**
 * FHIR R4 MeasureGroup
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface MeasureGroup {

  /**
   * Measure.group.id
   */
  id?: string;

  /**
   * Measure.group.extension
   */
  extension?: Extension[];

  /**
   * Measure.group.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Measure.group.code
   */
  code?: CodeableConcept;

  /**
   * Measure.group.description
   */
  description?: string;

  /**
   * Measure.group.population
   */
  population?: MeasureGroupPopulation[];

  /**
   * Measure.group.stratifier
   */
  stratifier?: MeasureGroupStratifier[];
}

/**
 * FHIR R4 MeasureGroupPopulation
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface MeasureGroupPopulation {

  /**
   * Measure.group.population.id
   */
  id?: string;

  /**
   * Measure.group.population.extension
   */
  extension?: Extension[];

  /**
   * Measure.group.population.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Measure.group.population.code
   */
  code?: CodeableConcept;

  /**
   * Measure.group.population.description
   */
  description?: string;

  /**
   * Measure.group.population.criteria
   */
  criteria: Expression;
}

/**
 * FHIR R4 MeasureGroupStratifier
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface MeasureGroupStratifier {

  /**
   * Measure.group.stratifier.id
   */
  id?: string;

  /**
   * Measure.group.stratifier.extension
   */
  extension?: Extension[];

  /**
   * Measure.group.stratifier.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Measure.group.stratifier.code
   */
  code?: CodeableConcept;

  /**
   * Measure.group.stratifier.description
   */
  description?: string;

  /**
   * Measure.group.stratifier.criteria
   */
  criteria?: Expression;

  /**
   * Measure.group.stratifier.component
   */
  component?: MeasureGroupStratifierComponent[];
}

/**
 * FHIR R4 MeasureGroupStratifierComponent
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface MeasureGroupStratifierComponent {

  /**
   * Measure.group.stratifier.component.id
   */
  id?: string;

  /**
   * Measure.group.stratifier.component.extension
   */
  extension?: Extension[];

  /**
   * Measure.group.stratifier.component.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Measure.group.stratifier.component.code
   */
  code?: CodeableConcept;

  /**
   * Measure.group.stratifier.component.description
   */
  description?: string;

  /**
   * Measure.group.stratifier.component.criteria
   */
  criteria: Expression;
}

/**
 * FHIR R4 MeasureSupplementalData
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface MeasureSupplementalData {

  /**
   * Measure.supplementalData.id
   */
  id?: string;

  /**
   * Measure.supplementalData.extension
   */
  extension?: Extension[];

  /**
   * Measure.supplementalData.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Measure.supplementalData.code
   */
  code?: CodeableConcept;

  /**
   * Measure.supplementalData.usage
   */
  usage?: CodeableConcept[];

  /**
   * Measure.supplementalData.description
   */
  description?: string;

  /**
   * Measure.supplementalData.criteria
   */
  criteria: Expression;
}

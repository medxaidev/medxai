import { Annotation } from './Annotation';
import { CodeableConcept } from './CodeableConcept';
import { ContactDetail } from './ContactDetail';
import { EvidenceVariable } from './EvidenceVariable';
import { Extension } from './Extension';
import { Identifier } from './Identifier';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { Period } from './Period';
import { Reference } from './Reference';
import { RelatedArtifact } from './RelatedArtifact';
import { Resource } from './Resource';
import { UsageContext } from './UsageContext';

/**
 * FHIR R4 RiskEvidenceSynthesis
 * @see https://hl7.org/fhir/R4/riskevidencesynthesis.html
 */
export interface RiskEvidenceSynthesis {

  /**
   * This is a RiskEvidenceSynthesis resource
   */
  readonly resourceType: 'RiskEvidenceSynthesis';

  /**
   * RiskEvidenceSynthesis.id
   */
  id?: string;

  /**
   * RiskEvidenceSynthesis.meta
   */
  meta?: Meta;

  /**
   * RiskEvidenceSynthesis.implicitRules
   */
  implicitRules?: string;

  /**
   * RiskEvidenceSynthesis.language
   */
  language?: string;

  /**
   * RiskEvidenceSynthesis.text
   */
  text?: Narrative;

  /**
   * RiskEvidenceSynthesis.contained
   */
  contained?: Resource[];

  /**
   * RiskEvidenceSynthesis.extension
   */
  extension?: Extension[];

  /**
   * RiskEvidenceSynthesis.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * RiskEvidenceSynthesis.url
   */
  url?: string;

  /**
   * RiskEvidenceSynthesis.identifier
   */
  identifier?: Identifier[];

  /**
   * RiskEvidenceSynthesis.version
   */
  version?: string;

  /**
   * RiskEvidenceSynthesis.name
   */
  name?: string;

  /**
   * RiskEvidenceSynthesis.title
   */
  title?: string;

  /**
   * RiskEvidenceSynthesis.status
   */
  status: 'draft' | 'active' | 'retired' | 'unknown';

  /**
   * RiskEvidenceSynthesis.date
   */
  date?: string;

  /**
   * RiskEvidenceSynthesis.publisher
   */
  publisher?: string;

  /**
   * RiskEvidenceSynthesis.contact
   */
  contact?: ContactDetail[];

  /**
   * RiskEvidenceSynthesis.description
   */
  description?: string;

  /**
   * RiskEvidenceSynthesis.note
   */
  note?: Annotation[];

  /**
   * RiskEvidenceSynthesis.useContext
   */
  useContext?: UsageContext[];

  /**
   * RiskEvidenceSynthesis.jurisdiction
   */
  jurisdiction?: CodeableConcept[];

  /**
   * RiskEvidenceSynthesis.copyright
   */
  copyright?: string;

  /**
   * RiskEvidenceSynthesis.approvalDate
   */
  approvalDate?: string;

  /**
   * RiskEvidenceSynthesis.lastReviewDate
   */
  lastReviewDate?: string;

  /**
   * RiskEvidenceSynthesis.effectivePeriod
   */
  effectivePeriod?: Period;

  /**
   * RiskEvidenceSynthesis.topic
   */
  topic?: CodeableConcept[];

  /**
   * RiskEvidenceSynthesis.author
   */
  author?: ContactDetail[];

  /**
   * RiskEvidenceSynthesis.editor
   */
  editor?: ContactDetail[];

  /**
   * RiskEvidenceSynthesis.reviewer
   */
  reviewer?: ContactDetail[];

  /**
   * RiskEvidenceSynthesis.endorser
   */
  endorser?: ContactDetail[];

  /**
   * RiskEvidenceSynthesis.relatedArtifact
   */
  relatedArtifact?: RelatedArtifact[];

  /**
   * RiskEvidenceSynthesis.synthesisType
   */
  synthesisType?: CodeableConcept;

  /**
   * RiskEvidenceSynthesis.studyType
   */
  studyType?: CodeableConcept;

  /**
   * RiskEvidenceSynthesis.population
   */
  population: Reference<EvidenceVariable>;

  /**
   * RiskEvidenceSynthesis.exposure
   */
  exposure?: Reference<EvidenceVariable>;

  /**
   * RiskEvidenceSynthesis.outcome
   */
  outcome: Reference<EvidenceVariable>;

  /**
   * RiskEvidenceSynthesis.sampleSize
   */
  sampleSize?: RiskEvidenceSynthesisSampleSize;

  /**
   * RiskEvidenceSynthesis.riskEstimate
   */
  riskEstimate?: RiskEvidenceSynthesisRiskEstimate;

  /**
   * RiskEvidenceSynthesis.certainty
   */
  certainty?: RiskEvidenceSynthesisCertainty[];
}

/**
 * FHIR R4 RiskEvidenceSynthesisCertainty
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface RiskEvidenceSynthesisCertainty {

  /**
   * RiskEvidenceSynthesis.certainty.id
   */
  id?: string;

  /**
   * RiskEvidenceSynthesis.certainty.extension
   */
  extension?: Extension[];

  /**
   * RiskEvidenceSynthesis.certainty.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * RiskEvidenceSynthesis.certainty.rating
   */
  rating?: CodeableConcept[];

  /**
   * RiskEvidenceSynthesis.certainty.note
   */
  note?: Annotation[];

  /**
   * RiskEvidenceSynthesis.certainty.certaintySubcomponent
   */
  certaintySubcomponent?: RiskEvidenceSynthesisCertaintyCertaintySubcomponent[];
}

/**
 * FHIR R4 RiskEvidenceSynthesisCertaintyCertaintySubcomponent
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface RiskEvidenceSynthesisCertaintyCertaintySubcomponent {

  /**
   * RiskEvidenceSynthesis.certainty.certaintySubcomponent.id
   */
  id?: string;

  /**
   * RiskEvidenceSynthesis.certainty.certaintySubcomponent.extension
   */
  extension?: Extension[];

  /**
   * RiskEvidenceSynthesis.certainty.certaintySubcomponent.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * RiskEvidenceSynthesis.certainty.certaintySubcomponent.type
   */
  type?: CodeableConcept;

  /**
   * RiskEvidenceSynthesis.certainty.certaintySubcomponent.rating
   */
  rating?: CodeableConcept[];

  /**
   * RiskEvidenceSynthesis.certainty.certaintySubcomponent.note
   */
  note?: Annotation[];
}

/**
 * FHIR R4 RiskEvidenceSynthesisRiskEstimate
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface RiskEvidenceSynthesisRiskEstimate {

  /**
   * RiskEvidenceSynthesis.riskEstimate.id
   */
  id?: string;

  /**
   * RiskEvidenceSynthesis.riskEstimate.extension
   */
  extension?: Extension[];

  /**
   * RiskEvidenceSynthesis.riskEstimate.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * RiskEvidenceSynthesis.riskEstimate.description
   */
  description?: string;

  /**
   * RiskEvidenceSynthesis.riskEstimate.type
   */
  type?: CodeableConcept;

  /**
   * RiskEvidenceSynthesis.riskEstimate.value
   */
  value?: number;

  /**
   * RiskEvidenceSynthesis.riskEstimate.unitOfMeasure
   */
  unitOfMeasure?: CodeableConcept;

  /**
   * RiskEvidenceSynthesis.riskEstimate.denominatorCount
   */
  denominatorCount?: number;

  /**
   * RiskEvidenceSynthesis.riskEstimate.numeratorCount
   */
  numeratorCount?: number;

  /**
   * RiskEvidenceSynthesis.riskEstimate.precisionEstimate
   */
  precisionEstimate?: RiskEvidenceSynthesisRiskEstimatePrecisionEstimate[];
}

/**
 * FHIR R4 RiskEvidenceSynthesisRiskEstimatePrecisionEstimate
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface RiskEvidenceSynthesisRiskEstimatePrecisionEstimate {

  /**
   * RiskEvidenceSynthesis.riskEstimate.precisionEstimate.id
   */
  id?: string;

  /**
   * RiskEvidenceSynthesis.riskEstimate.precisionEstimate.extension
   */
  extension?: Extension[];

  /**
   * RiskEvidenceSynthesis.riskEstimate.precisionEstimate.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * RiskEvidenceSynthesis.riskEstimate.precisionEstimate.type
   */
  type?: CodeableConcept;

  /**
   * RiskEvidenceSynthesis.riskEstimate.precisionEstimate.level
   */
  level?: number;

  /**
   * RiskEvidenceSynthesis.riskEstimate.precisionEstimate.from
   */
  from?: number;

  /**
   * RiskEvidenceSynthesis.riskEstimate.precisionEstimate.to
   */
  to?: number;
}

/**
 * FHIR R4 RiskEvidenceSynthesisSampleSize
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface RiskEvidenceSynthesisSampleSize {

  /**
   * RiskEvidenceSynthesis.sampleSize.id
   */
  id?: string;

  /**
   * RiskEvidenceSynthesis.sampleSize.extension
   */
  extension?: Extension[];

  /**
   * RiskEvidenceSynthesis.sampleSize.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * RiskEvidenceSynthesis.sampleSize.description
   */
  description?: string;

  /**
   * RiskEvidenceSynthesis.sampleSize.numberOfStudies
   */
  numberOfStudies?: number;

  /**
   * RiskEvidenceSynthesis.sampleSize.numberOfParticipants
   */
  numberOfParticipants?: number;
}

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
import { RiskEvidenceSynthesis } from './RiskEvidenceSynthesis';
import { UsageContext } from './UsageContext';

/**
 * FHIR R4 EffectEvidenceSynthesis
 * @see https://hl7.org/fhir/R4/effectevidencesynthesis.html
 */
export interface EffectEvidenceSynthesis {

  /**
   * This is a EffectEvidenceSynthesis resource
   */
  readonly resourceType: 'EffectEvidenceSynthesis';

  /**
   * EffectEvidenceSynthesis.id
   */
  id?: string;

  /**
   * EffectEvidenceSynthesis.meta
   */
  meta?: Meta;

  /**
   * EffectEvidenceSynthesis.implicitRules
   */
  implicitRules?: string;

  /**
   * EffectEvidenceSynthesis.language
   */
  language?: string;

  /**
   * EffectEvidenceSynthesis.text
   */
  text?: Narrative;

  /**
   * EffectEvidenceSynthesis.contained
   */
  contained?: Resource[];

  /**
   * EffectEvidenceSynthesis.extension
   */
  extension?: Extension[];

  /**
   * EffectEvidenceSynthesis.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * EffectEvidenceSynthesis.url
   */
  url?: string;

  /**
   * EffectEvidenceSynthesis.identifier
   */
  identifier?: Identifier[];

  /**
   * EffectEvidenceSynthesis.version
   */
  version?: string;

  /**
   * EffectEvidenceSynthesis.name
   */
  name?: string;

  /**
   * EffectEvidenceSynthesis.title
   */
  title?: string;

  /**
   * EffectEvidenceSynthesis.status
   */
  status: 'draft' | 'active' | 'retired' | 'unknown';

  /**
   * EffectEvidenceSynthesis.date
   */
  date?: string;

  /**
   * EffectEvidenceSynthesis.publisher
   */
  publisher?: string;

  /**
   * EffectEvidenceSynthesis.contact
   */
  contact?: ContactDetail[];

  /**
   * EffectEvidenceSynthesis.description
   */
  description?: string;

  /**
   * EffectEvidenceSynthesis.note
   */
  note?: Annotation[];

  /**
   * EffectEvidenceSynthesis.useContext
   */
  useContext?: UsageContext[];

  /**
   * EffectEvidenceSynthesis.jurisdiction
   */
  jurisdiction?: CodeableConcept[];

  /**
   * EffectEvidenceSynthesis.copyright
   */
  copyright?: string;

  /**
   * EffectEvidenceSynthesis.approvalDate
   */
  approvalDate?: string;

  /**
   * EffectEvidenceSynthesis.lastReviewDate
   */
  lastReviewDate?: string;

  /**
   * EffectEvidenceSynthesis.effectivePeriod
   */
  effectivePeriod?: Period;

  /**
   * EffectEvidenceSynthesis.topic
   */
  topic?: CodeableConcept[];

  /**
   * EffectEvidenceSynthesis.author
   */
  author?: ContactDetail[];

  /**
   * EffectEvidenceSynthesis.editor
   */
  editor?: ContactDetail[];

  /**
   * EffectEvidenceSynthesis.reviewer
   */
  reviewer?: ContactDetail[];

  /**
   * EffectEvidenceSynthesis.endorser
   */
  endorser?: ContactDetail[];

  /**
   * EffectEvidenceSynthesis.relatedArtifact
   */
  relatedArtifact?: RelatedArtifact[];

  /**
   * EffectEvidenceSynthesis.synthesisType
   */
  synthesisType?: CodeableConcept;

  /**
   * EffectEvidenceSynthesis.studyType
   */
  studyType?: CodeableConcept;

  /**
   * EffectEvidenceSynthesis.population
   */
  population: Reference<EvidenceVariable>;

  /**
   * EffectEvidenceSynthesis.exposure
   */
  exposure: Reference<EvidenceVariable>;

  /**
   * EffectEvidenceSynthesis.exposureAlternative
   */
  exposureAlternative: Reference<EvidenceVariable>;

  /**
   * EffectEvidenceSynthesis.outcome
   */
  outcome: Reference<EvidenceVariable>;

  /**
   * EffectEvidenceSynthesis.sampleSize
   */
  sampleSize?: EffectEvidenceSynthesisSampleSize;

  /**
   * EffectEvidenceSynthesis.resultsByExposure
   */
  resultsByExposure?: EffectEvidenceSynthesisResultsByExposure[];

  /**
   * EffectEvidenceSynthesis.effectEstimate
   */
  effectEstimate?: EffectEvidenceSynthesisEffectEstimate[];

  /**
   * EffectEvidenceSynthesis.certainty
   */
  certainty?: EffectEvidenceSynthesisCertainty[];
}

/**
 * FHIR R4 EffectEvidenceSynthesisCertainty
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface EffectEvidenceSynthesisCertainty {

  /**
   * EffectEvidenceSynthesis.certainty.id
   */
  id?: string;

  /**
   * EffectEvidenceSynthesis.certainty.extension
   */
  extension?: Extension[];

  /**
   * EffectEvidenceSynthesis.certainty.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * EffectEvidenceSynthesis.certainty.rating
   */
  rating?: CodeableConcept[];

  /**
   * EffectEvidenceSynthesis.certainty.note
   */
  note?: Annotation[];

  /**
   * EffectEvidenceSynthesis.certainty.certaintySubcomponent
   */
  certaintySubcomponent?: EffectEvidenceSynthesisCertaintyCertaintySubcomponent[];
}

/**
 * FHIR R4 EffectEvidenceSynthesisCertaintyCertaintySubcomponent
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface EffectEvidenceSynthesisCertaintyCertaintySubcomponent {

  /**
   * EffectEvidenceSynthesis.certainty.certaintySubcomponent.id
   */
  id?: string;

  /**
   * EffectEvidenceSynthesis.certainty.certaintySubcomponent.extension
   */
  extension?: Extension[];

  /**
   * EffectEvidenceSynthesis.certainty.certaintySubcomponent.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * EffectEvidenceSynthesis.certainty.certaintySubcomponent.type
   */
  type?: CodeableConcept;

  /**
   * EffectEvidenceSynthesis.certainty.certaintySubcomponent.rating
   */
  rating?: CodeableConcept[];

  /**
   * EffectEvidenceSynthesis.certainty.certaintySubcomponent.note
   */
  note?: Annotation[];
}

/**
 * FHIR R4 EffectEvidenceSynthesisEffectEstimate
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface EffectEvidenceSynthesisEffectEstimate {

  /**
   * EffectEvidenceSynthesis.effectEstimate.id
   */
  id?: string;

  /**
   * EffectEvidenceSynthesis.effectEstimate.extension
   */
  extension?: Extension[];

  /**
   * EffectEvidenceSynthesis.effectEstimate.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * EffectEvidenceSynthesis.effectEstimate.description
   */
  description?: string;

  /**
   * EffectEvidenceSynthesis.effectEstimate.type
   */
  type?: CodeableConcept;

  /**
   * EffectEvidenceSynthesis.effectEstimate.variantState
   */
  variantState?: CodeableConcept;

  /**
   * EffectEvidenceSynthesis.effectEstimate.value
   */
  value?: number;

  /**
   * EffectEvidenceSynthesis.effectEstimate.unitOfMeasure
   */
  unitOfMeasure?: CodeableConcept;

  /**
   * EffectEvidenceSynthesis.effectEstimate.precisionEstimate
   */
  precisionEstimate?: EffectEvidenceSynthesisEffectEstimatePrecisionEstimate[];
}

/**
 * FHIR R4 EffectEvidenceSynthesisEffectEstimatePrecisionEstimate
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface EffectEvidenceSynthesisEffectEstimatePrecisionEstimate {

  /**
   * EffectEvidenceSynthesis.effectEstimate.precisionEstimate.id
   */
  id?: string;

  /**
   * EffectEvidenceSynthesis.effectEstimate.precisionEstimate.extension
   */
  extension?: Extension[];

  /**
   * EffectEvidenceSynthesis.effectEstimate.precisionEstimate.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * EffectEvidenceSynthesis.effectEstimate.precisionEstimate.type
   */
  type?: CodeableConcept;

  /**
   * EffectEvidenceSynthesis.effectEstimate.precisionEstimate.level
   */
  level?: number;

  /**
   * EffectEvidenceSynthesis.effectEstimate.precisionEstimate.from
   */
  from?: number;

  /**
   * EffectEvidenceSynthesis.effectEstimate.precisionEstimate.to
   */
  to?: number;
}

/**
 * FHIR R4 EffectEvidenceSynthesisResultsByExposure
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface EffectEvidenceSynthesisResultsByExposure {

  /**
   * EffectEvidenceSynthesis.resultsByExposure.id
   */
  id?: string;

  /**
   * EffectEvidenceSynthesis.resultsByExposure.extension
   */
  extension?: Extension[];

  /**
   * EffectEvidenceSynthesis.resultsByExposure.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * EffectEvidenceSynthesis.resultsByExposure.description
   */
  description?: string;

  /**
   * EffectEvidenceSynthesis.resultsByExposure.exposureState
   */
  exposureState?: string;

  /**
   * EffectEvidenceSynthesis.resultsByExposure.variantState
   */
  variantState?: CodeableConcept;

  /**
   * EffectEvidenceSynthesis.resultsByExposure.riskEvidenceSynthesis
   */
  riskEvidenceSynthesis: Reference<RiskEvidenceSynthesis>;
}

/**
 * FHIR R4 EffectEvidenceSynthesisSampleSize
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface EffectEvidenceSynthesisSampleSize {

  /**
   * EffectEvidenceSynthesis.sampleSize.id
   */
  id?: string;

  /**
   * EffectEvidenceSynthesis.sampleSize.extension
   */
  extension?: Extension[];

  /**
   * EffectEvidenceSynthesis.sampleSize.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * EffectEvidenceSynthesis.sampleSize.description
   */
  description?: string;

  /**
   * EffectEvidenceSynthesis.sampleSize.numberOfStudies
   */
  numberOfStudies?: number;

  /**
   * EffectEvidenceSynthesis.sampleSize.numberOfParticipants
   */
  numberOfParticipants?: number;
}

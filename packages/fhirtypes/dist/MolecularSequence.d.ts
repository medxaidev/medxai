import { CodeableConcept } from './CodeableConcept';
import { Device } from './Device';
import { Extension } from './Extension';
import { Identifier } from './Identifier';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { Observation } from './Observation';
import { Organization } from './Organization';
import { Patient } from './Patient';
import { Quantity } from './Quantity';
import { Reference } from './Reference';
import { Resource } from './Resource';
import { Specimen } from './Specimen';

/**
 * FHIR R4 MolecularSequence
 * @see https://hl7.org/fhir/R4/molecularsequence.html
 */
export interface MolecularSequence {

  /**
   * This is a MolecularSequence resource
   */
  readonly resourceType: 'MolecularSequence';

  /**
   * MolecularSequence.id
   */
  id?: string;

  /**
   * MolecularSequence.meta
   */
  meta?: Meta;

  /**
   * MolecularSequence.implicitRules
   */
  implicitRules?: string;

  /**
   * MolecularSequence.language
   */
  language?: string;

  /**
   * MolecularSequence.text
   */
  text?: Narrative;

  /**
   * MolecularSequence.contained
   */
  contained?: Resource[];

  /**
   * MolecularSequence.extension
   */
  extension?: Extension[];

  /**
   * MolecularSequence.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * MolecularSequence.identifier
   */
  identifier?: Identifier[];

  /**
   * MolecularSequence.type
   */
  type?: string;

  /**
   * MolecularSequence.coordinateSystem
   */
  coordinateSystem: number;

  /**
   * MolecularSequence.patient
   */
  patient?: Reference<Patient>;

  /**
   * MolecularSequence.specimen
   */
  specimen?: Reference<Specimen>;

  /**
   * MolecularSequence.device
   */
  device?: Reference<Device>;

  /**
   * MolecularSequence.performer
   */
  performer?: Reference<Organization>;

  /**
   * MolecularSequence.quantity
   */
  quantity?: Quantity;

  /**
   * MolecularSequence.referenceSeq
   */
  referenceSeq?: MolecularSequenceReferenceSeq;

  /**
   * MolecularSequence.variant
   */
  variant?: MolecularSequenceVariant[];

  /**
   * MolecularSequence.observedSeq
   */
  observedSeq?: string;

  /**
   * MolecularSequence.quality
   */
  quality?: MolecularSequenceQuality[];

  /**
   * MolecularSequence.readCoverage
   */
  readCoverage?: number;

  /**
   * MolecularSequence.repository
   */
  repository?: MolecularSequenceRepository[];

  /**
   * MolecularSequence.pointer
   */
  pointer?: Reference<MolecularSequence>[];

  /**
   * MolecularSequence.structureVariant
   */
  structureVariant?: MolecularSequenceStructureVariant[];
}

/**
 * FHIR R4 MolecularSequenceQuality
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface MolecularSequenceQuality {

  /**
   * MolecularSequence.quality.id
   */
  id?: string;

  /**
   * MolecularSequence.quality.extension
   */
  extension?: Extension[];

  /**
   * MolecularSequence.quality.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * MolecularSequence.quality.type
   */
  type: string;

  /**
   * MolecularSequence.quality.standardSequence
   */
  standardSequence?: CodeableConcept;

  /**
   * MolecularSequence.quality.start
   */
  start?: number;

  /**
   * MolecularSequence.quality.end
   */
  end?: number;

  /**
   * MolecularSequence.quality.score
   */
  score?: Quantity;

  /**
   * MolecularSequence.quality.method
   */
  method?: CodeableConcept;

  /**
   * MolecularSequence.quality.truthTP
   */
  truthTP?: number;

  /**
   * MolecularSequence.quality.queryTP
   */
  queryTP?: number;

  /**
   * MolecularSequence.quality.truthFN
   */
  truthFN?: number;

  /**
   * MolecularSequence.quality.queryFP
   */
  queryFP?: number;

  /**
   * MolecularSequence.quality.gtFP
   */
  gtFP?: number;

  /**
   * MolecularSequence.quality.precision
   */
  precision?: number;

  /**
   * MolecularSequence.quality.recall
   */
  recall?: number;

  /**
   * MolecularSequence.quality.fScore
   */
  fScore?: number;

  /**
   * MolecularSequence.quality.roc
   */
  roc?: MolecularSequenceQualityRoc;
}

/**
 * FHIR R4 MolecularSequenceQualityRoc
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface MolecularSequenceQualityRoc {

  /**
   * MolecularSequence.quality.roc.id
   */
  id?: string;

  /**
   * MolecularSequence.quality.roc.extension
   */
  extension?: Extension[];

  /**
   * MolecularSequence.quality.roc.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * MolecularSequence.quality.roc.score
   */
  score?: number[];

  /**
   * MolecularSequence.quality.roc.numTP
   */
  numTP?: number[];

  /**
   * MolecularSequence.quality.roc.numFP
   */
  numFP?: number[];

  /**
   * MolecularSequence.quality.roc.numFN
   */
  numFN?: number[];

  /**
   * MolecularSequence.quality.roc.precision
   */
  precision?: number[];

  /**
   * MolecularSequence.quality.roc.sensitivity
   */
  sensitivity?: number[];

  /**
   * MolecularSequence.quality.roc.fMeasure
   */
  fMeasure?: number[];
}

/**
 * FHIR R4 MolecularSequenceReferenceSeq
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface MolecularSequenceReferenceSeq {

  /**
   * MolecularSequence.referenceSeq.id
   */
  id?: string;

  /**
   * MolecularSequence.referenceSeq.extension
   */
  extension?: Extension[];

  /**
   * MolecularSequence.referenceSeq.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * MolecularSequence.referenceSeq.chromosome
   */
  chromosome?: CodeableConcept;

  /**
   * MolecularSequence.referenceSeq.genomeBuild
   */
  genomeBuild?: string;

  /**
   * MolecularSequence.referenceSeq.orientation
   */
  orientation?: string;

  /**
   * MolecularSequence.referenceSeq.referenceSeqId
   */
  referenceSeqId?: CodeableConcept;

  /**
   * MolecularSequence.referenceSeq.referenceSeqPointer
   */
  referenceSeqPointer?: Reference<MolecularSequence>;

  /**
   * MolecularSequence.referenceSeq.referenceSeqString
   */
  referenceSeqString?: string;

  /**
   * MolecularSequence.referenceSeq.strand
   */
  strand?: string;

  /**
   * MolecularSequence.referenceSeq.windowStart
   */
  windowStart?: number;

  /**
   * MolecularSequence.referenceSeq.windowEnd
   */
  windowEnd?: number;
}

/**
 * FHIR R4 MolecularSequenceRepository
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface MolecularSequenceRepository {

  /**
   * MolecularSequence.repository.id
   */
  id?: string;

  /**
   * MolecularSequence.repository.extension
   */
  extension?: Extension[];

  /**
   * MolecularSequence.repository.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * MolecularSequence.repository.type
   */
  type: string;

  /**
   * MolecularSequence.repository.url
   */
  url?: string;

  /**
   * MolecularSequence.repository.name
   */
  name?: string;

  /**
   * MolecularSequence.repository.datasetId
   */
  datasetId?: string;

  /**
   * MolecularSequence.repository.variantsetId
   */
  variantsetId?: string;

  /**
   * MolecularSequence.repository.readsetId
   */
  readsetId?: string;
}

/**
 * FHIR R4 MolecularSequenceStructureVariant
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface MolecularSequenceStructureVariant {

  /**
   * MolecularSequence.structureVariant.id
   */
  id?: string;

  /**
   * MolecularSequence.structureVariant.extension
   */
  extension?: Extension[];

  /**
   * MolecularSequence.structureVariant.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * MolecularSequence.structureVariant.variantType
   */
  variantType?: CodeableConcept;

  /**
   * MolecularSequence.structureVariant.exact
   */
  exact?: boolean;

  /**
   * MolecularSequence.structureVariant.length
   */
  length?: number;

  /**
   * MolecularSequence.structureVariant.outer
   */
  outer?: MolecularSequenceStructureVariantOuter;

  /**
   * MolecularSequence.structureVariant.inner
   */
  inner?: MolecularSequenceStructureVariantInner;
}

/**
 * FHIR R4 MolecularSequenceStructureVariantInner
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface MolecularSequenceStructureVariantInner {

  /**
   * MolecularSequence.structureVariant.inner.id
   */
  id?: string;

  /**
   * MolecularSequence.structureVariant.inner.extension
   */
  extension?: Extension[];

  /**
   * MolecularSequence.structureVariant.inner.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * MolecularSequence.structureVariant.inner.start
   */
  start?: number;

  /**
   * MolecularSequence.structureVariant.inner.end
   */
  end?: number;
}

/**
 * FHIR R4 MolecularSequenceStructureVariantOuter
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface MolecularSequenceStructureVariantOuter {

  /**
   * MolecularSequence.structureVariant.outer.id
   */
  id?: string;

  /**
   * MolecularSequence.structureVariant.outer.extension
   */
  extension?: Extension[];

  /**
   * MolecularSequence.structureVariant.outer.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * MolecularSequence.structureVariant.outer.start
   */
  start?: number;

  /**
   * MolecularSequence.structureVariant.outer.end
   */
  end?: number;
}

/**
 * FHIR R4 MolecularSequenceVariant
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface MolecularSequenceVariant {

  /**
   * MolecularSequence.variant.id
   */
  id?: string;

  /**
   * MolecularSequence.variant.extension
   */
  extension?: Extension[];

  /**
   * MolecularSequence.variant.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * MolecularSequence.variant.start
   */
  start?: number;

  /**
   * MolecularSequence.variant.end
   */
  end?: number;

  /**
   * MolecularSequence.variant.observedAllele
   */
  observedAllele?: string;

  /**
   * MolecularSequence.variant.referenceAllele
   */
  referenceAllele?: string;

  /**
   * MolecularSequence.variant.cigar
   */
  cigar?: string;

  /**
   * MolecularSequence.variant.variantPointer
   */
  variantPointer?: Reference<Observation>;
}

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
 * FHIR R4 Evidence
 * @see https://hl7.org/fhir/R4/evidence.html
 */
export interface Evidence {

  /**
   * This is a Evidence resource
   */
  readonly resourceType: 'Evidence';

  /**
   * Evidence.id
   */
  id?: string;

  /**
   * Evidence.meta
   */
  meta?: Meta;

  /**
   * Evidence.implicitRules
   */
  implicitRules?: string;

  /**
   * Evidence.language
   */
  language?: string;

  /**
   * Evidence.text
   */
  text?: Narrative;

  /**
   * Evidence.contained
   */
  contained?: Resource[];

  /**
   * Evidence.extension
   */
  extension?: Extension[];

  /**
   * Evidence.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Evidence.url
   */
  url?: string;

  /**
   * Evidence.identifier
   */
  identifier?: Identifier[];

  /**
   * Evidence.version
   */
  version?: string;

  /**
   * Evidence.name
   */
  name?: string;

  /**
   * Evidence.title
   */
  title?: string;

  /**
   * Evidence.shortTitle
   */
  shortTitle?: string;

  /**
   * Evidence.subtitle
   */
  subtitle?: string;

  /**
   * Evidence.status
   */
  status: 'draft' | 'active' | 'retired' | 'unknown';

  /**
   * Evidence.date
   */
  date?: string;

  /**
   * Evidence.publisher
   */
  publisher?: string;

  /**
   * Evidence.contact
   */
  contact?: ContactDetail[];

  /**
   * Evidence.description
   */
  description?: string;

  /**
   * Evidence.note
   */
  note?: Annotation[];

  /**
   * Evidence.useContext
   */
  useContext?: UsageContext[];

  /**
   * Evidence.jurisdiction
   */
  jurisdiction?: CodeableConcept[];

  /**
   * Evidence.copyright
   */
  copyright?: string;

  /**
   * Evidence.approvalDate
   */
  approvalDate?: string;

  /**
   * Evidence.lastReviewDate
   */
  lastReviewDate?: string;

  /**
   * Evidence.effectivePeriod
   */
  effectivePeriod?: Period;

  /**
   * Evidence.topic
   */
  topic?: CodeableConcept[];

  /**
   * Evidence.author
   */
  author?: ContactDetail[];

  /**
   * Evidence.editor
   */
  editor?: ContactDetail[];

  /**
   * Evidence.reviewer
   */
  reviewer?: ContactDetail[];

  /**
   * Evidence.endorser
   */
  endorser?: ContactDetail[];

  /**
   * Evidence.relatedArtifact
   */
  relatedArtifact?: RelatedArtifact[];

  /**
   * Evidence.exposureBackground
   */
  exposureBackground: Reference<EvidenceVariable>;

  /**
   * Evidence.exposureVariant
   */
  exposureVariant?: Reference<EvidenceVariable>[];

  /**
   * Evidence.outcome
   */
  outcome?: Reference<EvidenceVariable>[];
}

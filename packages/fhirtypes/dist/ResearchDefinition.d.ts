import { CodeableConcept } from './CodeableConcept';
import { ContactDetail } from './ContactDetail';
import { Extension } from './Extension';
import { Group } from './Group';
import { Identifier } from './Identifier';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { Period } from './Period';
import { Reference } from './Reference';
import { RelatedArtifact } from './RelatedArtifact';
import { ResearchElementDefinition } from './ResearchElementDefinition';
import { Resource } from './Resource';
import { UsageContext } from './UsageContext';

/**
 * FHIR R4 ResearchDefinition
 * @see https://hl7.org/fhir/R4/researchdefinition.html
 */
export interface ResearchDefinition {

  /**
   * This is a ResearchDefinition resource
   */
  readonly resourceType: 'ResearchDefinition';

  /**
   * ResearchDefinition.id
   */
  id?: string;

  /**
   * ResearchDefinition.meta
   */
  meta?: Meta;

  /**
   * ResearchDefinition.implicitRules
   */
  implicitRules?: string;

  /**
   * ResearchDefinition.language
   */
  language?: string;

  /**
   * ResearchDefinition.text
   */
  text?: Narrative;

  /**
   * ResearchDefinition.contained
   */
  contained?: Resource[];

  /**
   * ResearchDefinition.extension
   */
  extension?: Extension[];

  /**
   * ResearchDefinition.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * ResearchDefinition.url
   */
  url?: string;

  /**
   * ResearchDefinition.identifier
   */
  identifier?: Identifier[];

  /**
   * ResearchDefinition.version
   */
  version?: string;

  /**
   * ResearchDefinition.name
   */
  name?: string;

  /**
   * ResearchDefinition.title
   */
  title?: string;

  /**
   * ResearchDefinition.shortTitle
   */
  shortTitle?: string;

  /**
   * ResearchDefinition.subtitle
   */
  subtitle?: string;

  /**
   * ResearchDefinition.status
   */
  status: 'draft' | 'active' | 'retired' | 'unknown';

  /**
   * ResearchDefinition.experimental
   */
  experimental?: boolean;

  /**
   * ResearchDefinition.subject[x]
   */
  subjectCodeableConcept?: CodeableConcept;

  /**
   * ResearchDefinition.subject[x]
   */
  subjectReference?: Reference<Group>;

  /**
   * ResearchDefinition.date
   */
  date?: string;

  /**
   * ResearchDefinition.publisher
   */
  publisher?: string;

  /**
   * ResearchDefinition.contact
   */
  contact?: ContactDetail[];

  /**
   * ResearchDefinition.description
   */
  description?: string;

  /**
   * ResearchDefinition.comment
   */
  comment?: string[];

  /**
   * ResearchDefinition.useContext
   */
  useContext?: UsageContext[];

  /**
   * ResearchDefinition.jurisdiction
   */
  jurisdiction?: CodeableConcept[];

  /**
   * ResearchDefinition.purpose
   */
  purpose?: string;

  /**
   * ResearchDefinition.usage
   */
  usage?: string;

  /**
   * ResearchDefinition.copyright
   */
  copyright?: string;

  /**
   * ResearchDefinition.approvalDate
   */
  approvalDate?: string;

  /**
   * ResearchDefinition.lastReviewDate
   */
  lastReviewDate?: string;

  /**
   * ResearchDefinition.effectivePeriod
   */
  effectivePeriod?: Period;

  /**
   * ResearchDefinition.topic
   */
  topic?: CodeableConcept[];

  /**
   * ResearchDefinition.author
   */
  author?: ContactDetail[];

  /**
   * ResearchDefinition.editor
   */
  editor?: ContactDetail[];

  /**
   * ResearchDefinition.reviewer
   */
  reviewer?: ContactDetail[];

  /**
   * ResearchDefinition.endorser
   */
  endorser?: ContactDetail[];

  /**
   * ResearchDefinition.relatedArtifact
   */
  relatedArtifact?: RelatedArtifact[];

  /**
   * ResearchDefinition.library
   */
  library?: string[];

  /**
   * ResearchDefinition.population
   */
  population: Reference<ResearchElementDefinition>;

  /**
   * ResearchDefinition.exposure
   */
  exposure?: Reference<ResearchElementDefinition>;

  /**
   * ResearchDefinition.exposureAlternative
   */
  exposureAlternative?: Reference<ResearchElementDefinition>;

  /**
   * ResearchDefinition.outcome
   */
  outcome?: Reference<ResearchElementDefinition>;
}

/**
 * ResearchDefinition.subject[x]
 */
export type ResearchDefinitionSubject = CodeableConcept | Reference<Group>;

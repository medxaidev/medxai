import { Attachment } from './Attachment';
import { CodeableConcept } from './CodeableConcept';
import { ContactDetail } from './ContactDetail';
import { DataRequirement } from './DataRequirement';
import { Extension } from './Extension';
import { Group } from './Group';
import { Identifier } from './Identifier';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { ParameterDefinition } from './ParameterDefinition';
import { Period } from './Period';
import { Reference } from './Reference';
import { RelatedArtifact } from './RelatedArtifact';
import { Resource } from './Resource';
import { UsageContext } from './UsageContext';

/**
 * FHIR R4 Library
 * @see https://hl7.org/fhir/R4/library.html
 */
export interface Library {

  /**
   * This is a Library resource
   */
  readonly resourceType: 'Library';

  /**
   * Library.id
   */
  id?: string;

  /**
   * Library.meta
   */
  meta?: Meta;

  /**
   * Library.implicitRules
   */
  implicitRules?: string;

  /**
   * Library.language
   */
  language?: string;

  /**
   * Library.text
   */
  text?: Narrative;

  /**
   * Library.contained
   */
  contained?: Resource[];

  /**
   * Library.extension
   */
  extension?: Extension[];

  /**
   * Library.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Library.url
   */
  url?: string;

  /**
   * Library.identifier
   */
  identifier?: Identifier[];

  /**
   * Library.version
   */
  version?: string;

  /**
   * Library.name
   */
  name?: string;

  /**
   * Library.title
   */
  title?: string;

  /**
   * Library.subtitle
   */
  subtitle?: string;

  /**
   * Library.status
   */
  status: 'draft' | 'active' | 'retired' | 'unknown';

  /**
   * Library.experimental
   */
  experimental?: boolean;

  /**
   * Library.type
   */
  type: CodeableConcept;

  /**
   * Library.subject[x]
   */
  subjectCodeableConcept?: CodeableConcept;

  /**
   * Library.subject[x]
   */
  subjectReference?: Reference<Group>;

  /**
   * Library.date
   */
  date?: string;

  /**
   * Library.publisher
   */
  publisher?: string;

  /**
   * Library.contact
   */
  contact?: ContactDetail[];

  /**
   * Library.description
   */
  description?: string;

  /**
   * Library.useContext
   */
  useContext?: UsageContext[];

  /**
   * Library.jurisdiction
   */
  jurisdiction?: CodeableConcept[];

  /**
   * Library.purpose
   */
  purpose?: string;

  /**
   * Library.usage
   */
  usage?: string;

  /**
   * Library.copyright
   */
  copyright?: string;

  /**
   * Library.approvalDate
   */
  approvalDate?: string;

  /**
   * Library.lastReviewDate
   */
  lastReviewDate?: string;

  /**
   * Library.effectivePeriod
   */
  effectivePeriod?: Period;

  /**
   * Library.topic
   */
  topic?: CodeableConcept[];

  /**
   * Library.author
   */
  author?: ContactDetail[];

  /**
   * Library.editor
   */
  editor?: ContactDetail[];

  /**
   * Library.reviewer
   */
  reviewer?: ContactDetail[];

  /**
   * Library.endorser
   */
  endorser?: ContactDetail[];

  /**
   * Library.relatedArtifact
   */
  relatedArtifact?: RelatedArtifact[];

  /**
   * Library.parameter
   */
  parameter?: ParameterDefinition[];

  /**
   * Library.dataRequirement
   */
  dataRequirement?: DataRequirement[];

  /**
   * Library.content
   */
  content?: Attachment[];
}

/**
 * Library.subject[x]
 */
export type LibrarySubject = CodeableConcept | Reference<Group>;

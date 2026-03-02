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
import { Resource } from './Resource';
import { TriggerDefinition } from './TriggerDefinition';
import { UsageContext } from './UsageContext';

/**
 * FHIR R4 EventDefinition
 * @see https://hl7.org/fhir/R4/eventdefinition.html
 */
export interface EventDefinition {

  /**
   * This is a EventDefinition resource
   */
  readonly resourceType: 'EventDefinition';

  /**
   * EventDefinition.id
   */
  id?: string;

  /**
   * EventDefinition.meta
   */
  meta?: Meta;

  /**
   * EventDefinition.implicitRules
   */
  implicitRules?: string;

  /**
   * EventDefinition.language
   */
  language?: string;

  /**
   * EventDefinition.text
   */
  text?: Narrative;

  /**
   * EventDefinition.contained
   */
  contained?: Resource[];

  /**
   * EventDefinition.extension
   */
  extension?: Extension[];

  /**
   * EventDefinition.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * EventDefinition.url
   */
  url?: string;

  /**
   * EventDefinition.identifier
   */
  identifier?: Identifier[];

  /**
   * EventDefinition.version
   */
  version?: string;

  /**
   * EventDefinition.name
   */
  name?: string;

  /**
   * EventDefinition.title
   */
  title?: string;

  /**
   * EventDefinition.subtitle
   */
  subtitle?: string;

  /**
   * EventDefinition.status
   */
  status: 'draft' | 'active' | 'retired' | 'unknown';

  /**
   * EventDefinition.experimental
   */
  experimental?: boolean;

  /**
   * EventDefinition.subject[x]
   */
  subjectCodeableConcept?: CodeableConcept;

  /**
   * EventDefinition.subject[x]
   */
  subjectReference?: Reference<Group>;

  /**
   * EventDefinition.date
   */
  date?: string;

  /**
   * EventDefinition.publisher
   */
  publisher?: string;

  /**
   * EventDefinition.contact
   */
  contact?: ContactDetail[];

  /**
   * EventDefinition.description
   */
  description?: string;

  /**
   * EventDefinition.useContext
   */
  useContext?: UsageContext[];

  /**
   * EventDefinition.jurisdiction
   */
  jurisdiction?: CodeableConcept[];

  /**
   * EventDefinition.purpose
   */
  purpose?: string;

  /**
   * EventDefinition.usage
   */
  usage?: string;

  /**
   * EventDefinition.copyright
   */
  copyright?: string;

  /**
   * EventDefinition.approvalDate
   */
  approvalDate?: string;

  /**
   * EventDefinition.lastReviewDate
   */
  lastReviewDate?: string;

  /**
   * EventDefinition.effectivePeriod
   */
  effectivePeriod?: Period;

  /**
   * EventDefinition.topic
   */
  topic?: CodeableConcept[];

  /**
   * EventDefinition.author
   */
  author?: ContactDetail[];

  /**
   * EventDefinition.editor
   */
  editor?: ContactDetail[];

  /**
   * EventDefinition.reviewer
   */
  reviewer?: ContactDetail[];

  /**
   * EventDefinition.endorser
   */
  endorser?: ContactDetail[];

  /**
   * EventDefinition.relatedArtifact
   */
  relatedArtifact?: RelatedArtifact[];

  /**
   * EventDefinition.trigger
   */
  trigger: TriggerDefinition[];
}

/**
 * EventDefinition.subject[x]
 */
export type EventDefinitionSubject = CodeableConcept | Reference<Group>;

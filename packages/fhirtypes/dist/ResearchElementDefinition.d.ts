import { CodeableConcept } from './CodeableConcept';
import { ContactDetail } from './ContactDetail';
import { DataRequirement } from './DataRequirement';
import { Duration } from './Duration';
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
import { Timing } from './Timing';
import { UsageContext } from './UsageContext';

/**
 * FHIR R4 ResearchElementDefinition
 * @see https://hl7.org/fhir/R4/researchelementdefinition.html
 */
export interface ResearchElementDefinition {

  /**
   * This is a ResearchElementDefinition resource
   */
  readonly resourceType: 'ResearchElementDefinition';

  /**
   * ResearchElementDefinition.id
   */
  id?: string;

  /**
   * ResearchElementDefinition.meta
   */
  meta?: Meta;

  /**
   * ResearchElementDefinition.implicitRules
   */
  implicitRules?: string;

  /**
   * ResearchElementDefinition.language
   */
  language?: string;

  /**
   * ResearchElementDefinition.text
   */
  text?: Narrative;

  /**
   * ResearchElementDefinition.contained
   */
  contained?: Resource[];

  /**
   * ResearchElementDefinition.extension
   */
  extension?: Extension[];

  /**
   * ResearchElementDefinition.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * ResearchElementDefinition.url
   */
  url?: string;

  /**
   * ResearchElementDefinition.identifier
   */
  identifier?: Identifier[];

  /**
   * ResearchElementDefinition.version
   */
  version?: string;

  /**
   * ResearchElementDefinition.name
   */
  name?: string;

  /**
   * ResearchElementDefinition.title
   */
  title?: string;

  /**
   * ResearchElementDefinition.shortTitle
   */
  shortTitle?: string;

  /**
   * ResearchElementDefinition.subtitle
   */
  subtitle?: string;

  /**
   * ResearchElementDefinition.status
   */
  status: 'draft' | 'active' | 'retired' | 'unknown';

  /**
   * ResearchElementDefinition.experimental
   */
  experimental?: boolean;

  /**
   * ResearchElementDefinition.subject[x]
   */
  subjectCodeableConcept?: CodeableConcept;

  /**
   * ResearchElementDefinition.subject[x]
   */
  subjectReference?: Reference<Group>;

  /**
   * ResearchElementDefinition.date
   */
  date?: string;

  /**
   * ResearchElementDefinition.publisher
   */
  publisher?: string;

  /**
   * ResearchElementDefinition.contact
   */
  contact?: ContactDetail[];

  /**
   * ResearchElementDefinition.description
   */
  description?: string;

  /**
   * ResearchElementDefinition.comment
   */
  comment?: string[];

  /**
   * ResearchElementDefinition.useContext
   */
  useContext?: UsageContext[];

  /**
   * ResearchElementDefinition.jurisdiction
   */
  jurisdiction?: CodeableConcept[];

  /**
   * ResearchElementDefinition.purpose
   */
  purpose?: string;

  /**
   * ResearchElementDefinition.usage
   */
  usage?: string;

  /**
   * ResearchElementDefinition.copyright
   */
  copyright?: string;

  /**
   * ResearchElementDefinition.approvalDate
   */
  approvalDate?: string;

  /**
   * ResearchElementDefinition.lastReviewDate
   */
  lastReviewDate?: string;

  /**
   * ResearchElementDefinition.effectivePeriod
   */
  effectivePeriod?: Period;

  /**
   * ResearchElementDefinition.topic
   */
  topic?: CodeableConcept[];

  /**
   * ResearchElementDefinition.author
   */
  author?: ContactDetail[];

  /**
   * ResearchElementDefinition.editor
   */
  editor?: ContactDetail[];

  /**
   * ResearchElementDefinition.reviewer
   */
  reviewer?: ContactDetail[];

  /**
   * ResearchElementDefinition.endorser
   */
  endorser?: ContactDetail[];

  /**
   * ResearchElementDefinition.relatedArtifact
   */
  relatedArtifact?: RelatedArtifact[];

  /**
   * ResearchElementDefinition.library
   */
  library?: string[];

  /**
   * ResearchElementDefinition.type
   */
  type: string;

  /**
   * ResearchElementDefinition.variableType
   */
  variableType?: string;

  /**
   * ResearchElementDefinition.characteristic
   */
  characteristic: ResearchElementDefinitionCharacteristic[];
}

/**
 * ResearchElementDefinition.subject[x]
 */
export type ResearchElementDefinitionSubject = CodeableConcept | Reference<Group>;

/**
 * FHIR R4 ResearchElementDefinitionCharacteristic
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ResearchElementDefinitionCharacteristic {

  /**
   * ResearchElementDefinition.characteristic.id
   */
  id?: string;

  /**
   * ResearchElementDefinition.characteristic.extension
   */
  extension?: Extension[];

  /**
   * ResearchElementDefinition.characteristic.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * ResearchElementDefinition.characteristic.definition[x]
   */
  definitionCodeableConcept: CodeableConcept;

  /**
   * ResearchElementDefinition.characteristic.definition[x]
   */
  definitionCanonical: string;

  /**
   * ResearchElementDefinition.characteristic.definition[x]
   */
  definitionExpression: Expression;

  /**
   * ResearchElementDefinition.characteristic.definition[x]
   */
  definitionDataRequirement: DataRequirement;

  /**
   * ResearchElementDefinition.characteristic.usageContext
   */
  usageContext?: UsageContext[];

  /**
   * ResearchElementDefinition.characteristic.exclude
   */
  exclude?: boolean;

  /**
   * ResearchElementDefinition.characteristic.unitOfMeasure
   */
  unitOfMeasure?: CodeableConcept;

  /**
   * ResearchElementDefinition.characteristic.studyEffectiveDescription
   */
  studyEffectiveDescription?: string;

  /**
   * ResearchElementDefinition.characteristic.studyEffective[x]
   */
  studyEffectiveDateTime?: string;

  /**
   * ResearchElementDefinition.characteristic.studyEffective[x]
   */
  studyEffectivePeriod?: Period;

  /**
   * ResearchElementDefinition.characteristic.studyEffective[x]
   */
  studyEffectiveDuration?: Duration;

  /**
   * ResearchElementDefinition.characteristic.studyEffective[x]
   */
  studyEffectiveTiming?: Timing;

  /**
   * ResearchElementDefinition.characteristic.studyEffectiveTimeFromStart
   */
  studyEffectiveTimeFromStart?: Duration;

  /**
   * ResearchElementDefinition.characteristic.studyEffectiveGroupMeasure
   */
  studyEffectiveGroupMeasure?: string;

  /**
   * ResearchElementDefinition.characteristic.participantEffectiveDescription
   */
  participantEffectiveDescription?: string;

  /**
   * ResearchElementDefinition.characteristic.participantEffective[x]
   */
  participantEffectiveDateTime?: string;

  /**
   * ResearchElementDefinition.characteristic.participantEffective[x]
   */
  participantEffectivePeriod?: Period;

  /**
   * ResearchElementDefinition.characteristic.participantEffective[x]
   */
  participantEffectiveDuration?: Duration;

  /**
   * ResearchElementDefinition.characteristic.participantEffective[x]
   */
  participantEffectiveTiming?: Timing;

  /**
   * ResearchElementDefinition.characteristic.participantEffectiveTimeFromStart
   */
  participantEffectiveTimeFromStart?: Duration;

  /**
   * ResearchElementDefinition.characteristic.participantEffectiveGroupMeasure
   */
  participantEffectiveGroupMeasure?: string;
}

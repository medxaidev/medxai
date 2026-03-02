import { Annotation } from './Annotation';
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
import { TriggerDefinition } from './TriggerDefinition';
import { UsageContext } from './UsageContext';

/**
 * FHIR R4 EvidenceVariable
 * @see https://hl7.org/fhir/R4/evidencevariable.html
 */
export interface EvidenceVariable {

  /**
   * This is a EvidenceVariable resource
   */
  readonly resourceType: 'EvidenceVariable';

  /**
   * EvidenceVariable.id
   */
  id?: string;

  /**
   * EvidenceVariable.meta
   */
  meta?: Meta;

  /**
   * EvidenceVariable.implicitRules
   */
  implicitRules?: string;

  /**
   * EvidenceVariable.language
   */
  language?: string;

  /**
   * EvidenceVariable.text
   */
  text?: Narrative;

  /**
   * EvidenceVariable.contained
   */
  contained?: Resource[];

  /**
   * EvidenceVariable.extension
   */
  extension?: Extension[];

  /**
   * EvidenceVariable.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * EvidenceVariable.url
   */
  url?: string;

  /**
   * EvidenceVariable.identifier
   */
  identifier?: Identifier[];

  /**
   * EvidenceVariable.version
   */
  version?: string;

  /**
   * EvidenceVariable.name
   */
  name?: string;

  /**
   * EvidenceVariable.title
   */
  title?: string;

  /**
   * EvidenceVariable.shortTitle
   */
  shortTitle?: string;

  /**
   * EvidenceVariable.subtitle
   */
  subtitle?: string;

  /**
   * EvidenceVariable.status
   */
  status: 'draft' | 'active' | 'retired' | 'unknown';

  /**
   * EvidenceVariable.date
   */
  date?: string;

  /**
   * EvidenceVariable.publisher
   */
  publisher?: string;

  /**
   * EvidenceVariable.contact
   */
  contact?: ContactDetail[];

  /**
   * EvidenceVariable.description
   */
  description?: string;

  /**
   * EvidenceVariable.note
   */
  note?: Annotation[];

  /**
   * EvidenceVariable.useContext
   */
  useContext?: UsageContext[];

  /**
   * EvidenceVariable.jurisdiction
   */
  jurisdiction?: CodeableConcept[];

  /**
   * EvidenceVariable.copyright
   */
  copyright?: string;

  /**
   * EvidenceVariable.approvalDate
   */
  approvalDate?: string;

  /**
   * EvidenceVariable.lastReviewDate
   */
  lastReviewDate?: string;

  /**
   * EvidenceVariable.effectivePeriod
   */
  effectivePeriod?: Period;

  /**
   * EvidenceVariable.topic
   */
  topic?: CodeableConcept[];

  /**
   * EvidenceVariable.author
   */
  author?: ContactDetail[];

  /**
   * EvidenceVariable.editor
   */
  editor?: ContactDetail[];

  /**
   * EvidenceVariable.reviewer
   */
  reviewer?: ContactDetail[];

  /**
   * EvidenceVariable.endorser
   */
  endorser?: ContactDetail[];

  /**
   * EvidenceVariable.relatedArtifact
   */
  relatedArtifact?: RelatedArtifact[];

  /**
   * EvidenceVariable.type
   */
  type?: string;

  /**
   * EvidenceVariable.characteristic
   */
  characteristic: EvidenceVariableCharacteristic[];
}

/**
 * FHIR R4 EvidenceVariableCharacteristic
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface EvidenceVariableCharacteristic {

  /**
   * EvidenceVariable.characteristic.id
   */
  id?: string;

  /**
   * EvidenceVariable.characteristic.extension
   */
  extension?: Extension[];

  /**
   * EvidenceVariable.characteristic.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * EvidenceVariable.characteristic.description
   */
  description?: string;

  /**
   * EvidenceVariable.characteristic.definition[x]
   */
  definitionReference: Reference<Group>;

  /**
   * EvidenceVariable.characteristic.definition[x]
   */
  definitionCanonical: string;

  /**
   * EvidenceVariable.characteristic.definition[x]
   */
  definitionCodeableConcept: CodeableConcept;

  /**
   * EvidenceVariable.characteristic.definition[x]
   */
  definitionExpression: Expression;

  /**
   * EvidenceVariable.characteristic.definition[x]
   */
  definitionDataRequirement: DataRequirement;

  /**
   * EvidenceVariable.characteristic.definition[x]
   */
  definitionTriggerDefinition: TriggerDefinition;

  /**
   * EvidenceVariable.characteristic.usageContext
   */
  usageContext?: UsageContext[];

  /**
   * EvidenceVariable.characteristic.exclude
   */
  exclude?: boolean;

  /**
   * EvidenceVariable.characteristic.participantEffective[x]
   */
  participantEffectiveDateTime?: string;

  /**
   * EvidenceVariable.characteristic.participantEffective[x]
   */
  participantEffectivePeriod?: Period;

  /**
   * EvidenceVariable.characteristic.participantEffective[x]
   */
  participantEffectiveDuration?: Duration;

  /**
   * EvidenceVariable.characteristic.participantEffective[x]
   */
  participantEffectiveTiming?: Timing;

  /**
   * EvidenceVariable.characteristic.timeFromStart
   */
  timeFromStart?: Duration;

  /**
   * EvidenceVariable.characteristic.groupMeasure
   */
  groupMeasure?: string;
}

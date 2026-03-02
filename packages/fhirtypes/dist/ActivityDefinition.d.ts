import { Age } from './Age';
import { CodeableConcept } from './CodeableConcept';
import { ContactDetail } from './ContactDetail';
import { Dosage } from './Dosage';
import { Duration } from './Duration';
import { Expression } from './Expression';
import { Extension } from './Extension';
import { Group } from './Group';
import { Identifier } from './Identifier';
import { Location } from './Location';
import { Medication } from './Medication';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { ObservationDefinition } from './ObservationDefinition';
import { Period } from './Period';
import { Quantity } from './Quantity';
import { Range } from './Range';
import { Reference } from './Reference';
import { RelatedArtifact } from './RelatedArtifact';
import { Resource } from './Resource';
import { SpecimenDefinition } from './SpecimenDefinition';
import { Substance } from './Substance';
import { Timing } from './Timing';
import { UsageContext } from './UsageContext';

/**
 * FHIR R4 ActivityDefinition
 * @see https://hl7.org/fhir/R4/activitydefinition.html
 */
export interface ActivityDefinition {

  /**
   * This is a ActivityDefinition resource
   */
  readonly resourceType: 'ActivityDefinition';

  /**
   * ActivityDefinition.id
   */
  id?: string;

  /**
   * ActivityDefinition.meta
   */
  meta?: Meta;

  /**
   * ActivityDefinition.implicitRules
   */
  implicitRules?: string;

  /**
   * ActivityDefinition.language
   */
  language?: string;

  /**
   * ActivityDefinition.text
   */
  text?: Narrative;

  /**
   * ActivityDefinition.contained
   */
  contained?: Resource[];

  /**
   * ActivityDefinition.extension
   */
  extension?: Extension[];

  /**
   * ActivityDefinition.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * ActivityDefinition.url
   */
  url?: string;

  /**
   * ActivityDefinition.identifier
   */
  identifier?: Identifier[];

  /**
   * ActivityDefinition.version
   */
  version?: string;

  /**
   * ActivityDefinition.name
   */
  name?: string;

  /**
   * ActivityDefinition.title
   */
  title?: string;

  /**
   * ActivityDefinition.subtitle
   */
  subtitle?: string;

  /**
   * ActivityDefinition.status
   */
  status: 'draft' | 'active' | 'retired' | 'unknown';

  /**
   * ActivityDefinition.experimental
   */
  experimental?: boolean;

  /**
   * ActivityDefinition.subject[x]
   */
  subjectCodeableConcept?: CodeableConcept;

  /**
   * ActivityDefinition.subject[x]
   */
  subjectReference?: Reference<Group>;

  /**
   * ActivityDefinition.date
   */
  date?: string;

  /**
   * ActivityDefinition.publisher
   */
  publisher?: string;

  /**
   * ActivityDefinition.contact
   */
  contact?: ContactDetail[];

  /**
   * ActivityDefinition.description
   */
  description?: string;

  /**
   * ActivityDefinition.useContext
   */
  useContext?: UsageContext[];

  /**
   * ActivityDefinition.jurisdiction
   */
  jurisdiction?: CodeableConcept[];

  /**
   * ActivityDefinition.purpose
   */
  purpose?: string;

  /**
   * ActivityDefinition.usage
   */
  usage?: string;

  /**
   * ActivityDefinition.copyright
   */
  copyright?: string;

  /**
   * ActivityDefinition.approvalDate
   */
  approvalDate?: string;

  /**
   * ActivityDefinition.lastReviewDate
   */
  lastReviewDate?: string;

  /**
   * ActivityDefinition.effectivePeriod
   */
  effectivePeriod?: Period;

  /**
   * ActivityDefinition.topic
   */
  topic?: CodeableConcept[];

  /**
   * ActivityDefinition.author
   */
  author?: ContactDetail[];

  /**
   * ActivityDefinition.editor
   */
  editor?: ContactDetail[];

  /**
   * ActivityDefinition.reviewer
   */
  reviewer?: ContactDetail[];

  /**
   * ActivityDefinition.endorser
   */
  endorser?: ContactDetail[];

  /**
   * ActivityDefinition.relatedArtifact
   */
  relatedArtifact?: RelatedArtifact[];

  /**
   * ActivityDefinition.library
   */
  library?: string[];

  /**
   * ActivityDefinition.kind
   */
  kind?: string;

  /**
   * ActivityDefinition.profile
   */
  profile?: string;

  /**
   * ActivityDefinition.code
   */
  code?: CodeableConcept;

  /**
   * ActivityDefinition.intent
   */
  intent?: 'proposal' | 'plan' | 'directive' | 'order' | 'original-order' | 'reflex-order' | 'filler-order' | 'instance-order' | 'option';

  /**
   * ActivityDefinition.priority
   */
  priority?: 'routine' | 'urgent' | 'asap' | 'stat';

  /**
   * ActivityDefinition.doNotPerform
   */
  doNotPerform?: boolean;

  /**
   * ActivityDefinition.timing[x]
   */
  timingTiming?: Timing;

  /**
   * ActivityDefinition.timing[x]
   */
  timingDateTime?: string;

  /**
   * ActivityDefinition.timing[x]
   */
  timingAge?: Age;

  /**
   * ActivityDefinition.timing[x]
   */
  timingPeriod?: Period;

  /**
   * ActivityDefinition.timing[x]
   */
  timingRange?: Range;

  /**
   * ActivityDefinition.timing[x]
   */
  timingDuration?: Duration;

  /**
   * ActivityDefinition.location
   */
  location?: Reference<Location>;

  /**
   * ActivityDefinition.participant
   */
  participant?: ActivityDefinitionParticipant[];

  /**
   * ActivityDefinition.product[x]
   */
  productReference?: Reference<Medication | Substance>;

  /**
   * ActivityDefinition.product[x]
   */
  productCodeableConcept?: CodeableConcept;

  /**
   * ActivityDefinition.quantity
   */
  quantity?: Quantity;

  /**
   * ActivityDefinition.dosage
   */
  dosage?: Dosage[];

  /**
   * ActivityDefinition.bodySite
   */
  bodySite?: CodeableConcept[];

  /**
   * ActivityDefinition.specimenRequirement
   */
  specimenRequirement?: Reference<SpecimenDefinition>[];

  /**
   * ActivityDefinition.observationRequirement
   */
  observationRequirement?: Reference<ObservationDefinition>[];

  /**
   * ActivityDefinition.observationResultRequirement
   */
  observationResultRequirement?: Reference<ObservationDefinition>[];

  /**
   * ActivityDefinition.transform
   */
  transform?: string;

  /**
   * ActivityDefinition.dynamicValue
   */
  dynamicValue?: ActivityDefinitionDynamicValue[];
}

/**
 * ActivityDefinition.subject[x]
 */
export type ActivityDefinitionSubject = CodeableConcept | Reference<Group>;
/**
 * ActivityDefinition.timing[x]
 */
export type ActivityDefinitionTiming = Timing | string | Age | Period | Range | Duration;
/**
 * ActivityDefinition.product[x]
 */
export type ActivityDefinitionProduct = Reference<Medication | Substance> | CodeableConcept;

/**
 * FHIR R4 ActivityDefinitionDynamicValue
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ActivityDefinitionDynamicValue {

  /**
   * ActivityDefinition.dynamicValue.id
   */
  id?: string;

  /**
   * ActivityDefinition.dynamicValue.extension
   */
  extension?: Extension[];

  /**
   * ActivityDefinition.dynamicValue.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * ActivityDefinition.dynamicValue.path
   */
  path: string;

  /**
   * ActivityDefinition.dynamicValue.expression
   */
  expression: Expression;
}

/**
 * FHIR R4 ActivityDefinitionParticipant
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ActivityDefinitionParticipant {

  /**
   * ActivityDefinition.participant.id
   */
  id?: string;

  /**
   * ActivityDefinition.participant.extension
   */
  extension?: Extension[];

  /**
   * ActivityDefinition.participant.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * ActivityDefinition.participant.type
   */
  type: string;

  /**
   * ActivityDefinition.participant.role
   */
  role?: CodeableConcept;
}

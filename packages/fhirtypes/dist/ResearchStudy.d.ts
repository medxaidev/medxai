import { Annotation } from './Annotation';
import { CodeableConcept } from './CodeableConcept';
import { ContactDetail } from './ContactDetail';
import { Extension } from './Extension';
import { Group } from './Group';
import { Identifier } from './Identifier';
import { Location } from './Location';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { Organization } from './Organization';
import { Period } from './Period';
import { PlanDefinition } from './PlanDefinition';
import { Practitioner } from './Practitioner';
import { PractitionerRole } from './PractitionerRole';
import { Reference } from './Reference';
import { RelatedArtifact } from './RelatedArtifact';
import { Resource } from './Resource';

/**
 * FHIR R4 ResearchStudy
 * @see https://hl7.org/fhir/R4/researchstudy.html
 */
export interface ResearchStudy {

  /**
   * This is a ResearchStudy resource
   */
  readonly resourceType: 'ResearchStudy';

  /**
   * ResearchStudy.id
   */
  id?: string;

  /**
   * ResearchStudy.meta
   */
  meta?: Meta;

  /**
   * ResearchStudy.implicitRules
   */
  implicitRules?: string;

  /**
   * ResearchStudy.language
   */
  language?: string;

  /**
   * ResearchStudy.text
   */
  text?: Narrative;

  /**
   * ResearchStudy.contained
   */
  contained?: Resource[];

  /**
   * ResearchStudy.extension
   */
  extension?: Extension[];

  /**
   * ResearchStudy.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * ResearchStudy.identifier
   */
  identifier?: Identifier[];

  /**
   * ResearchStudy.title
   */
  title?: string;

  /**
   * ResearchStudy.protocol
   */
  protocol?: Reference<PlanDefinition>[];

  /**
   * ResearchStudy.partOf
   */
  partOf?: Reference<ResearchStudy>[];

  /**
   * ResearchStudy.status
   */
  status: string;

  /**
   * ResearchStudy.primaryPurposeType
   */
  primaryPurposeType?: CodeableConcept;

  /**
   * ResearchStudy.phase
   */
  phase?: CodeableConcept;

  /**
   * ResearchStudy.category
   */
  category?: CodeableConcept[];

  /**
   * ResearchStudy.focus
   */
  focus?: CodeableConcept[];

  /**
   * ResearchStudy.condition
   */
  condition?: CodeableConcept[];

  /**
   * ResearchStudy.contact
   */
  contact?: ContactDetail[];

  /**
   * ResearchStudy.relatedArtifact
   */
  relatedArtifact?: RelatedArtifact[];

  /**
   * ResearchStudy.keyword
   */
  keyword?: CodeableConcept[];

  /**
   * ResearchStudy.location
   */
  location?: CodeableConcept[];

  /**
   * ResearchStudy.description
   */
  description?: string;

  /**
   * ResearchStudy.enrollment
   */
  enrollment?: Reference<Group>[];

  /**
   * ResearchStudy.period
   */
  period?: Period;

  /**
   * ResearchStudy.sponsor
   */
  sponsor?: Reference<Organization>;

  /**
   * ResearchStudy.principalInvestigator
   */
  principalInvestigator?: Reference<Practitioner | PractitionerRole>;

  /**
   * ResearchStudy.site
   */
  site?: Reference<Location>[];

  /**
   * ResearchStudy.reasonStopped
   */
  reasonStopped?: CodeableConcept;

  /**
   * ResearchStudy.note
   */
  note?: Annotation[];

  /**
   * ResearchStudy.arm
   */
  arm?: ResearchStudyArm[];

  /**
   * ResearchStudy.objective
   */
  objective?: ResearchStudyObjective[];
}

/**
 * FHIR R4 ResearchStudyArm
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ResearchStudyArm {

  /**
   * ResearchStudy.arm.id
   */
  id?: string;

  /**
   * ResearchStudy.arm.extension
   */
  extension?: Extension[];

  /**
   * ResearchStudy.arm.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * ResearchStudy.arm.name
   */
  name: string;

  /**
   * ResearchStudy.arm.type
   */
  type?: CodeableConcept;

  /**
   * ResearchStudy.arm.description
   */
  description?: string;
}

/**
 * FHIR R4 ResearchStudyObjective
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface ResearchStudyObjective {

  /**
   * ResearchStudy.objective.id
   */
  id?: string;

  /**
   * ResearchStudy.objective.extension
   */
  extension?: Extension[];

  /**
   * ResearchStudy.objective.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * ResearchStudy.objective.name
   */
  name?: string;

  /**
   * ResearchStudy.objective.type
   */
  type?: CodeableConcept;
}

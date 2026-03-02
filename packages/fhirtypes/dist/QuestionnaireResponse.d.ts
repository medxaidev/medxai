import { Attachment } from './Attachment';
import { CarePlan } from './CarePlan';
import { Coding } from './Coding';
import { Device } from './Device';
import { Encounter } from './Encounter';
import { Extension } from './Extension';
import { Identifier } from './Identifier';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { Observation } from './Observation';
import { Organization } from './Organization';
import { Patient } from './Patient';
import { Practitioner } from './Practitioner';
import { PractitionerRole } from './PractitionerRole';
import { Procedure } from './Procedure';
import { Quantity } from './Quantity';
import { Reference } from './Reference';
import { RelatedPerson } from './RelatedPerson';
import { Resource } from './Resource';
import { ServiceRequest } from './ServiceRequest';

/**
 * FHIR R4 QuestionnaireResponse
 * @see https://hl7.org/fhir/R4/questionnaireresponse.html
 */
export interface QuestionnaireResponse {

  /**
   * This is a QuestionnaireResponse resource
   */
  readonly resourceType: 'QuestionnaireResponse';

  /**
   * QuestionnaireResponse.id
   */
  id?: string;

  /**
   * QuestionnaireResponse.meta
   */
  meta?: Meta;

  /**
   * QuestionnaireResponse.implicitRules
   */
  implicitRules?: string;

  /**
   * QuestionnaireResponse.language
   */
  language?: string;

  /**
   * QuestionnaireResponse.text
   */
  text?: Narrative;

  /**
   * QuestionnaireResponse.contained
   */
  contained?: Resource[];

  /**
   * QuestionnaireResponse.extension
   */
  extension?: Extension[];

  /**
   * QuestionnaireResponse.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * QuestionnaireResponse.identifier
   */
  identifier?: Identifier;

  /**
   * QuestionnaireResponse.basedOn
   */
  basedOn?: Reference<CarePlan | ServiceRequest>[];

  /**
   * QuestionnaireResponse.partOf
   */
  partOf?: Reference<Observation | Procedure>[];

  /**
   * QuestionnaireResponse.questionnaire
   */
  questionnaire?: string;

  /**
   * QuestionnaireResponse.status
   */
  status: string;

  /**
   * QuestionnaireResponse.subject
   */
  subject?: Reference;

  /**
   * QuestionnaireResponse.encounter
   */
  encounter?: Reference<Encounter>;

  /**
   * QuestionnaireResponse.authored
   */
  authored?: string;

  /**
   * QuestionnaireResponse.author
   */
  author?: Reference<Device | Practitioner | PractitionerRole | Patient | RelatedPerson | Organization>;

  /**
   * QuestionnaireResponse.source
   */
  source?: Reference<Patient | Practitioner | PractitionerRole | RelatedPerson>;

  /**
   * QuestionnaireResponse.item
   */
  item?: QuestionnaireResponseItem[];
}

/**
 * FHIR R4 QuestionnaireResponseItem
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface QuestionnaireResponseItem {

  /**
   * QuestionnaireResponse.item.id
   */
  id?: string;

  /**
   * QuestionnaireResponse.item.extension
   */
  extension?: Extension[];

  /**
   * QuestionnaireResponse.item.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * QuestionnaireResponse.item.linkId
   */
  linkId: string;

  /**
   * QuestionnaireResponse.item.definition
   */
  definition?: string;

  /**
   * QuestionnaireResponse.item.text
   */
  text?: string;

  /**
   * QuestionnaireResponse.item.answer
   */
  answer?: QuestionnaireResponseItemAnswer[];
}

/**
 * FHIR R4 QuestionnaireResponseItemAnswer
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface QuestionnaireResponseItemAnswer {

  /**
   * QuestionnaireResponse.item.answer.id
   */
  id?: string;

  /**
   * QuestionnaireResponse.item.answer.extension
   */
  extension?: Extension[];

  /**
   * QuestionnaireResponse.item.answer.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * QuestionnaireResponse.item.answer.value[x]
   */
  valueBoolean?: boolean;

  /**
   * QuestionnaireResponse.item.answer.value[x]
   */
  valueDecimal?: number;

  /**
   * QuestionnaireResponse.item.answer.value[x]
   */
  valueInteger?: number;

  /**
   * QuestionnaireResponse.item.answer.value[x]
   */
  valueDate?: string;

  /**
   * QuestionnaireResponse.item.answer.value[x]
   */
  valueDateTime?: string;

  /**
   * QuestionnaireResponse.item.answer.value[x]
   */
  valueTime?: string;

  /**
   * QuestionnaireResponse.item.answer.value[x]
   */
  valueString?: string;

  /**
   * QuestionnaireResponse.item.answer.value[x]
   */
  valueUri?: string;

  /**
   * QuestionnaireResponse.item.answer.value[x]
   */
  valueAttachment?: Attachment;

  /**
   * QuestionnaireResponse.item.answer.value[x]
   */
  valueCoding?: Coding;

  /**
   * QuestionnaireResponse.item.answer.value[x]
   */
  valueQuantity?: Quantity;

  /**
   * QuestionnaireResponse.item.answer.value[x]
   */
  valueReference?: Reference;
}

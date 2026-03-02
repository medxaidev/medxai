import { Attachment } from './Attachment';
import { CodeableConcept } from './CodeableConcept';
import { Coding } from './Coding';
import { ContactDetail } from './ContactDetail';
import { Extension } from './Extension';
import { Identifier } from './Identifier';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { Period } from './Period';
import { Quantity } from './Quantity';
import { Reference } from './Reference';
import { Resource } from './Resource';
import { UsageContext } from './UsageContext';

/**
 * FHIR R4 Questionnaire
 * @see https://hl7.org/fhir/R4/questionnaire.html
 */
export interface Questionnaire {

  /**
   * This is a Questionnaire resource
   */
  readonly resourceType: 'Questionnaire';

  /**
   * Questionnaire.id
   */
  id?: string;

  /**
   * Questionnaire.meta
   */
  meta?: Meta;

  /**
   * Questionnaire.implicitRules
   */
  implicitRules?: string;

  /**
   * Questionnaire.language
   */
  language?: string;

  /**
   * Questionnaire.text
   */
  text?: Narrative;

  /**
   * Questionnaire.contained
   */
  contained?: Resource[];

  /**
   * Questionnaire.extension
   */
  extension?: Extension[];

  /**
   * Questionnaire.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Questionnaire.url
   */
  url?: string;

  /**
   * Questionnaire.identifier
   */
  identifier?: Identifier[];

  /**
   * Questionnaire.version
   */
  version?: string;

  /**
   * Questionnaire.name
   */
  name?: string;

  /**
   * Questionnaire.title
   */
  title?: string;

  /**
   * Questionnaire.derivedFrom
   */
  derivedFrom?: string[];

  /**
   * Questionnaire.status
   */
  status: 'draft' | 'active' | 'retired' | 'unknown';

  /**
   * Questionnaire.experimental
   */
  experimental?: boolean;

  /**
   * Questionnaire.subjectType
   */
  subjectType?: string[];

  /**
   * Questionnaire.date
   */
  date?: string;

  /**
   * Questionnaire.publisher
   */
  publisher?: string;

  /**
   * Questionnaire.contact
   */
  contact?: ContactDetail[];

  /**
   * Questionnaire.description
   */
  description?: string;

  /**
   * Questionnaire.useContext
   */
  useContext?: UsageContext[];

  /**
   * Questionnaire.jurisdiction
   */
  jurisdiction?: CodeableConcept[];

  /**
   * Questionnaire.purpose
   */
  purpose?: string;

  /**
   * Questionnaire.copyright
   */
  copyright?: string;

  /**
   * Questionnaire.approvalDate
   */
  approvalDate?: string;

  /**
   * Questionnaire.lastReviewDate
   */
  lastReviewDate?: string;

  /**
   * Questionnaire.effectivePeriod
   */
  effectivePeriod?: Period;

  /**
   * Questionnaire.code
   */
  code?: Coding[];

  /**
   * Questionnaire.item
   */
  item?: QuestionnaireItem[];
}

/**
 * FHIR R4 QuestionnaireItem
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface QuestionnaireItem {

  /**
   * Questionnaire.item.id
   */
  id?: string;

  /**
   * Questionnaire.item.extension
   */
  extension?: Extension[];

  /**
   * Questionnaire.item.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Questionnaire.item.linkId
   */
  linkId: string;

  /**
   * Questionnaire.item.definition
   */
  definition?: string;

  /**
   * Questionnaire.item.code
   */
  code?: Coding[];

  /**
   * Questionnaire.item.prefix
   */
  prefix?: string;

  /**
   * Questionnaire.item.text
   */
  text?: string;

  /**
   * Questionnaire.item.type
   */
  type: string;

  /**
   * Questionnaire.item.enableWhen
   */
  enableWhen?: QuestionnaireItemEnableWhen[];

  /**
   * Questionnaire.item.enableBehavior
   */
  enableBehavior?: string;

  /**
   * Questionnaire.item.required
   */
  required?: boolean;

  /**
   * Questionnaire.item.repeats
   */
  repeats?: boolean;

  /**
   * Questionnaire.item.readOnly
   */
  readOnly?: boolean;

  /**
   * Questionnaire.item.maxLength
   */
  maxLength?: number;

  /**
   * Questionnaire.item.answerValueSet
   */
  answerValueSet?: string;

  /**
   * Questionnaire.item.answerOption
   */
  answerOption?: QuestionnaireItemAnswerOption[];

  /**
   * Questionnaire.item.initial
   */
  initial?: QuestionnaireItemInitial[];
}

/**
 * FHIR R4 QuestionnaireItemAnswerOption
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface QuestionnaireItemAnswerOption {

  /**
   * Questionnaire.item.answerOption.id
   */
  id?: string;

  /**
   * Questionnaire.item.answerOption.extension
   */
  extension?: Extension[];

  /**
   * Questionnaire.item.answerOption.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Questionnaire.item.answerOption.value[x]
   */
  valueInteger: number;

  /**
   * Questionnaire.item.answerOption.value[x]
   */
  valueDate: string;

  /**
   * Questionnaire.item.answerOption.value[x]
   */
  valueTime: string;

  /**
   * Questionnaire.item.answerOption.value[x]
   */
  valueString: string;

  /**
   * Questionnaire.item.answerOption.value[x]
   */
  valueCoding: Coding;

  /**
   * Questionnaire.item.answerOption.value[x]
   */
  valueReference: Reference;

  /**
   * Questionnaire.item.answerOption.initialSelected
   */
  initialSelected?: boolean;
}

/**
 * FHIR R4 QuestionnaireItemEnableWhen
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface QuestionnaireItemEnableWhen {

  /**
   * Questionnaire.item.enableWhen.id
   */
  id?: string;

  /**
   * Questionnaire.item.enableWhen.extension
   */
  extension?: Extension[];

  /**
   * Questionnaire.item.enableWhen.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Questionnaire.item.enableWhen.question
   */
  question: string;

  /**
   * Questionnaire.item.enableWhen.operator
   */
  operator: string;

  /**
   * Questionnaire.item.enableWhen.answer[x]
   */
  answerBoolean: boolean;

  /**
   * Questionnaire.item.enableWhen.answer[x]
   */
  answerDecimal: number;

  /**
   * Questionnaire.item.enableWhen.answer[x]
   */
  answerInteger: number;

  /**
   * Questionnaire.item.enableWhen.answer[x]
   */
  answerDate: string;

  /**
   * Questionnaire.item.enableWhen.answer[x]
   */
  answerDateTime: string;

  /**
   * Questionnaire.item.enableWhen.answer[x]
   */
  answerTime: string;

  /**
   * Questionnaire.item.enableWhen.answer[x]
   */
  answerString: string;

  /**
   * Questionnaire.item.enableWhen.answer[x]
   */
  answerCoding: Coding;

  /**
   * Questionnaire.item.enableWhen.answer[x]
   */
  answerQuantity: Quantity;

  /**
   * Questionnaire.item.enableWhen.answer[x]
   */
  answerReference: Reference;
}

/**
 * FHIR R4 QuestionnaireItemInitial
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface QuestionnaireItemInitial {

  /**
   * Questionnaire.item.initial.id
   */
  id?: string;

  /**
   * Questionnaire.item.initial.extension
   */
  extension?: Extension[];

  /**
   * Questionnaire.item.initial.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Questionnaire.item.initial.value[x]
   */
  valueBoolean: boolean;

  /**
   * Questionnaire.item.initial.value[x]
   */
  valueDecimal: number;

  /**
   * Questionnaire.item.initial.value[x]
   */
  valueInteger: number;

  /**
   * Questionnaire.item.initial.value[x]
   */
  valueDate: string;

  /**
   * Questionnaire.item.initial.value[x]
   */
  valueDateTime: string;

  /**
   * Questionnaire.item.initial.value[x]
   */
  valueTime: string;

  /**
   * Questionnaire.item.initial.value[x]
   */
  valueString: string;

  /**
   * Questionnaire.item.initial.value[x]
   */
  valueUri: string;

  /**
   * Questionnaire.item.initial.value[x]
   */
  valueAttachment: Attachment;

  /**
   * Questionnaire.item.initial.value[x]
   */
  valueCoding: Coding;

  /**
   * Questionnaire.item.initial.value[x]
   */
  valueQuantity: Quantity;

  /**
   * Questionnaire.item.initial.value[x]
   */
  valueReference: Reference;
}

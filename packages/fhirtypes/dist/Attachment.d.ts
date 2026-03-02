import { Extension } from './Extension';

/**
 * FHIR R4 Attachment
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface Attachment {

  /**
   * Attachment.id
   */
  id?: string;

  /**
   * Attachment.extension
   */
  extension?: Extension[];

  /**
   * Attachment.contentType
   */
  contentType?: string;

  /**
   * Attachment.language
   */
  language?: string;

  /**
   * Attachment.data
   */
  data?: string;

  /**
   * Attachment.url
   */
  url?: string;

  /**
   * Attachment.size
   */
  size?: number;

  /**
   * Attachment.hash
   */
  hash?: string;

  /**
   * Attachment.title
   */
  title?: string;

  /**
   * Attachment.creation
   */
  creation?: string;
}

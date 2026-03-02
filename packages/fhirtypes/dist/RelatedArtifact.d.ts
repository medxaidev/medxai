import { Attachment } from './Attachment';
import { Extension } from './Extension';

/**
 * FHIR R4 RelatedArtifact
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface RelatedArtifact {

  /**
   * RelatedArtifact.id
   */
  id?: string;

  /**
   * RelatedArtifact.extension
   */
  extension?: Extension[];

  /**
   * RelatedArtifact.type
   */
  type: string;

  /**
   * RelatedArtifact.label
   */
  label?: string;

  /**
   * RelatedArtifact.display
   */
  display?: string;

  /**
   * RelatedArtifact.citation
   */
  citation?: string;

  /**
   * RelatedArtifact.url
   */
  url?: string;

  /**
   * RelatedArtifact.document
   */
  document?: Attachment;

  /**
   * RelatedArtifact.resource
   */
  resource?: string;
}

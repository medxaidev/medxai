import { Extension } from './Extension';
import { Identifier } from './Identifier';
import { Meta } from './Meta';
import { Resource } from './Resource';
import { Signature } from './Signature';

/**
 * FHIR R4 Bundle
 * @see https://hl7.org/fhir/R4/bundle.html
 */
export interface Bundle<T extends Resource = Resource> {

  /**
   * This is a Bundle resource
   */
  readonly resourceType: 'Bundle';

  /**
   * Bundle.id
   */
  id?: string;

  /**
   * Bundle.meta
   */
  meta?: Meta;

  /**
   * Bundle.implicitRules
   */
  implicitRules?: string;

  /**
   * Bundle.language
   */
  language?: string;

  /**
   * Bundle.identifier
   */
  identifier?: Identifier;

  /**
   * Bundle.type
   */
  type: 'document' | 'message' | 'transaction' | 'transaction-response' | 'batch' | 'batch-response' | 'history' | 'searchset' | 'collection';

  /**
   * Bundle.timestamp
   */
  timestamp?: string;

  /**
   * Bundle.total
   */
  total?: number;

  /**
   * Bundle.link
   */
  link?: BundleLink[];

  /**
   * Bundle.entry
   */
  entry?: BundleEntry[];

  /**
   * Bundle.signature
   */
  signature?: Signature;
}

/**
 * FHIR R4 BundleEntry
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface BundleEntry<T extends Resource = Resource> {

  /**
   * Bundle.entry.id
   */
  id?: string;

  /**
   * Bundle.entry.extension
   */
  extension?: Extension[];

  /**
   * Bundle.entry.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Bundle.entry.fullUrl
   */
  fullUrl?: string;

  /**
   * Bundle.entry.resource
   */
  resource?: Resource;

  /**
   * Bundle.entry.search
   */
  search?: BundleEntrySearch;

  /**
   * Bundle.entry.request
   */
  request?: BundleEntryRequest;

  /**
   * Bundle.entry.response
   */
  response?: BundleEntryResponse;
}

/**
 * FHIR R4 BundleEntryRequest
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface BundleEntryRequest {

  /**
   * Bundle.entry.request.id
   */
  id?: string;

  /**
   * Bundle.entry.request.extension
   */
  extension?: Extension[];

  /**
   * Bundle.entry.request.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Bundle.entry.request.method
   */
  method: 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

  /**
   * Bundle.entry.request.url
   */
  url: string;

  /**
   * Bundle.entry.request.ifNoneMatch
   */
  ifNoneMatch?: string;

  /**
   * Bundle.entry.request.ifModifiedSince
   */
  ifModifiedSince?: string;

  /**
   * Bundle.entry.request.ifMatch
   */
  ifMatch?: string;

  /**
   * Bundle.entry.request.ifNoneExist
   */
  ifNoneExist?: string;
}

/**
 * FHIR R4 BundleEntryResponse
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface BundleEntryResponse {

  /**
   * Bundle.entry.response.id
   */
  id?: string;

  /**
   * Bundle.entry.response.extension
   */
  extension?: Extension[];

  /**
   * Bundle.entry.response.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Bundle.entry.response.status
   */
  status: string;

  /**
   * Bundle.entry.response.location
   */
  location?: string;

  /**
   * Bundle.entry.response.etag
   */
  etag?: string;

  /**
   * Bundle.entry.response.lastModified
   */
  lastModified?: string;

  /**
   * Bundle.entry.response.outcome
   */
  outcome?: Resource;
}

/**
 * FHIR R4 BundleEntrySearch
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface BundleEntrySearch {

  /**
   * Bundle.entry.search.id
   */
  id?: string;

  /**
   * Bundle.entry.search.extension
   */
  extension?: Extension[];

  /**
   * Bundle.entry.search.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Bundle.entry.search.mode
   */
  mode?: 'match' | 'include' | 'outcome';

  /**
   * Bundle.entry.search.score
   */
  score?: number;
}

/**
 * FHIR R4 BundleLink
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface BundleLink {

  /**
   * Bundle.link.id
   */
  id?: string;

  /**
   * Bundle.link.extension
   */
  extension?: Extension[];

  /**
   * Bundle.link.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Bundle.link.relation
   */
  relation: string;

  /**
   * Bundle.link.url
   */
  url: string;
}

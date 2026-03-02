import { ContactPoint } from './ContactPoint';
import { Extension } from './Extension';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { Resource } from './Resource';

/**
 * FHIR R4 Subscription
 * @see https://hl7.org/fhir/R4/subscription.html
 */
export interface Subscription {

  /**
   * This is a Subscription resource
   */
  readonly resourceType: 'Subscription';

  /**
   * Subscription.id
   */
  id?: string;

  /**
   * Subscription.meta
   */
  meta?: Meta;

  /**
   * Subscription.implicitRules
   */
  implicitRules?: string;

  /**
   * Subscription.language
   */
  language?: string;

  /**
   * Subscription.text
   */
  text?: Narrative;

  /**
   * Subscription.contained
   */
  contained?: Resource[];

  /**
   * Subscription.extension
   */
  extension?: Extension[];

  /**
   * Subscription.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Subscription.status
   */
  status: string;

  /**
   * Subscription.contact
   */
  contact?: ContactPoint[];

  /**
   * Subscription.end
   */
  end?: string;

  /**
   * Subscription.reason
   */
  reason: string;

  /**
   * Subscription.criteria
   */
  criteria: string;

  /**
   * Subscription.error
   */
  error?: string;

  /**
   * Subscription.channel
   */
  channel: SubscriptionChannel;
}

/**
 * FHIR R4 SubscriptionChannel
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface SubscriptionChannel {

  /**
   * Subscription.channel.id
   */
  id?: string;

  /**
   * Subscription.channel.extension
   */
  extension?: Extension[];

  /**
   * Subscription.channel.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Subscription.channel.type
   */
  type: string;

  /**
   * Subscription.channel.endpoint
   */
  endpoint?: string;

  /**
   * Subscription.channel.payload
   */
  payload?: string;

  /**
   * Subscription.channel.header
   */
  header?: string[];
}

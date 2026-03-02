import { Address } from './Address';
import { CodeableConcept } from './CodeableConcept';
import { Coding } from './Coding';
import { ContactPoint } from './ContactPoint';
import { Endpoint } from './Endpoint';
import { Extension } from './Extension';
import { Identifier } from './Identifier';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { Organization } from './Organization';
import { Reference } from './Reference';
import { Resource } from './Resource';

/**
 * FHIR R4 Location
 * @see https://hl7.org/fhir/R4/location.html
 */
export interface Location {

  /**
   * This is a Location resource
   */
  readonly resourceType: 'Location';

  /**
   * Location.id
   */
  id?: string;

  /**
   * Location.meta
   */
  meta?: Meta;

  /**
   * Location.implicitRules
   */
  implicitRules?: string;

  /**
   * Location.language
   */
  language?: string;

  /**
   * Location.text
   */
  text?: Narrative;

  /**
   * Location.contained
   */
  contained?: Resource[];

  /**
   * Location.extension
   */
  extension?: Extension[];

  /**
   * Location.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Location.identifier
   */
  identifier?: Identifier[];

  /**
   * Location.status
   */
  status?: string;

  /**
   * Location.operationalStatus
   */
  operationalStatus?: Coding;

  /**
   * Location.name
   */
  name?: string;

  /**
   * Location.alias
   */
  alias?: string[];

  /**
   * Location.description
   */
  description?: string;

  /**
   * Location.mode
   */
  mode?: string;

  /**
   * Location.type
   */
  type?: CodeableConcept[];

  /**
   * Location.telecom
   */
  telecom?: ContactPoint[];

  /**
   * Location.address
   */
  address?: Address;

  /**
   * Location.physicalType
   */
  physicalType?: CodeableConcept;

  /**
   * Location.position
   */
  position?: LocationPosition;

  /**
   * Location.managingOrganization
   */
  managingOrganization?: Reference<Organization>;

  /**
   * Location.partOf
   */
  partOf?: Reference<Location>;

  /**
   * Location.hoursOfOperation
   */
  hoursOfOperation?: LocationHoursOfOperation[];

  /**
   * Location.availabilityExceptions
   */
  availabilityExceptions?: string;

  /**
   * Location.endpoint
   */
  endpoint?: Reference<Endpoint>[];
}

/**
 * FHIR R4 LocationHoursOfOperation
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface LocationHoursOfOperation {

  /**
   * Location.hoursOfOperation.id
   */
  id?: string;

  /**
   * Location.hoursOfOperation.extension
   */
  extension?: Extension[];

  /**
   * Location.hoursOfOperation.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Location.hoursOfOperation.daysOfWeek
   */
  daysOfWeek?: string[];

  /**
   * Location.hoursOfOperation.allDay
   */
  allDay?: boolean;

  /**
   * Location.hoursOfOperation.openingTime
   */
  openingTime?: string;

  /**
   * Location.hoursOfOperation.closingTime
   */
  closingTime?: string;
}

/**
 * FHIR R4 LocationPosition
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface LocationPosition {

  /**
   * Location.position.id
   */
  id?: string;

  /**
   * Location.position.extension
   */
  extension?: Extension[];

  /**
   * Location.position.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * Location.position.longitude
   */
  longitude: number;

  /**
   * Location.position.latitude
   */
  latitude: number;

  /**
   * Location.position.altitude
   */
  altitude?: number;
}

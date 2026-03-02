import { CodeableConcept } from './CodeableConcept';
import { ContactPoint } from './ContactPoint';
import { Endpoint } from './Endpoint';
import { Extension } from './Extension';
import { HealthcareService } from './HealthcareService';
import { Identifier } from './Identifier';
import { Location } from './Location';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { Organization } from './Organization';
import { Period } from './Period';
import { Reference } from './Reference';
import { Resource } from './Resource';

/**
 * FHIR R4 OrganizationAffiliation
 * @see https://hl7.org/fhir/R4/organizationaffiliation.html
 */
export interface OrganizationAffiliation {

  /**
   * This is a OrganizationAffiliation resource
   */
  readonly resourceType: 'OrganizationAffiliation';

  /**
   * OrganizationAffiliation.id
   */
  id?: string;

  /**
   * OrganizationAffiliation.meta
   */
  meta?: Meta;

  /**
   * OrganizationAffiliation.implicitRules
   */
  implicitRules?: string;

  /**
   * OrganizationAffiliation.language
   */
  language?: string;

  /**
   * OrganizationAffiliation.text
   */
  text?: Narrative;

  /**
   * OrganizationAffiliation.contained
   */
  contained?: Resource[];

  /**
   * OrganizationAffiliation.extension
   */
  extension?: Extension[];

  /**
   * OrganizationAffiliation.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * OrganizationAffiliation.identifier
   */
  identifier?: Identifier[];

  /**
   * OrganizationAffiliation.active
   */
  active?: boolean;

  /**
   * OrganizationAffiliation.period
   */
  period?: Period;

  /**
   * OrganizationAffiliation.organization
   */
  organization?: Reference<Organization>;

  /**
   * OrganizationAffiliation.participatingOrganization
   */
  participatingOrganization?: Reference<Organization>;

  /**
   * OrganizationAffiliation.network
   */
  network?: Reference<Organization>[];

  /**
   * OrganizationAffiliation.code
   */
  code?: CodeableConcept[];

  /**
   * OrganizationAffiliation.specialty
   */
  specialty?: CodeableConcept[];

  /**
   * OrganizationAffiliation.location
   */
  location?: Reference<Location>[];

  /**
   * OrganizationAffiliation.healthcareService
   */
  healthcareService?: Reference<HealthcareService>[];

  /**
   * OrganizationAffiliation.telecom
   */
  telecom?: ContactPoint[];

  /**
   * OrganizationAffiliation.endpoint
   */
  endpoint?: Reference<Endpoint>[];
}

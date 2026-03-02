import { CodeableConcept } from './CodeableConcept';
import { Extension } from './Extension';
import { Medication } from './Medication';
import { MedicinalProduct } from './MedicinalProduct';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { ObservationDefinition } from './ObservationDefinition';
import { Reference } from './Reference';
import { Resource } from './Resource';
import { Substance } from './Substance';

/**
 * FHIR R4 MedicinalProductInteraction
 * @see https://hl7.org/fhir/R4/medicinalproductinteraction.html
 */
export interface MedicinalProductInteraction {

  /**
   * This is a MedicinalProductInteraction resource
   */
  readonly resourceType: 'MedicinalProductInteraction';

  /**
   * MedicinalProductInteraction.id
   */
  id?: string;

  /**
   * MedicinalProductInteraction.meta
   */
  meta?: Meta;

  /**
   * MedicinalProductInteraction.implicitRules
   */
  implicitRules?: string;

  /**
   * MedicinalProductInteraction.language
   */
  language?: string;

  /**
   * MedicinalProductInteraction.text
   */
  text?: Narrative;

  /**
   * MedicinalProductInteraction.contained
   */
  contained?: Resource[];

  /**
   * MedicinalProductInteraction.extension
   */
  extension?: Extension[];

  /**
   * MedicinalProductInteraction.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * MedicinalProductInteraction.subject
   */
  subject?: Reference<MedicinalProduct | Medication | Substance>[];

  /**
   * MedicinalProductInteraction.description
   */
  description?: string;

  /**
   * MedicinalProductInteraction.interactant
   */
  interactant?: MedicinalProductInteractionInteractant[];

  /**
   * MedicinalProductInteraction.type
   */
  type?: CodeableConcept;

  /**
   * MedicinalProductInteraction.effect
   */
  effect?: CodeableConcept;

  /**
   * MedicinalProductInteraction.incidence
   */
  incidence?: CodeableConcept;

  /**
   * MedicinalProductInteraction.management
   */
  management?: CodeableConcept;
}

/**
 * FHIR R4 MedicinalProductInteractionInteractant
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface MedicinalProductInteractionInteractant {

  /**
   * MedicinalProductInteraction.interactant.id
   */
  id?: string;

  /**
   * MedicinalProductInteraction.interactant.extension
   */
  extension?: Extension[];

  /**
   * MedicinalProductInteraction.interactant.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * MedicinalProductInteraction.interactant.item[x]
   */
  itemReference: Reference<MedicinalProduct | Medication | Substance | ObservationDefinition>;

  /**
   * MedicinalProductInteraction.interactant.item[x]
   */
  itemCodeableConcept: CodeableConcept;
}

import { DataRequirement } from './DataRequirement';
import { Expression } from './Expression';
import { Extension } from './Extension';
import { Reference } from './Reference';
import { Schedule } from './Schedule';
import { Timing } from './Timing';

/**
 * FHIR R4 TriggerDefinition
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface TriggerDefinition {

  /**
   * TriggerDefinition.id
   */
  id?: string;

  /**
   * TriggerDefinition.extension
   */
  extension?: Extension[];

  /**
   * TriggerDefinition.type
   */
  type: string;

  /**
   * TriggerDefinition.name
   */
  name?: string;

  /**
   * TriggerDefinition.timing[x]
   */
  timingTiming?: Timing;

  /**
   * TriggerDefinition.timing[x]
   */
  timingReference?: Reference<Schedule>;

  /**
   * TriggerDefinition.timing[x]
   */
  timingDate?: string;

  /**
   * TriggerDefinition.timing[x]
   */
  timingDateTime?: string;

  /**
   * TriggerDefinition.data
   */
  data?: DataRequirement[];

  /**
   * TriggerDefinition.condition
   */
  condition?: Expression;
}

/**
 * TriggerDefinition.timing[x]
 */
export type TriggerDefinitionTiming = Timing | Reference<Schedule> | string;

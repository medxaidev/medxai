import { Extension } from './Extension';
import { Identifier } from './Identifier';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { Reference } from './Reference';
import { Resource } from './Resource';
import { TestScript } from './TestScript';

/**
 * FHIR R4 TestReport
 * @see https://hl7.org/fhir/R4/testreport.html
 */
export interface TestReport {

  /**
   * This is a TestReport resource
   */
  readonly resourceType: 'TestReport';

  /**
   * TestReport.id
   */
  id?: string;

  /**
   * TestReport.meta
   */
  meta?: Meta;

  /**
   * TestReport.implicitRules
   */
  implicitRules?: string;

  /**
   * TestReport.language
   */
  language?: string;

  /**
   * TestReport.text
   */
  text?: Narrative;

  /**
   * TestReport.contained
   */
  contained?: Resource[];

  /**
   * TestReport.extension
   */
  extension?: Extension[];

  /**
   * TestReport.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * TestReport.identifier
   */
  identifier?: Identifier;

  /**
   * TestReport.name
   */
  name?: string;

  /**
   * TestReport.status
   */
  status: string;

  /**
   * TestReport.testScript
   */
  testScript: Reference<TestScript>;

  /**
   * TestReport.result
   */
  result: string;

  /**
   * TestReport.score
   */
  score?: number;

  /**
   * TestReport.tester
   */
  tester?: string;

  /**
   * TestReport.issued
   */
  issued?: string;

  /**
   * TestReport.participant
   */
  participant?: TestReportParticipant[];

  /**
   * TestReport.setup
   */
  setup?: TestReportSetup;

  /**
   * TestReport.test
   */
  test?: TestReportTest[];

  /**
   * TestReport.teardown
   */
  teardown?: TestReportTeardown;
}

/**
 * FHIR R4 TestReportParticipant
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface TestReportParticipant {

  /**
   * TestReport.participant.id
   */
  id?: string;

  /**
   * TestReport.participant.extension
   */
  extension?: Extension[];

  /**
   * TestReport.participant.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * TestReport.participant.type
   */
  type: string;

  /**
   * TestReport.participant.uri
   */
  uri: string;

  /**
   * TestReport.participant.display
   */
  display?: string;
}

/**
 * FHIR R4 TestReportSetup
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface TestReportSetup {

  /**
   * TestReport.setup.id
   */
  id?: string;

  /**
   * TestReport.setup.extension
   */
  extension?: Extension[];

  /**
   * TestReport.setup.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * TestReport.setup.action
   */
  action: TestReportSetupAction[];
}

/**
 * FHIR R4 TestReportSetupAction
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface TestReportSetupAction {

  /**
   * TestReport.setup.action.id
   */
  id?: string;

  /**
   * TestReport.setup.action.extension
   */
  extension?: Extension[];

  /**
   * TestReport.setup.action.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * TestReport.setup.action.operation
   */
  operation?: TestReportSetupActionOperation;

  /**
   * TestReport.setup.action.assert
   */
  assert?: TestReportSetupActionAssert;
}

/**
 * FHIR R4 TestReportSetupActionAssert
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface TestReportSetupActionAssert {

  /**
   * TestReport.setup.action.assert.id
   */
  id?: string;

  /**
   * TestReport.setup.action.assert.extension
   */
  extension?: Extension[];

  /**
   * TestReport.setup.action.assert.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * TestReport.setup.action.assert.result
   */
  result: string;

  /**
   * TestReport.setup.action.assert.message
   */
  message?: string;

  /**
   * TestReport.setup.action.assert.detail
   */
  detail?: string;
}

/**
 * FHIR R4 TestReportSetupActionOperation
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface TestReportSetupActionOperation {

  /**
   * TestReport.setup.action.operation.id
   */
  id?: string;

  /**
   * TestReport.setup.action.operation.extension
   */
  extension?: Extension[];

  /**
   * TestReport.setup.action.operation.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * TestReport.setup.action.operation.result
   */
  result: string;

  /**
   * TestReport.setup.action.operation.message
   */
  message?: string;

  /**
   * TestReport.setup.action.operation.detail
   */
  detail?: string;
}

/**
 * FHIR R4 TestReportTeardown
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface TestReportTeardown {

  /**
   * TestReport.teardown.id
   */
  id?: string;

  /**
   * TestReport.teardown.extension
   */
  extension?: Extension[];

  /**
   * TestReport.teardown.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * TestReport.teardown.action
   */
  action: TestReportTeardownAction[];
}

/**
 * FHIR R4 TestReportTeardownAction
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface TestReportTeardownAction {

  /**
   * TestReport.teardown.action.id
   */
  id?: string;

  /**
   * TestReport.teardown.action.extension
   */
  extension?: Extension[];

  /**
   * TestReport.teardown.action.modifierExtension
   */
  modifierExtension?: Extension[];
}

/**
 * FHIR R4 TestReportTest
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface TestReportTest {

  /**
   * TestReport.test.id
   */
  id?: string;

  /**
   * TestReport.test.extension
   */
  extension?: Extension[];

  /**
   * TestReport.test.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * TestReport.test.name
   */
  name?: string;

  /**
   * TestReport.test.description
   */
  description?: string;

  /**
   * TestReport.test.action
   */
  action: TestReportTestAction[];
}

/**
 * FHIR R4 TestReportTestAction
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface TestReportTestAction {

  /**
   * TestReport.test.action.id
   */
  id?: string;

  /**
   * TestReport.test.action.extension
   */
  extension?: Extension[];

  /**
   * TestReport.test.action.modifierExtension
   */
  modifierExtension?: Extension[];
}

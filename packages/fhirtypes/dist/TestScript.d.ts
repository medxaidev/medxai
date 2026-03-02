import { CodeableConcept } from './CodeableConcept';
import { Coding } from './Coding';
import { ContactDetail } from './ContactDetail';
import { Extension } from './Extension';
import { Identifier } from './Identifier';
import { Meta } from './Meta';
import { Narrative } from './Narrative';
import { Reference } from './Reference';
import { Resource } from './Resource';
import { UsageContext } from './UsageContext';

/**
 * FHIR R4 TestScript
 * @see https://hl7.org/fhir/R4/testscript.html
 */
export interface TestScript {

  /**
   * This is a TestScript resource
   */
  readonly resourceType: 'TestScript';

  /**
   * TestScript.id
   */
  id?: string;

  /**
   * TestScript.meta
   */
  meta?: Meta;

  /**
   * TestScript.implicitRules
   */
  implicitRules?: string;

  /**
   * TestScript.language
   */
  language?: string;

  /**
   * TestScript.text
   */
  text?: Narrative;

  /**
   * TestScript.contained
   */
  contained?: Resource[];

  /**
   * TestScript.extension
   */
  extension?: Extension[];

  /**
   * TestScript.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * TestScript.url
   */
  url: string;

  /**
   * TestScript.identifier
   */
  identifier?: Identifier;

  /**
   * TestScript.version
   */
  version?: string;

  /**
   * TestScript.name
   */
  name: string;

  /**
   * TestScript.title
   */
  title?: string;

  /**
   * TestScript.status
   */
  status: 'draft' | 'active' | 'retired' | 'unknown';

  /**
   * TestScript.experimental
   */
  experimental?: boolean;

  /**
   * TestScript.date
   */
  date?: string;

  /**
   * TestScript.publisher
   */
  publisher?: string;

  /**
   * TestScript.contact
   */
  contact?: ContactDetail[];

  /**
   * TestScript.description
   */
  description?: string;

  /**
   * TestScript.useContext
   */
  useContext?: UsageContext[];

  /**
   * TestScript.jurisdiction
   */
  jurisdiction?: CodeableConcept[];

  /**
   * TestScript.purpose
   */
  purpose?: string;

  /**
   * TestScript.copyright
   */
  copyright?: string;

  /**
   * TestScript.origin
   */
  origin?: TestScriptOrigin[];

  /**
   * TestScript.destination
   */
  destination?: TestScriptDestination[];

  /**
   * TestScript.metadata
   */
  metadata?: TestScriptMetadata;

  /**
   * TestScript.fixture
   */
  fixture?: TestScriptFixture[];

  /**
   * TestScript.profile
   */
  profile?: Reference[];

  /**
   * TestScript.variable
   */
  variable?: TestScriptVariable[];

  /**
   * TestScript.setup
   */
  setup?: TestScriptSetup;

  /**
   * TestScript.test
   */
  test?: TestScriptTest[];

  /**
   * TestScript.teardown
   */
  teardown?: TestScriptTeardown;
}

/**
 * FHIR R4 TestScriptDestination
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface TestScriptDestination {

  /**
   * TestScript.destination.id
   */
  id?: string;

  /**
   * TestScript.destination.extension
   */
  extension?: Extension[];

  /**
   * TestScript.destination.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * TestScript.destination.index
   */
  index: number;

  /**
   * TestScript.destination.profile
   */
  profile: Coding;
}

/**
 * FHIR R4 TestScriptFixture
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface TestScriptFixture {

  /**
   * TestScript.fixture.id
   */
  id?: string;

  /**
   * TestScript.fixture.extension
   */
  extension?: Extension[];

  /**
   * TestScript.fixture.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * TestScript.fixture.autocreate
   */
  autocreate: boolean;

  /**
   * TestScript.fixture.autodelete
   */
  autodelete: boolean;

  /**
   * TestScript.fixture.resource
   */
  resource?: Reference;
}

/**
 * FHIR R4 TestScriptMetadata
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface TestScriptMetadata {

  /**
   * TestScript.metadata.id
   */
  id?: string;

  /**
   * TestScript.metadata.extension
   */
  extension?: Extension[];

  /**
   * TestScript.metadata.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * TestScript.metadata.link
   */
  link?: TestScriptMetadataLink[];

  /**
   * TestScript.metadata.capability
   */
  capability: TestScriptMetadataCapability[];
}

/**
 * FHIR R4 TestScriptMetadataCapability
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface TestScriptMetadataCapability {

  /**
   * TestScript.metadata.capability.id
   */
  id?: string;

  /**
   * TestScript.metadata.capability.extension
   */
  extension?: Extension[];

  /**
   * TestScript.metadata.capability.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * TestScript.metadata.capability.required
   */
  required: boolean;

  /**
   * TestScript.metadata.capability.validated
   */
  validated: boolean;

  /**
   * TestScript.metadata.capability.description
   */
  description?: string;

  /**
   * TestScript.metadata.capability.origin
   */
  origin?: number[];

  /**
   * TestScript.metadata.capability.destination
   */
  destination?: number;

  /**
   * TestScript.metadata.capability.link
   */
  link?: string[];

  /**
   * TestScript.metadata.capability.capabilities
   */
  capabilities: string;
}

/**
 * FHIR R4 TestScriptMetadataLink
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface TestScriptMetadataLink {

  /**
   * TestScript.metadata.link.id
   */
  id?: string;

  /**
   * TestScript.metadata.link.extension
   */
  extension?: Extension[];

  /**
   * TestScript.metadata.link.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * TestScript.metadata.link.url
   */
  url: string;

  /**
   * TestScript.metadata.link.description
   */
  description?: string;
}

/**
 * FHIR R4 TestScriptOrigin
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface TestScriptOrigin {

  /**
   * TestScript.origin.id
   */
  id?: string;

  /**
   * TestScript.origin.extension
   */
  extension?: Extension[];

  /**
   * TestScript.origin.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * TestScript.origin.index
   */
  index: number;

  /**
   * TestScript.origin.profile
   */
  profile: Coding;
}

/**
 * FHIR R4 TestScriptSetup
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface TestScriptSetup {

  /**
   * TestScript.setup.id
   */
  id?: string;

  /**
   * TestScript.setup.extension
   */
  extension?: Extension[];

  /**
   * TestScript.setup.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * TestScript.setup.action
   */
  action: TestScriptSetupAction[];
}

/**
 * FHIR R4 TestScriptSetupAction
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface TestScriptSetupAction {

  /**
   * TestScript.setup.action.id
   */
  id?: string;

  /**
   * TestScript.setup.action.extension
   */
  extension?: Extension[];

  /**
   * TestScript.setup.action.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * TestScript.setup.action.operation
   */
  operation?: TestScriptSetupActionOperation;

  /**
   * TestScript.setup.action.assert
   */
  assert?: TestScriptSetupActionAssert;
}

/**
 * FHIR R4 TestScriptSetupActionAssert
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface TestScriptSetupActionAssert {

  /**
   * TestScript.setup.action.assert.id
   */
  id?: string;

  /**
   * TestScript.setup.action.assert.extension
   */
  extension?: Extension[];

  /**
   * TestScript.setup.action.assert.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * TestScript.setup.action.assert.label
   */
  label?: string;

  /**
   * TestScript.setup.action.assert.description
   */
  description?: string;

  /**
   * TestScript.setup.action.assert.direction
   */
  direction?: string;

  /**
   * TestScript.setup.action.assert.compareToSourceId
   */
  compareToSourceId?: string;

  /**
   * TestScript.setup.action.assert.compareToSourceExpression
   */
  compareToSourceExpression?: string;

  /**
   * TestScript.setup.action.assert.compareToSourcePath
   */
  compareToSourcePath?: string;

  /**
   * TestScript.setup.action.assert.contentType
   */
  contentType?: string;

  /**
   * TestScript.setup.action.assert.expression
   */
  expression?: string;

  /**
   * TestScript.setup.action.assert.headerField
   */
  headerField?: string;

  /**
   * TestScript.setup.action.assert.minimumId
   */
  minimumId?: string;

  /**
   * TestScript.setup.action.assert.navigationLinks
   */
  navigationLinks?: boolean;

  /**
   * TestScript.setup.action.assert.operator
   */
  operator?: string;

  /**
   * TestScript.setup.action.assert.path
   */
  path?: string;

  /**
   * TestScript.setup.action.assert.requestMethod
   */
  requestMethod?: string;

  /**
   * TestScript.setup.action.assert.requestURL
   */
  requestURL?: string;

  /**
   * TestScript.setup.action.assert.resource
   */
  resource?: string;

  /**
   * TestScript.setup.action.assert.response
   */
  response?: string;

  /**
   * TestScript.setup.action.assert.responseCode
   */
  responseCode?: string;

  /**
   * TestScript.setup.action.assert.sourceId
   */
  sourceId?: string;

  /**
   * TestScript.setup.action.assert.validateProfileId
   */
  validateProfileId?: string;

  /**
   * TestScript.setup.action.assert.value
   */
  value?: string;

  /**
   * TestScript.setup.action.assert.warningOnly
   */
  warningOnly: boolean;
}

/**
 * FHIR R4 TestScriptSetupActionOperation
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface TestScriptSetupActionOperation {

  /**
   * TestScript.setup.action.operation.id
   */
  id?: string;

  /**
   * TestScript.setup.action.operation.extension
   */
  extension?: Extension[];

  /**
   * TestScript.setup.action.operation.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * TestScript.setup.action.operation.type
   */
  type?: Coding;

  /**
   * TestScript.setup.action.operation.resource
   */
  resource?: string;

  /**
   * TestScript.setup.action.operation.label
   */
  label?: string;

  /**
   * TestScript.setup.action.operation.description
   */
  description?: string;

  /**
   * TestScript.setup.action.operation.accept
   */
  accept?: string;

  /**
   * TestScript.setup.action.operation.contentType
   */
  contentType?: string;

  /**
   * TestScript.setup.action.operation.destination
   */
  destination?: number;

  /**
   * TestScript.setup.action.operation.encodeRequestUrl
   */
  encodeRequestUrl: boolean;

  /**
   * TestScript.setup.action.operation.method
   */
  method?: string;

  /**
   * TestScript.setup.action.operation.origin
   */
  origin?: number;

  /**
   * TestScript.setup.action.operation.params
   */
  params?: string;

  /**
   * TestScript.setup.action.operation.requestHeader
   */
  requestHeader?: TestScriptSetupActionOperationRequestHeader[];

  /**
   * TestScript.setup.action.operation.requestId
   */
  requestId?: string;

  /**
   * TestScript.setup.action.operation.responseId
   */
  responseId?: string;

  /**
   * TestScript.setup.action.operation.sourceId
   */
  sourceId?: string;

  /**
   * TestScript.setup.action.operation.targetId
   */
  targetId?: string;

  /**
   * TestScript.setup.action.operation.url
   */
  url?: string;
}

/**
 * FHIR R4 TestScriptSetupActionOperationRequestHeader
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface TestScriptSetupActionOperationRequestHeader {

  /**
   * TestScript.setup.action.operation.requestHeader.id
   */
  id?: string;

  /**
   * TestScript.setup.action.operation.requestHeader.extension
   */
  extension?: Extension[];

  /**
   * TestScript.setup.action.operation.requestHeader.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * TestScript.setup.action.operation.requestHeader.field
   */
  field: string;

  /**
   * TestScript.setup.action.operation.requestHeader.value
   */
  value: string;
}

/**
 * FHIR R4 TestScriptTeardown
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface TestScriptTeardown {

  /**
   * TestScript.teardown.id
   */
  id?: string;

  /**
   * TestScript.teardown.extension
   */
  extension?: Extension[];

  /**
   * TestScript.teardown.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * TestScript.teardown.action
   */
  action: TestScriptTeardownAction[];
}

/**
 * FHIR R4 TestScriptTeardownAction
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface TestScriptTeardownAction {

  /**
   * TestScript.teardown.action.id
   */
  id?: string;

  /**
   * TestScript.teardown.action.extension
   */
  extension?: Extension[];

  /**
   * TestScript.teardown.action.modifierExtension
   */
  modifierExtension?: Extension[];
}

/**
 * FHIR R4 TestScriptTest
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface TestScriptTest {

  /**
   * TestScript.test.id
   */
  id?: string;

  /**
   * TestScript.test.extension
   */
  extension?: Extension[];

  /**
   * TestScript.test.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * TestScript.test.name
   */
  name?: string;

  /**
   * TestScript.test.description
   */
  description?: string;

  /**
   * TestScript.test.action
   */
  action: TestScriptTestAction[];
}

/**
 * FHIR R4 TestScriptTestAction
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface TestScriptTestAction {

  /**
   * TestScript.test.action.id
   */
  id?: string;

  /**
   * TestScript.test.action.extension
   */
  extension?: Extension[];

  /**
   * TestScript.test.action.modifierExtension
   */
  modifierExtension?: Extension[];
}

/**
 * FHIR R4 TestScriptVariable
 * @see https://hl7.org/fhir/R4/datatypes.html
 */
export interface TestScriptVariable {

  /**
   * TestScript.variable.id
   */
  id?: string;

  /**
   * TestScript.variable.extension
   */
  extension?: Extension[];

  /**
   * TestScript.variable.modifierExtension
   */
  modifierExtension?: Extension[];

  /**
   * TestScript.variable.name
   */
  name: string;

  /**
   * TestScript.variable.defaultValue
   */
  defaultValue?: string;

  /**
   * TestScript.variable.description
   */
  description?: string;

  /**
   * TestScript.variable.expression
   */
  expression?: string;

  /**
   * TestScript.variable.headerField
   */
  headerField?: string;

  /**
   * TestScript.variable.hint
   */
  hint?: string;

  /**
   * TestScript.variable.path
   */
  path?: string;

  /**
   * TestScript.variable.sourceId
   */
  sourceId?: string;
}

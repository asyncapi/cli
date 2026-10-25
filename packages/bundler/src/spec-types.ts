import type { JSONSchema7Version, JSONSchema7TypeName, JSONSchema7Type } from 'json-schema';

export type AsyncAPIVersion = string;
export type Identifier = string;
export type DefaultContentType = string;

export interface AsyncAPIObject extends SpecificationExtensions {
  asyncapi: AsyncAPIVersion;
  id?: Identifier;
  info: InfoObject;
  defaultContentType?: DefaultContentType;
  servers?: ServersObject;
  channels: ChannelsObject;
  components?: ComponentsObject;
  tags?: TagsObject;
  externalDocs?: ExternalDocumentationObject;
}

export interface InfoObject extends SpecificationExtensions {
  title: string;
  version: string;
  description?: string;
  termsOfService?: string;
  contact?: ContactObject;
  license?: LicenseObject;
}

export interface ContactObject extends SpecificationExtensions {
  name?: string;
  url?: string;
  email?: string;
}

export interface LicenseObject extends SpecificationExtensions {
  name: string;
  url?: string;
}

export type ServersObject = Record<string, ServerObject>;

export interface ServerObject extends SpecificationExtensions {
  url: string;
  protocol: string;
  protocolVersion?: string;
  description?: string;
  variables?: Record<string, ServerVariableObject>;
  security?: Array<SecurityRequirementObject>;
  bindings?: ServerBindingsObject | ReferenceObject;
}

export interface ServerVariableObject extends SpecificationExtensions {
  enum?: Array<string>;
  default?: string;
  description?: string;
  examples?: Array<string>;
}

export interface ServerBindingsObject extends SpecificationExtensions {
  http?: Binding;
  ws?: Binding;
  kafka?: Binding;
  anypointmq?: Binding;
  amqp?: Binding;
  amqp1?: Binding;
  mqtt?: Binding;
  mqtt5?: Binding;
  nats?: Binding;
  jms?: Binding;
  sns?: Binding;
  sqs?: Binding;
  stomp?: Binding;
  redis?: Binding;
  mercure?: Binding;
  ibmmq?: Binding;
}

export type ChannelsObject = Record<string, ChannelObject>;

export interface ChannelObject extends SpecificationExtensions {
  description?: string;
  servers?: Array<string>;
  subscribe?: OperationObject;
  publish?: OperationObject;
  parameters?: ParametersObject;
  bindings?: ChannelBindingsObject | ReferenceObject;
}

export interface ChannelBindingsObject extends SpecificationExtensions {
  http?: Binding;
  ws?: Binding;
  kafka?: Binding;
  anypointmq?: Binding;
  amqp?: Binding;
  amqp1?: Binding;
  mqtt?: Binding;
  mqtt5?: Binding;
  nats?: Binding;
  jms?: Binding;
  sns?: Binding;
  sqs?: Binding;
  stomp?: Binding;
  redis?: Binding;
  mercure?: Binding;
  ibmmq?: Binding;
}

export interface OperationObject extends OperationTraitObject, SpecificationExtensions {
  message?: MessageObject | ReferenceObject | { oneOf: Array<MessageObject | ReferenceObject> };
  traits?: Array<OperationTraitObject | ReferenceObject>;
}

export interface OperationTraitObject extends SpecificationExtensions {
  operationId?: string;
  summary?: string;
  description?: string;
  security?: Array<SecurityRequirementObject>;
  tags?: TagsObject;
  externalDocs?: ExternalDocumentationObject;
  bindings?: OperationBindingsObject | ReferenceObject;
}

export interface OperationBindingsObject extends SpecificationExtensions {
  http?: Binding;
  ws?: Binding;
  kafka?: Binding;
  anypointmq?: Binding;
  amqp?: Binding;
  amqp1?: Binding;
  mqtt?: Binding;
  mqtt5?: Binding;
  nats?: Binding;
  jms?: Binding;
  sns?: Binding;
  sqs?: Binding;
  stomp?: Binding;
  redis?: Binding;
  mercure?: Binding;
  ibmmq?: Binding;
}

export type ParametersObject = Record<string, ParameterObject | ReferenceObject>;

export interface ParameterObject extends SpecificationExtensions {
  description?: string;
  schema?: SchemaObject;
  location?: string;
}

export interface MessageObject extends MessageTraitObject, SpecificationExtensions {
  payload?: any;
  traits?: Array<MessageTraitObject | ReferenceObject>;
}

export interface MessageTraitObject extends SpecificationExtensions {
  messageId?: string;
  headers?: SchemaObject;
  correlationId?: CorrelationIDObject | ReferenceObject;
  schemaFormat?: string;
  contentType?: string;
  name?: string;
  title?: string;
  summary?: string;
  description?: string;
  tags?: TagsObject;
  externalDocs?: ExternalDocumentationObject;
  bindings?: MessageBindingsObject | ReferenceObject;
  examples?: Array<MessageExampleObject>;
}

export interface MessageExampleObject extends SpecificationExtensions {
  name?: string;
  summary?: string;
  headers?: Record<string, any>;
  payload?: any;
}

export interface MessageBindingsObject extends SpecificationExtensions {
  http?: Binding;
  ws?: Binding;
  kafka?: Binding;
  anypointmq?: Binding;
  amqp?: Binding;
  amqp1?: Binding;
  mqtt?: Binding;
  mqtt5?: Binding;
  nats?: Binding;
  jms?: Binding;
  sns?: Binding;
  sqs?: Binding;
  stomp?: Binding;
  redis?: Binding;
  mercure?: Binding;
  ibmmq?: Binding;
}

export type TagsObject = Array<TagObject>;

export interface TagObject extends SpecificationExtensions {
  name: string;
  description?: string;
  externalDocs?: ExternalDocumentationObject;
}

export interface ExternalDocumentationObject extends SpecificationExtensions {
  url: string;
  description?: string;
}

export interface ComponentsObject extends SpecificationExtensions {
  channels?: Record<string, ChannelObject | ReferenceObject>;
  servers?: Record<string, ServerObject | ReferenceObject>;
  schemas?: Record<string, SchemaObject | ReferenceObject>;
  messages?: Record<string, MessageObject | ReferenceObject>;
  securitySchemes?: Record<string, SecuritySchemeObject | ReferenceObject>;
  parameters?: Record<string, ParameterObject | ReferenceObject>;
  serverVariables?: Record<string, ServerVariableObject | ReferenceObject>;
  correlationIds?: Record<string, CorrelationIDObject | ReferenceObject>;
  operationTraits?: Record<string, OperationTraitObject | ReferenceObject>;
  messageTraits?: Record<string, MessageTraitObject | ReferenceObject>;
  serverBindings?: Record<string, ServerBindingsObject | ReferenceObject>;
  channelBindings?: Record<string, ChannelBindingsObject | ReferenceObject>;
  operationBindings?: Record<string, OperationBindingsObject | ReferenceObject>;
  messageBindings?: Record<string, MessageBindingsObject | ReferenceObject>;
}

export type SchemaObject = AsyncAPISchemaObject | ReferenceObject;

export type AsyncAPISchemaObject = AsyncAPISchemaDefinition | boolean;
export interface AsyncAPISchemaDefinition extends SpecificationExtensions {
  $id?: string;
  $schema?: JSONSchema7Version;
  $comment?: string;

  type?: JSONSchema7TypeName | JSONSchema7TypeName[];
  enum?: JSONSchema7Type[];
  const?: JSONSchema7Type;

  multipleOf?: number;
  maximum?: number;
  exclusiveMaximum?: number;
  minimum?: number;
  exclusiveMinimum?: number;

  maxLength?: number;
  minLength?: number;
  pattern?: string;

  items?: AsyncAPISchemaObject | AsyncAPISchemaObject[];
  additionalItems?: AsyncAPISchemaObject;
  maxItems?: number;
  minItems?: number;
  uniqueItems?: boolean;
  contains?: AsyncAPISchemaObject;

  maxProperties?: number;
  minProperties?: number;
  required?: string[];
  properties?: {
    [key: string]: AsyncAPISchemaObject;
  };
  patternProperties?: {
    [key: string]: AsyncAPISchemaObject;
  };
  additionalProperties?: AsyncAPISchemaObject;
  dependencies?: {
    [key: string]: AsyncAPISchemaObject | string[];
  };
  propertyNames?: AsyncAPISchemaObject;

  if?: AsyncAPISchemaObject;
  then?: AsyncAPISchemaObject;
  else?: AsyncAPISchemaObject;

  allOf?: AsyncAPISchemaObject[];
  anyOf?: AsyncAPISchemaObject[];
  oneOf?: AsyncAPISchemaObject[];
  not?: AsyncAPISchemaObject;

  format?: string;

  contentMediaType?: string;
  contentEncoding?: string;

  definitions?: {
    [key: string]: AsyncAPISchemaObject;
  };

  title?: string;
  description?: string;
  default?: JSONSchema7Type;
  readOnly?: boolean;
  writeOnly?: boolean;
  examples?: Array<JSONSchema7Type>;

  discriminator?: string;
  externalDocs?: ExternalDocumentationObject;
  deprecated?: boolean;
  [keyword: string]: any;
}

export interface SecuritySchemeObject extends SpecificationExtensions {
  type: SecuritySchemeType;
  description?: string;
  name?: string;
  in?: 'user' | 'password' | 'query' | 'header' | 'cookie';
  scheme?: string;
  bearerFormat?: string;
  flows?: OAuthFlowsObject;
  openIdConnectUrl?: string;
}

export type SecuritySchemeType =
  | 'userPassword'
  | 'apiKey'
  | 'X509'
  | 'symmetricEncryption'
  | 'asymmetricEncryption'
  | 'httpApiKey'
  | 'http'
  | 'oauth2'
  | 'openIdConnect'
  | 'plain'
  | 'scramSha256'
  | 'scramSha512'
  | 'gssapi';

export type SecuritySchemaLocation = 
  | 'user' 
  | 'password' 
  | 'query' 
  | 'header' 
  | 'header' 
  | 'cookie';

export interface SecuritySchemeObjectBase extends SpecificationExtensions {
  description?: string;
}

export interface SecuritySchemeObjectUserPassword extends SecuritySchemeObjectBase, SpecificationExtensions {
  type: 'userPassword';
}

export interface SecuritySchemeObjectApiKey extends SecuritySchemeObjectBase, SpecificationExtensions {
  type: 'apiKey';
  in: 'user' | 'password';
}

export interface SecuritySchemeObjectX509 extends SecuritySchemeObjectBase, SpecificationExtensions {
  type: 'X509';
}

export interface SecuritySchemeObjectSymetricEncryption extends SecuritySchemeObjectBase, SpecificationExtensions {
  type: 'symmetricEncryption';
}

export interface SecuritySchemeObjectAsymetricEncryption extends SecuritySchemeObjectBase, SpecificationExtensions {
  type: 'asymmetricEncryption';
}

export interface SecuritySchemeObjectHttpApiKey extends SecuritySchemeObjectBase, SpecificationExtensions {
  type: 'httpApiKey';
  name: string;
  in: 'query' | 'header' | 'cookie';
}

export interface SecuritySchemeObjectHttp extends SecuritySchemeObjectBase, SpecificationExtensions {
  type: 'http';
  scheme: string;
  bearerFormat?: string;
}

export interface SecuritySchemeObjectOauth2 extends SecuritySchemeObjectBase, SpecificationExtensions {
  type: 'oauth2';
  flows: OAuthFlowsObject;
}

export interface SecuritySchemeObjectOpenIdConnect extends SecuritySchemeObjectBase, SpecificationExtensions {
  type: 'openIdConnect';
  openIdConnectUrl: string;
}

export interface SecuritySchemeObjectPlain extends SecuritySchemeObjectBase, SpecificationExtensions {
  type: 'plain';
}

export interface SecuritySchemeObjectScramSha256 extends SecuritySchemeObjectBase, SpecificationExtensions {
  type: 'scramSha256';
}

export interface SecuritySchemeObjectScramSha512 extends SecuritySchemeObjectBase, SpecificationExtensions {
  type: 'scramSha512';
}

export interface SecuritySchemeObjectGssapi extends SecuritySchemeObjectBase, SpecificationExtensions {
  type: 'gssapi';
}

export interface OAuthFlowsObject extends SpecificationExtensions {
  implicit?: OAuthFlowObjectImplicit;
  password?: OAuthFlowObjectPassword;
  clientCredentials?: OAuthFlowObjectClientCredentials;
  authorizationCode?: OAuthFlowObjectAuthorizationCode;
}

export type OAuthFlowObject =
  & OAuthFlowObjectImplicit
  & OAuthFlowObjectPassword 
  & OAuthFlowObjectClientCredentials
  & OAuthFlowObjectAuthorizationCode;

export interface OAuthFlowObjectBase extends SpecificationExtensions {
  refreshUrl?: string;
  scopes: Record<string, string>;
}

export interface OAuthFlowObjectImplicit extends OAuthFlowObjectBase, SpecificationExtensions {
  authorizationUrl: string;
}

export interface OAuthFlowObjectPassword extends OAuthFlowObjectBase, SpecificationExtensions {
  tokenUrl: string;
}

export interface OAuthFlowObjectClientCredentials extends OAuthFlowObjectBase, SpecificationExtensions {
  tokenUrl: string;
}

export interface OAuthFlowObjectAuthorizationCode extends OAuthFlowObjectBase, SpecificationExtensions {
  authorizationUrl: string;
  tokenUrl: string;
}

export type SecurityRequirementObject = Record<string, Array<string>>;

export interface CorrelationIDObject extends SpecificationExtensions {
  location: string;
  description?: string;
}

export interface Binding {
  bindingVersion?: string;
}

export interface SpecificationExtensions {
  [extension: `x-${string}`]: SpecificationExtension;
}

export type SpecificationExtension<T = any> = T;

export interface ReferenceObject {
  $ref: string;
}

export interface Options {
  base?: string;
  baseDir?: string;
  xOrigin?: boolean;
}

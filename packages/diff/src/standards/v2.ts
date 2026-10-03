import { breaking, nonBreaking, unclassified } from '../constants';

/**
 * The standard object for AsyncAPI v2
 *
 * @private
 */
export const standard = {
  '/asyncapi': {
    add: nonBreaking,
    remove: breaking,
    edit: breaking,
  },
  '/id': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/defaultContentType': {
    add: breaking,
    remove: breaking,
    edit: breaking,
  },
  '/info': {
    add: nonBreaking,
    remove: breaking,
    edit: breaking,
  },
  '/info/version': {
    add: nonBreaking,
    remove: breaking,
    edit: breaking,
  },
  '/info/termsOfService': {
    add: nonBreaking,
    remove: breaking,
    edit: breaking,
  },
  '/info/license': {
    add: nonBreaking,
    remove: breaking,
    edit: breaking,
  },
  '/info/license/name': {
    add: breaking,
    remove: breaking,
    edit: breaking,
  },
  '/info/license/url': {
    add: breaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/info/title': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/info/description': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/info/contact': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/info/contact/name': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/info/contact/url': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/info/contact/email': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/servers': {
    add: nonBreaking,
    remove: breaking,
    edit: breaking,
  },
  '/servers/*': {
    add: nonBreaking,
    remove: breaking,
    edit: breaking,
  },
  '/servers/*/url': {
    add: nonBreaking,
    remove: breaking,
    edit: breaking,
  },
  '/servers/*/description': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/servers/*/protocol': {
    add: breaking,
    remove: breaking,
    edit: breaking,
  },
  '/servers/*/protocolVersion': {
    add: breaking,
    remove: breaking,
    edit: breaking,
  },
  '/servers/*/variables': {
    add: nonBreaking,
    remove: breaking,
    edit: breaking,
  },
  '/servers/*/variables/*': {
    add: nonBreaking,
    remove: breaking,
    edit: breaking,
  },
  '/servers/*/variables/*/enum': {
    add: nonBreaking,
    remove: breaking,
    edit: breaking,
  },
  '/servers/*/variables/*/enum/*': {
    add: nonBreaking,
    remove: breaking,
    edit: breaking,
  },
  '/servers/*/variables/*/default': {
    add: breaking,
    remove: breaking,
    edit: breaking,
  },
  '/servers/*/variables/*/description': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/servers/*/variables/*/examples': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/servers/*/variables/*/examples/*': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/servers/*/security': {
    add: breaking,
    remove: breaking,
    edit: breaking,
  },
  '/servers/*/security/*': {
    add: breaking,
    remove: breaking,
    edit: breaking,
  },
  '/servers/*/bindings': {
    add: unclassified,
    remove: unclassified,
    edit: unclassified,
  },
  '/channels': {
    add: nonBreaking,
    remove: breaking,
    edit: breaking,
  },
  '/channels/*': {
    add: nonBreaking,
    remove: breaking,
    edit: breaking,
  },
  '/channels/*/description': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/channels/*/bindings': {
    add: unclassified,
    remove: unclassified,
    edit: unclassified,
  },
  '/channels/*/subscribe': {
    add: nonBreaking,
    remove: breaking,
    edit: breaking,
  },
  '/channels/*/subscribe/operationId': {
    add: nonBreaking,
    remove: breaking,
    edit: breaking,
  },
  '/channels/*/subscribe/summary': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/channels/*/subscribe/description': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/channels/*/subscribe/tags': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/channels/*/subscribe/tags/*': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/channels/*/subscribe/externalDocs': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/channels/*/subscribe/bindings': {
    add: unclassified,
    remove: unclassified,
    edit: unclassified,
  },
  '/channels/*/subscribe/traits': {
    add: nonBreaking,
    remove: breaking,
    edit: breaking,
  },
  '/channels/*/subscribe/traits/*': {
    add: nonBreaking,
    remove: breaking,
    edit: breaking,
  },
  '/channels/*/subscribe/traits/operationId': {
    add: nonBreaking,
    remove: breaking,
    edit: breaking,
  },
  '/channels/*/subscribe/traits/summary': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/channels/*/subscribe/traits/description': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/channels/*/subscribe/traits/tags': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/channels/*/subscribe/traits/tags/*': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/channels/*/subscribe/traits/externalDocs': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/channels/*/subscribe/traits/bindings': {
    add: unclassified,
    remove: unclassified,
    edit: unclassified,
  },
  '/channels/*/subscribe/message': {
    add: breaking,
    remove: breaking,
    edit: breaking,
  },
  '/channels/*/subscribe/message/headers': {
    add: unclassified,
    remove: unclassified,
    edit: unclassified,
  },
  '/channels/*/subscribe/message/correlationId': {
    add: nonBreaking,
    remove: breaking,
    edit: breaking,
  },
  '/channels/*/subscribe/message/correlationId/location': {
    add: nonBreaking,
    remove: breaking,
    edit: breaking,
  },
  '/channels/*/subscribe/message/correlationId/description': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/channels/*/subscribe/message/schemaFormat': {
    add: breaking,
    remove: breaking,
    edit: breaking,
  },
  '/channels/*/subscribe/message/contentType': {
    add: nonBreaking,
    remove: breaking,
    edit: breaking,
  },
  '/channels/*/subscribe/message/name': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/channels/*/subscribe/message/title': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/channels/*/subscribe/message/summary': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/channels/*/subscribe/message/tags': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/channels/*/subscribe/message/tags/*': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/channels/*/subscribe/message/externalDocs': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/channels/*/subscribe/message/bindings': {
    add: unclassified,
    remove: unclassified,
    edit: unclassified,
  },
  '/channels/*/subscribe/message/examples': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/channels/*/subscribe/message/examples/*': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/channels/*/subscribe/message/traits': {
    add: nonBreaking,
    remove: breaking,
    edit: breaking,
  },
  '/channels/*/subscribe/message/traits/*': {
    add: nonBreaking,
    remove: breaking,
    edit: breaking,
  },
  '/channels/*/subscribe/message/traits/headers': {
    add: unclassified,
    remove: unclassified,
    edit: unclassified,
  },
  '/channels/*/subscribe/message/traits/correlationId': {
    add: nonBreaking,
    remove: breaking,
    edit: breaking,
  },
  '/channels/*/subscribe/message/traits/correlationId/location': {
    add: nonBreaking,
    remove: breaking,
    edit: breaking,
  },
  '/channels/*/subscribe/message/traits/correlationId/description': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/channels/*/subscribe/message/traits/schemaFormat': {
    add: breaking,
    remove: breaking,
    edit: breaking,
  },
  '/channels/*/subscribe/message/traits/contentType': {
    add: nonBreaking,
    remove: breaking,
    edit: breaking,
  },
  '/channels/*/subscribe/message/traits/name': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/channels/*/subscribe/message/traits/title': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/channels/*/subscribe/message/traits/summary': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/channels/*/subscribe/message/traits/tags': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/channels/*/subscribe/message/traits/tags/*': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/channels/*/subscribe/message/traits/externalDocs': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/channels/*/subscribe/message/traits/bindings': {
    add: unclassified,
    remove: unclassified,
    edit: unclassified,
  },
  '/channels/*/subscribe/message/traits/examples': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/channels/*/subscribe/message/traits/examples/*': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/channels/*/subscribe/message/description': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/channels/*/subscribe/message/payload': {
    add: unclassified,
    remove: unclassified,
    edit: unclassified,
  },
  '/channels/*/publish': {
    add: nonBreaking,
    remove: breaking,
    edit: breaking,
  },
  '/channels/*/publish/operationId': {
    add: nonBreaking,
    remove: breaking,
    edit: breaking,
  },
  '/channels/*/publish/summary': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/channels/*/publish/description': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/channels/*/publish/tags': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/channels/*/publish/tags/*': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/channels/*/publish/externalDocs': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/channels/*/publish/bindings': {
    add: unclassified,
    remove: unclassified,
    edit: unclassified,
  },
  '/channels/*/publish/traits': {
    add: nonBreaking,
    remove: breaking,
    edit: breaking,
  },
  '/channels/*/publish/traits/*': {
    add: nonBreaking,
    remove: breaking,
    edit: breaking,
  },
  '/channels/*/publish/traits/operationId': {
    add: nonBreaking,
    remove: breaking,
    edit: breaking,
  },
  '/channels/*/publish/traits/summary': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/channels/*/publish/traits/description': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/channels/*/publish/traits/tags': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/channels/*/publish/traits/tags/*': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/channels/*/publish/traits/externalDocs': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/channels/*/publish/traits/bindings': {
    add: unclassified,
    remove: unclassified,
    edit: unclassified,
  },
  '/channels/*/publish/message': {
    add: breaking,
    remove: breaking,
    edit: breaking,
  },
  '/channels/*/publish/message/headers': {
    add: unclassified,
    remove: unclassified,
    edit: unclassified,
  },
  '/channels/*/publish/message/correlationId': {
    add: nonBreaking,
    remove: breaking,
    edit: breaking,
  },
  '/channels/*/publish/message/correlationId/location': {
    add: nonBreaking,
    remove: breaking,
    edit: breaking,
  },
  '/channels/*/publish/message/correlationId/description': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/channels/*/publish/message/schemaFormat': {
    add: breaking,
    remove: breaking,
    edit: breaking,
  },
  '/channels/*/publish/message/contentType': {
    add: nonBreaking,
    remove: breaking,
    edit: breaking,
  },
  '/channels/*/publish/message/name': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/channels/*/publish/message/title': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/channels/*/publish/message/summary': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/channels/*/publish/message/tags': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/channels/*/publish/message/tags/*': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/channels/*/publish/message/externalDocs': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/channels/*/publish/message/bindings': {
    add: unclassified,
    remove: unclassified,
    edit: unclassified,
  },
  '/channels/*/publish/message/examples': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/channels/*/publish/message/examples/*': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/channels/*/publish/message/traits': {
    add: nonBreaking,
    remove: breaking,
    edit: breaking,
  },
  '/channels/*/publish/message/traits/*': {
    add: nonBreaking,
    remove: breaking,
    edit: breaking,
  },
  '/channels/*/publish/message/traits/headers': {
    add: unclassified,
    remove: unclassified,
    edit: unclassified,
  },
  '/channels/*/publish/message/traits/correlationId': {
    add: nonBreaking,
    remove: breaking,
    edit: breaking,
  },
  '/channels/*/publish/message/traits/correlationId/location': {
    add: nonBreaking,
    remove: breaking,
    edit: breaking,
  },
  '/channels/*/publish/message/traits/correlationId/description': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/channels/*/publish/message/traits/schemaFormat': {
    add: breaking,
    remove: breaking,
    edit: breaking,
  },
  '/channels/*/publish/message/traits/contentType': {
    add: nonBreaking,
    remove: breaking,
    edit: breaking,
  },
  '/channels/*/publish/message/traits/name': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/channels/*/publish/message/traits/title': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/channels/*/publish/message/traits/summary': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/channels/*/publish/message/traits/tags': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/channels/*/publish/message/traits/tags/*': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/channels/*/publish/message/traits/externalDocs': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/channels/*/publish/message/traits/bindings': {
    add: unclassified,
    remove: unclassified,
    edit: unclassified,
  },
  '/channels/*/publish/message/traits/examples': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/channels/*/publish/message/traits/examples/*': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/channels/*/publish/message/description': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/channels/*/publish/message/payload': {
    add: unclassified,
    remove: unclassified,
    edit: unclassified,
  },
  '/channels/*/parameters': {
    add: breaking,
    remove: breaking,
    edit: breaking,
  },
  '/channels/*/parameters/*': {
    add: nonBreaking,
    remove: breaking,
    edit: breaking,
  },
  '/channels/*/parameters/*/description': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/channels/*/parameters/*/schema': {
    add: unclassified,
    remove: unclassified,
    edit: unclassified,
  },
  '/channels/*/parameters/*/location': {
    add: breaking,
    remove: breaking,
    edit: breaking,
  },
  '/components': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/tags': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/externalDocs': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
};

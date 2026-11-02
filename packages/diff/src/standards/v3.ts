import { breaking, nonBreaking, unclassified } from '../constants';

/**
 * The standard object for AsyncAPI v3
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
    remove: breaking,
    edit: breaking,
  },
  '/info': {
    add: nonBreaking,
    remove: breaking,
    edit: nonBreaking,
  },
  '/info/title': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/info/version': {
    add: nonBreaking,
    remove: breaking,
    edit: breaking,
  },
  '/info/description': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/info/termsOfService': {
    add: nonBreaking,
    remove: breaking,
    edit: breaking,
  },
  '/info/contact': {
    add: nonBreaking,
    remove: breaking,
    edit: nonBreaking,
  },
  '/info/contact/name': {
    add: nonBreaking,
    remove: breaking,
    edit: nonBreaking,
  },
  '/info/contact/url': {
    add: nonBreaking,
    remove: breaking,
    edit: nonBreaking,
  },
  '/info/contact/email': {
    add: nonBreaking,
    remove: breaking,
    edit: nonBreaking,
  },
  '/info/license': {
    add: nonBreaking,
    remove: breaking,
    edit: nonBreaking,
  },
  '/info/license/name': {
    add: nonBreaking,
    remove: breaking,
    edit: nonBreaking,
  },
  '/info/license/url': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/info/tags': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/info/tags/*': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/info/externalDocs': {
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
  '/servers/*/host': {
    add: nonBreaking,
    remove: breaking,
    edit: breaking,
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
  '/servers/*/pathname': {
    add: nonBreaking,
    remove: breaking,
    edit: breaking,
  },
  '/servers/*/description': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/servers/*/title': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
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
  '/servers/*/tags': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/servers/*/tags/*': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/servers/*/externalDocs': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/servers/*/bindings': {
    add: unclassified,
    remove: unclassified,
    edit: unclassified,
  },
  '/defaultContentType': {
    add: breaking,
    remove: breaking,
    edit: breaking,
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
  '/channels/*/address': {
    add: nonBreaking,
    remove: breaking,
    edit: breaking,
  },
  '/channels/*/messages': {
    add: nonBreaking,
    remove: breaking,
    edit: breaking,
  },
  '/channels/*/messages/*': {
    add: nonBreaking,
    remove: breaking,
    edit: breaking,
  },
  '/channels/*/messages/*/headers': {
    add: breaking,
    remove: breaking,
    edit: breaking,
  },
  '/channels/*/messages/*/payload': {
    add: breaking,
    remove: breaking,
    edit: breaking,
  },
  '/channels/*/messages/*/correlationId': {
    add: nonBreaking,
    remove: breaking,
    edit: breaking,
  },
  '/channels/*/messages/*/contentType': {
    add: breaking,
    remove: breaking,
    edit: breaking,
  },
  '/channels/*/messages/*/name': {
    add: nonBreaking,
    remove: breaking,
    edit: breaking,
  },
  '/channels/*/messages/*/title': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/channels/*/messages/*/summary': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/channels/*/messages/*/description': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/channels/*/messages/*/tags': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/channels/*/messages/*/tags/*': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/channels/*/messages/*/externalDocs': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/channels/*/messages/*/bindings': {
    add: unclassified,
    remove: unclassified,
    edit: unclassified,
  },
  '/channels/*/messages/*/examples': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/channels/*/messages/*/examples/*': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/channels/*/messages/*/traits': {
    add: nonBreaking,
    remove: breaking,
    edit: breaking,
  },
  '/channels/*/messages/*/traits/*': {
    add: nonBreaking,
    remove: breaking,
    edit: breaking,
  },
  '/channels/*/messages/*/traits/*/headers': {
    add: unclassified,
    remove: unclassified,
    edit: unclassified,
  },
  '/channels/*/messages/*/traits/*/correlationId': {
    add: nonBreaking,
    remove: breaking,
    edit: breaking,
  },
  '/channels/*/messages/*/traits/*/correlationId/description': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/channels/*/messages/*/traits/*/correlationId/location': {
    add: nonBreaking,
    remove: breaking,
    edit: breaking,
  },
  '/channels/*/messages/*/traits/*/contentType': {
    add: breaking,
    remove: breaking,
    edit: breaking,
  },
  '/channels/*/messages/*/traits/*/name': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/channels/*/messages/*/traits/*/title': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/channels/*/messages/*/traits/*/summary': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/channels/*/messages/*/traits/*/description': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/channels/*/messages/*/traits/*/tags': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/channels/*/messages/*/traits/*/tags/*': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/channels/*/messages/*/traits/*/externalDocs': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/channels/*/messages/*/traits/*/bindings': {
    add: unclassified,
    remove: unclassified,
    edit: unclassified,
  },
  '/channels/*/messages/*/traits/*/examples': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/channels/*/messages/*/traits/*/examples/*': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/channels/*/title': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/channels/*/summary': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/channels/*/description': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/channels/*/servers': {
    add: nonBreaking,
    remove: breaking,
    edit: breaking,
  },
  '/channels/*/servers/*': {
    add: nonBreaking,
    remove: breaking,
    edit: breaking,
  },
  '/channels/*/parameters': {
    add: breaking,
    remove: breaking,
    edit: breaking,
  },
  '/channels/*/tags': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/channels/*/tags/*': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/channels/*/externalDocs': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/channels/*/bindings': {
    add: unclassified,
    remove: unclassified,
    edit: unclassified,
  },
  '/operations': {
    add: nonBreaking,
    remove: breaking,
    edit: nonBreaking,
  },
  '/operations/*': {
    add: nonBreaking,
    remove: breaking,
    edit: breaking,
  },
  '/operations/*/action': {
    add: nonBreaking,
    remove: breaking,
    edit: breaking,
  },
  '/operations/*/channel': {
    add: nonBreaking,
    remove: breaking,
    edit: breaking,
  },
  '/operations/*/title': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/operations/*/summary': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/operations/*/description': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/operations/*/security': {
    add: breaking,
    remove: breaking,
    edit: breaking,
  },
  '/operations/*/security/*': {
    add: breaking,
    remove: breaking,
    edit: breaking,
  },
  '/operations/*/tags': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/operations/*/tags/*': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/operations/*/externalDocs': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/operations/*/bindings': {
    add: unclassified,
    remove: unclassified,
    edit: unclassified,
  },
  '/operations/*/traits': {
    add: nonBreaking,
    remove: breaking,
    edit: breaking,
  },
  '/operations/*/traits/*': {
    add: nonBreaking,
    remove: breaking,
    edit: breaking,
  },
  '/operations/*/traits/*/title': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/operations/*/traits/*/summary': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/operations/*/traits/*/description': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/operations/*/traits/*/security': {
    add: breaking,
    remove: breaking,
    edit: breaking,
  },
  '/operations/*/traits/*/security/*': {
    add: breaking,
    remove: breaking,
    edit: breaking,
  },
  '/operations/*/traits/*/tags': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/operations/*/traits/*/tags/*': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/operations/*/traits/*/externalDocs': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/operations/*/traits/*/bindings': {
    add: unclassified,
    remove: unclassified,
    edit: unclassified,
  },
  '/operations/*/messages': {
    add: nonBreaking,
    remove: breaking,
    edit: breaking,
  },
  '/operations/*/messages/*': {
    add: nonBreaking,
    remove: breaking,
    edit: breaking,
  },
  '/operations/*/reply': {
    add: nonBreaking,
    remove: breaking,
    edit: breaking,
  },
  '/operations/*/reply/address': {
    add: breaking,
    remove: breaking,
    edit: breaking,
  },
  '/operations/*/reply/address/description': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  },
  '/operations/*/reply/address/location': {
    add: nonBreaking,
    remove: breaking,
    edit: breaking,
  },
  '/operations/*/reply/channel': {
    add: unclassified,
    remove: unclassified,
    edit: unclassified,
  },
  '/operations/*/reply/messages': {
    add: unclassified,
    remove: unclassified,
    edit: unclassified,
  },
  '/operations/*/reply/messages/*': {
    add: unclassified,
    remove: unclassified,
    edit: unclassified,
  },
  '/components': {
    add: nonBreaking,
    remove: nonBreaking,
    edit: nonBreaking,
  }
};

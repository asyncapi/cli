import YAML from 'yaml'
import _ from 'lodash'
import { compareComponents, isEqual, isInComponents, isInChannels, toJS } from '../../src/Utils'

describe('Helpers', () => {
  const testObject1 = {
    streetlightId: { schema: { type: 'string', 'x-extension': 'different_value' } },
  }
  const testObject1_copy = { streetlightId: { schema: { type: 'string', 'x-extension': 'value' } } }
  const testObject2 = { streetlightId: { schema: { type: 'number' } } }
  const testObject2_reference = testObject2

  describe('compareComponents', () => {
    test('should return true.', () => {
      expect(compareComponents(testObject1, testObject1_copy)).toEqual(true)
    })

    test('should return false.', () => {
      expect(compareComponents(testObject1, testObject2)).toEqual(false)
    })
  })
  describe('isEqual', () => {
    test('should return true.', () => {
      expect(isEqual(testObject2, testObject2_reference, true)).toEqual(true)
      expect(isEqual(testObject1, testObject1_copy, true)).toEqual(true)
      expect(isEqual(testObject1, testObject1_copy, false)).toEqual(true)
    })

    test('should return false.', () => {
      expect(isEqual(testObject2, testObject2_reference, false)).toEqual(false)
    })
  })

  describe('isInComponents', () => {
    test('should return true.', () => {
      expect(isInComponents({ component: {}, path: 'components.messages.message1' })).toEqual(true)
    })

    test('should return false.', () => {
      expect(isInComponents({ component: {}, path: 'channels.channel1.message' })).toEqual(false)
    })
  })

  describe('toJS', () => {
    const json_object = {
      components: {
        messages: {
          unusedMessage: { name: 'unusedMessage', title: 'Thismessageisnotusedinanychannel.' },
        },
      },
    }
    const json_string = JSON.stringify(json_object)
    const yaml_string = YAML.stringify(json_object)
    test('should convert all input types to Object.', () => {
      expect(_.isEqual(toJS(json_object), json_object)).toEqual(true)
      expect(_.isEqual(toJS(json_string), json_object)).toEqual(true)
      expect(_.isEqual(toJS(yaml_string), json_object)).toEqual(true)
    })
  })
  describe('isInChannels', () => {
    test('should return true.', () => {
      expect(isInChannels({ component: {}, path: 'channels.channel1.message' })).toEqual(true)
    })

    test('should return false.', () => {
      expect(isInChannels({ component: {}, path: 'components.messages.message1' })).toEqual(false)
    })
  })
})

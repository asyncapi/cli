import {
  moveAllToComponents,
  moveDuplicatesToComponents,
  reuseComponents,
  removeComponents,
} from '../../src/Reporters'
import { inputYAML } from '../fixtures'
import { Parser } from '@asyncapi/parser'
import { getOptimizableComponents } from '../../src/ComponentProvider'
import { OptimizableComponentGroup } from '../../src/types'

const moveAllToComponentsExpectedResult: any[] = [
  {
    path: 'channels.withDuplicatedMessage1.messages.duped1',
    action: 'move',
    target: 'components.messages.duped1',
  },
  {
    path: 'channels.withDuplicatedMessage2.messages.duped2',
    action: 'move',
    target: 'components.messages.duped2',
  },
  {
    path: 'channels.withFullFormMessage.messages.canBeReused',
    action: 'move',
    target: 'components.messages.canBeReused',
  },
  {
    path: 'channels.withDuplicatedMessage1',
    action: 'move',
    target: 'components.channels.withDuplicatedMessage1FromXOrigin',
  },
  {
    path: 'channels.withDuplicatedMessage2',
    action: 'move',
    target: 'components.channels.withDuplicatedMessage2',
  },
  {
    path: 'channels.withFullFormMessage',
    action: 'move',
    target: 'components.channels.withFullFormMessage',
  },
  {
    path: 'channels.UserSignedUp1',
    action: 'move',
    target: 'components.channels.UserSignedUp1',
  },
  {
    path: 'channels.UserSignedUp2',
    action: 'move',
    target: 'components.channels.UserSignedUp2',
  },
  {
    path: 'channels.deleteAccount',
    action: 'move',
    target: 'components.channels.deleteAccount',
  },
  {
    path: 'channels.withDuplicatedMessage1.messages.duped1.payload',
    action: 'move',
    target: 'components.schemas.payload',
  },
  {
    path: 'channels.withDuplicatedMessage2.messages.duped2.payload',
    action: 'move',
    target: 'components.schemas.payload',
  },
  {
    path: 'channels.UserSignedUp1.messages.myMessage.payload',
    action: 'move',
    target: 'components.schemas.payload',
  },
  {
    path: 'channels.UserSignedUp1.messages.myMessage.payload.properties.displayName',
    action: 'move',
    target: 'components.schemas.displayName',
  },
  {
    path: 'channels.UserSignedUp1.messages.myMessage.payload.properties.email',
    action: 'move',
    target: 'components.schemas.email',
  },
  {
    path: 'channels.deleteAccount.messages.deleteUser.payload',
    action: 'move',
    target: 'components.schemas.payload',
  },
  {
    path: 'operations.user/deleteAccount.subscribe',
    action: 'move',
    target: 'components.operations.subscribe',
  },
]
const moveDuplicatesToComponentsExpectedResult: any[] = [
  {
    path: 'channels.withDuplicatedMessage1.messages.duped1',
    action: 'move',
    target: 'components.messages.duped1',
  },
  {
    path: 'channels.withDuplicatedMessage2.messages.duped2',
    action: 'reuse',
    target: 'components.messages.duped1',
  },
  {
    path: 'channels.UserSignedUp1',
    action: 'move',
    target: 'components.channels.UserSignedUp1',
  },
  {
    path: 'channels.UserSignedUp2',
    action: 'reuse',
    target: 'components.channels.UserSignedUp1',
  },
  {
    path: 'channels.withDuplicatedMessage1.messages.duped1.payload',
    action: 'move',
    target: 'components.schemas.payload',
  },
  {
    path: 'channels.withDuplicatedMessage2.messages.duped2.payload',
    action: 'reuse',
    target: 'components.schemas.payload',
  },
]
const RemoveComponentsExpectedResult = [
  { path: 'components.messages.unUsedMessage', action: 'remove' },
  { path: 'components.channels.unUsedChannel', action: 'remove' },
  { path: 'components.schemas.canBeReused', action: 'remove' },
]
const ReuseComponentsExpectedResult = [
  {
    path: 'channels.withFullFormMessage.messages.canBeReused.payload',
    action: 'reuse',
    target: 'components.schemas.canBeReused',
  },
]

describe('Optimizers', () => {
  let optimizableComponents: OptimizableComponentGroup[]
  beforeAll(async () => {
    const asyncapiDocument = await new Parser().parse(inputYAML, { applyTraits: false })
    optimizableComponents = getOptimizableComponents(asyncapiDocument.document!)
  })
  describe('moveAllToComponents', () => {
    test('should contain the correct optimizations.', () => {
      const report = moveAllToComponents(optimizableComponents)
      expect(report.elements).toEqual(moveAllToComponentsExpectedResult)
      expect(report.type).toEqual('moveAllToComponents')
    })
  })

  describe('moveDuplicatesToComponents', () => {
    test('should contain the correct optimizations.', () => {
      const report = moveDuplicatesToComponents(optimizableComponents)
      expect(report.elements).toEqual(moveDuplicatesToComponentsExpectedResult)
      expect(report.type).toEqual('moveDuplicatesToComponents')
    })
  })

  describe('RemoveComponents', () => {
    test('should contain the correct optimizations.', () => {
      const report = removeComponents(optimizableComponents)
      expect(report.elements).toEqual(RemoveComponentsExpectedResult)
      expect(report.type).toEqual('removeComponents')
    })
  })

  describe('ReuseComponents', () => {
    test('should contain the correct optimizations.', () => {
      const report = reuseComponents(optimizableComponents)
      expect(report.elements).toEqual(ReuseComponentsExpectedResult)
      expect(report.type).toEqual('reuseComponents')
    })
  })
})

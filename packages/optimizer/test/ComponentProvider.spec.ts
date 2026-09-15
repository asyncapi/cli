import { asyncapiYAMLWithoutComponents, inputYAML } from './fixtures'
import { Parser } from '@asyncapi/parser'
import { isInComponents } from '../src/Utils'
import { getOptimizableComponents } from '../src/ComponentProvider'

describe('ComponentProvider', () => {
  it('should not contain any component from components section', async () => {
    const asyncapiDocument = await new Parser().parse(asyncapiYAMLWithoutComponents, {
      applyTraits: false,
    })
    const componentProviderWithoutComponents = getOptimizableComponents(asyncapiDocument.document!)
    for (const componentsGroup of componentProviderWithoutComponents) {
      for (const component of componentsGroup.components) {
        expect(isInComponents(component)).toBe(false)
      }
    }
  })

  it('should contain some components from components section', async () => {
    const asyncapiDocument = await new Parser().parse(inputYAML)
    const componentProviderWithComponents = getOptimizableComponents(asyncapiDocument.document!)
    let inComponentsCounter = 0

    for (const componentsGroup of componentProviderWithComponents) {
      for (const component of componentsGroup.components) {
        if (isInComponents(component)) {
          inComponentsCounter++
        }
      }
    }
    expect(inComponentsCounter).toBeGreaterThan(0)
  })
})

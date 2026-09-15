import { Action } from '../Optimizer'
import { OptimizableComponentGroup, ReportElement, Reporter } from '../types'
import { createReport, isInComponents } from '../Utils'
import Debug from 'debug'
const debug = Debug('reporter:removeComponents')

const findUnusedComponents = (componentsGroup: OptimizableComponentGroup): ReportElement[] => {
  const allComponents = componentsGroup.components
  const insideComponentsSection = new Set([...allComponents].filter(isInComponents))
  const outsideComponentsSection = new Set(
    allComponents
      .filter((component) => !insideComponentsSection.has(component))
      .map((component) => component.component)
  )
  const unusedComponents = [...insideComponentsSection].filter(
    (component) => !outsideComponentsSection.has(component.component)
  )
  debug(
    'unused %s inside components section: %O',
    componentsGroup.type,
    unusedComponents.map((component) => component.path)
  )
  return unusedComponents.map((component) => ({ path: component.path, action: Action.Remove }))
}

export const removeComponents: Reporter = (optimizeableComponents) => {
  return createReport(findUnusedComponents, optimizeableComponents, 'removeComponents')
}

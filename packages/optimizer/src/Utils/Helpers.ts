import * as _ from 'lodash'
import YAML from 'js-yaml'
import { OptimizableComponentGroup, Report, ReportElement, OptimizableComponent } from 'types'
import { OptimizerInputError, OptimizerErrorCode } from '../errors'

/**
 * Checks if a component's parent is a ref or not.
 */
export const hasParent = (reportElement: ReportElement, asyncapiFile: any): boolean => {
  const childPath = reportElement.path
  const parentPath = childPath.substring(0, childPath.lastIndexOf('.'))
  const parent = _.get(asyncapiFile, parentPath)
  return !_.has(parent, '$ref')
}

export const createReport = (
  reportFn: (optimizableComponent: OptimizableComponentGroup) => ReportElement[],
  optimizeableComponents: OptimizableComponentGroup[],
  reporterType: string
): Report => {
  const elements = optimizeableComponents
    .map((optimizeableComponent) => reportFn(optimizeableComponent))
    .flat()

  const type = reporterType
  return { type, elements }
}

export const sortReportElements = (report: Report): Report => {
  report.elements.sort((a, b) => a.action.length - b.action.length || b.path.length - a.path.length)
  return report
}

// Utility function to get all targets of reports with type 'reuseComponents'
const getReuseComponentTargets = (
  reports: { type: string; elements: ReportElement[] }[]
): Set<string> => {
  const targets = new Set<string>()
  for (const report of reports) {
    if (report.type === 'reuseComponents') {
      for (const element of report.elements) {
        if (element.target) {
          targets.add(element.target)
        }
      }
    }
  }
  return targets
}

// Main function to filter report elements
export const filterReportElements = (
  reports: { type: string; elements: ReportElement[] }[]
): Report[] => {
  const reuseTargets = getReuseComponentTargets(reports)

  return reports.map((report) => {
    if (report.type === 'removeComponents') {
      const filteredElements = report.elements.filter((element) => {
        return !reuseTargets.has(element.path)
      })
      return { type: report.type, elements: filteredElements }
    }
    return report
  })
}

const isExtension = (fieldName: string): boolean => {
  return fieldName.startsWith('x-')
}

const backwardsCheck = (x: any, y: any): boolean => {
  for (const p in y) {
    if (_.has(y, p) && !_.has(x, p)) {
      return false
    }
  }
  return true
}

const compareComponents = (x: any, y: any): boolean => {
  // if they are not strictly equal, they both need to be Objects
  if (!(x instanceof Object) || !(y instanceof Object)) {
    return false
  }
  for (const p in x) {
    //extensions have different values for objects that are equal (duplicated.) If you don't skip the extensions this function always returns false.
    if (isExtension(p)) {
      continue
    }
    if (!_.has(x, p)) {
      continue
    }

    // allows to compare x[ p ] and y[ p ] when set to undefined
    if (!_.has(y, p)) {
      return false
    }

    // if they have the same strict value or identity then they are equal
    if (x[String(p)] === y[String(p)]) {
      continue
    }

    // Numbers, Strings, Functions, Booleans must be strictly equal
    if (typeof x[String(p)] !== 'object') {
      return false
    }

    // Objects and Arrays must be tested recursively
    if (!compareComponents(x[String(p)], y[String(p)])) {
      return false
    }
  }
  return backwardsCheck(x, y)
}

/**
 *
 * @param component1 The first component that you want to compare with the second component.
 * @param component2 The second component.
 * @param referentialEqualityCheck If `true` the function will return true if the two components have referential equality OR they have the same structure. If `false` the it will only return true if they have the same structure but they are NOT referentially equal.
 * @returns whether the two components are equal.
 */
const isEqual = (component1: any, component2: any, referentialEqualityCheck: boolean): boolean => {
  if (referentialEqualityCheck) {
    return component1 === component2 || compareComponents(component1, component2)
  }
  return component1 !== component2 && compareComponents(component1, component2)
}

/**
 * checks if a component is located in `components` section of an asyncapi document.
 */
const isInComponents = (optimizableComponent: OptimizableComponent): boolean => {
  return optimizableComponent.path.startsWith('components.')
}

/**
 * checks if a component is located in `channels` section of an asyncapi document.
 */
const isInChannels = (component: OptimizableComponent): boolean => {
  return component.path.startsWith('channels.')
}

/**
 * Converts JSON or YAML string object.
 */
const toJS = (asyncapiYAMLorJSON: any): any => {
  if (asyncapiYAMLorJSON.constructor && asyncapiYAMLorJSON.constructor.name === 'Object') {
    //NOTE: this approach can have problem with circular references between object and JSON.stringify doesn't support it.
    //more info: https://github.com/asyncapi/parser-js/issues/293
    return JSON.parse(JSON.stringify(asyncapiYAMLorJSON))
  }
  if (typeof asyncapiYAMLorJSON === 'string') {
    return YAML.load(asyncapiYAMLorJSON)
  }
  throw new OptimizerInputError(
    OptimizerErrorCode.INPUT_INVALID,
    'Unknown input: Please make sure that your input is an Object/String of a valid AsyncAPI specification document.'
  )
}

const getComponentName = (component: OptimizableComponent): string => {
  let componentName
  if (component.component['x-origin']) {
    componentName = String(component.component['x-origin']).split('/').reverse()[0]
  } else {
    componentName = String(component.path).split('.').reverse()[0]
  }
  return componentName
}

export { compareComponents, isEqual, isInComponents, isInChannels, toJS, getComponentName }

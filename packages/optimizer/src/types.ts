import type { Action, Output } from './Optimizer'

export interface ReportElement {
  path: string
  action: Action
  target?: string
}
export type OptimizableComponent = {
  path: string
  component: any
}
export type OptimizableComponentGroup = {
  type: string
  components: OptimizableComponent[]
}

// v2: the report is a list of per-optimization-type groups.
// (v1 exposed an object keyed by optimization name; that shape was removed in v2.)
export interface Report {
  type: string
  elements: ReportElement[]
}

export type Reporter = (optimizeableComponents: OptimizableComponentGroup[]) => Report

interface Rules {
  reuseComponents?: boolean
  removeComponents?: boolean
  moveAllToComponents?: boolean
  moveDuplicatesToComponents?: boolean
}

export interface DisableOptimizationFor {
  schema?: boolean
}
export interface Options {
  rules?: Rules
  output?: Output
  disableOptimizationFor?: DisableOptimizationFor // non-approved type
}

export interface IOptimizer {
  getReport: () => Promise<Report[]>
}

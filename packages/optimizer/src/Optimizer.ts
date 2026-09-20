import {
  Report,
  ReportElement,
  Options,
  OptimizableComponentGroup,
  Reporter,
} from './types'
import { Parser } from '@asyncapi/parser'
import {
  OptimizerParseError,
  OptimizerStateError,
  OptimizerSerializationError,
  OptimizerErrorCode,
} from './errors'
import {
  removeComponents,
  reuseComponents,
  moveAllToComponents,
  moveDuplicatesToComponents,
} from './reporters'
import YAML from 'js-yaml'
import merge from 'merge-deep'
import * as _ from 'lodash'
import { getOptimizableComponents } from './ComponentProvider'
import { filterReportElements, hasParent, sortReportElements, toJS } from './utils'
import Debug from 'debug'

export enum Action {
  Move = 'move',
  Remove = 'remove',
  Reuse = 'reuse',
}

export enum Output {
  JSON = 'JSON',
  YAML = 'YAML',
}
/**
 * this class is the starting point of the library.
 * user will only interact with this class. here we generate different kind of reports using optimizers, apply changes and return the results to the user.
 *
 * @public
 */
export class Optimizer {
  private components!: OptimizableComponentGroup[]
  private readonly reporters: Reporter[]
  private reports: Report[] | undefined
  private readonly outputObject: any

  /**
   * @param {any} YAMLorJSON - YAML or JSON document that you want to optimize. You can pass Object, YAML or JSON version of your AsyncAPI document here.
   */
  constructor(private readonly YAMLorJSON: any) {
    this.outputObject = toJS(this.YAMLorJSON)
    this.reporters = [
      removeComponents,
      reuseComponents,
      moveAllToComponents,
      moveDuplicatesToComponents,
    ]
  }

  /**
   * @returns {Report} an object containing all of the optimizations that the library can do.
   *
   */
  async getReport(): Promise<Report[]> {
    const parser = new Parser()
    const parsedDocument = await parser.parse(this.YAMLorJSON, { applyTraits: false })
    if (!parsedDocument.document) {
      throw new OptimizerParseError(
        OptimizerErrorCode.DOCUMENT_PARSE_FAILED,
        'Parsing failed.',
        { details: parsedDocument.diagnostics }
      )
    }
    this.components = getOptimizableComponents(parsedDocument.document)
    const rawReports = this.reporters.map((reporter) => reporter(this.components))
    const reportsWithParents = rawReports.map((report) => ({
      type: report.type,
      elements: report.elements.filter((reportElement) =>
        hasParent(reportElement, this.outputObject)
      ),
    }))

    const filteredReports = filterReportElements(reportsWithParents)
    const sortedReports = filteredReports.map((report) => sortReportElements(report))
    this.reports = sortedReports

    return this.reports
  }

  /**
   * @typedef {Object} Rules
   * @property {Boolean=} reuseComponents - whether to reuse components from `components` section or not. Defaults to `true`.
   * @property {Boolean=} removeComponents - whether to remove un-used components from `components` section or not. Defaults to `true`.
   * @property {Boolean=} moveAllToComponents - whether to move all AsyncAPI Specification-valid components to the `components` section or not. Defaults to `true`.
   * @property {Boolean=} moveDuplicatesToComponents - whether to move duplicated components to the `components` section or not. Defaults to `false`.
   */
  /**
   * @typedef {Object} DisableOptimizationFor
   * @property {Boolean=} schema - whether object `schema` should be excluded from the process of optimization (`true` instructs **not** to add calculated `schemas` to the optimized AsyncAPI Document.)
   */
  /**
   * @typedef {Object} Options
   * @property {Rules=} rules - the list of rules that specifies which type of optimizations should be applied.
   * @property {String=} output - specifies which type of output user wants, `'JSON'` or `'YAML'`. Defaults to `'YAML'`;
   * @property {DisableOptimizationFor=} disableOptimizationFor - the list of objects that should be excluded from the process of optimization.
   */
  /**
   * This function is used to get the optimized document after seeing the report.
   *
   * @param {Options=} Options - the options are a way to customize the final output.
   * @returns {string } returns an stringified version of the YAML output.
   *
   */
  getOptimizedDocument(options?: Options): string {
    const defaultOptions = {
      rules: {
        reuseComponents: true,
        removeComponents: true,
        moveAllToComponents: true,
        moveDuplicatesToComponents: false, // there is no need to move duplicates if `moveAllToComponents` is `true`
      },
      output: Output.YAML,
      disableOptimizationFor: {
        schema: false,
      },
    }
    options = merge(defaultOptions, options)
    if (!this.reports) {
      throw new OptimizerStateError(
        OptimizerErrorCode.REPORT_NOT_GENERATED,
        'No report has been generated. please first generate a report by calling getReport method.'
      )
    }
    for (const report of this.reports) {
      if (options.disableOptimizationFor?.schema === true) {
        report.elements = report.elements.filter(
          (element) => !element.target?.includes('.schemas.')
        )
      }
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if (options.rules[report.type] === true) {
        this.applyReport(report.elements)
      }
    }

    try {
      if (options.output === Output.JSON) {
        return JSON.stringify(this.outputObject)
      }
      return YAML.dump(this.outputObject)
    } catch (err) {
      throw new OptimizerSerializationError(
        OptimizerErrorCode.SERIALIZATION_FAILED,
        'Failed to serialize the optimized AsyncAPI document.',
        { cause: err }
      )
    }
  }

  private removeEmptyParent(childPath: string): void {
    const parentPath = childPath.substring(0, childPath.lastIndexOf('.'))
    const parent = _.get(this.outputObject, parentPath)
    if (_.isEmpty(parent)) {
      _.unset(this.outputObject, parentPath)
    }
  }

  private applyReport(changes: ReportElement[]): void {
    const debug = Debug('optimizer:applyReport')
    for (const change of changes) {
      switch (change.action) {
        case Action.Move:
          _.set(this.outputObject, change.target as string, _.get(this.outputObject, change.path))
          _.set(this.outputObject, change.path, {
            $ref: `#/${change.target?.replace(/\./g, '/')}`,
          })
          debug('moved %s to %s', change.path, change.target)
          break

        case Action.Reuse:
          if (_.get(this.outputObject, change.target as string)) {
            _.set(this.outputObject, change.path, {
              $ref: `#/${change.target?.replace(/\./g, '/')}`,
            })
          }
          debug('%s reused %s', change.path, change.target)
          break

        case Action.Remove:
          _.unset(this.outputObject, change.path)
          //if parent becomes empty after removing, parent should be removed as well.
          this.removeEmptyParent(change.path)
          debug('removed %s', change.path)
          break
      }
    }
  }
}

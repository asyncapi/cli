import YAML from 'js-yaml'
import { Optimizer, Output } from '../src/Optimizer'
import {
  OptimizerError,
  OptimizerErrorCode,
  OptimizerInputError,
  OptimizerParseError,
  OptimizerSerializationError,
  OptimizerStateError,
} from '../src/errors'
import { inputYAML } from './fixtures'

describe('Optimizer v2 errors and report shape', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('getReport() returns an array of { type, elements } groups', async () => {
    const optimizer = new Optimizer(inputYAML)
    const report = await optimizer.getReport()

    expect(Array.isArray(report)).toBe(true)
    expect(report.length).toBeGreaterThan(0)
    for (const group of report) {
      expect(typeof group.type).toBe('string')
      expect(Array.isArray(group.elements)).toBe(true)
    }
    expect(report.map((group) => group.type).sort()).toEqual(
      ['moveAllToComponents', 'moveDuplicatesToComponents', 'removeComponents', 'reuseComponents'].sort()
    )
  })

  it('throws OptimizerInputError when the input is neither an object nor a string', () => {
    expect(() => new Optimizer(42)).toThrow(OptimizerInputError)
    try {
      new Optimizer(true)
    } catch (err) {
      expect(err).toBeInstanceOf(OptimizerError)
      expect(err).toBeInstanceOf(OptimizerInputError)
      expect((err as OptimizerInputError).code).toBe(OptimizerErrorCode.INPUT_INVALID)
      expect((err as OptimizerInputError).message).toMatch(/Unknown input/)
    }
  })

  it('throws OptimizerParseError with diagnostics when the document cannot be parsed', async () => {
    const optimizer = new Optimizer({ not: 'an AsyncAPI document' })
    await expect(optimizer.getReport()).rejects.toBeInstanceOf(OptimizerParseError)

    try {
      await optimizer.getReport()
    } catch (err) {
      expect(err).toBeInstanceOf(OptimizerParseError)
      expect((err as OptimizerParseError).code).toBe(OptimizerErrorCode.DOCUMENT_PARSE_FAILED)
      expect((err as OptimizerParseError).details).toBeDefined()
    }
  })

  it('throws OptimizerStateError when getOptimizedDocument() is called before getReport()', () => {
    const optimizer = new Optimizer(inputYAML)
    expect(() => optimizer.getOptimizedDocument()).toThrow(OptimizerStateError)
    try {
      optimizer.getOptimizedDocument()
    } catch (err) {
      expect(err).toBeInstanceOf(OptimizerStateError)
      expect((err as OptimizerStateError).code).toBe(OptimizerErrorCode.REPORT_NOT_GENERATED)
    }
  })

  it('throws OptimizerSerializationError when YAML serialization fails', async () => {
    const optimizer = new Optimizer(inputYAML)
    await optimizer.getReport()
    jest.spyOn(YAML, 'dump').mockImplementation(() => {
      throw new Error('dump failed')
    })

    expect(() =>
      optimizer.getOptimizedDocument({
        output: Output.YAML,
        rules: {
          reuseComponents: false,
          removeComponents: false,
          moveAllToComponents: false,
          moveDuplicatesToComponents: false,
        },
      })
    ).toThrow(OptimizerSerializationError)

    try {
      optimizer.getOptimizedDocument({ output: Output.YAML })
    } catch (err) {
      expect(err).toBeInstanceOf(OptimizerSerializationError)
      expect((err as OptimizerSerializationError).code).toBe(OptimizerErrorCode.SERIALIZATION_FAILED)
      expect((err as OptimizerSerializationError).cause).toBeInstanceOf(Error)
    }
  })
})

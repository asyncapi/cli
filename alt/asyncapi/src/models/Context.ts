import { ContextFileNotFoundError, ContextNotFoundError } from '../errors/context'
import { SpecFileNotFoundError } from '../errors/fs'
import { CONTEXTFILE_PATH } from '../constants'
import * as fs from 'fs'
import * as path from 'path'
import { SpecificationFile } from './SpecificationFile'

export interface IContext {
  current: string,
  store: {
    [name: string]: string
  }
}

export function loadContextFile(): IContext {
  if (!fs.existsSync(CONTEXTFILE_PATH)) {throw new ContextFileNotFoundError()}
  return JSON.parse(fs.readFileSync(CONTEXTFILE_PATH, 'utf-8')) as IContext
}

export function isContext(): boolean {
  if (!fs.existsSync(CONTEXTFILE_PATH)) {return true}
  return false
}

export function deleteContextFile(): void {
  if (fs.existsSync(CONTEXTFILE_PATH)) {fs.unlinkSync(CONTEXTFILE_PATH)}
}

export function save(context: IContext): void {
  fs.writeFileSync(CONTEXTFILE_PATH, JSON.stringify(context), { encoding: 'utf-8' })
}

export function autoDetectSpecFile(): string | undefined {
  const allowedSpecFileNames = ['asyncapi.yml', 'asyncapi.yaml', 'asyncapi.json']
  return allowedSpecFileNames.find(specName => fs.existsSync(path.resolve(process.cwd(), specName)))
}

export function addContext(context: IContext, key: string, specFile: SpecificationFile): IContext {
  if (specFile.isNotValid()) {throw new SpecFileNotFoundError(specFile.getSpecificationName())}
  context.store[String(key)] = specFile.getSpecificationName()
  return context
}

export function deleteContext(context: IContext, key: string): IContext {
  if (context.current === key) {context.current = ''} 
  delete context.store[String(key)]
  save(context)
  return context
}

export function updateCurrent(context: IContext, key: string): IContext {
  if (!context.store[String(key)]) {throw new ContextNotFoundError(key)} 
  context.current = key
  save(context)
  return context
}

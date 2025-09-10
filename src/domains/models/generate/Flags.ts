export interface IMapBaseUrlToFlag {
  url: string,
  folder: string
}

export interface ParsedFlags {
  params: Record<string, string>,
  disableHooks: Record<string, string>,
  mapBaseUrlToFolder: IMapBaseUrlToFlag
}

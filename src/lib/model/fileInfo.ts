import { ExtendsFormat } from './format'
import { ExtendsCardinal } from './cardinal'
export interface FileInfo {
	isMainSource: boolean
	isSingleFile: boolean
	filePath:string
	fullPath:string
	cardinal?:ExtendsCardinal
	extension?:string
	format?:ExtendsFormat
	targetPath?:string
	names:string[]
}

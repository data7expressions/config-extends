import path from 'path'
import { h3lp } from 'h3lp'
import { ExtendsFormat } from './model/format'
import { ExtendsCardinal } from './model/cardinal'
import { ExtendsOptions } from './model/options'
import { FileInfo } from './model/fileInfo'

const Yaml = require('js-yaml')

export class ConfigExtends {
	public async apply (source:string, target?:string, options:ExtendsOptions = {}):Promise<any> {
		let config:any = {}
		let _source:string
		let _result:string|undefined
		const filesInfo:FileInfo[] = []
		if (await h3lp.fs.isDirectory(source)) {
			_source = source
			_result = undefined
		} else {
			_source = path.dirname(source)
			_result = path.parse(source).name
		}
		await this.loadSourceConfig(config, filesInfo, _source, options)
		config = this.extends(config)
		config = this.getTargetConfig(config, filesInfo, options)
		if (_result !== undefined) {
			config = config[_result]
		}
		if (target) {
			await this.saveTarget(config, filesInfo, target, options)
		}
		return config
	}

	public extends (source:string, ...args:string[]) {
		const _config = Object.assign(source, args)
		for (const k in _config) {
			_config[k] = this.complete(_config, _config[k])
		}
		for (const k in _config) this.removeFlags(_config[k])
		return _config
	}

	private async loadSourceConfig (config:any, filesInfo:FileInfo[], source:string, options:ExtendsOptions):Promise<void> {
		let sources = [source]
		if (options.addSources) {
			sources = sources.concat(options.addSources)
		}
		for (const _source of sources) {
			const sourcePath = path.resolve(_source)
			if (!h3lp.fs.exists(sourcePath)) {
				throw new Error(`${sourcePath} not exists!`)
			}
			if (await h3lp.fs.isDirectory(sourcePath)) {
				const files = await this.files(sourcePath, '')
				for (let j = 0; j < files.length; j++) {
					const fileInfo:FileInfo = {
						isMainSource: _source === source,
						isSingleFile: false,
						filePath: files[j],
						fullPath: path.join(sourcePath, files[j]),
						names: []
					}
					await this.loadSourceConfigFromFile(config, fileInfo)
					filesInfo.push(fileInfo)
				}
			} else {
				const fileInfo:FileInfo = {
					isMainSource: _source === source,
					isSingleFile: true,
					filePath: path.basename(_source),
					fullPath: sourcePath,
					names: []
				}
				await this.loadSourceConfigFromFile(config, fileInfo)
				filesInfo.push(fileInfo)
			}
		}
	}

	private async loadSourceConfigFromFile (config:any, fileInfo:FileInfo) {
		this.completeFileInfo(fileInfo)
		const content = await h3lp.fs.read(fileInfo.fullPath)
		if (content === null) {
			return
		}
		let data = null
		if (fileInfo.format === ExtendsFormat.yaml) {
			const list = await Yaml.loadAll(content)
			if (list.length === 1) {
				data = list[0]
			} else {
				fileInfo.cardinal = ExtendsCardinal.multiple
				data = { list }
			}
		} else {
			data = JSON.parse(content)
		}
		if (fileInfo.isSingleFile) {
			config = Object.assign(config, data)
		} else {
			this.setData(config, fileInfo.names, data)
		}
	}

	private async saveTarget (config:any, filesInfo:FileInfo[], target:string, options:ExtendsOptions) {
		const targetPath = path.resolve(target)
		if (await h3lp.fs.isDirectory(targetPath)) {
			for (let i = 0; i < filesInfo.length; i++) {
				const fileInfo = filesInfo[i]
				const fileData = this.getData(config, fileInfo.names)
				if (fileData) {
					fileInfo.targetPath = path.join(targetPath, fileInfo.filePath)
					this.writeFile(fileInfo, fileData, options)
				}
			}
		} else {
			const fileInfo:FileInfo = {
				isMainSource: false,
				isSingleFile: true,
				filePath: path.basename(targetPath),
				fullPath: targetPath,
				targetPath,
				names: []
			}
			this.completeFileInfo(fileInfo)
			this.writeFile(fileInfo, config, options)
		}
	}

	private getTargetConfig (config:any, filesInfo:FileInfo[], options:ExtendsOptions):any {
		let result:any = {}
		if (options.outputs) {
			for (const output of options.outputs) {
				const names = output.split('.')
				const data = this.getData(config, names)
				this.setData(result, names, data)
			}
		} else {
			if (filesInfo.length === 1 && filesInfo[0].isSingleFile) {
				result = config
			} else {
				for (const fileInfo of filesInfo) {
					if (fileInfo.isMainSource) {
						const data = this.getData(config, fileInfo.names)
						this.setData(result, fileInfo.names, data)
					}
				}
			}
		}
		return result
	}

	private completeFileInfo (fileInfo:FileInfo) {
		if (!fileInfo.cardinal) {
			fileInfo.cardinal = ExtendsCardinal.single
		}
		fileInfo.extension = path.parse(fileInfo.fullPath).ext.toLocaleLowerCase()
		fileInfo.format = (fileInfo.extension === '.yaml' || fileInfo.extension === '.yml') ? ExtendsFormat.yaml : ExtendsFormat.json
		fileInfo.names = this.names(fileInfo.filePath)
	}

	private names (_path:string) {
		const parsePath = path.parse(_path)
		const a = parsePath.dir.split(path.sep)
		const b = parsePath.name.split('.')
		return a.length > 0 && a[0] !== '' ? a.concat(b) : b
	}

	private async writeFile (fileInfo:FileInfo, data:any, options:ExtendsOptions):Promise<void> {
		let content
		const outputFormat = options.format || fileInfo.format
		if (outputFormat === ExtendsFormat.yaml) {
			if (fileInfo.cardinal === ExtendsCardinal.multiple) {
				content = ''
				for (let i = 0; i < data.list.length; i++) {
					const item = data.list[i]
					if (Object.entries(item).length === 0) continue
					content = content + Yaml.dump(item, { noRefs: true })
					if (i !== (data.list.length - 1)) content = content + '---\n'
				}
			} else {
				content = Yaml.dump(data, { noRefs: true })
			}
		} else {
			content = JSON.stringify(data, null, 2)
		}
		if (fileInfo.targetPath === undefined) {
			throw Error('targetPath undefined')
		}
		if (await h3lp.fs.exists(path.dirname(fileInfo.targetPath))) {
			await h3lp.fs.create(path.dirname(fileInfo.targetPath))
		}
		await h3lp.fs.write(fileInfo.targetPath, content)
	}

	private async files (rootPath:string, relativePath:string):Promise<string[]> {
		let files:string[] = []
		const list = await h3lp.fs.readdir(path.join(rootPath, relativePath))
		for (const item of list) {
			const fullPath = path.join(rootPath, relativePath, item)
			if (!(await h3lp.fs.isDirectory(fullPath))) {
				const extension = path.parse(fullPath).ext.toLocaleLowerCase()
				if (extension === '.yaml' || extension === '.yml' || extension === '.json') {
					files.push(path.join(relativePath, item))
				}
			} else {
				const children = await this.files(rootPath, path.join(relativePath, item))
				files = files.concat(children)
			}
		}
		return files
	}

	private complete (config:any, obj:any, parentParams = {}):any {
		if (!obj) return obj
		const params = obj._params ? Object.assign(parentParams, obj._params) : Object.assign(parentParams, {})

		if (obj._extends) {
			const _extends = obj._extends
			if (Array.isArray(_extends)) {
				for (let i = 0; i < _extends.length; i++) {
					obj = this.extendObject2(config, obj, _extends[i], params)
				}
			} else if (typeof _extends === 'object') {
				for (const k in _extends) {
					let childParams
					if (typeof _extends[k] === 'object') {
						const newParams = _extends[k]
						for (const k2 in newParams) {
							if (typeof newParams[k2] === 'string') {
								newParams[k2] = this.solveParams(newParams[k2], params)
							}
						}
						childParams = Object.assign(params, newParams)
					} else {
						childParams = params
					}
					obj = this.extendObject2(config, obj, k, childParams)
				}
			} else {
				obj = this.extendObject2(config, obj, _extends, params)
			}
		}
		for (const k in obj) {
			if (typeof obj[k] === 'object') {
				obj[k] = this.complete(config, obj[k], params)
			}
			if (typeof obj[k] === 'string') {
				obj[k] = this.solveParams(obj[k], params)
			}
		}
		if (obj) obj._completed = true
		return obj
	}

	private solveParams (expression:any, params:string[]):any {
		let value = expression
		if (typeof value !== 'string' || !value.includes('${')) return value
		for (const k in params) {
			if (value.includes('${' + k + '}')) {
				value = h3lp.str.replace(value, '${' + k + '}', params[k])
			}
		}
		return isNaN(value) ? value : parseFloat(value)
	}

	private extendObject2 (config:any, obj:any, baseFullName:string, params:string[]) {
		// TODO: mejorar para que no llegue aca este error
		if (baseFullName === '_extends' || baseFullName === '_completed') return obj
		let base = this.getData(config, baseFullName.split('.'))
		if (base === undefined) {
			throw new Error(`${baseFullName} not found`)
		}
		if (base && !base._completed) {
			base = this.complete(config, base, params)
		}
		return this.extendObject(obj, base)
	}

	private extendObject (obj:any, base:any):any {
		if (Array.isArray(base)) {
			if (!Array.isArray(obj)) return base
			for (let i = 0; i < base.length; i++) {
				const baseItem = base[i]
				if (baseItem.name) {
					const objItem = obj.find(p => p.name === baseItem.name)
					if (!objItem) {
						obj.push(baseItem)
					} else {
						this.extendObject(objItem, baseItem)
					}
				}
			}
		}
		for (const k in base) {
			if (k === '_extends' || k === '_completed') continue
			if (obj[k] === undefined) {
				obj[k] = base[k]
			} else if (typeof obj[k] === 'object') {
				this.extendObject(obj[k], base[k])
			}
		}
		return obj
	}

	private setData (config:any, names:string[], data:any) {
		let _config = config
		for (let i = 0; i < names.length; i++) {
			if (!_config[names[i]]) _config[names[i]] = (names.length - 1) === i ? data : {}
			_config = _config[names[i]]
		}
	}

	private getData (config:any, names:string[]):any {
		let _config = config
		for (let i = 0; i < names.length; i++) {
			if (!_config) break
			_config = _config[names[i]]
		}
		return _config
	}

	private removeFlags (obj:any) {
		if (!obj) return
		if (obj._extends) delete obj._extends
		if (obj._params) delete obj._params
		if (obj._completed) delete obj._completed
		for (const k in obj) {
			if (typeof obj[k] === 'object') {
				this.removeFlags(obj[k])
			}
		}
	}
}

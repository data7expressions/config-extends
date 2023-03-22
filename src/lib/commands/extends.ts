import { configExtends } from '../index'
module.exports = async (args:any) => {
	const source = args.source || args.s
	if (!source) {
		console.error('source is required!')
		return
	}
	const config = await configExtends.extends(JSON.parse(source))
	console.log(config)
}

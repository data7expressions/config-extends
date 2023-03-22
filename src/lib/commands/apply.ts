import { configExtends } from '../index'
module.exports = async (args:any) => {
	const source = args.source || args.s
	const target = args.target || args.t
	if (!source) {
		console.error('source is required!')
		return
	}
	const config = await configExtends.apply(source, target)
	if (!target)console.log(config)
}

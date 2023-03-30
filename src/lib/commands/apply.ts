import { configExtends } from '../index'
module.exports = async (args:any) => {
	const source = args.source || args.s
	const target = args.target || args.t
	const from = args.from || args.f
	if (!source) {
		console.error('source is required!')
		return
	}
	const config = await configExtends.apply(source, target, { from })
	if (!target)console.log(config)
}

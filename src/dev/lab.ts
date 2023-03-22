import { configExtends } from '../lib/index'

export async function apply (callback: any) {
	try {
	// await configExtends.apply('src/dev/config/sql/source/SQL', 'src/dev/config/sql/target/sql.json')
	// await configExtends.apply('src/dev/config/sql/source/NoSQL', 'src/dev/config/sql/target/noSql.json')
		await configExtends.apply('src/dev/config/collections/source/collections/orm-svc.yaml', 'src/dev/config/collections/target/orm-svc.yaml')
		await configExtends.apply('src/dev/config/collections/source/collections/importer.yaml', 'src/dev/config/collections/target/importer.yaml')
	} catch (error:any) {
		console.error(error.stack)
	} finally {
		callback()
	}
}

apply(function () {
	console.log('end')
})

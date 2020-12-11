const ConfigExtends = require('../lib/config-extends')
module.exports = async (args) => {
  const source = args.source || args.s
  const target = args.target || args.t
  if(!source){
     console.error('source is required!')
     return
  }
  let config = await ConfigExtends.apply(source,target)
  if(!target)console.log(config)
}
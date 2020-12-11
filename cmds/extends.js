const ConfigExtends = require('../lib/config-extends')
module.exports = async (args) => {
  const source = args.source || args.s
  if(!source){
     console.error('source is required!')
     return
  }
  let config = await ConfigExtends.extends(JSON.parse(source))
  console.log(config)
}
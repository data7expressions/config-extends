const menus:any = {
	main: `
    config-extends [command] <options>
  
      version ............ show package version
      help ............... show help menu for a command
      extends ............ extend json 
      apply .............. extend file or path and return config extended`,

	apply: `
      config-extends apply <options>
  
      --source, -s ..... input path of folder or file
      --target, -t ..... output file (optional)
      --from,   -f ..... from property (optional)`,

	extends: `
      config-extends extends <options>
  
      --source, -s ..... input json (serialized)`,
	version: `
      config-extends version`
}

module.exports = (args:any) => {
	const subCmd = args._[0] === 'help'
		? args._[1]
		: args._[0]

	console.log(menus[subCmd] || menus.main)
}

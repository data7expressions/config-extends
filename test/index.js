const path = require('path');
const configExtended = require('../lib/config-extended');

(async () => { 
    try {      


        // let config = await configExtended.load(path.join(__dirname,'raspberry.yaml'));
        // console.log(JSON.stringify(config.version));
        
        // console.log(path.join(path.parse('a/b/c.yaml').dir,path.parse('a/b/c.yaml').name));
        // console.log(path.join(path.parse('c.yaml').dir,path.parse('c.yaml').name));


        // path.parse('a/b/c.yaml').name;
        // path.parse('a/b/c.yaml').dir;
        
        let config = await configExtended.load(path.join(__dirname,'tetris'));
        console.log(JSON.stringify(config));
        // let list = []
        // for(let k in config.version){
        //     list.push(config.version[k]);
        // }
        // console.log(JSON.stringify(list));
    }
    catch (error) {     
        console.error(error);  
    }    
})();
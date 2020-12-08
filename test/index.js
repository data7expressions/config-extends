const path = require('path');
const configExtended = require('../lib/config-extended');

(async () => { 
    try {        
        
        let config = await configExtended.loadPath(path.join(__dirname,'config'));

        let list = []
        for(let k in config.game){
            list.push(config.game[k]);
        }
        console.log(JSON.stringify(list));
    }
    catch (error) {     
        console.error(error);  
    }    
})();
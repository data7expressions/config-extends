const path = require('path');
const ConfigExtended = require('../lib/config-extended');

(async () => { 
    try {        
        let configExtended = new ConfigExtended();
        await configExtended.loadPath(path.join(__dirname,'config'));
        console.log(JSON.stringify(configExtended.config));
    }
    catch (error) {     
        console.error(error);  
    }    
})();
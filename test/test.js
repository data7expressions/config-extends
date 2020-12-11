const path = require('path');
const ConfigExtends = require('../lib/config-extends');
var assert = require('assert');

// var assert = require('assert');
// describe('Extends simple', function() {
//     describe('Extend {data:{_extends:"base",d:3,e:4},base: {a:1,b:2}}', function() {
//         let source ={data:{_extends:'base',d:3,e:4},base: {a:1,b:2}};
//         let result = JSON.stringify(ConfigExtends.extends(source));
//         let expected = JSON.stringify({data:{d:3,e:4,a:1,b:2},base:{a:1,b:2}});
//         it('should return {data:{d:3,e:4,a:1,b:2},base:{a:1,b:2}}', function() {
//         assert.strictEqual(result,expected);
//         });
//     });
// });

// let source ={
//     data : {_extends:'base',d:3,e:4},
//     base: {a:1,b:2}
// };
// let config = ConfigExtends.extends(source);
// console.log(JSON.stringify(config,null,2));


// let source ={
//     data: { 1: {_extends:'base',d:3,e:4},
//            2: {_extends:'data.1', f:3,g:4},
//            },
//     base: {a:1,b:2}
// }
// let config = ConfigExtends.extends(source);
// console.log(JSON.stringify(config,null,2));


// let source ={
//     data: { 1: {_extends:'base',d:3,e:4},
//             2: {_extends:['base','base2'], f:3,g:4},
//             },
//     base: {a:1,b:2},
//     base2: {h:'a',i:'b'}
// };
// let config = ConfigExtends.extends(source);
// console.log(JSON.stringify(config,null,2));

(async () => { 
    try {      


//         // let config = await ConfigExtends.load(path.join(__dirname,'raspberry.yaml'));
//         // console.log(JSON.stringify(config.version));

        //example from folder    
        let config = await ConfigExtends.apply(path.join(__dirname,'test-1'),'result');
        console.log(JSON.stringify(config,null,2));
    }
    catch (error) {     
        console.error(error);  
    }    
})();
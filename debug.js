const dircompare = require('dir-compare');
const ConfigExtends = require('./lib/config-extends');

(async () => { 
    try {      
        
        let source ='test/kubernetes/source';
        let target ='test/kubernetes/target';
        let toCompare ='test/kubernetes/to-compare';

        let config = await ConfigExtends.apply(source,target,{outputs:['app']});
        let compareResult = await dircompare.compare(target,toCompare,{compareContent:true});
        let result = compareResult.same? 'identical' : 'different';
        console.log(result);
        //console.log(JSON.stringify(config,null,2));
    }
    catch (error) {     
        console.error(error);  
    }    
})();

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
// console.log(JSON.stringify(config));


// let source ={
//     data: { 1: {_extends:'base',d:3,e:4},
//             2: {_extends:['base','base2'], f:3,g:4},
//             },
//     base: {a:1,b:2},
//     base2: {h:'a',i:'b'}
// };
// let config = ConfigExtends.extends(source);
// console.log(JSON.stringify(config));
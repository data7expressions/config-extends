const assert = require('assert');
const dircompare = require('dir-compare');
const ConfigExtends = require('../lib/config-extends');

describe('extends', function() {
    describe('Simple extension', function() {        
        let source ={
            data : {_extends:'base',d:3,e:4},
            base: {a:1,b:2}
        };        
        let expected = JSON.stringify({data:{d:3,e:4,a:1,b:2},
                                       base:{a:1,b:2}
                                     });
        let result = JSON.stringify(ConfigExtends.extends(source));                             
        it('should return '+expected, function() {
            assert.strictEqual(result,expected);
        });
    });
    describe('Chain extension', function() {
        let source ={
            data: { 1: {_extends:'base',d:3,e:4},
                   2: {_extends:'data.1', f:3,g:4},
                   },
            base: {a:1,b:2}
        }        
        let expected = JSON.stringify({data:{1:{d:3,e:4,a:1,b:2},
                                             2:{f:3,g:4,d:3,e:4,a:1,b:2}
                                            },
                                      base:{a:1,b:2}
                                      });
        let result = JSON.stringify(ConfigExtends.extends(source));                              
        it('should return '+expected, function() {
            assert.strictEqual(result,expected);
        });
    });
    describe('Multiple extension', function() {
        let source ={
            data: { 1: {_extends:'base',d:3,e:4},
                    2: {_extends:['base','base2'], f:3,g:4},
                    },
            base: {a:1,b:2},
            base2: {h:'a',i:'b'}
        };       
        let expected = JSON.stringify({data:{1:{d:3,e:4,a:1,b:2},
                                             2:{f:3,g:4,a:1,b:2,h:"a",i:"b"}
                                            },
                                      base:{a:1,b:2},
                                      base2:{h:"a",i:"b"}
                                    });
        let result = JSON.stringify(ConfigExtends.extends(source));                              
        it('should return '+expected, function() {
            assert.strictEqual(result,expected);
        });
    });
});
// describe('apply', function() {
//     describe('Extends single file', function() {
//         let fileSource ='test/raspberry/source/raspberry.yaml';
//         let filetTarget ='test/raspberry/target/raspberry.yaml';
//         let target ='test/raspberry/target';
//         let toCompare ='test/raspberry/to-compare';
//         let expected = 'identical';
//         it(expected, async ()=> {
//             let config = await ConfigExtends.apply(fileSource,filetTarget);
//             let compareResult = await dircompare.compare(target,toCompare,{compareContent:true});
//             let result = compareResult.same? 'identical' : 'different';
//             assert.strictEqual(result,expected);
//         });
//     });
//     describe('Extends simple folder', function() {
//         let source ='test/folder/source';
//         let target ='test/folder/target';
//         let toCompare ='test/folder/to-compare';
//         let expected = 'identical';
//         it(expected, async ()=> {
//             let config = await ConfigExtends.apply(source,target);
//             let compareResult = await dircompare.compare(target,toCompare,{compareContent:true});
//             let result = compareResult.same? 'identical' : 'different';
//             assert.strictEqual(result,expected);
//         });
//     });
//     describe('Extends tetris folder', function() {
//         let source ='test/tetris/source';
//         let target ='test/tetris/target';
//         let toCompare ='test/tetris/to-compare';
//         let expected = 'identical';
//         it(expected, async ()=> {
//             let config = await ConfigExtends.apply(source,target);
//             let compareResult = await dircompare.compare(target,toCompare,{compareContent:true});
//             let result = compareResult.same? 'identical' : 'different';
//             assert.strictEqual(result,expected);
//         });
//     });
//     describe('Extends pacman folder', function() {
//         let source ='test/pacman/source';
//         let target ='test/pacman/target';
//         let toCompare ='test/pacman/to-compare';
//         let expected = 'identical';
//         it(expected, async ()=> {
//             let config = await ConfigExtends.apply(source,target,{outputs:['versions']});
//             let compareResult = await dircompare.compare(target,toCompare,{compareContent:true});
//             let result = compareResult.same? 'identical' : 'different';
//             assert.strictEqual(result,expected);
//         });
//     });
//     describe('Extends kubernetes', function() {
//         let source ='test/kubernetes/source';
//         let target ='test/kubernetes/target';
//         let toCompare ='test/kubernetes/to-compare';
//         let expected = 'identical';
//         it(expected, async ()=> {
//             let config = await ConfigExtends.apply(source,target,{addSources:['test/kubernetes/base'] });
//             let compareResult = await dircompare.compare(target,toCompare,{compareContent:true});
//             let result = compareResult.same? 'identical' : 'different';
//             assert.strictEqual(result,expected);
//         });
//     });
// });



import { configExtends} from '../../index'

describe('extends', function() {
	test('Simple extension', function() {        
        let source:any ={
            data : {_extends:'base',d:3,e:4},
            base: {a:1,b:2}
        }        
        let expected = JSON.stringify({data:{d:3,e:4,a:1,b:2},
                                       base:{a:1,b:2}
                                     })
        let result = JSON.stringify(configExtends.extends(source))  
				expect(result).toStrictEqual(expected) 
    })
    test('Chain extension', function() {
        let source:any ={
            data: { 1: {_extends:'base',d:3,e:4},
                   2: {_extends:'data.1', f:3,g:4},
                   },
            base: {a:1,b:2}
        }        
        let expected = JSON.stringify({data:{1:{d:3,e:4,a:1,b:2},
                                             2:{f:3,g:4,d:3,e:4,a:1,b:2}
                                            },
                                      base:{a:1,b:2}
                                      })
        let result = JSON.stringify(configExtends.extends(source))                              
        expect(result).toStrictEqual(expected) 
    })
    test('Multiple extension', function() {
        let source:any ={
            data: { 1: {_extends:'base',d:3,e:4},
                    2: {_extends:['base','base2'], f:3,g:4},
                    },
            base: {a:1,b:2},
            base2: {h:'a',i:'b'}
        }       
        let expected = JSON.stringify({data:{1:{d:3,e:4,a:1,b:2},
                                             2:{f:3,g:4,a:1,b:2,h:"a",i:"b"}
                                            },
                                      base:{a:1,b:2},
                                      base2:{h:"a",i:"b"}
                                    })
        let result = JSON.stringify(configExtends.extends(source))                              
        expect(result).toStrictEqual(expected) 
    })
})
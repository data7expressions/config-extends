# Config Extends
Allow to extend json or yaml/json files configuration

## Features
- Multiple extension
- Can be loaded from yaml or json files
- Can load from a directory including all its files
- Available from browser and node.js

## Methods
### .extends(source,...args) [synchronously]
This api allows to extend one or more json objects 
- Paramas: 
  - source : object with extensions defined
  - args : others sources

### .load(path,format='yaml') [asynchronous]
This api allows to extend configuration from a file or several files from a path
- Paramas: 
  - path : object of file or folder
  - format : file format [yaml|json]
  
Note: Only node.js

## Installation
```
npm i config-extends
```

## Bundled YAML library for node.js
```
const ConfigExtends = require("config-extends")

let source ={
    data : {_extends:'base',d:3,e:4},
    base: {a:1,b:2}
};
let config = ConfigExtends.extends(source);
console.log(JSON.stringify(config,null,2));
```

## Bundled library for browsers
```
<script src="config-extends.min.js"></script>

let source ={
    data : {_extends:'base',d:3,e:4},
    base: {a:1,b:2}
};
let config = ConfigExtends.extends(source);
console.log(JSON.stringify(config,null,2));
```


## Examples

### Simple extension
```
let source ={
    data : {_extends:'base',d:3,e:4},
    base: {a:1,b:2}
};
let config = ConfigExtends.extends(source);
console.log(JSON.stringify(config,null,2));
```
Result:
```
{
  "data": {
    "d": 3,
    "e": 4,
    "a": 1,
    "b": 2
  },
  "base": {
    "a": 1,
    "b": 2
  }
}
```

### Chain extension
```
let source ={
    data: { 1: {_extends:'base',d:3,e:4},
           2: {_extends:'data.1', f:3,g:4},
           },
    base: {a:1,b:2}
}
let config = ConfigExtends.extends(source);
console.log(JSON.stringify(config,null,2));
```
Result:
```
     "d": 3,
      "e": 4,
      "a": 1,
      "b": 2
    },
    "2": {
      "f": 3,
      "g": 4,
      "d": 3,
      "e": 4,
      "a": 1,
      "b": 2
    }
  },
  "base": {
    "a": 1,
    "b": 2
  }
}
```

### Multiple extension
```
let source ={
    data: { 1: {_extends:'base',d:3,e:4},
            2: {_extends:['base','base2'], f:3,g:4},
            },
    base: {a:1,b:2},
    base2: {h:'a',i:'b'}
};
let config = ConfigExtends.extends(source);
console.log(JSON.stringify(config,null,2));
```
Result:
```
{
  "data": {
    "1": {
      "d": 3,
      "e": 4,
      "a": 1,
      "b": 2
    },
    "2": {
      "f": 3,
      "g": 4,
      "a": 1,
      "b": 2,
      "h": "a",
      "i": "b"
    }
  },
  "base": {
    "a": 1,
    "b": 2
  },
  "base2": {
    "h": "a",
    "i": "b"
  }
}
```

### extends from single file
```
let config = await configExtends.load(path.join(__dirname,'raspberry.yaml'));
console.log(JSON.stringify(config.version,null,2));
```
#### raspberry.yaml content
```
version:
  PiA:
    _extends: [family.Pi, model.A]
  PiB:
    _extends: [family.Pi, model.B]
  PiA+:
    _extends: [family.Pi, model.A]
    measure: 
      _extends: measure.compact
  PiB+:
    _extends: [family.Pi, model.B]
  Pi2B:
    measure: 
      _extends: measure.standard
  Pi3A:
    _extends: [family.Pi3, model.A]
  Pi3A+:
    _extends: [family.Pi3, model.A]
  Pi3B+:
    _extends: [family.Pi3, model.B]
  Pi4B1G:
    _extends: family.Pi4
    memory: 1G
  Pi4B2G:
    _extends: family.Pi4
    memory: 2G
  Pi4B4G:
    _extends: family.Pi4
    memory: 4G
  Pi4B8G:
    _extends: family.Pi4
    memory: 8G
family:
  Pi:
    wireless: false
    measure: 
      _extends: measure.standard
  Pi3:
    wireless: true
    measure: 
      _extends: measure.standard    
  Pi4:
    _extends: [model.B]
    wireless: true
    measure: 
      _extends: measure.standard
model:
  A:
    ethernet: false
  B:
    ethernet: true    
measure:
  standard:
    high: 85.6
    long: 56.5
  compact:
    high: 65
    long: 56.5  
```

#### Result:
```
{
    "PiA": {
        "wireless": false,
        "measure": {
            "high": 85.6,
            "long": 56.5
        },
        "ethernet": false
    },
    "PiB": {
        "wireless": false,
        "measure": {
            "high": 85.6,
            "long": 56.5
        },
        "ethernet": true
    },
    "PiA+": {
        "measure": {
            "high": 85.6,
            "long": 56.5
        },
        "wireless": false,
        "ethernet": false
    },
    "PiB+": {
        "wireless": false,
        "measure": {
            "high": 85.6,
            "long": 56.5
        },
        "ethernet": true
    },
    "Pi2B": {
        "measure": {
            "high": 85.6,
            "long": 56.5
        }
    },
    "Pi3A": {
        "wireless": true,
        "measure": {
            "high": 85.6,
            "long": 56.5
        },
        "ethernet": false
    },
    "Pi3A+": {
        "wireless": true,
        "measure": {
            "high": 85.6,
            "long": 56.5
        },
        "ethernet": false
    },
    "Pi3B+": {
        "wireless": true,
        "measure": {
            "high": 85.6,
            "long": 56.5
        },
        "ethernet": true
    },
    "Pi4B1G": {
        "memory": "1G",
        "wireless": true,
        "measure": {
            "high": 85.6,
            "long": 56.5
        },
        "ethernet": true
    },
    "Pi4B2G": {
        "memory": "2G",
        "wireless": true,
        "measure": {
            "high": 85.6,
            "long": 56.5
        },
        "ethernet": true
    },
    "Pi4B4G": {
        "memory": "4G",
        "wireless": true,
        "measure": {
            "high": 85.6,
            "long": 56.5
        },
        "ethernet": true
    },
    "Pi4B8G": {
        "memory": "8G",
        "wireless": true,
        "measure": {
            "high": 85.6,
            "long": 56.5
        },
        "ethernet": true
    }
}
```
### extends from path
```
let config = await ConfigExtends.load(path.join(__dirname,'test-1'));
console.log(JSON.stringify(config,null,2));
```
#### structure folder
- test-1
  - folder1
    - file1.yaml  content => c: 3
  - folder2 
    - file1.yaml  content => _extends: [file,folder1.file1]
                             d: 1
    - file2.yaml  content => _extends: [folder2.file1]
                             e: 1
  - file.yaml     content => a: 1
                             b: "b"

#### Result
```
{
  "file": {
    "a": 1,
    "b": "b"
  },
  "folder1": {
    "file1": {
      "c": 3
    }
  },
  "folder2": {
    "file1": {
      "d": 1,
      "a": 1,
      "b": "b",
      "c": 3
    },
    "file2": {
      "e": 1,
      "d": 1,
      "a": 1,
      "b": "b",
      "c": 3
    }
  }
}
```




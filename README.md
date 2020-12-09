# Config Extends
Allow to extend yaml or json files configuration

## Usage

Install with npm

```
npm i config-extends
```

```javascript
const ConfigExtends = require("config-extends")

...

let config = await configExtends.load(path.join(__dirname,'tetris'));
console.log(JSON.stringify(config));
```

### extends in single file
```
let config = await configExtends.load(path.join(__dirname,'raspberry.yaml'));
console.log(JSON.stringify(config.version));
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

#### result:
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




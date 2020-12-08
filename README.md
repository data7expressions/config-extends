# Config Extended
Allow to extend yaml or json files configuration

## Usage

Install with npm

```
npm i config-extended
```

```javascript
const ConfigExtended = require("config-extended")

...

let configExtended = new ConfigExtended();
await configExtended.loadPath(path.join(__dirname,'config'));
console.log(JSON.stringify(configExtended.config));
```
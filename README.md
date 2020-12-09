# Config Extended
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
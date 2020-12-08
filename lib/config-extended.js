const Path = require('path');
const Fs = require('fs');
const Glob = require('glob');
const Yaml = require('js-yaml');

module.exports = class ConfigExtend
{
  static async loadPath(path,format='yaml'){
    let config = {};
    await ConfigExtend.loadFiles(path,format,config);
    console.log(config);
    ConfigExtend.load(config);
    return config;
  }
  static async loadFiles(path,format='yaml',config={}){
    let list =Glob.sync("**/*."+format,{cwd:path});
    for(let i=0;i<list.length;i++)
      await ConfigExtend.loadFile(Path.join(path,list[i]),format,config);
  }
  static async loadFile(filePath,format='yaml',config={}){
    let content = Fs.readFileSync(filePath,'utf8');
    let data = format=='yaml' || format == 'yml'?Yaml.safeLoad(content):content;
    let names = data._name.split('.');
    let _config = config;      
    for(let i=0;i<names.length;i++){
        if(!_config[names[i]])_config[names[i]]= (names.length-1)==i?data:{};         
        _config=_config[names[i]];
    }
  }
  static load(config,...args){
    config =Object.assign(config,args);    
    for(let k in config)config[k] =ConfigExtend.completeObject(config,config[k]);
    for(let k in config)ConfigExtend.removeFlagCompleted(config[k]); 
    return config;
  }  
  static completeObject(config,obj){
    if(obj['_extend']){
      let baseFullname = obj['_extend'];
      let base = ConfigExtend.getContent(config,baseFullname);
      if(!base['_completed'])base=ConfigExtend.completeObject(config,base);
      obj=ConfigExtend.extend(obj, base);
    }
    for(let k in obj)
      if(typeof obj[k] == 'object')
        obj[k] = ConfigExtend.completeObject(config,obj[k]);
    obj['_completed']=true;
    return obj;
  }
  static extend(obj, base){
    if(Array.isArray(base))
      return base;    
    for(let k in base){
      if(k=='_name' || k=='_extend')continue;
      if(obj[k]=== undefined)
        obj[k] = base[k];
      else if (typeof obj[k] == 'object')
        ConfigExtend.extend(obj[k],base[k]); 
    }
    return obj;
  }
  static getContent(config,fullname){
    let names = fullname.split('.');
    let _config = config; 
    for(let i=0;i<names.length;i++){
      _config = _config[names[i]];
    }
    return _config;
  }
  static removeFlagCompleted(obj){
    if(obj['_completed'])delete obj['_completed'];
    for(let k in obj)
      if(typeof obj[k] == 'object')
        ConfigExtend.removeFlagCompleted(obj[k]);      
  } 

}
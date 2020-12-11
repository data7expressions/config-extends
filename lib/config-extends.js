const Path = require('path');
const Fs = require('fs');
const Yaml = require('js-yaml');

module.exports = class ConfigExtends
{
  static async apply(source,target){
    let config = {};
    if(Fs.lstatSync(source).isDirectory()){
      let list = await ConfigExtends._getFiles(source,'');
      for(let i=0;i<list.length;i++){
        let filePath = list[i];
        let fullPath = Path.join(source,filePath);
        let extension = Path.parse(fullPath).ext.toLocaleLowerCase(); 
        let content = Fs.readFileSync(fullPath,'utf8');
        let data = extension=='.yaml' || extension == '.yml'?Yaml.safeLoad(content):JSON.parse(content);
        let parseFilePath = Path.parse(filePath);
        let a = parseFilePath.dir.split(Path.sep);
        let b = parseFilePath.name.split('.');
        let names = a != ''?a.concat(b):b;
        ConfigExtends._setData(config,names,data);
      }
      config = ConfigExtends.extends(config);
    }else{
      let extension = Path.parse(source).ext.toLocaleLowerCase(); 
      let content = Fs.readFileSync(source,'utf8');
      config = extension=='.yaml' || extension == '.yml'?Yaml.safeLoad(content):JSON.parse(content);
      config = ConfigExtends.extends(config);
    }
    if(target){
      let extension = Path.parse(target).ext.toLocaleLowerCase();
      let content = extension=='.yaml' || extension == '.yml'?Yaml.safeDump(config):JSON.stringify(config,null,2); 
      Fs.writeFileSync(target,content,{encoding: "utf8"});
    }
    return config;    
  }
  static extends(source,...args){
    let _config =Object.assign(source,args);    
    for(let k in _config)_config[k] =ConfigExtends._completeObject(_config,_config[k]);
    for(let k in _config)ConfigExtends._removeFlags(_config[k]); 
    return _config;
  }
  static async _getFiles(rootPath,relativePath){
    let files = [] 
    let list = Fs.readdirSync(Path.join(rootPath,relativePath));
    for(let i=0;i<list.length;i++){
      let item = list[i];
      let fullPath = Path.join(rootPath,relativePath,item);
      if(!Fs.lstatSync(fullPath).isDirectory()){
        let extension = Path.parse(fullPath).ext.toLocaleLowerCase(); 
        if(extension == '.yaml' || extension == '.yml' || extension == '.json')
          files.push(Path.join(relativePath,item))
      }else
      {
        files =files.concat(await ConfigExtends._getFiles(rootPath,Path.join(relativePath,item)));
      }
    }
    return files;
  } 
  static _completeObject(config,obj){
    if(obj['_extends']){
       let _extends = obj['_extends'];
       if(Array.isArray(_extends)){
          for(let i=0;i<_extends.length;i++){
            let baseFullname = _extends[i];
            let base = ConfigExtends._getData(config,baseFullname);
            if(base===undefined)throw  baseFullname+" not found";
            if(!base['_completed'])base=ConfigExtends._completeObject(config,base);
            obj=ConfigExtends._extend(obj, base);
          }
       }
       else{
        let baseFullname = _extends;
        let base = ConfigExtends._getData(config,baseFullname);
        if(base===undefined)throw  baseFullname+" not found";
        if(!base['_completed'])base=ConfigExtends._completeObject(config,base);
        obj=ConfigExtends._extend(obj, base);
       }      
    }
    for(let k in obj)
      if(typeof obj[k] == 'object')
        obj[k] = ConfigExtends._completeObject(config,obj[k]);
    obj['_completed']=true;
    return obj;
  }
  static _extend(obj, base){
    if(Array.isArray(base))
      return base;    
    for(let k in base){
      if(k=='_extends')continue;
      if(obj[k]=== undefined)
        obj[k] = base[k];
      else if (typeof obj[k] == 'object')
        ConfigExtends._extend(obj[k],base[k]); 
    }
    return obj;
  }
  static _setData(config,names,data){
    let _config = config; 
    for(let i=0;i<names.length;i++){
        if(!_config[names[i]])_config[names[i]]= (names.length-1)==i?data:{};         
        _config=_config[names[i]];
    }
  }
  static _getData(config,fullname){
    let names = fullname.split('.');
    let _config = config; 
    for(let i=0;i<names.length;i++){
      _config = _config[names[i]];
    }
    return _config;
  }
  static _removeFlags(obj){
    if(obj['_completed'])delete obj['_completed'];
    if(obj['_extends'])delete obj['_extends'];
    for(let k in obj)
      if(typeof obj[k] == 'object')
        ConfigExtends._removeFlags(obj[k]);      
  }
}
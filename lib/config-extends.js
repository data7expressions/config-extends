const Path = require('path');
const Fs = require('fs');
const Yaml = require('js-yaml');

class _ConfigExtends
{
  async apply(source,target,options={}){
    let config = {},filesinfo=[];
    await this._loadSourceConfig(config,filesinfo,source,options);
    config = this.extends(config);    
    config = this._getTargetConfig(config,filesinfo,options);
    if(target)
      await  this._saveTarget(config,filesinfo,target,options);    
    return config;    
  }
  async _loadSourceConfig(config,filesinfo,source,options){
    let sources = [source];
    if(options.addSources)
       sources = sources.concat(options.addSources)

    for(let i=0;i<sources.length;i++){
      let sourcePath = Path.resolve(sources[i]); 
      if(!Fs.existsSync(sourcePath))throw sourcePath+" not exists!";      
      if(this._isDirectory(sourcePath)){
        let files = await this._getFiles(sourcePath,'');
        for(let j=0;j<files.length;j++){
          let fileInfo = {};
          fileInfo.isMainSource = sources[i] == source;
          fileInfo.isSingleFile = false;   
          fileInfo.filePath = files[j];
          fileInfo.fullPath = Path.join(sourcePath,fileInfo.filePath);
          await this._loadSourceConfigFromFile(config,fileInfo);
          filesinfo.push(fileInfo);
        }
      }else{
        let fileInfo = {};
        fileInfo.isMainSource = sources[i] == source;
        fileInfo.isSingleFile = true;  
        fileInfo.filePath = Path.basename(sources[i]);
        fileInfo.fullPath = sourcePath;
        await this._loadSourceConfigFromFile(config,fileInfo);
        filesinfo.push(fileInfo);
      }  
    }
  }
  async _loadSourceConfigFromFile(config,fileInfo){
    this._completeFileInfo(fileInfo);      
    let content = Fs.readFileSync(fileInfo.fullPath,'utf8');
    let data = null;
    if(fileInfo.format=='yaml'){
      let list = Yaml.safeLoadAll(content);
      if(list.length==1){
        data = list[0];
      }
      else{
        fileInfo.cardinal = 'multiple';
        data = {list:list};
      }
    }else{
      data = JSON.parse(content);
    }        
    if(fileInfo.isSingleFile)
      config = Object.assign(config, data)
    else
      this._setData(config,fileInfo.names,data);
  }
  async _saveTarget(config,filesinfo,target,options){
    let targetPath = Path.resolve(target); 
    if(this._isDirectory(targetPath)){
      for(let i=0;i<filesinfo.length;i++){
        let fileInfo = filesinfo[i];          
        let fileData = this._getData(config,fileInfo.names);
        if(fileData){
          fileInfo.targetPath = Path.join(targetPath,fileInfo.filePath);
          this._writeFile(fileInfo,fileData,options);
        }
      }
    }
    else{
      let fileInfo = {};
      fileInfo.filePath = Path.basename(targetPath);
      fileInfo.fullPath=targetPath;
      fileInfo.targetPath=targetPath;
      this._completeFileInfo(fileInfo);
      this._writeFile(fileInfo,config,options);
    }
  }
  _getTargetConfig(config,filesinfo,options){
    let result = {};
    if(options.outputs){      
      for(let i=0;i<options.outputs.length;i++){
          let outputNames = options.outputs[i].split('.');
          let data=this._getData(config,outputNames);
          this._setData(result,outputNames,data);
      }
    }
    else{
      if(filesinfo.length == 1 && filesinfo[0].isSingleFile){
        result = config;
      }else{
        for(let i=0;i<filesinfo.length;i++){
          let fileInfo = filesinfo[i];
          if(fileInfo.isMainSource){             
              let data=this._getData(config,fileInfo.names);
              this._setData(result,fileInfo.names,data);
          }            
        }
      }
    }
    return result;
  }
  _completeFileInfo(fileInfo){  
    if(fileInfo.cardinal)fileInfo.cardinal = 'single';     
    fileInfo.extension = Path.parse(fileInfo.fullPath).ext.toLocaleLowerCase(); 
    fileInfo.format= (fileInfo.extension=='.yaml' || fileInfo.extension == '.yml')?'yaml':'json';
    fileInfo.names = this._getNames(fileInfo.filePath);
  }
  _isDirectory(path){
    return (Fs.existsSync(path))?Fs.lstatSync(path).isDirectory():Path.parse(path).ext.toLocaleLowerCase() == '';
  }
  _getNames(path){
    let parsePath = Path.parse(path);
    let a = parsePath.dir.split(Path.sep);
    let b = parsePath.name.split('.');
    return a != ''?a.concat(b):b;
  }
  _writeFile(fileInfo,data,options){  
    let content;

    let outputFormat  = options.format ||  fileInfo.format;
    if(outputFormat == 'yaml'){
      if(fileInfo.cardinal == 'multiple'){
          content = '';
          for(let i=0;i<data.list.length;i++){
              let item =data.list[i];
              if(Object.entries(item).length==0)continue; 
              content = content+Yaml.safeDump(item,{ noRefs: true });
              if(i!= (data.list.length-1))content=content+'---\n';
          }
      }else{
        content = Yaml.safeDump(data,{ noRefs: true });
      }
    }else{
      content = JSON.stringify(data,null,2);
    }
    if(!Fs.existsSync(Path.dirname(fileInfo.targetPath)))
       Fs.mkdirSync(Path.dirname(fileInfo.targetPath), { recursive: true });          
    Fs.writeFileSync(fileInfo.targetPath,content,{encoding: "utf8"}); 
  }

  extends(source,...args){
    let _config =Object.assign(source,args);    
    for(let k in _config)_config[k] =this._completeObject(_config,_config[k]);
    for(let k in _config)this._removeFlags(_config[k]); 
    return _config;
  }
  async _getFiles(rootPath,relativePath){
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
        files =files.concat(await this._getFiles(rootPath,Path.join(relativePath,item)));
      }
    }
    return files;
  } 
  _completeObject(config,obj,parentParams={}){
    if(!obj)return obj;
    let params= obj['_params']?Object.assign(parentParams,obj['_params']):Object.assign(parentParams,{});    

    if(obj['_extends']){
      let _extends = obj['_extends'];
      if(Array.isArray(_extends)){
          for(let i=0;i<_extends.length;i++){
            obj=this._extend2(config,obj,_extends[i],params);
          }
       }
       else if(typeof _extends == 'object'){
          for(let k in _extends){
            let childParams;            
            if(typeof _extends[k]== 'object'){
              let newParams = _extends[k];
              for(let k2 in newParams)
                if(typeof newParams[k2] == 'string')
                  newParams[k2]= this._solveParams(newParams[k2],params);
              childParams = Object.assign(params,newParams);    
            }else{
              childParams = params;
            }                          
            obj=this._extend2(config,obj,k,childParams);
          }
       }
       else{
        obj=this._extend2(config,obj,_extends,params);
       }      
    }
    for(let k in obj){
      if(typeof obj[k] == 'object')
        obj[k] = this._completeObject(config,obj[k],params);
      if(typeof obj[k] == 'string')
        obj[k] = this._solveParams(obj[k],params);
    }
    if(obj)obj['_completed']=true;
    return obj;
  }
  _solveParams(expression,params){
    let value = expression;
    if(typeof value != 'string' || !value.includes('${'))return value;
    for(let k in params)
        if(value.includes('${'+k+'}'))
            value =this._replaceAll(value,'${'+k+'}', params[k]);    
    return isNaN(value)?value:parseFloat(value);
  }
  _replaceAll(string, search, replace) {
    return string.split(search).join(replace);
  }
  _extend2(config,obj,baseFullname,params){
    if(baseFullname=='_extends' || baseFullname=='_completed')return obj;//TODO: mejorar para que no llegue aca este error
    let base = this._getData(config,baseFullname.split('.'));
    if(base===undefined)
       throw  baseFullname+" not found";
    if(base && !base['_completed'])base=this._completeObject(config,base,params);
    return this._extend(obj, base);
  }
  _extend(obj, base){
    if(Array.isArray(base)){
      if(!Array.isArray(obj))return base;      
      for(let i =0;i<base.length;i++){
          let baseItem = base[i];
            if(baseItem.name){
            let objItem = obj.find(p=> p.name == baseItem.name );
            if(!objItem)
              obj.push(baseItem);
            else
              this._extend(objItem, baseItem);
          }
      }      
    }   
    for(let k in base){
      if(k=='_extends' || k=='_completed')continue;
      if(obj[k]=== undefined)
        obj[k] = base[k];
      else if (typeof obj[k] == 'object')
        this._extend(obj[k],base[k]); 
    }
    return obj;
  }
  _setData(config,names,data){
    let _config = config; 
    for(let i=0;i<names.length;i++){
        if(!_config[names[i]])_config[names[i]]= (names.length-1)==i?data:{};         
        _config=_config[names[i]];
    }
  }
  _getData(config,names){
    let _config = config; 
    for(let i=0;i<names.length;i++){
      if(!_config)break;
      _config = _config[names[i]];
    }
    return _config;
  }
  _removeFlags(obj){
    if(!obj)return;   
    if(obj['_extends'])delete obj['_extends'];
    if(obj['_params'])delete obj['_params'];
    if(obj['_completed'])delete obj['_completed'];
    for(let k in obj)
      if(typeof obj[k] == 'object')
        this._removeFlags(obj[k]);      
  }
}

var ConfigExtends = new _ConfigExtends();
module.exports = ConfigExtends;
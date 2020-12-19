const Path = require('path');
const Fs = require('fs');
const Yaml = require('js-yaml');

class _ConfigExtends
{
  async apply(source,target,options={}){
    let config = {},filesinfo=[];
    let sourcePath = Path.resolve(source); 
    if(!Fs.existsSync(sourcePath))throw sourcePath+" not exists!";
    if(this._isDirectory(sourcePath)){
      let files = await this._getFiles(sourcePath,'');
      for(let i=0;i<files.length;i++){
        let fileInfo = {};
        fileInfo.filePath = files[i];
        fileInfo.fullPath = Path.join(sourcePath,fileInfo.filePath);
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
        fileInfo.names = this._getNames(fileInfo.filePath);
        this._setData(config,fileInfo.names,data);
        filesinfo.push(fileInfo);
      }
      config = this.extends(config);
    }else{
      let extension = Path.parse(sourcePath).ext.toLocaleLowerCase(); 
      let content = Fs.readFileSync(sourcePath,'utf8');
      let source = extension=='.yaml' || extension == '.yml'?Yaml.safeLoad(content):JSON.parse(content);
      config = this.extends(source);
    }    
    if(options.outputs){
      let result = {};
      for(let i=0;i<options.outputs.length;i++){
          let outputNames = options.outputs[i].split('.');
          let data=this._getData(config,outputNames);
          this._setData(result,outputNames,data);
      }
      config =result;
    }
    if(target){
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
        fileInfo.fullPath=targetPath;
        fileInfo.targetPath=targetPath;
        this._completeFileInfo(fileInfo);
        this._writeFile(fileInfo,config,options);
      }
    }
    return config;    
  }
  _completeFileInfo(fileInfo){  
    if(fileInfo.cardinal)fileInfo.cardinal = 'single';     
    fileInfo.extension = Path.parse(fileInfo.fullPath).ext.toLocaleLowerCase(); 
    fileInfo.format= (fileInfo.extension=='.yaml' || fileInfo.extension == '.yml')?'yaml':'json';
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
    if(Array.isArray(base))
      return base;    
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
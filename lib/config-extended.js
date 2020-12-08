const Path = require('path');
const Fs = require('fs');
const Glob = require('glob');
const Yaml = require('js-yaml');

module.exports = class ConfigExtend
{
  constructor(){
      this._status = 'pending';
      this._config= {};
  }
  get config(){return this._config;}
  get status(){return this._status;}

  async loadPath(path,format='yaml'){
    this._status = 'loading';
    await this.loadFiles(path,format);
    this.load();
    this._status = 'loaded';
  }
  async loadFiles(path,format='yaml'){
    let list =Glob.sync("**/*."+format,{cwd:path});
    for(let i=0;i<list.length;i++)
      await this.loadFile(Path.join(path,list[i]),format);
  }
  async loadFile(filePath,format='yaml'){
    let content = Fs.readFileSync(filePath,'utf8');
    let data = format=='yaml' || format == 'yml'?Yaml.safeLoad(content):content;
    let names = data._name.split('.');
    let config = this._config;      
    for(let i=0;i<names.length;i++){
        if(!config[names[i]])config[names[i]]= (names.length-1)==i?data:{};         
        config=config[names[i]];
    }
  }
  load(...args){
    this._status = 'loading';
    this._config =Object.assign(this._config,args);    
    for(let k in this._config)this._config[k] =this.completeObject(this._config[k]);
    for(let k in this._config)this.removeFlagCompleted(this._config[k]);    
    this._status = 'loaded';
  }  
  completeObject(obj){
    if(obj['_extend']){
      let baseFullname = obj['_extend'];
      let base = this.getContent(baseFullname);
      if(!base['_completed'])base=this.completeObject(base);
      obj=this.extend(obj, base);
    }
    for(let k in obj)
      if(typeof obj[k] == 'object')
        obj[k] = this.completeObject(obj[k]);
    obj['_completed']=true;
    return obj;
  }
  extend(obj, base){
    if(Array.isArray(base))
      return base;    
    for(let k in base){
      if(k=='_name' || k=='_extend')continue;
      if(obj[k]=== undefined)
        obj[k] = base[k];
      else if (typeof obj[k] == 'object')
        this.extend(obj[k],base[k]); 
    }
    return obj;
  }
  getContent(fullname){
    let names = fullname.split('.');
    let config = this._config; 
    for(let i=0;i<names.length;i++){
      config = config[names[i]];
    }
    return config;
  }
  removeFlagCompleted(obj){
    if(obj['_completed'])delete obj['_completed'];
    for(let k in obj)
      if(typeof obj[k] == 'object')
        this.removeFlagCompleted(obj[k]);      
  } 

}
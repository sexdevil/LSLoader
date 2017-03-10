/*
根据webpack_entry.json文件寻找项目入口文件,
分析js源码内的import模块,根据依赖关系
* 生成对应的依赖表,同时修改webpack_lsloader_entry.json做为配置文件*/
var fs = require('fs');

var entryJSRoot = './dev/webpack2/js/pages/' //要遍历的入口文件路径

var moduleMap = {};//生成model层使用的路由表,不同入口页面有不同的依赖树

var chunksMap = {};//所有入口依赖的模块存储在这个map 对应生成commonChunksPlugin的配置

//遍历文件夹
function _walk(path) {
    var files = fs.readdirSync(path)
    files.forEach(function(item) {
        if(fs.statSync(path+item).isFile() && item.match(/\S*\.js$/g)){
            getDefine(fs.readFileSync(path+item,"utf-8"),item,path,path.replace('./dev/webpack2/js/pages/',''))
        }
        if(fs.statSync(path+item).isDirectory()){
            _walk(path+item+'/')
        }
    })
}

//获取依赖关系
function getDefine(file,filename,pathname,relativePathName){
    //第一步 去除注释 单行变多行
    file = file.replace(/\/\/[^\n]*\n/g,'') // 匹配双斜线单行注释
    file = file.replace(/\/\*(.|\n)*\*\//g,'') // 匹配*多行注释
    file = file.replace(/;/g,'\n') //单行变多行
    //第二步 提取依赖
    if(file==null){return;}
    var importList =  file.match(/(import.*from.*)/g)
    if(importList==null || importList.length===0){return;}
    moduleMap[relativePathName+filename]={};
    importList.forEach(function(item){
        var path = './client';
        item = item.match(/('|")([^']|[^"])+('|")/)[0]
        var itemName = item.match(/\/[^\/]+$/g)[0]
        itemName = itemName.replace(/'|"|\//g,'').replace(/\./g,'')
        moduleMap[relativePathName+filename][itemName]='';
        var root = pathname
        item.match(/\.\.\//g).forEach(function(){
            root = root.replace(/[^\/]+\/$/g,'')
        })
        moduleMap[relativePathName+filename][itemName]= 1;
        chunksMap[itemName] = root+item.replace(/\.\.\//g,'').replace(/'|"/g,'');
    })
    fs.writeFileSync('./gulptask/webpack2/build/moduleMap.json',JSON.stringify(moduleMap,null,2),"utf-8");
}

//写入口文件表
function writeWebpackEntry(){
    var WebpackEntry = fs.readFileSync('./webpack_entry.json',"utf-8");
    var data = JSON.parse(WebpackEntry);
    // console.log(data)
    for(var key in chunksMap){
        data[key] = [chunksMap[key]]
    }
    data = JSON.stringify(data,null,2);
    fs.writeFileSync('./webpack_lsloader_entry.json',data,"utf-8");
}

//写webapck配置
function writeWebpackConfig(){
    var entryNames = [];//webpack 入口文件
    var WebpackEntry = fs.readFileSync('./webpack_entry.json', 'utf8');
    WebpackEntryJson = JSON.parse(WebpackEntry);
    for(var key in WebpackEntryJson){
        if(typeof WebpackEntryJson[key] ==='string'){ //配置文件里 字符串类型的是入口文件
            entryNames.push(key);
        }
    }
    var data = [];
    for(var key in chunksMap){
        data.push({
            name:key,
            filename:key+'_[chunkhash].js',
            chunks:entryNames
        })
    }
    data = JSON.stringify(data,null,2);
    fs.writeFileSync('./gulptask/webpack2/build/commonChunksConfig.json',data,"utf-8");
}

exports.run = function(){
    if(!fs.existsSync('./gulptask/webpack2/build/')){
        fs.mkdirSync('./gulptask/webpack2/build/');
    }
    _walk(entryJSRoot)
    writeWebpackEntry();
    writeWebpackConfig();
    //console.log(moduleMap)
    //console.log(chunksMap)
}
module.exports=exports;
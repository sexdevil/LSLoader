//遍历模版文件

var staticPath='../'   //要附加的静态路径
//json地址
var jsonPath = './build/rev-manifest.json';
//AST语法分析AMD模块
var ASTbuild = require('./ASTbuild');
//dev 压缩后js路径
var devjs = ['./build/js/'];

var fs=require("fs");

//所有js添加combo头信息
function addJSHead(paths){
    paths.forEach(function (path) {
        _walk(path)
    })

    function _walk(path) {
        fs.readdir(path, function (err, files) {

            files.forEach(function(item) {
                if(fs.statSync(path+item).isFile()){
                    _fileReplace(path,item) ;
                }
                if(fs.statSync(path+item).isDirectory()){
                    _walk(path+item+'/')
                }
            })
        })
    }
    function _fileReplace(path,item) {
        fs.readdir(path, function (err, files) {

                    var content = fs.readFileSync(path + item, "utf-8")
                    content = '/*combojs*/'+content
                    fs.writeFileSync(path + item, content, "utf-8")

        })
    }
}


function compileFile(json,paths){
    paths.forEach(function (path) {
        walk(path)
    })

    function walk(path) {
        fs.readdir(path, function (err, files) {

            files.forEach(function(item) {
                if(fs.statSync(path+item).isFile()){
                    fileReplace(path,item)
                }
                if(fs.statSync(path+item).isDirectory()){
                    walk(path+item+'/')
                }
            })
        })
    }
    function fileReplace(path) {
        fs.readdir(path, function (err, files) {
            files.forEach(function (item) {
                if (/\.*\.html|\.*\.ftl/.test(item)) {
                    var content = fs.readFileSync(path + item, "utf-8")
                    content = replaceContent(content, json) //替换内部preload的资源地址

                    fs.writeFileSync(path + item, content, "utf-8")

                }
            })
        })
    }

}
var tagLoadCount = 0;
var inlinejsCount = 0;  //全局变量防止inlineId tagLoadId再不同模版间重复
function replaceContent(content,json){

    //<!--css ls build--><link href="1.css" onload="function(){}"/><!--css ls endbuild-->
    content= content.replace(/<!--css ls build-->[\s|\S]*?<!--css ls endbuild-->/g,function(cssOrginCodes){
        var insideHrefs = cssOrginCodes.match(/[^'|^"]*\.css/g)
        if(insideHrefs){ //match out href="test.css"
            for(var i in insideHrefs ){
                if(json[insideHrefs[i]]){
                    try{
                        var onload = cssOrginCodes.match(/onload="[\s|\S]*?"/)[0].match(/"[\s|\S]*?"/)[0];
                        onload = 'function(){'+onload.replace(/\"/g,'')+'}'
                    }catch (e){
                        var onload = null
                    }

                    if(onload){
                        cssOrginCodes+='<style id="'+insideHrefs[i]+'"></style><script>lsloader.load("'+insideHrefs[i]+'","'+json[insideHrefs[i]]+'",'+onload+' )</script>'
                    }else{
                        cssOrginCodes+='<style id="'+insideHrefs[i]+'"></style><script>lsloader.load("'+insideHrefs[i]+'","'+json[insideHrefs[i]]+'" )</script>'
                    }

                }
            }
        }
        return cssOrginCodes.replace(/<!--css ls build-->[\s|\S]*?<!--css ls endbuild-->/,'');
    })


    content= content.replace(/<!--js ls build-->[\s|\S]*?<!--js ls endbuild-->/g,function(cssOrginCodes){
        var insideHrefs = cssOrginCodes.match(/[^'|^"]*\.js/g)
        if(insideHrefs){ //match out href="test.css"
            for(var i in insideHrefs ){
                if(json[insideHrefs[i]]){
                    cssOrginCodes+='<script>lsloader.load("'+insideHrefs[i]+'","'+json[insideHrefs[i]]+'" )</script>'

                }
            }
        }
        return cssOrginCodes.replace(/<!--js ls build-->[\s|\S]*?<!--js ls endbuild-->/,'');
    })

    content= content.replace(/<!--js combo build-->[\s|\S]*?<!--js combo endbuild-->/g,function(cssOrginCodes){
        var insideHrefs = cssOrginCodes.match(/[^'|^"]*\.js/g)
        if(insideHrefs){ //match out href="test.css"
            cssOrginCodes = '';
            cssOrginCodes +='<script>lsloader.loadCombo(['
            for(var i in insideHrefs ){
                i = parseInt(i);
                if(json[insideHrefs[i]]){
                    cssOrginCodes+='{name:"'+insideHrefs[i]+'",path:"'+json[insideHrefs[i]].replace(staticPath,'')+'"}';

                    if(!!json[insideHrefs[i+1]]){
                        cssOrginCodes+=',';
                    }
                }
            }
            cssOrginCodes+='])</script>'
        }
        return cssOrginCodes;
    })


    content = content.replace(/<!--js tagload build-->[\s|\S]*?<!--js tagload endbuild-->/g,function(inlinejs){
        var inlinejsCodes = inlinejs.match(/[^'|^"]*\.js/g)
        if(inlinejsCodes){
            for(var i in inlinejsCodes) {
                tagLoadCount++;
                inlinejs += '<script>lsloader.tagLoad("' + inlinejsCodes[i] + '","ls-loader-tagload' + tagLoadCount + '")</script>'
            }
        }
        return inlinejs.replace(/<!--js tagload build-->[\s|\S]*?<!--js tagload endbuild-->/,'');
    })


    content = content.replace(/<!--js inline build-->[\s|\S]*?<!--js inline endbuild-->/g,function(inlinejs){
        var inlinejsCodes = inlinejs.match(/(<script[^>]*?>)([\s\S]*?)(<\/script>)/i)[2]
        if(inlinejsCodes){
            inlinejsCount++;
            inlinejs ='';
            inlinejs +='<textarea style="display:none" id="ls-loader-inlinecode'+inlinejsCount+'">'+inlinejsCodes+'</textarea>'
            inlinejs += '<script id="ls-loader-inlinerun'+inlinejsCount+'"></script>'
            inlinejs += '<script>lsloader.runInlineScript("ls-loader-inlinerun'+inlinejsCount+'","ls-loader-inlinecode'+inlinejsCount+'")</script>'
        }
        return inlinejs.replace(/<!--js inline build-->[\s|\S]*?<!--js inline endbuild-->/,'');
    })

    //替换lsloader.js入行内
    content= content.replace(/<!--lsloder build-->[\s|\S]*?<!--lsloder endbuild-->/,function(cssOrginCodes){
        var content = fs.readFileSync('./build/js/lib/lsloader.js',"utf-8")
        return cssOrginCodes.replace(/<!--lsloder build-->[\s|\S]*?<!--lsloder endbuild-->/,'<script>'+content+'</script>');
    })


    //替换AMD模块依赖分析后的脚本入行内
    content= content.replace(/(<script[^>]*?>)(<\/script>)/g,function(inlinejs){
        
        var insideHrefs = inlinejs.match(/src=('|")[^'|^"]*\.js('|")/g)
        if(insideHrefs!=null){
            console.log('发现AMD格式js:'+insideHrefs+',开始分析依赖')
            var jsSrc = insideHrefs[0].match(/[^'|^"]*\.js/g)[0]
            var fsPath = jsSrc.replace('../','./dev/');//AMD文件本地地址
            var AMDlist = ASTbuild.run(fsPath,'./dev/js/');
            var inlinejs = '';
            inlinejs+='<script>lsloader.loadCombo(['
            for(var i in AMDlist){
                    inlinejs+= '{name:"'+AMDlist[i]+'",path:"'+json[AMDlist[i]].replace(staticPath,'')+'"},' //combo服务不要线上路径 要文件目录路径
            }
            inlinejs+='{name:"'+insideHrefs[0]+'",path:"'+json[jsSrc].replace(staticPath,'')+'"}' //最后加上入口文件
            inlinejs+='])</script>'
        }
        return inlinejs
    })

    return content

}

var exports = {};

exports.run=function(args){
    var path = args.path;


    var data = fs.readFileSync(jsonPath,"utf-8")
    data = JSON.parse(data)
    for(var i in data){
        data[i] = staticPath + data[i];
    }
    compileFile(data,path); //编译模版
    addJSHead(devjs); //所有js添加头部信息
    console.log('templatebuild success')
}

module.exports = exports;
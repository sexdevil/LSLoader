"use strict";
//webpack拆分包后,文件加分割符
let fs = require('fs');

let jsRoot = './dist/' //要遍历的入口文件路径

//遍历文件夹
function _walk(path) {
    var files = fs.readdirSync(path)
    files.forEach(function(item) {
        if(fs.statSync(path+item).isFile() && item.match(/\S*\.js$/g)){
            writeFile(path+item)
        }
        if(fs.statSync(path+item).isDirectory()){
            _walk(path+item+'/')
        }
    })
}

function writeFile (path){
    var fileString = fs.readFileSync(path,"utf-8");
    if(!/\/\*combojs\*\//.test(fileString)){
        fileString = "/*combojs*/" + fileString;
        fs.writeFileSync(path,fileString,"utf-8");
        console.log('文件分割添加成功 from:'+path)
    }
}

_walk(jsRoot);
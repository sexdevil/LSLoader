var UglifyJS = require('uglify-js');
var fs=require("fs");
var staticPath='../js/'   //开发路径根目录


var exports = {};

var relyList =[];//依赖数组
//获取所有依赖的模块
function getDefine(file,basePath){
    var ast = UglifyJS.parse(file);
    ast.figure_out_scope();
    ast.walk(new UglifyJS.TreeWalker(function(node) {
        try{
            if(node.print_to_string()=='define'){
                var elments ;//define 依赖数组可能是第一个或者第二个参数
                if(!!node.scope.body[0].body.args[0].elements){
                    elments = node.scope.body[0].body.args[0].elements
                }else if(!!node.scope.body[0].body.args[1].elements){
                    elments = node.scope.body[0].body.args[1].elements
                }
                for(var i in elments){
                    relyList.unshift(elments[i].value) //顶部插入
                    var fileStream = fs.readFileSync(basePath + elments[i].value+'.js',"utf-8");
                    getDefine(fileStream,basePath)
                }
            }else if(node.print_to_string()=='require'){
                for(var i in node.scope.body[0].body.args[0].elements){
                    relyList.unshift(node.scope.body[0].body.args[0].elements[i].value) //顶部插入
                    var fileStream = fs.readFileSync(basePath + node.scope.body[0].body.args[0].elements[i].value+'.js',"utf-8");
                    getDefine(fileStream,basePath)
                }
            }
        }catch (e){}

    }));
}

function sliceSame(relyList){
    var tempHash = {};
    var resultArr =[];
    for (var key in relyList){
        tempHash[relyList[key]] = 0;
    }
    for(var i in tempHash){
        resultArr.push(i)
    }
    return resultArr
}
/*
 * filePath 要AST分析的文件本地路径
 * basePath 要取js的本地根路径
 * */
exports.run=function(filePath,basePath){
    relyList =[];//依赖数组
    getDefine(fs.readFileSync(filePath,"utf-8"),basePath)
    relyList = sliceSame(relyList) //依赖列表去除重复
    console.log('AST分析'+filePath+'依赖AMD模块为:'+relyList)
    for (var key in relyList){   //依赖列表项恢复为相对路径
        relyList[key] = staticPath+relyList[key]+'.js'
    }
    return relyList;
}

module.exports = exports;
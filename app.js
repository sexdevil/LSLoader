"use strict";
var express = require('express');
var app = express();

var fs= require("fs");

app.use(express.static('dist'));


app.get('/', function (req, res) {
    res.sendfile("dist/html/index.html");
});

//指定模板引擎
app.set("view engine", 'ejs');
//指定模板位置
app.set('views', __dirname + '/src/html');



let mainfest = fs.readFileSync(__dirname + '/dist/manifest.json',"utf-8");
mainfest = JSON.parse(mainfest); //md5 对应表

let moduleMap = fs.readFileSync(__dirname + '/task/build/moduleMap.json',"utf-8");
moduleMap = JSON.parse(moduleMap); //依赖关系 对应表


app.get("/webpack/**", function(req, res) {
    var pathName = req.path.replace(/\/webpack\//g,'');
    let relyModules = [];//依赖列表
    if(moduleMap[pathName+'.js']){
        for(var key in moduleMap[pathName+'.js']){
            relyModules.push({
                name:key,
                path:mainfest[key+'.js']
            })
        }
    }
    res.render(pathName+'.ejs', {
        common : {
            name : 'common.js',
            path : mainfest['common.js']
        },
        relyModules : relyModules,
        entrance: {
            name : pathName + '.js',
            path : mainfest[pathName + '.js']
        }
    });
});

app.get('/combo', function (req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    var combos = req.param('combo').split(';');
    combos=combos || req.param('combo');
    var result = '';
    for(var i in combos){
        result+=fs.readFileSync("dist/"+combos[i],"utf-8");
    }
    res.send(result)
});

var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Example app listening at http://%s:%s', host, port);
});
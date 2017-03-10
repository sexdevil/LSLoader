/**
 * lsloader 同步版本 所有资源阻塞加载,无需其他配置
 * codestartv1 ls版本号,改动这个版本号 所有ls作废.
 * lsloader.load(name,path)
 * name  根据路径生成的唯一localStorage key
 * path 线上的打包后文件路径
 */

(function(){


    window.lsloader = {
        jsFallbacks:[],   //js xhr请求失败队列,按顺序加载执行js
        jsnamemap:{},     //js name map 防fallback 重复请求资源
        cssnamemap:{}      //css name map 防fallback 重复请求资源
    };

    //读取资源到模板中
    lsloader.load = function(jsname,jspath){
        var code
        try{
            code = localStorage.getItem(jsname);
        }catch(e){
            this.requestResource(jsname,jspath);
            return;
        }
        if(!/\/\*codestartv1\*\//.test(code)){   //ls 版本 codestartv1 每次换这个版本 所有ls作废
            this.removeLS(jsname);
            this.requestResource(jsname,jspath);
            return
        }
        //取出对应文件名下的code
        if(code){
            var versionNumber = code.split('/*codestartv1*/')[0]; //取出路径版本号 如果要加载的和ls里的不同,清理,重写
            if(versionNumber!=jspath){
                this.removeLS(jsname);
                this.requestResource(jsname,jspath);
                return
            }
            code = code.split('/*codestartv1*/')[1];
            document.getElementById(jsname).appendChild(document.createTextNode(code))
        }else{
            //null xhr获取资源
            this.requestResource(jsname,jspath);
        }
    };
    //卸载storage中的资源
    lsloader.removeLS = function(key){
        localStorage.removeItem(key)
    };

    lsloader.requestResource = function(jsname,jspath){
        this.io(jspath,jsname,function(code){
            document.getElementById(jsname).appendChild(document.createTextNode(code));
            try{
                localStorage.setItem(jsname,jspath+'/*codestartv1*/'+code);
            }catch(e){
            }
        })
    };

    //ajax 请求资源
    lsloader.io = function(path,jsname,callback){
        var that = this;
        try{
            var xhr = new XMLHttpRequest();
            xhr.open("get",path,false);
            xhr.onreadystatechange = function(){
                if (xhr.readyState == 4){
                    if((xhr.status >=200 && xhr.status < 300 ) || xhr.status == 304){
                        if(xhr.response!=''){
                            callback(xhr.response);
                            return;
                        }
                    }
                }

                if(/\.js$/.test(path)) {
                    that.jsfallback(path,jsname);
                }else if(/\.css$/.test(path)){
                    that.cssfallback(path,jsname);
                }
            };
            xhr.send(null);

        }catch(e){

            if(/\.js$/.test(path)) {
                that.jsfallback(path,jsname);
            }else if(/\.css$/.test(path)){
                that.cssfallback(path,jsname);
            }

        }

    };


    //js回退加载 this.jsnamemap[name] 存在 证明已经在队列中 放弃
    //如果 path name 都为空 为来自上个任务js加载完成的回调 直接从加载队列中处理
    lsloader.jsfallback = function(path,name){
        if(path!=null && name!=null){
            if(!!this.jsnamemap[name]){
                return;
            }else{
                this.jsnamemap[name]=name;
            }
            if(path){
                this.jsFallbacks.push(path);
            }
        }
        var that = this;
        if(this.jsFallbacks.length==1 || (path==null && name==null)){ //只有一个等待加载的js 或者是上个js回调这里 直接异步加载 否则队列中等待
            var script = document.createElement('script');
            script.src = this.jsFallbacks[0];
            script.onload=function(){
                that.jsFallbacks.shift();
                if(that.jsFallbacks.length>0){
                    that.jsfallback(null,null); //如果还有js等待，加载他
                }
            };
            var root = document.getElementsByTagName('script')[0];
            root.parentNode.insertBefore(script, root);
        }
    };
    lsloader.cssfallback =function(path,name){
        if(!!this.cssnamemap[name]){
            return;
        }else{
            this.cssnamemap[name]=1;
        }
        var link= document.createElement('link');
        link.type='text/css';
        link.href=path;
        link.rel='stylesheet';
        var root = document.getElementsByTagName('script')[0];
        root.parentNode.insertBefore(link, root)
    }


})()/**
 * Created by yanghuanyu on 16/3/19.
 */
define('AmdModule',['common/test'],function(test){
    return function(){
        $(document.body).append('AMDRunning:the test number is '+test.testNumber);

        $(document.body).append('</br>this is new version');
    }
})
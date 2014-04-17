var Remote = require('../lib/phantomjs-remote.js').Remote;


var remote = new Remote({});
remote.start(function(){
    //console.log('Ok, we can start here ..');
    
    remote.create(function(page){
        
        page.open('http://tualo.de',function(status){
            //console.log('simple',status);
            page.evaluate(function(){
                return {
                    title: document.title,
                    bodyLength: document.body.innerHTML.length
                };
            },function(result){
                console.log('simple result',result);
            })

        })
    });
    
});
var page = require('webpage').create(),
    server = require('webserver').create(),
    system = require('system'),
    service,
    port = 18000,
    clients = [];


var registerClient = function(clientURL){
    clients.push({
        url: clientURL,
        page: require('webpage').create(),
        send: function(url){
            return function(data){
                sendResult(url,data);
            }
        }(clientURL)
    });
    return clients.length;
}

var sendResult = function(url,data){
    /*
    page.open(url, 'POST', data, function(){

    });  
    */
}

service = server.listen(port, function (request, response) {
    console.log('Request received at ' + new Date());
    response.statusCode = 200;
    response.headers = {
        'Cache': 'no-cache',
        'Content-Type': 'text/json;charset=utf-8'
    };
    var result = request;
    //console.log(JSON.stringify(request,null,4));
    if (
        (typeof request.post === 'object') &&
        (typeof request.post.msg === 'string')
    ){
        
        try{
            request.post.msg = JSON.parse(request.post.msg);
            if (typeof request.post.msg.cmd === 'string'){
                //console.log(request.post.msg.cmd);
                switch(request.post.msg.cmd){
                    case 'exit':
                        // todo: check permissions for that!
                        phantom.exit();
                        response.write(JSON.stringify(result, null, 4));
                        response.close();
                        break;
                    case 'register':
                        if (typeof request.post.msg.url === 'string'){
                            result.clientID = registerClient(request.post.url);
                            // test ping
                            //clients[result.clientID-1].send('hello=world');
                            response.write(JSON.stringify(result, null, 4));
                            response.close();
                        }
                        break;
                    case 'open':

                        //console.log('open',(typeof request.post.msg.clientID));
                        //console.log('open',(typeof request.post.msg.url));
                        if (
                            (typeof request.post.msg.clientID === 'number') && 
                            (typeof request.post.msg.url === 'string')
                        ){
                            if (
                                (typeof clients[request.post.msg.clientID-1] === 'object') && 
                                (clients[request.post.msg.clientID-1]!==null)
                            ){
                                var myclient = clients[request.post.msg.clientID-1];
                                myclient.page.open(request.post.msg.url,function(status){
                                    result.msg = {
                                        status: status
                                    };
                                    /*
                                myclient.send({
                                    msg: JSON.stringify({status: status})
                                });
                                */
                                response.write(JSON.stringify(result, null, 4));
                                response.close();
                            });
                        }

                    }
                    break;
                case 'evaluate':
                    //console.log('evaluate',(typeof request.post.msg.clientID));
                    //console.log('evaluate',(typeof request.post.msg.code));
                    if (
                        (typeof request.post.msg.clientID === 'number') && 
                        (typeof request.post.msg.code === 'string')
                    ){

                        if (
                            (typeof clients[request.post.msg.clientID - 1] === 'object') && 
                            (clients[request.post.msg.clientID - 1] !== null)
                        ){
                            //console.log(request.post.msg.code);
                            var myclient = clients[request.post.msg.clientID - 1];
                            var codeResult = myclient.page.evaluate(function(code){
                                var fn='('+code+')()';
                                return eval(fn);
                                
                            },request.post.msg.code);
                            //console.log(JSON.stringify(codeResult,null,4));
                            result.msg = {
                                result: codeResult
                            };
                            /*
                            
                            myclient.send({
                                msg: JSON.stringify({result: codeResult})
                            });
                            */
                            response.write(JSON.stringify(result, null, 4));
                            response.close();
                        }
                    }
                    break;
                default:
                    response.write(JSON.stringify(result, null, 4));
                    response.close();
                    break;
            }
        }
        }catch(e){
            response.write(JSON.stringify(result, null, 4));
            response.close();
        }
    }

});

console.log('phantom is up!')
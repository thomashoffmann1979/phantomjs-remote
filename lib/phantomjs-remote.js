var path = require('path'),
    fs = require('fs'),
    http = require('http'),
    Page = require('./page').Page;


var Remote = function(config){
    this.config = config;
    this.port = 18000;
    
}

Remote.prototype.start = function(cb){

    var me = this;
    
    me.child = require('child_process').spawn('phantomjs',[path.join(__dirname,'phantom','server.js')]);
    me.child.stdout.on('data', function (data) {
        //console.log(data.toString() == 'phantom is up!');
        //console.log(data.toString().length , ('phantom is up!').length);
        if (data.toString().substring(0,14) == 'phantom is up!'){ // now we are ready!
            if (typeof cb === 'function'){
                cb();
            }
        }else{
            //console.log('phantomserver said: ',  data.toString());
        }
    });

    
    me.child.on('close', function (code) {
        console.log('phantomserver child process exited with code ' + code);
    });
    
    
    process.on('SIGINT', me.tryKilling.bind(me));
    process.on('SIGHUP', me.tryKilling.bind(me));
    process.on('SIGTERM', me.tryKilling.bind(me));
    
    process.on('exit', me.tryKilling.bind(me));
    
    //console.log('child phantom started');
    
}

Remote.prototype.tryKilling = function(){
    try{
        console.log('killing phantomserver');
        this.child.kill('SIGHUP');
    }catch(e){
        
    }
}
Remote.prototype.send = function(msg,cb){
    var data = 'msg='+escape(JSON.stringify(msg)),
        options = {
            hostname: '127.0.0.1',
            port: this.port,
            path: '/',
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': data.length
            }
        };


    var req = http.request(options, function(res) {
        res.setEncoding('utf8');
        var data = '';
        res.on('data', function (chunk) {
            data += chunk;

        });
        res.on('end', function () {
            if (typeof cb === 'function'){
                cb(JSON.parse(data));
            }
        });
    });
    req.end(data);
}

Remote.prototype.create = function(cb){
    var me = this;
    me.send({
        cmd:'register',
        url: 'http://127.0.0.1'
    },function(data){
        //console.log(data);
        //var c = JSON.parse(data);
        if (typeof cb === 'function'){
            cb(new Page(me,data.clientID));
        }


    });
}

exports.Remote = Remote;
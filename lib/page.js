
var Page = function(remote,clientID){
    //console.log('remote',remote)
    this.remote = remote;
    this.clientID = clientID;
}

Page.prototype.open = function(url,cb){
    this.remote.send({
        cmd:'open',
        url: url,
        clientID: this.clientID
    },function(data){
        if (typeof cb === 'function'){
            cb(data.msg.status);
        }
    })
}



Page.prototype.evaluate = function(fn,cb){
    
    this.remote.send({
        cmd:'evaluate',
        code: fn.toString(),
        clientID: this.clientID
    },function(data){
        //console.log(data);
        if (typeof cb === 'function'){
            cb(data.msg.result);
        }
    })
}
   
    
exports.Page = Page;

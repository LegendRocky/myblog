//测试multiparty上传文件
var multiparty = require('multiparty');
var http = require('http');
var util = require('util');
 
http.createServer(function(req, res) {
  if (req.url === '/upload' && req.method === 'POST') {
    // parse a file upload 
    var form = new multiparty.Form({uploadDir:'./public/images'});
    form.parse(req, function(err, fields, files) {
      console.log(files);
      res.writeHead(200, {'content-type': 'text/plain'});
      res.write('received upload:\n\n');
      res.end(util.inspect({fields: fields, files: files}));
    });
 
    return;
  }
 
  // show a file upload form 
  res.writeHead(200, {'content-type': 'text/html'});
  res.end(
    '<form action="/upload" enctype="multipart/form-data" method="post">'+
    '<input type="text" name="title"><br>'+
    '<input type="file" name="upload" multiple="multiple"><br>'+
    '<input type="submit" value="Upload">'+
    '</form>'
  );
}).listen(8080);
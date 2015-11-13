var https = require('https');
var ns = require('node-static');
var fs = require('fs');
file = new ns.Server('./site');
var options = {
  key: fs.readFileSync('./ssl/privatekey.pem'),
  cert: fs.readFileSync('./ssl/certificate.pem')
};
http_function = function (request, response) {
	file.serve(request, response, function (err, res) {
	    if (err) {
	        response.writeHead(err.status, err.headers);
	        response.end();
	    }
	});
}
https.createServer(options, http_function).listen(8080);

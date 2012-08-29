
/**
 * Module dependencies.
 */
var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  , md = require("github-flavored-markdown").parse
  , fs = require("fs");

var app = express();

app.engine('md', function(path, options, fn) {
    var tpl = '';
    var views = __dirname + '/views';
    fs.readFile(views + '/index.ejs', 'utf8', function(err, data) {
        if (err) return fn(err);
        tpl = data;
    });
    
    fs.readFile(path, 'utf8', function(err, data) {
        if (err) return fn(err);
        try {
            var html = md(data);
            html = html.replace(/\{([^}]+)\}/g, function(_, name) {
                return options[name] || '';
            });
            var out = tpl.replace(/<%= md %>/g, html);
            fn(null, out);
        } catch(err) {
            fn(err);
        }
    });
});

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'md');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('your secret here'));
  app.use(express.session());
  app.use(app.router);
  app.use(require('stylus').middleware(__dirname + '/public'));
  app.use(express.static(path.join(__dirname, 'public')));

});

app.configure('development', function(){
  app.use(express.errorHandler());
});
/*

*/
app.get('/', function(req, res) {
    res.render('index', {title : 'Markdown Example'});
});

app.get('/fail', function(req, res) {
    res.render('missing', {title: 'markdown Example'});
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

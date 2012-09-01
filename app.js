/**
 * Module dependencies.
 */
var express = require('express')
  //, routes = require('./routes')
  , http = require('http')
  , path = require('path')
  , md = require("github-flavored-markdown").parse
  , fs = require("fs")
  , moment = require("moment");

var app = express();

app.engine('md', function(path, options, fn) {
    var tpl = '';
    var views = __dirname + '/views';
    fs.readFile(views + '/index.ejs', 'utf8', function(err, data) {
        if (err) return fn(err);
        tpl = data;

        fs.readFile(path, 'utf8', function(err, data) {
            if (err) return fn(err);
            try {
                var ctime = '';
                fs.stat(path, function(err, stats) {
                    if (err) return fn(err);
                    ctime = stats.ctime;
                    moment().local();
                    var m = moment(ctime);
                    var html = md(data);
                    var time = "<time pubdate='pubdate' datetime='" + m.format() + "'>" + m.format('YYYY/M/D hh:mm:ss Z') + "</time>";
                    var title = html.match(/<h1>([^<]*)<\/h1>/i);
                    html = html.replace(/\{([^}]+)\}/g, function(_, name) {
                        return options[name] || '';
                    });
                    tpl = tpl.replace(/<%= time %>/g, time);
                    tpl = tpl.replace(/<%= title %>/g, title[1]);
                    var out = tpl.replace(/<%= md %>/g, html);
                    fn(null, out);
                });
            } catch(err) {
                fn(err);
            }
        });
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

app.get('/', function(req, res) {
    res.render('index');
});

app.get(/^\/([\w]+)$/g, function(req, res) {
    res.render(req.params[0]);
});

app.get('/fail', function(req, res) {
    res.render('missing');
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

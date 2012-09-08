/**
 * Module dependencies.
 */
var express = require('express')
  , routes = require('./routes/main')
  , http = require('http')
  , path = require('path')
  , md = require("github-flavored-markdown").parse
  , fs = require("fs")
  , moment = require("moment");

var app = module.exports = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('entries', __dirname + '/entries');
  app.set('main_title', 'org-node');
  app.set('timezone', 'Asia/Tokyo');
  app.engine('.md', require('ejs').__express);
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
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

app.get('/', function(req, res, next) {
  res.render('index.ejs', {main_title: app.get('main_title'),
                           title: 'main',
                           script: 'index.js'});
});

app.get('/entries', routes.entries); 

app.get('/entry/:content', routes.entry);

app.get('/fail', function(req, res) {
    res.render('missing');
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});


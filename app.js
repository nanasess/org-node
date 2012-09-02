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

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('entries', __dirname + '/entries');
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
  app.use(express.errorHandler());
});

app.get('/', function(req, res, next) {
      res.render('index.ejs', {title: 'Markdown', script: 'index.js'});
});

app.get('/entries', function(req, res, next) {
    moment().local();
    fs.readdir(app.get('entries'), function(err, files) {
        if (err) {
            next(err);
            res.send('readdir error', 500);
            return;
        }
        if (!files) {
            res.send('Can\'t read entries', 404);
            return;
        }
        if (files.length < 1) {
            res.send('Can\'t read entries', 404);
            return;
        }
        var entries = new Array(files.length);
        for (var i = 0; i < files.length; i++) {
            var stats = fs.statSync(app.get('entries') + '/' + files[i]);
            var m = moment(stats.ctime);
            entries[i] = new Entry(files[i], m.unix());
        }
        entries.sort(function(a, b) {
            return b.ctime - a.ctime;
        });
        res.type('json');
        res.json(entries);
    });
});

app.get('/entry/:content', function(req, res) {
    var path = app.get('entries') + '/' + req.params.content;
    if (!path.match(/.md$/)) {
        path += '.md';
    }
    fs.readFile(path, 'utf8', function(err, data) {
        if (err) {
            res.send('Can\'t read entries', 404);
            return;
        }
        fs.stat(path, function(err, stats) {
            if (err) throw err;
            var entry = new Entry(req.params.content, stats.ctime, data);
            if (req.xhr) {
                res.type('json');
                var result = {};
                result.name = entry.name;
                result.html = entry.html();
                result.datetime = entry.datetime();
                result.pubdate = entry.pubdate();
                res.json(result);
            } else {
                res.render('entry.ejs', {title: entry.title(), content: entry.html(), datetime: entry.datetime(), pubdate: entry.pubdate(), script: 'entry.js'});
            }
        });
    });
});

app.get('/fail', function(req, res) {
    res.render('missing');
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

function Entry(name, ctime, source) {
    var parsed = false;
    var content = null;
    moment().local();
    this.m = moment(ctime);
    this.name = name;
    this.ctime = ctime;
    this.source = source;
    this.title = function() {
        if (source) {
            if (!parsed) {
                content = this.html();
                var title = content.match(/<h1>([^<]*)<\/h1>/i);
                return title[1];
            }
        }
        return null;
    };
    this.unix = function() {
        return m.unix();
    };
    this.html = function() {
        if (source && !parsed) {
            content = md(this.source);
            parsed = true;
        }
        return content;
    };
    this.pubdate = function() {
        return this.m.format('YYYY/M/D hh:mm:ss ZZ');
    };
    this.datetime = function() {
        return this.m.format();
    };
}

var path = require('path')
  , md = require("github-flavored-markdown").parse
  , fs = require("fs")
  , moment = require("moment")
  , time = require("time");


/**
 * get entries.
 */
exports.entries = function(req, res, next) {
    moment().local();
    fs.readdir(module.parent.exports.get('entries'), function(err, files) {
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
            var stats = fs.statSync(module.parent.exports.get('entries') + '/' + files[i]);
            var m = moment(stats.ctime);
            entries[i] = new Entry(files[i], m.unix());
        }
        entries.sort(function(a, b) {
            return b.ctime - a.ctime;
        });
        res.type('json');
        res.json(entries);
    });
};

/**
 * get entry by filename.
 */

exports.entry = function(req, res) {
        var path = module.parent.exports.get('entries') + '/' + req.params.content;
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
                var result = {
                    name: entry.name,
                    html: entry.html(),
                    datetime: entry.datetime(),
                    pubdate: entry.pubdate()
                };
                res.json(result);
            } else {
                res.render('entry.ejs', {
                               main_title: module.parent.exports.get('main_title'),
                               title: entry.title(),
                               content: entry.html(),
                               datetime: entry.datetime(),
                               pubdate: entry.pubdate(),
                               script: 'entry.js'});
            }
        });
    });
};

function Entry(name, ctime, source) {
    var parsed = false,
    content = null,
    d = new time.Date(ctime, module.parent.exports.get('timezone'));

    this.m = moment(d);
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

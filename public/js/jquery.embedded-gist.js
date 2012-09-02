// non-blocking GitHub Gist embed code jQuery plugin
// usage:
// 1. <div data-gist-id=your_gist_id><a href="http://gist.github.com/your_gist_id">your_gist_filename on GitHub Gist</a></div> in html
// 2. $('<div/>').embedGist(your_gist_id).appendTo('article'); in javascript
// see also. http://pastebin.com/XHYnjy2C
;(function ($) {
    $.fn.embedGist = (function () {
        var gistWriteFunc = {},
            gistWrited = {},
            addGist = function (gistId, $el) {
                if (!gistWriteFunc[gistId]) {
                    gistWriteFunc[gistId] = function (str) {
                        $el.empty();
                        $(str).appendTo($el);
                        gistWrited[gistId] = true;
                    };
                    $('head').append('<script src="https://gist.github.com/' +
                                     gistId + '.js"></script>');
                }
            };

        document.origWrite = document.write;
        document.write = function (str) {
            var match, gistId;
            if (str.indexOf('<link rel="stylesheet" href="https://gist.github.com/stylesheets/gist/embed.css"/>') === 0) {
                if (!$('#gist-embed-css').length) {
                $(str).attr('id', 'gist-embed-css').appendTo('head');
                }
            } else if ((match = str.match(/div id="gist-(\d+)"/)) != null) {
                gistId = match[1];
                if (!gistWrited[gistId] && gistWriteFunc[gistId]) gistWriteFunc[gistId](str);
            } else {
                document.origWrite.apply(document, arguments);
            }
        };

        return function (gistId) {
            if (typeof gistId != 'undefined') {
                addGist(gistId, $(this));
            } else {
                $(this).each(function (i, el) {
                    var $el = $(el),
                        gistId = $el.data('gist-id');
                    if (!gistId) return;
                    addGist(gistId, $el);
                });
            }
            return this;
        };
    }());
}(jQuery));
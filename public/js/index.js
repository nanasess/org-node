$(function() {
      var footer = $('footer').hide();
      $('head').append('<link rel="stylesheet" type="text/css" media="screen" href="http://gist.github.com/stylesheets/gist/embed.css" />');
      $.ajax({
                 type: 'GET',
                 dataType: 'json',
                 url: '/entries',
                 cache: false,
                 success: function(data, textStatus, jqXHR) {
                     for (var i = 0; i < data.length; i++) {
                         var entry = data[i].name;
                         $.ajax(
                             {
                                 type: 'GET',
                                 dataType: 'json',
                                 url: '/entry/' + entry,
                                 cache: false,
                                 success: function(data, textStatus, jqXHR) {
                                     var $article = $('<article id=' + data.name + '/>')
                                         .append(data.html)
                                         .hide();
                                     var $time = $('<time />')
                                         .attr({pubdate: 'pubdate',
                                                datetime: data.datetime})
                                         .text(data.pubdate);
                                     $article.append($time);
                                     $article.appendTo('#content')
                                         .fadeIn('slow');
                                     $('div[data-gist-id]').embedGist();
                                 }
                             }
                         );
                     }
                 },
                 complete: function(textStatus, jqXHR) {
                     footer.fadeIn();  
                 }
             }
      );
});

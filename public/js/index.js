$(function() {
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
                                     var $article = $('<article />').append(data.html);
                                     var $time = $('<time />')
                                         .attr({pubdate: 'pubdate',
                                                datetime: data.datetime})
                                         .text(data.pubdate);
                                     $article.append($time);
                                     $('#content').append($article);
                                 }
                             }
                         );
                     }
                 }
             }
      );
});
$(function() {
      var footer = $('footer').hide(),
      loadEntries = function(entries) {
          if (entries.length < 1) {
              return true;
          }
          var entry = entries.shift();
          $.ajax(
              {
                  type: 'GET',
                  dataType: 'json',
                  url: '/entry/' + entry.name,
                  cache: false,
                  success: function(data, textStatus, jqXHR) {
                      var $article = $('<article id=' + data.name + '/>')
                          .append(data.html)
                          .hide();
                      var $h1 = $article.find('h1');
                      $h1.html('<a href="/entry/' + data.name + '">' + $h1.text() + '</a>');
                      var $time = $('<time />')
                          .attr({pubdate: 'pubdate',
                                 datetime: data.datetime})
                          .text(data.pubdate);
                      $article.append($time);
                      $article.appendTo('#content').fadeIn('slow');
                      $('div[data-gist-id]').embedGist();
                  },
                  complete: function(textStatus, jqXHR) {
                      // Recursive loading of the entries.
                      loadEntries(entries);
                  }
              });
          return false;
      };

      $.ajax({
                 type: 'GET',
                 dataType: 'json',
                 url: '/entries',
                 cache: false,
                 success: function(entries, textStatus, jqXHR) {
                     loadEntries(entries);
                 },
                 complete: function(textStatus, jqXHR) {
                     footer.fadeIn('slow');  
                 }
             }
      );
});

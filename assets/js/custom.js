$(function() {
    
    $('table td[title]').each(function() {
        var self = this;
        var title = this.title;
        
        $(this).wrapInner('<span class="tooltiped"></span>').children().
            on('click', function() {
                var active = $(this).siblings('.tooltip').length;
                
                if (active) {
                    $('table td span.tooltiped').tooltip('destroy');
                } else {
                    $('table td span.tooltiped').not(this).tooltip('destroy');
                    
                    $(this).tooltip({
                        title: title,
                        trigger: 'manual'
                    });
                    
                    $(this).tooltip('show');
                }
            });
        
        this.title = null;
    });
    
});
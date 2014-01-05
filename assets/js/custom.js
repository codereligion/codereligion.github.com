$(function() {
    
    $('table td[title]').each(function() {
        var self = this;
        $(this).wrapInner('<span class="tooltiped"></span>').children().tooltip({
            title: this.title,
            trigger: 'click'
        }).on('show.bs.tooltip', function() {
                $('table td').not(self).find('span.tooltiped').tooltip('hide');
        });
        
        this.title = null;
    });
    
});
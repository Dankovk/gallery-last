$(window).on('load', function () {
    var $preloader = $('.page-preloader'),
        $spinner   = $preloader.find('.preloader-itself');
    $spinner.fadeOut();
    $preloader.delay(350).fadeOut('slow');
});



$(document).on('slide.bs.carousel','.carousel-top', function(event) {
    var $this   = $(this),
        itemLength = $this.find('.item').length,
        $slides = $this.find('.item'),
        $next   = $(event.relatedTarget),
        targetID = $next.index(),
        $active = $slides.filter('.active'),
        $bg = $('.slide-background-wrap .slide-background'),
        $left = $this.find('.carousel-control.left'),
        $right = $this.find('.carousel-control.right'),

        activeIndex = $slides.index($active),
        nextIndex   = $slides.index($next),
        background = $this.find('.slide-background');

    if (targetID === 0) {
            $left.addClass('hidden');
            $right.removeClass('hidden');
        } else if (targetID == itemLength - 1) {
            $left.removeClass('hidden');
            $right.addClass('hidden');
        } else {
            $left.removeClass('hidden');
            $right.removeClass('hidden');
        }

    $bg.eq(nextIndex).addClass('active');
    $bg.eq(activeIndex).removeClass('active');

    // // Hashnav
    // var hash = $next.data('hash');

    // if (hash) document.location.hash = '#!' + hash;
    // else document.location.hash = '';
    // $('.slide-background').css({
    //     opacity:0
    // });

    // $('.slide-background.active').css({
    //     opacity:1
    // });

});


(function ($) {

    $('.collapse-item').on('show.bs.collapse', function(){
        $(this).find('.icon-collapse-arrow').addClass('up-arrow');
    });
    $('.collapse-item').on('hide.bs.collapse', function(){
        $(this).find('.icon-collapse-arrow').removeClass('up-arrow');
    });

    $('.carousel').carousel({
        interval: false
    });

    //Make something this HEADER after certain("sDistanse") scroll
    function headerAfterScroll(){
            var sElement = $('.layout-header'),
                sDistace = 100,
                sFromTop = $(window).scrollTop();

            if(sFromTop > sDistace) {
                $('.layout-header').addClass('scrolled');
            }
            else {
                $('.layout-header').removeClass('scrolled');
            }
            requestAnimationFrame(headerAfterScroll);
        }
     requestAnimationFrame(headerAfterScroll);
    //headerAfterScroll END


    //unclosable DROPDOWN
        $(document).on('click', '.unclosable', function (event) {
            event.stopPropagation();
        });
    //unclosable DROPDOWN END

})(window.jQuery);


$(document).on("change", ".file-input", function(){

        var $fileLabel = $(".file-label");
            $filename = $(".file-input").val();
            $fileLabelChildren = $(".file-label").children();

        $fileLabel.addClass("filed");
        $filename = $filename.replace(/^.*[\\\/]/, '');

        $fileLabel.empty();
        $fileLabel.html($fileLabelChildren);
        $fileLabel.append($filename);

    });
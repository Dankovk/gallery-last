(function ($) {
    "use strict";

    $('.selectize').selectize({
        sortField: 'text'
    });

    $('.selectize-tag').selectize({
        plugins: ['remove_button'],
        delimiter: ',',
        persist: false,
        create: function (input) {
            return {
                value: input,
                text: input
            };
        }
    });
    $('.works-slider').bxSlider({
        minSlides: 3,
        maxSlides:3,
        slideWidth:115,
        slideMargin: 20,
        pager:false,
        hideControlOnEnd:true,
        infiniteLoop: false
    });
    $('.guest-book-slider').bxSlider({
        minSlides: 3,
        maxSlides:3,
        slideWidth:204,
        slideMargin: 31,
        pager:false,
        hideControlOnEnd:true,
        infiniteLoop: false
    });

    $(document).on('click', '.artist-name', function(){
        $(this).parent().find('.active').removeClass('active');
        $(this).addClass('active');
        $('.artist-wave').animate({
            left: $(this).position().left + $(this).width() * 0.55
        })
    });
    $('.btn-primary').on('click', function(e){
        e.preventDefault();
    });

})(window.jQuery);

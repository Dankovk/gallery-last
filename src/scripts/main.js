(function ($) {
    "use strict";

    $(window).on('load', function () {
        var $preloader = $('.preloader-cont'),
            $spinner   = $preloader.find('.preloader-itself');
        //$spinner.fadeOut();
        $preloader.delay(850).fadeOut('slow');
    });

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




    function handleCategories (data){
        console.log('cliked');
        $('.pics-wrap').empty();
        $('.pics-wrap').append(data);
    }
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
    $('.modal-btn').on('click', function(e){
        e.preventDefault();
    });
    $(document).on('click', '.artist-name a', function(e){
        e.preventDefault();
        var categoryName = $(this).attr('data-slug');
        $.ajax({
            url:'/wp-admin/admin-ajax.php?action=get_products',
            data: categoryName,
            beforeSend: function(){
                $('.preloader-wrap').fadeIn('fast');
            },
            complete: function(){
                $('.preloader-wrap').fadeOut('fast');
            },
            success: function(data){
                handleCategories(data);
            }
        });
    });



    new WOW().init();
})(window.jQuery);

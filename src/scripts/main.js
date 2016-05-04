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




    function handleCategories (data,slug){
        console.log('cliked');
        $('.pics-wrap').empty();
        $('.pics-wrap').append(data);
        history.replaceState(null, null, '/product-category/'+slug+'/');
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
            url:'/wp-admin/admin-ajax.php',
            data: {
                'category':categoryName,
                'action': 'get_products'
            },
            beforeSend: function(){
                $('.preloader-wrap').fadeIn('fast');
            },
            complete: function(){
                $('.preloader-wrap').fadeOut('fast');
            },
            success: function(data){
                handleCategories(data, categoryName);
            }
        });
    });


    $('[name="woocommerce_checkout_place_order"]').val('Continue to PayPal');

    $('.basket > a').on('click', function() {
        $('.dropdown-content').fadeIn(300);
    });

    $(document).on("click", function(event){
        var $trigger = $('.dropdown');
        if($trigger !== event.target && !$trigger.has(event.target).length){
            $('.dropdown-content').fadeOut(300);
        }            
    });

    if ($('.dropdown-content li').length > 1) $('.basket > a').addClass('has-items');

    $('#comment').attr('rows', '1');
    $('#reply-title').remove();

    new WOW().init();
})(window.jQuery);

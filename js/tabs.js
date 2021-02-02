$(document).ready(function() {
    $('#tabs li').on('click', function() {
      var tab = $(this).data('tab');
  
      $('#tabs li').removeClass('is-active');
      $(this).addClass('is-active');
  
      $('#tab-content p').removeClass('is-active');
      $('p[data-content="' + tab + '"]').addClass('is-active');
    });

        // Owl Carousel
        $('.owl-carousel').owlCarousel({
          items:1,
          loop:true,
          autoplay:true,
          autoplayTimeout:4000,
          autoplayHoverPause:true,
          autoHeight:true,
          nav:false,
          responsiveClass:true,
          responsive:{
            0:{
                items:1,
            },
            600:{
                items:1,
            },
            1000:{
                items:1
            }
          }
        });  
      
  });

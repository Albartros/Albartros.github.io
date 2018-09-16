$(document).ready(function () {
    $('.scrollTo').on('click', function () {
        var page = $(this).attr('href');
        var speed = 750;
        $('html, body').animate({
            scrollTop: $(page).offset().top
        }, speed);
        return false;
    });

    var $button = $(".game__controls__bullet");
    var $game = $(".game__container");
    var $progress = $("#progress");
    var currentSlide = 1;
    var maxSlides = $button.length;
    var interval;

    var $ul = $('#shuffle');
    $ul.children('li').sort(function () {
        return (Math.round(Math.random()) - 0.5)
    }).appendTo($ul);

    // Le timer du slideshow
    var timer = function () {
        interval = setInterval(function () {
            if (currentSlide != maxSlides) {
                currentSlide++;
                slide(currentSlide);
            }
            else {
                currentSlide = 1;
                slide(currentSlide);
            }
        }, 9500);
    }
    timer();

    // Changement manuel du slideshow
    $button.click(function (event) {
        event.preventDefault();
        var $this = $(this);
        if (!$this.hasClass("active")) {
            slide($this.data("game"));
        }
        clearInterval(interval);
        timer();
    })

    // Le slideshow
    function slide(id) {
        $button.removeClass("active").filter("[data-game='" + id + "']").addClass("active");
        $game.addClass("fadeOutLeft").removeClass("fadeInRight");
        $progress.removeClass("game__progress--run")
        currentSlide = id;
        setTimeout(function () {
            $game.addClass("hidden").removeClass("fadeInLeft fadeOutLeft").filter("[data-game='" + id + "']").removeClass("hidden").addClass("fadeInRight");
            $progress.addClass("game__progress--run");
        }, 500);
    }

    // Fix léger
    setTimeout(function () {
        $progress.addClass("game__progress--run");
    }, 500);
});

var Homepage = {
    settings: {
        currentSlide: 1,
        init: false,
        scrollSpeed: 750
    },
    init: function () {
        this.initScroller()
        this.initSlideshow()
        this.shuffleUsers()
        this.settings.init = true
    },
    shuffleUsers: function () {
        $("#shuffle").children("li").sort(function () {
            return (Math.round(Math.random()) - 0.5)
        }).appendTo($("#shuffle"))
    },
    initScroller: function () {
        var self = this
        $(".scrollTo").on("click", function () {
            var page = $(this).attr("href")
            $("html, body").animate({
                scrollTop: $(page).offset().top
            }, self.settings.scrollSpeed)
            return false
        });
    },
    initSlideshow: function () {
        var self = this

        setTimeout(function () {
            $("#progress").addClass("game__progress--run")
        }, 500);

        var timer = function () {
            var maxSlides = $(".game__controls__bullet").length
            interval = setInterval(function () {
                if (self.settings.currentSlide != maxSlides) {
                    self.settings.currentSlide++
                    self.changeSlideshow(self.settings.currentSlide)
                }
                else {
                    self.settings.currentSlide = 1
                    self.changeSlideshow(self.settings.currentSlide)
                }
            }, 9500)
        }

        $(".game__controls__bullet").click(function (event) {
            event.preventDefault()
            var $this = $(this)

            if (!$this.hasClass("active")) {
                self.changeSlideshow($this.data("game"))
            }
            clearInterval(interval)
            timer()
        })

        timer()
    },
    changeSlideshow: function (id) {
        var $game = $(".game__container")
        var $progress = $("#progress")

        $(".game__controls__bullet").removeClass("active").filter("[data-game='" + id + "']").addClass("active")
        $game.addClass("fadeOutLeft").removeClass("fadeInRight")
        $progress.removeClass("game__progress--run")
        this.settings.currentSlide = id

        setTimeout(function () {
            $game.addClass("hidden").removeClass("fadeInLeft fadeOutLeft").filter("[data-game='" + id + "']").removeClass("hidden").addClass("fadeInRight")
            $progress.addClass("game__progress--run")
        }, 500)
    },
}

var Legicode = {
    settings: {
        codesFound: [],
        cookieLength: 365,
        cookieName: "foundSequences",
        init: false,
        muted: false,
        sequence: "",
        sequenceIncrement: 0,
        sequences: {}
    },
    init: function () {
        this.buttonListener()
        this.initializeCookies()
        this.initializeCustom()
        this.initializeSequences()
        this.settings.init = true
    },
    initializeCookies: function () {
        var cookies = Cookies.getJSON(this.settings.cookieName)
        if (typeof cookies == "undefined") {
            Cookies.set(this.settings.cookieName, [], { expires: this.settings.cookieLength })
        } else {
            this.settings.codesFound = cookies
        }
        this.updateCounter()
    },
    initializeSequences: function () {
        var self = this
        $.getJSON("./data.json", function (data) {
            self.settings.sequences = data
        })
    },
    updateCounter: function () {
        $("#count").text(this.settings.codesFound.filter(code => code.length == $(".code__button__button").length).length)
    },
    closeModal: function () {
        $modal = $("#isModal")
        if ($modal.hasClass("active")) {
            this.playSound("back")
            setTimeout(function () {
                $modal.removeClass("active").find("h2").first().text("")
                $(".hideModal").removeClass("hidden")
                $("#player").replaceWith("<div id=\"player\"></div>")
            }, 150)
        }
    },
    openModal: function () {
        $("#isModal").addClass("active")
        $(".hideModal").addClass("hidden")
    },
    toggleMute: function () {
        this.settings.muted = !this.settings.muted
        $(".volumeIcon").toggleClass("hidden")
    },
    playSound: function (sound) {
        if (this.settings.muted == false) {
            switch (sound) {
                case "back":
                    $("#back").prop("volume", 0.4).prop("currentTime", 0).trigger("play")
                    break
                case "error":
                    $("#error").prop("volume", 0.4).trigger("play")
                    break
                case "select":
                    $("#select").prop("volume", 0.4).prop("currentTime", 0.1).trigger("play")
                    break
                case "success":
                    $("#success").prop("volume", 0.25).prop("currentTime", 0.1).trigger("play")
                    break
            }
        }
    },
    initializeCustom: function () {
        var url = new URL(window.location.href)
        if (url.searchParams.get("code")) {
            var order = url.searchParams.get("code").split(',')
            
            var $buttons = $(".code__button")
            $buttons.sort(function (a, b) {
                console.log(order.indexOf(a.dataset.value) - order.indexOf(b.dataset.value))
                return order.indexOf(a.dataset.value) - order.indexOf(b.dataset.value)
            }).appendTo("#buttons")
        }
    },
    buttonListener: function () {
        var self = this

        $("#closeModal").click(function () {
            self.closeModal()
        })

        var $mute = $("#volume")
        $mute.click(function (event) {
            event.preventDefault()
            self.toggleMute()
        })

        var $button = $(".code__button__button")
        var $allButtons = $("#buttons")
        setTimeout(function () {
            $allButtons.removeClass("flipInX delay-1s")
        }, 2000);

        $button.click(function (event) {
            event.preventDefault()
            var $this = $(this)
            if (!$this.hasClass("active")) {
                self.settings.sequenceIncrement++
                self.settings.sequence += $this.data("value")
                self.playSound("select")
                $this.addClass("active")
                if (self.settings.sequenceIncrement >= $button.length) {
                    var proposedSequence = self.settings.sequence
                    if (proposedSequence in self.settings.sequences) {
                        self.playSound("success")
                        $allButtons.addClass("true animated pulse")
                        setTimeout(function () {
                            $allButtons.removeClass("true animated pulse")
                            $button.removeClass("active")

                            self.openModal()
                            $("#titleModal").text(self.settings.sequences[proposedSequence].title)

                            Player.loadVideo(self.settings.sequences[proposedSequence].id)
                        }, 1000);

                        function isValueInArray(arr, val) {
                            inArray = false
                            for (i = 0; i < arr.length; i++) {
                                if (val == arr[i]) {
                                    inArray = true
                                }
                            }
                            return inArray
                        }
                        if (isValueInArray(self.settings.codesFound, proposedSequence) == false) {
                            self.settings.codesFound.push(proposedSequence)
                            Cookies.set(self.settings.cookieName, self.settings.codesFound, { expires: self.settings.cookieLength })
                            self.updateCounter()
                        }
                    } else {
                        self.playSound("error")
                        $allButtons.addClass("false animated shake faster")
                        setTimeout(function () {
                            $allButtons.removeClass("false animated shake faster")
                            $button.removeClass("active")
                        }, 1000);
                    }

                    self.settings.sequenceIncrement = 0
                    self.settings.sequence = ""
                }
            }
        })

        $(window).keydown(function (event) {
            if (event.which >= 97 && event.which <= 103) {
                event.preventDefault()
                var id = event.which - 96
                $button.filter("[data-value='" + id + "']").click()
            } else if (event.which == 27) {
                self.closeModal()
            }
        })
    }
}

var Machinima = {
    settings: {
        init: false,
        player: {},
        scrollSpeed: Homepage.settings.scrollSpeed,
        state: true
    },
    init: function (id) {
        this.buttonListener()
        this.initializePlayer(id)
        this.settings.init = true
    },
    buttonListener: function () {
        var self = this
        $(window).keydown(function (event) {
            if (event.which == 32) {
                event.preventDefault()

                if (self.settings.state == true) {
                    self.settings.player.pauseVideo()
                } else {
                    self.settings.player.playVideo()
                }
                self.settings.state = !self.settings.state
            } else if (event.which == 27) {
                self.settings.player.stopVideo()
                self.scrollDescription()
            }
        })
    },
    initializePlayer: function (id) {
        var self = this

        setTimeout(function () {
            self.settings.player = Player.loadVideo(id)
        }, 1000);
    },
    scrollDescription: function () {
        var self = this
        $("html, body").animate({
            scrollTop: $("#about").offset().top - $("nav").first().height()
        }, self.settings.scrollSpeed)
    }
}

var Player = {
    settings: {
        init: false
    },
    init: function () {
        this.initializePlayer()
        this.settings.init = true
    },
    initializePlayer: function () {
        var tag = document.createElement("script")
        tag.src = "https://www.youtube.com/iframe_api"
        var firstScriptTag = document.getElementsByTagName("script")[0]
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)
    },
    loadVideo: function (id) {
        var self = this
        var player = new YT.Player("player", {
            videoId: id,
            width: "1920",
            height: "1080",
            playerVars: {
                autoplay: 1,
                controls: 1,
                disablekb: 0,
                iv_load_policy: 3,
                modestbranding: 0,
                rel: 0,
                showinfo: 0,
                showsearch: 0
            },
            events: {
                "onStateChange": self.onPlayerStateChange,
            }
        })
        return player
    },
    onPlayerStateChange: function (event) {
        if (event.data == YT.PlayerState.ENDED) {
            if (Legicode.settings.init == true) {
                Legicode.closeModal()
            } else if (Machinima.settings.init == true) {
                Machinima.scrollDescription()
            }
        } else if (event.data == YT.PlayerState.PLAYING) {
            if (Machinima.settings.init == true) {
                Machinima.settings.state = true
            }
        }
    },
}
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
        var shuffle = document.getElementById("shuffle")
        for (var i = shuffle.children.length; i >= 0; i--) {
            shuffle.appendChild(shuffle.children[Math.random() * i | 0])
        }
    },
    initScroller: function () {
        var scrollButtons = document.getElementsByClassName("scrollTo")
        for (var i = 0; i < scrollButtons.length; i++) {
            scrollButtons[i].addEventListener("click", function (event) {
                event.preventDefault()
                document.getElementById(event.currentTarget.hash.substr(1)).scrollIntoView({
                    behavior: "smooth"
                })
            }, false)
        }
    },
    initSlideshow: function () {
        var self = this

        setTimeout(function () {
            document.getElementById("progress").classList.add("game__progress--run")
        }, 500);

        var timer = function () {
            var maxSlides = document.getElementsByClassName("game__controls__bullet").length

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

        var slideBullets = document.getElementsByClassName("game__controls__bullet")
        for (var i = 0; i < slideBullets.length; i++) {
            slideBullets[i].addEventListener("click", function (event) {
                event.preventDefault()
                if (!event.currentTarget.classList.contains("active")) {
                    self.changeSlideshow(event.currentTarget.dataset.game)
                }
                clearInterval(interval)
                timer()
            }, false)
        }

        timer()
    },
    changeSlideshow: function (id) {
        this.settings.currentSlide = id

        var game = document.getElementsByClassName("game__container")
        for (var i = 0; i < game.length; i++) {
            game[i].classList.add("fadeOutLeft")
            game[i].classList.remove("fadeInRight")
        }

        var progress = document.getElementById("progress")
        progress.classList.remove("game__progress--run")

        var slideBullets = document.getElementsByClassName("game__controls__bullet")
        for (var i = 0; i < slideBullets.length; i++) {
            slideBullets[i].classList.remove("active")
            if (slideBullets[i].dataset.game == id) {
                slideBullets[i].classList.add("active")
            }
        }

        setTimeout(function () {
            for (var i = 0; i < game.length; i++) {
                game[i].classList.add("hidden")
                game[i].classList.remove("fadeInRight")
                game[i].classList.remove("fadeOutLeft")
                if (game[i].dataset.game == id) {
                    game[i].classList.remove("hidden")
                    game[i].classList.add("fadeInRight")
                }
            }
            
            progress.classList.add("game__progress--run")
        }, 500)
    },
}

var Legicode = {
    settings: {
        codesFound: 0,
        cookieLength: 365,
        cookieName: "foundSequences",
        host: "https://legipix.zd.fr",
        init: false,
        muted: false,
        sequence: "",
        sequenceIncrement: 0
    },
    init: function () {
        this.buttonListener()
        this.initializeCounter()
        this.initializeCustom()
        this.settings.init = true
    },
    initializeCounter: function () {
        var self = this
        var request = new XMLHttpRequest()
        request.open("GET", this.settings.host + "/code/count", true)

        request.onload = function () {
            if (request.status >= 200 && request.status < 400) {
                // Success!
                var data = JSON.parse(request.responseText)
                var buttonLength = $(".code__button__button").length
                
                if (buttonLength == 6) {
                    self.settings.codesFound = data.sequences_6
                } else if (buttonLength == 7) {
                    self.settings.codesFound = data.sequences_7
                }

                self.updateCounter()
            }
        }

        request.onerror = function () {
            // There was a connection error of some sort
        }

        request.send()
        return true
    },
    updateCounter: function () {
        $("#count").text(this.settings.codesFound)
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
                case "award":
                    $("#award").prop("volume", 0.4).trigger("play")
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

        $("#halowards").click(function (event) {
            self.playSound("award")
        });

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

                    var request = new XMLHttpRequest();
                    request.open("GET", self.settings.host + "/code/" + self.settings.sequence, true);

                    request.onload = function () {
                        if (request.status >= 200 && request.status < 400) {
                            // Success!
                            var data = JSON.parse(request.responseText);

                            self.playSound("success")
                            $allButtons.addClass("true animated pulse")
                            setTimeout(function () {
                                $allButtons.removeClass("true animated pulse")
                                $button.removeClass("active")

                                self.openModal()
                                $("#titleModal").text(data.title)

                                Player.loadVideo(data.video_id)
                            }, 1000)
                        } else {
                            // We reached our target server, but it returned an error
                            self.playSound("error")
                            $allButtons.addClass("false animated shake faster")
                            setTimeout(function () {
                                $allButtons.removeClass("false animated shake faster")
                                $button.removeClass("active")
                            }, 1000)
                        }
                    }

                    request.onerror = function () {
                        // There was a connection error of some sort
                        self.playSound("error")
                        $allButtons.addClass("false animated shake faster")
                        setTimeout(function () {
                            $allButtons.removeClass("false animated shake faster")
                            $button.removeClass("active")
                        }, 1000)
                    }

                    request.send()

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
        window.addEventListener("keydown", function (event) {
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
        document.getElementById("about").scrollIntoView({
            behavior: "smooth"
        })
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
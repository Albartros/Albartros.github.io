"use strict";

// Functions
function debounce(func, wait, immediate) {
    var timeout;
    return function() {
        var context = this, args = arguments;
        var later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
};

// Poll
var Poll = {

    settings: {
        pollBars: document.getElementsByClassName("poll__bar__value")
    },

    init: function() {
        this.animatePollBars();
        return;
    },

    animatePollBars: function() {
        var s = this.settings;
        
        for (var i = s.pollBars.length - 1; i >= 0; i--) {
            s.pollBars[i].style.width = s.pollBars[i].dataset.value;
        };
        return;
    }


};

var Background = {

    settings: {
        body: document.body,
        html: document.documentElement
    },

    init: function() {
        this.parallaxBackground();
        return;
    },

    parallaxBackground: function() {
        var s = this.settings;
        var self = this;

        window.addEventListener("load", function() {
            document.body.style.backgroundPosition = "center " + self.positionBackground() + "%";
        }, false);

        window.addEventListener("scroll", function() {
            document.body.style.backgroundPosition = "center " + self.positionBackground() + "%";
        }, false);

        return;
    },

    positionBackground: function() {
        var s = this.settings;

        var pageHeight = Math.max(s.body.scrollHeight, s.body.offsetHeight, s.html.clientHeight, s.html.scrollHeight, s.html.offsetHeight),
        scrolledFromTop = (window.pageYOffset || s.html.scrollTop)  - (s.html.clientTop || 0),
        maxDisplayed = pageHeight - window.innerHeight;

        return (scrolledFromTop * 100) / maxDisplayed;
    }

};

var SimpleEditor = {

    settings: {
        editor: document.getElementById("content"),
        jumpButton: document.getElementById("jump"),
        loader: document.getElementById("loader"),
        loaderShown: false,
        preview: document.getElementById("preview")
    },

    init: function() {
        this.listenEditorAndCompletePreview();
        this.listenJumpButton();
        return;
    },

    listenEditorAndCompletePreview: function() {
        var s = this.settings;
        var self = this;

        s.editor.addEventListener("keyup", debounce(function() {
            s.preview.innerHTML = "";
            self.showOrHideLoader();
            setTimeout(function() {
                self.showOrHideLoader();
                self.parseText();
            }, 1000)
        }, 600), false);
        return;
    },

    listenJumpButton: function() {
        var s = this.settings;

        s.jumpButton.addEventListener("click", function(e) {
            e.preventDefault();
            s.editor.focus();
        }, false);
        return;
    },

    showOrHideLoader: function() {
        var s = this.settings;

        if(s.loaderShown === false) {
            s.loaderShown = true;
            s.loader.style.display = "block";
            return;
        }
        else {
            s.loaderShown = false;
            s.loader.style.display = "none";
            return;
        }
    },

    parseText: function() {
        var s = this.settings;

        s.preview.innerHTML = s.editor.value;
        return;
    },

};

var ScoreLoader = {

    settings: {
        scores: document.getElementsByClassName("carnage__score"),
        separator: document.getElementById("carnage__score__separator"),
        teamLogos: document.getElementsByClassName("carnage__score__team")
    },

    init: function() {
        this.resetScores();
        this.animateScores();
        return;
    },

    resetScores: function() {
        var s = this.settings;

        for (var i = s.scores.length - 1; i >= 0; i--) {
            s.scores[i].innerHTML = "";
        };
        return;
    },

    animateScores: function() {
        var s = this.settings;
        var self = this;

        this.launchAnimation();

        setTimeout(function() {
            for (var i = s.scores.length - 1; i >= 0; i--) {
                var score = s.scores[i], max = score.dataset.score, duration = 1000 / max;
                self.incrementScores(score, max, duration);
            };
        }, 2750);

        this.endAnimation();

        return;
    },

    incrementScores: function(score, max, duration) {
        var theScoresInterval;
        var i = 0;
        
        theScoresInterval = setInterval(function() {
            i++;
            score.innerHTML = i;
            // Quand on atteint le score souhaité on arrête le script.
            if(i >= max) { 
                clearInterval(theScoresInterval);
                score.innerHTML = max;
            }
        }, duration);
        return;
    },

    launchAnimation: function() {
        var s = this.settings;

        for (var i = s.teamLogos.length - 1; i >= 0; i--) {
            s.teamLogos[i].className = s.teamLogos[i].className + " launchAnimation";
        };
        s.separator.className = s.separator.className + " launchAnimation";
        return;
    },

    endAnimation: function() {
        var s = this.settings;

        setTimeout(function() {
            for (var i = s.teamLogos.length - 1; i >= 0; i--) {
                s.teamLogos[i].className = s.teamLogos[i].className + " done";
            };
            s.separator.className = s.separator.className + " done";
        }, 4750);
        return;
    },

};

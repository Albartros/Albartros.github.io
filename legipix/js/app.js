"use strict";

String.prototype.nl2br = function() {
   return this.replace(/\n/g, "<br>");
}

var window_focus;
$(window).focus(function() {
   window_focus = true;
}).blur(function() {
   window_focus = false;
});

var Chat = {
   settings: {
      activeGroup: 0,
      firstMessageId: 0,
      hasLoadedMessages: false,
      lastDate: null,
      lastMessageId: 0,
      lastUserId: 0,
      playsVideo: "",
   },
   init: function() { // cette fonction est appelée au chargement de la page
      this.resizeContainer();
      this.animateTitles();
      this.loadEmojiAutocomplete();
      this.loadGroupSelector();
      this.loadImageUploader();
      this.loadSendMessageListeners();
      this.loadPusherConnections();
   },
   loadYoutube: function() {
      var self = this;

      $(".hasYoutube").unbind().on("click", function(e) {
         e.preventDefault();
         var $this = $(this);
         var id = $this.data("id");
         var $container = $("#videoWrapper");

         $(".chat__core__container__message__content__post__text__media--active").removeClass("chat__core__container__message__content__post__text__media--active");
         $(".visiblePath").show();
         $(".hiddenPath").hide();

         if (id != self.settings.playsVideo) {
            self.settings.playsVideo = id;
            $this.addClass("chat__core__container__message__content__post__text__media--active");
            $this.find(".chat__core__container__message__content__post__text__media__icon__path").toggle();
            $container.html("<iframe width=\"560\" height=\"349\" src=\"https://www.youtube.com/embed/" + id + "?iv_load_policy=3&amp;autohide=1&amp;showinfo=0&amp;rel=0&amp;autoplay=1\" frameborder=\"0\" allowfullscreen></iframe>");
            if ($container.is(":hidden")) {
               $container.slideToggle();
            }
         } else {
            self.settings.playsVideo = "";
            $container.slideToggle(function() {
               $container.empty();
            })
         }
         return false;
      })
   },
   animateTitles: function() {
      var self = this;
      $(".chat__groups__group").on("mouseenter", function() {
         var $it = $(this);
         var $this = $it.find(".chat__groups__group__info__chat__name__title").first();
         var $parent = $this.parent();
         if ($this.width() > $parent.width()) {
            var toLeft = true;
            var small = 750;
            //var base = $this.width() >= 1.5 * $parent.width() ? small * 4 : small;
            //var time = base / ($this.width() - $parent.width());
            var time = 75;
            window[$it.attr("id")] = setInterval(function() {
               var left;
               //left = -left > $this.width() ? $this.parent().width() : left;
               if (toLeft == true) {
                  left = $this.position().left - 0.75;
                  if ($parent.width() + -left >= $this.width() + 8) {
                     toLeft = false;
                  }
               } else {
                  left = $this.position().left + 0.75;
                  if (left >= 8) {
                     toLeft = true;
                  }
               }
               $this.css({
                  left: left
               });
            }, time);
         }
      }).on("mouseleave", function() {
         var $it = $(this);
         var $this = $it.find(".chat__groups__group__info__chat__name__title").first();
         var $parent = $this.parent();
         if ($this.width() > $parent.width()) {
            clearInterval(window[$it.attr("id")]);
            $this.css({
               left: 0
            });
         }
      });
   },
   loadPusherConnections: function() {
      var self = this;
      var key = $("meta[name=\"pusher-app\"]").attr("content");
      var pusher = new Pusher(key, {
         authEndpoint: "api/chat/auth",
         auth: {
            headers: {
               "X-CSRF-TOKEN": $("meta[name=\"csrf-token\"]").attr("content")
            }
         }
      });

      window["channels"] = 0;
      $(".chat__groups__group").each(function() {
         var $this = $(this);
         window["channels"]++;
         var channel = $this.data("channel");

         window[channel] = pusher.subscribe(channel);
         window[channel].bind("message", function(data) {
            self.appendChatMessage(data);
         });
      });

      $(window).bind("beforeunload", function() {
         for (var i = window["channels"]; i > 0; i--) {
            if (i == 1) {
               pusher.unsubscribe(window["private-chat-" + i]);
            } else {
               pusher.unsubscribe(window["presence-chat-" + i]);
            }
         }
      });
   },
   updateUser: function() {
      var self = this;
      $.ajax({
         url: "api/chat/thread",
         type: "POST",
         headers: {
            "X-CSRF-TOKEN": $("meta[name=\"csrf-token\"]").attr("content")
         },
         data: {
            thread: self.settings.activeGroup
         },
         success: function() {
            return true;
         }
      });
   },
   parseParticipants: function(participants) {
      var $container = $("#chatOverlayUsers");
      var appended = $();

      appended = appended.add($("<h2>", {
         class: "chat__members__title",
         text: $container.parent().data("title")
      }));
      for (var i = participants.length - 1; i >= 0; i--) {
         var participant = participants[i];
         appended = appended.add($("<a>", {
            class: "chat__participant",
            href: "profil/" + participant.user.slug,
            id: "chat-participant-" + participant.user.id,
            html: $("<div>", {
               class: "chat__participant__avatar",
               html: $("<img>", {
                  alt: "avatar-" + participant.user.name,
                  class: "chat__participant__avatar__img avatar",
                  src: "https://api.adorable.io/avatars/160/" + participant.user.name + ".png"
               })
            }),
            append: $("<div>", {
               class: "chat__participant__info",
               html: $("<div>", {
                  class: "chat__participant__info__name",
                  text: participant.user.name,
                  append: $("<span>", {
                     class: "chat__participant__info__status",
                     text: moment(participant.last_read).isSame(moment(), "day") ? moment(participant.last_read).format("HH:mm") : moment(participant.last_read).format("LL")
                  })
               })
            })
         }));
      }
      $container.html(appended);
   },
   appendChatMessage: function(message) {
      var self = this;
      var $chatbox = $("#chatboxMessages");
      if (message[0].thread_id == self.settings.activeGroup) {
         var $group = $("#chat-" + message[0].thread_id);
         var $counter = $group.find(".chat__groups__group__info__lastPost__label").text(null);
         $group.find(".chat__groups__group__info__lastPost").html(emojione.shortnameToImage(message[0].body)).prepend($counter);
         $group.find(".chat__groups__group__info__chat__time").text(moment(message[0].created_at).format("HH:mm"))

         if ($chatbox[0].scrollHeight - $chatbox.scrollTop() == $chatbox.outerHeight()) {
            self.parseMessages(message);
            var saved = $chatbox.html(); // SVG Fix
            $chatbox.empty().html(saved); // SVG Fix
            $chatbox.scrollTop(1e10);
         } else {
            self.parseMessages(message);
            var saved = $chatbox.html(); // SVG Fix
            $chatbox.empty().html(saved); // SVG Fix
         }

         if (window_focus == false) {
            $("#chatAudio").trigger("play");
         }

         self.updateUser();

         var time = 1000;
         $(".chat__core__container__message__content__post__text--new").each(function() {
            var $this = $(this);
            setTimeout(function() {
               $this.removeClass("chat__core__container__message__content__post__text--new");
            }, time);
            time += 200;
         });
         self.loadYoutube();
      } else {
         var $group = $("#chat-" + message[0].thread_id);
         var $counter = $group.find(".chat__groups__group__info__lastPost__label");
         var counted = isNaN(parseInt($counter.text())) ? 1 : parseInt($counter.text()) + 1;
         $counter.text(counted);
         $group.find(".chat__groups__group__info__lastPost").html(emojione.shortnameToImage(message[0].body)).prepend($counter);
         $("#chatAudio").trigger("play");
      }
   },
   loadSendMessageListeners: function() {
      var self = this;
      $("#chatboxSendButton").on("click", function(e) {
         e.preventDefault();
         self.sendChatboxMessage();
         return false;
      });
      $("#chatboxTextarea").keypress(function(e) {
         if (e.which == 13 && !e.shiftKey) {
            self.sendChatboxMessage();
            return false;
         }
      });
   },
   checkScroll: function(e) {
      var elem = $(e.currentTarget);
      if (elem[0].scrollHeight - elem.scrollTop() == elem.outerHeight()) {
         return "bottom";
      }
      if (elem.scrollTop() == 0) {
         return "top";
      }
   },
   sendChatboxMessage: function() {
      var self = this;
      var group = this.settings.activeGroup;
      var $button = $("#chatboxSendButton");
      var $textarea = $("#chatboxTextarea");

      if ($textarea.val().trim().length == 0) {
         return false;
      }
      $button.toggleClass("button--loading");

      $.ajax({
         url: "api/chat/postMessage",
         type: "POST",
         headers: {
            "X-CSRF-TOKEN": $("meta[name=\"csrf-token\"]").attr("content")
         },
         data: {
            id: parseInt(group), // Le groupe
            text: emojione.toShort($textarea.val()) // Le contenu
         },
         success: function() {
            $textarea.val("");
            $button.toggleClass("button--loading");
         },
         error: function() {
            alert("Votre message n'a pas été envoyé, veuillez réessayer");
            $button.toggleClass("button--loading");
         }
      });
   },
   loadImageUploader: function() {
      var $imageUploadButton = $("#chatboxButtonImageUpload");

      $imageUploadButton.on("click", function(e) {
         e.preventDefault();
         $("#chatboxImageUploaderInput").trigger("click");
         return false;
      })

      $("#chatboxImageUploaderInput").on("change", function() {
         var dataForUpload = new FormData();
         dataForUpload.append("image", $(this).prop("files")[0]);

         $.ajax({
            url: "https://api.imgur.com/3/image",
            type: "POST",
            headers: {
               "Authorization": "Client-ID eb413ab31709e16"
            },
            data: dataForUpload,
            processData: false,
            contentType: false,
            success: function(response) {
               $imageUploadButton.unbind().addClass("chat__core__form__button__imageButton--disabled");
               var $textarea = $("#chatboxTextarea");
               $textarea.val(response.data.link + " " + $textarea.val()).focus();
            },
            error: function() {
               alert("Une erreur est survenue lors de l'upload de l'image");
            }
         });
      });
   },
   resizeContainer: function() {
      $(window).on("resize", function() {
         /*var $contentBoxes = $("#chatboxPosts, #chatboxGroups").hide();
         var $containerBoxes = $("#chatboxMessages, #chatboxMembers").each(function() {
            var $this = $(this);
            $this.css({
               "max-height": "none"
            }).css({
               "max-height": $this.height() + "px"
            });
         });
         $contentBoxes.show();*/
         $("#chatboxMessages").scrollTop(1e10);
      }).resize();
   },
   loadEmojiAutocomplete: function() { // Tout marche ici aussi
      // emoji strategy for .textcomplete() (latest version available in our repo: emoji_strategy.json)
      var emojiStrategy = emoji_strategy;

      $(document).ready(function() {

         $("#chatboxTextarea").textcomplete([{
            match: /\B:([\-+\w]*)$/,
            search: function(term, callback) {
               var results = [];
               var results2 = [];
               var results3 = [];
               $.each(emojiStrategy, function(shortname, data) {
                  if (shortname.indexOf(term) > -1) {
                     results.push(shortname);
                  } else {
                     if ((data.aliases !== null) && (data.aliases.indexOf(term) > -1)) {
                        results2.push(shortname);
                     } else if ((data.keywords !== null) && (data.keywords.indexOf(term) > -1)) {
                        results3.push(shortname);
                     }
                  }
               });

               if (term.length >= 3) {
                  results.sort(function(a, b) {
                     return (a.length > b.length);
                  });
                  results2.sort(function(a, b) {
                     return (a.length > b.length);
                  });
                  results3.sort();
               }
               var newResults = results.concat(results2).concat(results3);

               callback(newResults);
            },
            template: function(shortname) {
               return "<img class=\"emojione\" src=\"//cdn.jsdelivr.net/emojione/assets/png/" + emojiStrategy[shortname].unicode + ".png\"> :" + shortname + ":";
            },
            replace: function(shortname) {
               return ":" + shortname + ": ";
            },
            index: 1,
            maxCount: 10
         }]).on({
            "textComplete:show": function() {
               setTimeout(function() {
                  $("#textcomplete-dropdown-1").css({
                     top: "-=10px"
                  });
               }, 1);
            }
         });
      });
   },
   loadGroupSelector: function() {
      var self = this;
      $("#chatShowUsers, #chatOverlayClose").on("click", function(e) {
         e.preventDefault();
         $(".chat__core").toggleClass("chat__core--overlayed");
         $(".chat__groups").toggleClass("chat__groups--overlayed");
         $("#chatOverlay").toggleClass("chat__members--visible");
         return false;
      });
      //$(".chat__groups__group").first().addClass("chat__groups__group--selected");
      $(".chat__groups__group").each(function() {
         var $this = $(this);
         $this.on("click", $.throttle(3500, false, function(e) {
            e.preventDefault();
            if (!$this.hasClass("chat__groups__group--selected")) {
               $("#chatLoadMore").unbind().removeClass("chat__core__form__button__imageButton--disabled");
               $(".chat__groups__group--selected").removeClass("chat__groups__group--selected");
               $("#chatOverlayUsers").html(null);
               var $self = $(this);
               $self.addClass("chat__groups__group--selected");
               $self.find(".chat__groups__group__info__lastPost__label").text("");

               self.settings.activeGroup = $this.data("id");
               self.settings.hasLoadedMessages = false;
               self.settings.lastUserId = 0;
               self.settings.lastMessageId = "";
               $("#chatboxTextarea").val("").focus();

               self.loadMessages();
            }
            return false;
         }))
      })

      if (this.settings.activeGroup == 0) {
         $(".chat__groups__group").first().click();
      }
   },
   parseMessages: function(data) {
      var self = this;

      if (typeof data.messages != "undefined") {
         var countBeforeNewMessages = data.messages.length - data.unread;
         var mess = data.messages;
      } else {
         var countBeforeNewMessages = data.length;
         var mess = data;
      }

      var regexImgUr = /(.*)(?:http|https)\:\/\/(?:i.imgur.com)\/([a-zA-Z0-9]{5,8})(\.jpg|\.gif|\.png)(.*)/i;
      var regexUrl = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/ig;
      var regexYoutube = /(?:https?:\/\/)?(?:www\.)?youtu\.?be(?:\.com)?\/?.*(?:watch|embed)?(?:.*v=|v\/|\/)([\w\-_]+)\&?(.*)/i;

      if (this.settings.hasLoadedMessages == true) {
         var outputHTML = $("#chatboxPosts");
         //var outputHTML = $("<div id=\"chatbox_generated\">");
      } else {
         var outputHTML = $("<div id=\"chatbox_generated\">");
      }

      var i = 0;
      $.each(mess, function(key, val) {
         var date = moment(val.created_at);
         var user = val.user.id;

         /**
          * Global Block elements
          */
         var blockUnreadMessages_HTML = $("<div>", {
            class: "chat__core__container__newMessages",
            html: $("<div>", {
               class: "chat__core__container__newMessages__text",
               text: data.unread > 1 ? data.unread + " Nouveaux Messages" : "1 Nouveau Message"
            })
         });

         var blockDateMessages_HTML = $("<div>", {
            class: "chat__core__container__newMessages",
            html: $("<div>", {
               class: "chat__core__container__newMessages__text",
               text: date.isSame(moment(), "day") ? "Aujourd'hui" : date.format("LL")
            })
         });

         /**
          * Message-specific Block elements
          */
         var newUserWithAvatar_HTML = $("<article>", {
            class: "chat__core__container__message",
            "data-user": val.user.name,
            html: $("<div>", {
               class: "chat__core__container__message__avatar",
               html: $("<img>", {
                  alt: "avatar-" + val.user.name,
                  class: "avatar avatar--chat",
                  src: "https://api.adorable.io/avatars/160/" + val.user.name + ".png"
               })
            })
         });
         var newUserWithName_HTML = $("<div>", {
            class: "chat__core__container__message__content",
            html: $("<header>", {
               class: "chat__core__container__message__content__header",
               html: $("<a>", {
                  class: "chat__core__container__message__content__header__user",
                  href: "profil/" + val.user.slug,
                  text: val.user.name
               })
            })
         });

         if (regexImgUr.test(val.body)) {
            var matched = val.body.match(regexImgUr);
            var message_HTML = $("<div>", {
               class: "chat__core__container__message__content__post",
               "data-id": val.id,
               html: $("<div>", {
                  class: self.settings.hasLoadedMessages == false ? "chat__core__container__message__content__post__text chat__core__container__message__content__post__text--withImgur" : "chat__core__container__message__content__post__text chat__core__container__message__content__post__text--withImgur chat__core__container__message__content__post__text--new",
                  html: emojione.shortnameToImage(matched[4].nl2br().replace(regexUrl, "<a href=\"$&\" target=\"_blank\">$&</a>")),
                  prepend: $("<a>", {
                     class: "chat__core__container__message__content__post__text__media",
                     href: "http://i.imgur.com/" + matched[2] + matched[3],
                     target: "_blank",
                     html: $("<img>", {
                        alt: "imgur-" + matched[2],
                        class: "chat__core__container__message__content__post__text__media__img",
                        onerror: "this.src = \"//i.imgur.com/" + matched[2] + matched[3] + "\"",
                        src: "//i.imgur.com/" + matched[2] + "m" + matched[3]
                     }).add($("<div>", {
                        class: "chat__core__container__message__content__post__text__media__ref",
                        html: "Image | <span style=\"color: #85BF25\">i</span>mgur<span style=\"font-weight: 400\">.com</span>"
                     })).add($("<svg>", {
                        viewBox: "0 0 24 24",
                        "xmlns": "http://www.w3.org/2000/svg",
                        class: "chat__core__container__message__content__post__text__media__icon chat__core__container__message__content__post__text__media__icon--zoom",
                        html: "<path class=\"chat__core__container__message__content__post__text__media__icon__path\" d=\"M9.516 14.016q1.875 0 3.188-1.313t1.313-3.188-1.313-3.188-3.188-1.313-3.188 1.313-1.313 3.188 1.313 3.188 3.188 1.313zM15.516 14.016l4.969 4.969-1.5 1.5-4.969-4.969v-0.797l-0.281-0.281q-1.781 1.547-4.219 1.547-2.719 0-4.617-1.875t-1.898-4.594 1.898-4.617 4.617-1.898 4.594 1.898 1.875 4.617q0 2.438-1.547 4.219l0.281 0.281h0.797z\"></path>",
                     }))
                  }),
                  append: $("<time>", {
                     class: "chat__core__container__message__content__post__text__time",
                     text: moment(val.created_at).format("HH:mm")
                  })
               })
            });
         } else if (regexYoutube.test(val.body)) {
            var matched = val.body.match(regexYoutube);
            var message_HTML = $("<div>", {
               class: "chat__core__container__message__content__post",
               "data-id": val.id,
               html: $("<div>", {
                  class: self.settings.hasLoadedMessages == false ? "chat__core__container__message__content__post__text chat__core__container__message__content__post__text--withYoutube" : "chat__core__container__message__content__post__text chat__core__container__message__content__post__text--withYoutube chat__core__container__message__content__post__text--new",
                  html: emojione.shortnameToImage(matched[2].nl2br().replace(regexUrl, "<a href=\"$&\" target=\"_blank\">$&</a>")),
                  prepend: $("<a>", {
                     class: "chat__core__container__message__content__post__text__media hasYoutube",
                     href: "https://www.youtube.com/watch?v=" + matched[1],
                     "data-id": matched[1],
                     html: $("<img>", {
                        alt: "youtube-" + matched[1],
                        class: "chat__core__container__message__content__post__text__media__img",
                        src: "http://img.youtube.com/vi/" + matched[1] + "/mqdefault.jpg"
                     }).add($("<div>", {
                        class: "chat__core__container__message__content__post__text__media__ref",
                        html: "Vidéo | You<span style=\"color: #E52D27\">Tube</span><span style=\"font-weight: 400\">.com</span>"
                     })).add($("<svg>", {
                        viewBox: "0 0 24 24",
                        "xmlns": "http://www.w3.org/2000/svg",
                        class: "chat__core__container__message__content__post__text__media__icon",
                        html: "<path class=\"chat__core__container__message__content__post__text__media__icon__path visiblePath\" d=\"M8.016 5.016l10.969 6.984-10.969 6.984v-13.969z\"></path><path class=\"chat__core__container__message__content__post__text__media__icon__path hiddenPath\" style=\"display: none\" d=\"M6 6h12v12h-12v-12z\"></path>",
                     }))
                  }),
                  append: $("<time>", {
                     class: "chat__core__container__message__content__post__text__time",
                     text: moment(val.created_at).format("HH:mm")
                  })
               })
            });
         } else {
            var message_HTML = $("<div>", {
               class: "chat__core__container__message__content__post",
               "data-id": val.id,
               html: $("<div>", {
                  class: self.settings.hasLoadedMessages == false ? "chat__core__container__message__content__post__text" : "chat__core__container__message__content__post__text chat__core__container__message__content__post__text--new",
                  html: emojione.shortnameToImage($.trim(val.body.nl2br()).replace(regexUrl, "<a href=\"$&\" target=\"_blank\">$&</a>")),
                  append: $("<time>", {
                     class: "chat__core__container__message__content__post__text__time",
                     text: moment(val.created_at).format("HH:mm")
                  })
               })
            });
         }

         /**
          * Building the elements
          */
         if (self.settings.lastUserId == user) {
            var appendedToOutputHTML = [];

            if (self.settings.lastDate.isSame(date, "day") == false || i == countBeforeNewMessages) {
               if (i == countBeforeNewMessages) {
                  appendedToOutputHTML.push(blockUnreadMessages_HTML);
               }
               if (self.settings.lastDate.isSame(date, "day") == false) {
                  appendedToOutputHTML.push(blockDateMessages_HTML);
                  self.settings.lastDate = date;
                  self.settings.todayBlockplaced = true;
               }
               appendedToOutputHTML.push(
                  newUserWithAvatar_HTML.append(
                     newUserWithName_HTML.append(message_HTML)
                  )
               );
               outputHTML.append(appendedToOutputHTML);
            } else {
               outputHTML.find(".chat__core__container__message__content__post").last().after(message_HTML);
            }
         } else {
            self.settings.lastUserId = user;
            var appendedToOutputHTML = [];

            if (i == countBeforeNewMessages) {
               appendedToOutputHTML.push(blockUnreadMessages_HTML);
            }
            if (self.settings.lastDate.isSame(date, "day") == false) {
               appendedToOutputHTML.push(blockDateMessages_HTML);
               self.settings.lastDate = date;
               self.settings.todayBlockplaced = true;
            }
            appendedToOutputHTML.push(
               newUserWithAvatar_HTML.append(
                  newUserWithName_HTML.append(message_HTML)
               )
            );
            outputHTML.append(appendedToOutputHTML);
         }
         i++;
      });
      return outputHTML;
   },
   loadUsers: function(users) {
      if (typeof users != "undefined") {
         var channel = window["presence-chat-" + this.settings.activeGroup];
         var members = channel.members.members;

         $.when(this.parseParticipants(users)).then(function() {
            $.each(members, function(index, value) {
               $("#chat-participant-" + value.id).find(".chat__participant__info__status").addClass("chat__participant__info__status--online").text("connecté");
            });

            channel.bind("pusher:member_removed", function(member) {
               $("#chat-participant-" + member.id).find(".chat__participant__info__status").removeClass("chat__participant__info__status--online").text(moment().format("HH:mm"));
            });
            channel.bind("pusher:member_added", function(member) {
               $("#chat-participant-" + member.id).find(".chat__participant__info__status").addClass("chat__participant__info__status--online").text("connecté");
            });
         });
      }
   },
   loadMessages: function(group) {
      var self = this;

      // Hiding the buttons.
      var $loading = $("#chatboxLoadingMessage").show();
      var $posts = $("#chatboxPosts").hide();
      var $buttons = $(".chat__core__form__button__imageButton").hide();

      $.ajax({
         url: self.settings.hasLoadedMessages == true ? "api/chat/thread/" + self.settings.activeGroup + "/" + self.settings.firstMessageId : "api/chat/thread/" + self.settings.activeGroup,
         type: "GET",
         dataType: "json",
         success: function(response) {
            if (response.messages.length != 0) {
               self.settings.firstMessageId = response.messages[0].id;
               self.settings.lastDate = moment();
            }

            if (self.settings.hasLoadedMessages == false) {
               var generated = self.parseMessages(response);

               self.loadUsers(response.participants);

               $posts.empty().html(generated.html()).waitForImages(function() {
                  //self.resizeContainer();
                  $("#chatboxLoadingMessage").hide();
                  $(this).show();
                  $("#chatboxMessages").scrollTop(1e10);
                  self.settings.hasLoadedMessages = true;

                  // Showing Buttons
                  var time = 400;
                  $buttons.delay(1000).not($(typeof response.participants == "undefined" ? ".notPublic" : "")).each(function() {
                     var $this = $(this);
                     setTimeout(function() {
                        $this.show();
                     }, time);
                     time += 200;
                     if (time == 800) {
                        time += 200;
                     }
                  });
               });

               $("#chatLoadMore").on("click", function(e) {
                  e.preventDefault();
                  self.loadMessages();
                  return false;
               });
               self.loadYoutube();
            } else {
               if (response.messages.length == 0) {
                  var nomore_HTML = $("<div>", {
                     class: "chat__core__container__newMessages noMoreMessages",
                     html: $("<div>", {
                        class: "chat__core__container__newMessages__text",
                        text: "Fin des messages"
                     })
                  });

                  $("#chatboxLoadingMessage").hide();
                  $(".noMoreMessages").remove();
                  $posts.prepend(nomore_HTML).show();
                  $("#chatLoadMore").unbind().addClass("chat__core__form__button__imageButton--disabled").hide();

                  // Showing Buttons
                  var time = 400;
                  $buttons.delay(1000).not($(typeof response.participants == "undefined" ? ".notPublic" : "")).each(function() {
                     var $this = $(this);
                     setTimeout(function() {
                        $this.show();
                     }, time);
                     time += 200;
                     if (time == 800) {
                        time += 200;
                     }
                  });
               } else {
                  var old = $posts.html();
                  $("#chatboxLoadingMessage").hide();
                  $posts.empty().html(self.parseMessages(response).html() + old).show();
                  $(".chat__core__container__message__content__post__text--new").removeClass("chat__core__container__message__content__post__text--new");

                  // Showing Buttons
                  var time = 400;
                  $buttons.delay(1000).not($(typeof response.participants == "undefined" ? ".notPublic" : "")).each(function() {
                     var $this = $(this);
                     setTimeout(function() {
                        $this.show();
                     }, time);
                     time += 200;
                     if (time == 800) {
                        time += 200;
                     }
                  });
                  self.loadYoutube();
               }
            }
         },
         error: function() {
            alert("Les messages n'ont pas été récupérés");
         }
      });
   }
};

var Global = {
   init: function() {
      this.configAjax();
      this.disableLinks();
      this.launchLogo();
      this.loadEmojis();
   },
   configAjax: function() {
      $(document).ajaxStart(function() {
         $("#ajaxSpinner").toggleClass("ajax-active")
      }).ajaxStop(function() {
         $("#ajaxSpinner").toggleClass("ajax-active")
      });
   },
   disableLinks: function() {
      $(".disabled").on("click", function(e) {
         e.preventDefault();
         return false;
      });
   },
   launchLogo: function() {
      setTimeout(function() {
         $(".nav__logo__image").toggleClass("nav__logo__image--shown")
      }, 5000);
   },
   loadEmojis: function() {
      $(".withEmojis").each(function() {
         var $this = $(this);
         $this.html(emojione.shortnameToImage($this.html()));
      });
   }
};
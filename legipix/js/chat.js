emojione.unicodeAlt = false;
emojione.ascii = true;

var vue = new Vue({
  http: {
    headers: {
      "X-CSRF-TOKEN": document.getElementById("_token").getAttribute("value"),
    }
  },
  el: "#app",
  data: {
    activeThread: 0,
    channels: [],
    hasUploadedImage: false,
    messages: [],
    newMessages: 0,
    searchTerm: "",
    //stickedMediaId: "",
    //stickedMediaType: "",
    threads: [],
  },
  computed: {
    visibleUserGroups: function() {
      var num = 0;
      for (var i = this.threads.length - 1; i >= 1; i--) {
        if (this.threads[i].subject.toLowerCase().indexOf(this.searchTerm.toLowerCase()) > -1) {
          num++;
        }
      }
      return num;
    },
    lastPost: function() {
      return this.messages.messages[this.messages.messages.length - 1].id;
    },
    computedMessages: function() {
      var groupedMessages = [];
      var user = 0;
      var momentDate = moment();
    
      for (var i = 0; i <= this.messages.messages.length - 1; i++) {
        var message = this.messages.messages[i];
        var messageDate = moment(message.created_at);

        if (
            momentDate.isSame(messageDate, "day") == false || 
            (this.messages.unread > 0 && i == (this.messages.messages.length - this.messages.unread))
        ) {
          if (this.messages.unread > 0 && i == (this.messages.messages.length - this.messages.unread)) {
            groupedMessages.push([
              { user: 0, type: "unread", body: this.messages.unread + (this.messages.unread > 1 ? " messages non lus" : " message non lu") }
            ]);
          };
          if (momentDate.isSame(messageDate, "day") == false) {
            user = message.user_id;
            momentDate = messageDate;
            groupedMessages.push([
              { user: 0, type: "date", body: messageDate.isSame(moment(), "day") ? "Aujourd'hui" : messageDate.format("LL") }
            ]);
          };
          groupedMessages.push([
            { user: message.user, content: [message]},
          ]);
        } else {
          if (user != message.user_id) {
            user = message.user_id;
            groupedMessages.push([
              { user: message.user, content: [message]},
            ]);
          } else {
            groupedMessages[groupedMessages.length - 1][0].content.push(message);
          };
        };
      };
      return groupedMessages;
    },
  },
  beforeCompile: function() {
    this.fetchUserThreads();
  },
  compiled: function() {
    //
  },
  ready: function() {
    //
  },
  methods: {
    devAppend: function() {
      this.newMessages++;
    },
    /*stickVideo: function(id) {
      this.$set("stickedMediaType", "video");
      this.$set("stickedMediaId", id);
    },
    stickAudio: function(id) {
      this.$set("stickedMediaType", "audio");
      this.$set("stickedMediaId", id);
    },
    unstickMedia: function() {
      this.$set("stickedMediaType", "");
      this.$set("stickedMediaId", "");
    },*/
    chooseThread: function(id) {
      this.$set("activeThread", id);
      this.$set("messages", []);
      this.$set("newMessages", 0);
      this.$nextTick(function () {
        this.fetchThreadPosts();
      });
    },
    scrollChatbox: function() {
      var container = document.getElementById("chatboxMessages");
      if (this.threads[this.activeThread].unread_count == null) {
        container.scrollTop = container.scrollHeight;
      } else {
        container.scrollTop = document.getElementsByClassName("unreadBlock")[0].offsetTop;
      }
    },
    fetchUserThreads: function() {
      this.$http.get("/api/chat/threads").then((response) => {
        this.$set("threads", response.data);
        this.$nextTick(function () {
          this.fetchThreadPosts();
        });
      });
    },
    fetchThreadPosts: function() {
      this.$http.get("/api/chat/thread/" + this.threads[this.activeThread].id).then((response) => {
        this.$set("messages", response.data);
        this.$nextTick(function() {
          this.scrollChatbox();
          this.threads[this.activeThread].unread_count = null;
        });
      });
    },
    checkRegex: function(val) {
      var regex9gag = /(?:9gag:)(\w{7})(.*)/ig;
      var regexImgur = /(?:imgur:)(\w{5,8})(.*)/ig;
      //var regexSpotify = /(spotify:(?:track:|album:|playlist:)\w{22})(.*)/ig;
      //var regexYoutube = /(?:youtube:)(\w{11})(.*)/ig;

      var returned = [];

      if (regex9gag.test(val)) {
        returned.push("9gag");
        returned.push(regex9gag.exec(val.match(regex9gag)));
        return returned;
      } else if (regexImgur.test(val)) {
        returned.push("imgur");
        returned.push(regexImgur.exec(val.match(regexImgur)));
        return returned;
      }; /*else if (regexSpotify.test(val)) {
        returned.push("spotify");
        returned.push(regexSpotify.exec(val.match(regexSpotify)));
        return returned;
      } else if (regexYoutube.test(val)) {
        returned.push("youtube");
        returned.push(regexYoutube.exec(val.match(regexYoutube)));
        return returned;
      };*/

      return returned;
    },
  },
  filters: {
    moment: function(val) {
      return moment(val).format("HH:mm");
    },
    safe: function(val) {
      var entityMap = {
        "&": "&amp;",
        "'": "&#039;",
        "/": "&#x2F;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
      };
      return String(val).replace(/[&<>"'\/]/g, function (s) {
        return entityMap[s];
      });
    },
    formatted: function(val) {
      return val.replace(/(\*)(.*?)\1/ig, "<b>$2</b>");
    },
    emoji: function(val) {
      return emojione.shortnameToImage(val);
    },
  }
});

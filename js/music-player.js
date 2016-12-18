//GetMusic类

function MusicPlayer($container) {
    this.$container = $container;
    this.$channelsList = this.$container.find(".c-channels-list");
    this.channelId = "";
    this.song = {};
    this.$audio = $("#music");
    this.audio = this.$audio[0];
    this.$title = this.$container.find(".c-msg__title");
    this.$artist = this.$container.find(".c-msg__artist");
    this.$channel = this.$container.find(".c-msg__channel");
    this.channelName = "";
    this.$posterImg = this.$container.find(".c-poster__img");
    this.sid = null;
    this.lyric = "";
    this.lyricTimeArr = [];
    this.$lyricList = this.$container.find(".c-lyric__list");
    this.$playPause = this.$container.find(".c-control__play-pause");
    this.$next = this.$container.find(".c-control__next");
    this.$posterImg = this.$container.find(".c-poster__img");
    this.$lyricBtn = this.$container.find(".c-setting__lyric");
    this.$channelBtn = this.$container.find(".c-setting__channel");
    this.$curTime = this.$container.find(".c-progress__current-time");
    this.$totalTime = this.$container.find(".c-progress__total-time");

    this.$curBar = this.$container.find(".c-progress__curbar");
    this.$baseBar = this.$container.find(".c-progress__basebar");

    this.totalTime = "";
    this.curTime = "";

    this.volume = null;
    this.$volumeBtn = this.$container.find(".c-setting__volume");
    this.volume = this.audio.volume;
    this.$basicVolume = this.$container.find(".c-setting__basic-volume");
    this.$curVolume = this.$container.find(".c-setting__cur-volume");

    this.init();
    this.bind();

}

MusicPlayer.prototype.init = function () {
    this.getChannels();
    this.autoPlay();
}

MusicPlayer.prototype.bind = function () {
    this.changeLyric();
    this.playPause();
    this.nextSong();
    this.rotatePostImage();
    this.changeChannel();
    this.showLyric();
    this.showChannelsList();
    this.setTime();
    this.changeProgress();
    this.setMute();
    this.changeVolume();
}

MusicPlayer.prototype.getChannels = function () {
    var _this = this;
    this.$container.ready(function () {
        $.get('http://api.jirengu.com/fm/getChannels.php').done(function (data) {
            var channelsArr = JSON.parse(data).channels;
            for (var i = 0; i < channelsArr.length; i++) {
                var item = '<li data-channel_id=\"' + channelsArr[i].channel_id + '\" ' + 'data-channel_name=' + channelsArr[i].name + ' class=\"c-channels-list__item\">' + channelsArr[i].name + '</li>';
                _this.$channelsList.append(item);
            };
            $(".c-channels-list__item").first().addClass("c-channels-list__item--active");
            _this.channelId = channelsArr[0].channel_id;
            _this.channelName = channelsArr[0].name;
            _this.getSong();
        })
    });
}

MusicPlayer.prototype.getSong = function (str) {
    var _this = this;
    $.get('http://api.jirengu.com/fm/getSong.php', {
        channel: _this.channelId
    }).done(function (data) {
        _this.song = JSON.parse(data).song[0];
        _this.roadSong();

    });
}

MusicPlayer.prototype.roadSong = function () {
    this.audio.src = this.song.url;
    this.$title.text(this.song.title);
    this.$artist.text(this.song.artist);
    this.$channel.text("频道：" + this.channelName);
    this.$posterImg.css("background-image", "url(" + this.song.picture + ")");
    this.getLyric();
    this.audio.play();
    this.$playPause.removeClass("icon-play").addClass("icon-pause");
}

MusicPlayer.prototype.getLyric = function () {
    var _this = this;
    _this.sid = this.song.sid;
    $.post('http://api.jirengu.com/fm/getLyric.php', {
        sid: _this.sid
    }).done(function (data) {
        _this.lyric = JSON.parse(data).lyric;
        _this.loadLyric();
    });
}


MusicPlayer.prototype.loadLyric = function () {
    this.$lyricList.find("p").remove();
    this.lyricTimeArr = [];
    var lyricArr = this.lyric.split("\n");
    for (var i = 0; i < lyricArr.length; i++) {
        var lyricText = lyricArr[i].slice(10) || "---";
        var lyricRow = `<p class=\"c-lyric__item` + i + `\">` + lyricText + `</p>`;
        this.$lyricList.append(lyricRow);
        var lyricTime = Math.round(parseFloat(lyricArr[i].slice(1, 3)) * 60 + parseFloat(lyricArr[i].slice(4, 9)));
        this.lyricTimeArr.push(lyricTime);
    }

}

MusicPlayer.prototype.changeLyric = function () {
    var _this = this;
    this.$audio.on("timeupdate", function () {
        var time = Math.round(_this.audio.currentTime);
        for (var i = 0; i < _this.lyricTimeArr.length; i++) {
            if (time === _this.lyricTimeArr[i]) {
                $(".c-lyric__item" + i).siblings().removeClass("c-lyric__item--active");
                $(".c-lyric__item" + i).addClass("c-lyric__item--active");
                var top = 120 - i * 24;
                _this.$lyricList.animate({
                    top: top
                }, 400);
            }
        }
    });
}

MusicPlayer.prototype.playPause = function () {

    var _this = this;
    this.$playPause.on("click", function () {
        if (_this.audio.paused) {
            _this.audio.play();
            _this.$playPause.removeClass("icon-play").addClass("icon-pause");
        } else {
            _this.audio.pause();
            _this.$playPause.removeClass("icon-pause").addClass("icon-play");
        }
    });
}

MusicPlayer.prototype.nextSong = function () {
    var _this = this;
    this.$next.on("click", function () {
        _this.audio.pause();
        _this.$playPause.removeClass("icon-pause").addClass("icon-play");
        _this.getSong();
    });
}

MusicPlayer.prototype.rotatePostImage = function () {
    var _this = this;
    this.$audio.on("play", function () {
        _this.$posterImg.css("animation-play-state", "running");
    });
    this.$audio.on("pause", function () {
        _this.$posterImg.css("animation-play-state", "paused");
    });
}

MusicPlayer.prototype.autoPlay = function () {
    var _this = this;
    this.$audio.on("ended", function () {
        _this.getSong();
    });
}

MusicPlayer.prototype.changeChannel = function () {
    var _this = this;
    this.$channelsList.on("click", "li", function () {
        _this.audio.pause();
        _this.$playPause.removeClass("icon-pause").addClass("icon-play");
        $(this).siblings().removeClass("c-channels-list__item--active");
        $(this).addClass("c-channels-list__item--active");
        _this.channelId = $(this).attr("data-channel_id");
        _this.channelName = $(this).attr("data-channel_name");
        _this.getSong();
    });
}

MusicPlayer.prototype.showLyric = function () {
    var _this = this;
    this.$lyricBtn.on("click", function () {
        if (_this.$lyricList.css("display") !== "none") {
            _this.$lyricList.fadeOut();
        } else {
            _this.$lyricList.fadeIn();
        }
    });
}

MusicPlayer.prototype.showChannelsList = function () {
    var _this = this;
    this.$channelBtn.on("click", function (event) {
        event.stopPropagation();
        if (_this.$channelsList.css("display") !== "none") {
            _this.$channelsList.fadeOut();
            _this.$channelBtn.removeClass("icon-cross").addClass("icon-menu");
        } else {
            _this.$channelsList.fadeIn();
            _this.$channelBtn.removeClass("icon-menu").addClass("icon-cross");
        }
    });
    $("body").on("click", function () {
        _this.$channelsList.fadeOut();
        _this.$channelBtn.removeClass("icon-cross").addClass("icon-menu");
    });
}

MusicPlayer.prototype.setTime = function () {
    var _this = this;
    this.$audio.on("loadedmetadata", function () {
        _this.totalTime = _this.audio.duration;
        var text = _this.formatTime(_this.totalTime);
        _this.$totalTime.text(text);
    });
    setInterval(function () {
        _this.curTime = _this.audio.currentTime;
        var text = _this.formatTime(_this.curTime);
        _this.$curTime.text(text);
        var baseWidth = _this.$baseBar.width();
        var curWdth = baseWidth * _this.curTime / _this.totalTime;
        _this.$curBar.width(curWdth);
    }, 500);
}

MusicPlayer.prototype.formatTime = function (num) {
    var total = parseInt(num);
    var min = parseInt(total / 60);
    var sec = parseInt(total % 60);
    if (sec < 10) {
        sec = "0" + sec;
    };
    return min + " : " + sec;
}

MusicPlayer.prototype.changeProgress = function () {
    var _this = this;
    this.$baseBar.on("click", function (e) {
        var posX = e.clientX;
        var offsetLeft = $(this).offset().left;
        var target = posX - offsetLeft;
        _this.audio.currentTime = _this.totalTime * target / _this.$baseBar.width();
        _this.$curBar.width(target);
    });
}

MusicPlayer.prototype.setMute = function () {
    var _this = this;
    this.$volumeBtn.on("click", function () {
        if (_this.audio.volume) {
            _this.audio.volume = 0;
            _this.$volumeBtn.removeClass("icon-volume").addClass("icon-mute");
        } else {
            _this.audio.volume = _this.volume;
            _this.$volumeBtn.removeClass("icon-mute").addClass("icon-volume");
        }
    });
}

MusicPlayer.prototype.changeVolume = function () {
    var _this = this;
    this.$curVolume.width(_this.audio.volume * 100 + "%");
    this.$basicVolume.on("click", function (e) {
        var posX = e.clientX;
        var offsetLeft = $(this).offset().left;
        var target = posX - offsetLeft;
        _this.audio.volume = 1 * target / _this.$basicVolume.width();
        _this.volume = _this.audio.volume;
        _this.$curVolume.width(target);
    });

}
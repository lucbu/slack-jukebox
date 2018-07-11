var BaseSound = require('./BaseSound.js'),
    inherits = require('util').inherits,
    fs = require('fs'),
    config = require('../config.js'),
    ytdl = require('ytdl-core');

var spawn = require('child_process').spawn;

function YoutubeSound(url) {
    // console.log('Create youtube sound')
    this.mountpoint = config.dl_folder;
    BaseSound.call(this, url);
    this.ytdlOpts = { filter: 'audioonly'};
}

inherits(YoutubeSound, BaseSound);

YoutubeSound.prototype.checkAndSetUrl = function(url) {
    var pattern = new RegExp(/^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be|youtube\.fr))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/);
    var match = url.match(pattern);

    if (match === null) {
        throw new Error('The url is invalid');
    }

    var is_error = false;

    ytdl.getInfo(url, this.ytdlOpts, function(err, infos) {
        if ('undefined' === typeof infos) {
            is_error = true;
        }
    });

    if (is_error) {
        throw new Error('The url is invalid');
    }

    this.url = url;
    this.basename = "youtube-" + match[5] + "-" + new Date().getTime() + ".mp4";
    this.filename = this.mountpoint + this.basename;
};

YoutubeSound.prototype.downloadFile = function(cb) {
    var file = this.filename;
    var sound = this;

    console.log('### Start downloading "'+ file +'" from "' + this.url + '"');
    sound.file = file;

     ytdl.getInfo(this.url, this.ytdlOpts, function(err, infos) {
         if (err) {
             console.log(err);
         } else {
             if (typeof infos !== "undefined") {
                 sound.title = infos.title;

                 if (!isNaN(infos.length_seconds)) {
                     sound.length = parseInt(infos.length_seconds);
                 }
             }
         }
    });

    if (this.timeRange == null) {
        console.log('Without timeRange');
        this.downloading = ytdl(this.url, this.ytdlOpts);

        this.downloading
            .pipe(fs.createWriteStream(file))
            .on('finish', function(test) {
                console.log('### End downloading ' + file);
            })
        ;

        if ('undefined' !== typeof cb) {
            setTimeout(cb, 5000);
        }
    } else {
        console.log('With timeRange');
        var self = this;
        var timeRange = this.parseTimeRange();
        console.log(timeRange);

        this.downloading = ytdl(this.url, this.ytdlOpts);

        var tmpFile = file + '_tmp';

        this.downloading
            .pipe(fs.createWriteStream(tmpFile))
            .on('finish', function(test) {
                console.log('### End downloading ' + tmpFile);

                var ffmpeg = spawn('ffmpeg', [
                    '-i',
                    tmpFile,
                    '-acodec',
                    config.samples_codec,
                    '-ss',
                    timeRange.start,
                    '-t',
                    timeRange.delta,
                    '-strict',
                    '-2',
                    '-f',
                    'mp4',
                    file,
                    '-y'
                ], { shell: true });

                ffmpeg.on('error', function(err) { console.log('*FFMPEGError'); console.log(err); });
                ffmpeg.on('close', function(close) { console.log('*FFMPEGClose'); console.log(close); });
                ffmpeg.on('disconnect', function(disconnect) { console.log('*FFMPEGDisconnect'); console.log(disconnect); });
                ffmpeg.on('exit', function(code) {
                    fs.unlink(tmpFile, cb);
                });
            })
        ;
    }
};

YoutubeSound.prototype.deleteFile = function() {
    var file = this.file;

    if ('undefined' !== typeof this.downloading) {
        this.downloading.destroy();
    }

    fs.unlink(this.file, function() {console.log(file + " => deleted")});
};



module.exports = YoutubeSound;

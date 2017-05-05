var BaseSound = require('./BaseSound.js'),
    inherits = require('util').inherits,
    fs = require('fs'),
    config = require('../config.js'),
    ytdl = require('ytdl-core');

function YoutubeSound(url) {
    // console.log('Create youtube sound')
    BaseSound.call(this, url);
    this.filter = { filter: 'audioonly'};
}

inherits(YoutubeSound, BaseSound);

YoutubeSound.prototype.checkAndSetUrl = function(url) {
  var pattern = new RegExp(/^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be|youtube\.fr))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/);
  var match = url.match(pattern)
  if (match === null){
    throw new Error('The Url is not good');
  }
  this.url = url;
  this.filename = config.dl_folder + "/youtube-" + match[5] + "-" + new Date().getTime() + ".mp4";
}

YoutubeSound.prototype.downloadFile = function(cb) {
    var file = this.filename;
    var sound = this;
    console.log('### Start downloading "'+ file +'" from "' + this.url + '"');
    sound.file = file;
    var sound = this;
    ytdl.getInfo(this.url, this.filter, function(a, b){
        sound.title = b.title;
          if(!isNaN(b.length_seconds)){
            sound.length = parseInt(b.length_seconds);
        }
    })
    this.downloading = ytdl(this.url, this.filter);
    this.downloading.pipe(fs.createWriteStream(file))
    .on('finish', function(test) {
      console.log('### End downloading ' + file);
    });
    if('undefined' !== typeof cb) {
      setTimeout(cb, 5000);
    }
}

YoutubeSound.prototype.deleteFile = function(){
  var file = this.file;
  if('undefined' !== typeof this.downloading){
    this.downloading.destroy();
  }
  fs.unlink(this.file, function(){console.log(file + " => deleted")});
}



module.exports = YoutubeSound;

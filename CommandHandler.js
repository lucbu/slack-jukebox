var YoutubeSound = require('./sound/YoutubeSound.js');
var PlaylistItem = require('./playlist/PlaylistItem.js');

function CommandHandler(playlist) {
  this.playlist = playlist;
  this.url_regex = {
    youtube: new RegExp(/^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be|youtube\.fr))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/)
  };
}

CommandHandler.prototype.addLike = function (playlist_item) {
    playlist_item.like = playlist_item.like + 1;
};

CommandHandler.prototype.removeLike = function (playlist_item) {
  if(playlist_item.like > 0){
    playlist_item.like = playlist_item.like - 1;
  }
};

CommandHandler.prototype.addDislike = function (playlist_item) {
    playlist_item.dislike = playlist_item.dislike + 1;
};

CommandHandler.prototype.removeDislike = function (playlist_item) {
  if(playlist_item.dislike > 0){
    playlist_item.dislike = playlist_item.dislike - 1;
  }
};

CommandHandler.prototype.playNext = function(){
  this.playlist.playNext(true);
}

CommandHandler.prototype.addUrlToPlaylist = function (url, provider, user_id, endPlaying) {
  var sound = undefined;
  if(url.match(this.url_regex['youtube']) !== null){
    var sound = new YoutubeSound(url);
  }
  if('undefined' !== typeof sound) {
    var item = new PlaylistItem(sound, provider, user_id, endPlaying);
    this.playlist.addToQueue(item);
    return item;
  }
  return null;
};

CommandHandler.prototype.deleteFromPlaylist = function(item, cb) {
  var index = this.playlist.queue.indexOf(item);
  if (index > -1) {
      this.playlist.queue.splice(index, 1);
      if('undefined' !== cb){
        cb()
      }
  }
}

module.exports = CommandHandler;

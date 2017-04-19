var os = require('os');

function Playlist(player) {
//  console.log('Create Playlist');
    this.player = player;
    this.queue = [];
    this.playing = undefined;
}

Playlist.prototype.addToQueue = function (playlist_item, cb) {
  this.queue.push(playlist_item);
  if(this.queue.length == 1){
    this.playNext();
  } else {
    playlist_item.sound.downloadFile();
  }
}

Playlist.prototype.playNext = function(force){
  if('undefined' === typeof force){
    force=false;
  }
  if(force){
    this.queue.shift();
    var isWin = /^win/.test(os.platform());
    if(!isWin) {
        this.player.audio.kill('SIGKILL');
    } else {
        var cp = require('child_process');
        cp.exec('taskkill /PID ' + this.player.audio.pid + ' /T /F', function (error, stdout, stderr) {});
    }
    this.player.status = 'offair'
  }
  var playlist = this;
  var next = this.queue[0];
  this.playing = undefined;
  if('undefined' !== typeof next){
    if(next.like >= next.dislike){
      this.playing = next;
      this.player.playSound(next.sound, function(){
        playlist.queue.shift();
        next.sound.deleteFile();
        if('undefined' !== next.endPlaying){
          next.endPlaying()
        }
        playlist.playNext();
      });
    } else {
      this.queue.shift();
      next.sound.deleteFile();
      this.playNext();
    }
  }
}

module.exports = Playlist;

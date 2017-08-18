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
        if('undefined' !== typeof this.player.audio){
            console.log('lol');
            this.player.audio.stdin.write('quit' + os.EOL);
        }
        this.player.status = 'offair'
    } else{
        var playlist = this;
        var next = this.queue[0];
        if('undefined' !== typeof next){
            if(next.like >= next.dislike){
                this.playing = next;
                this.player.playSound(next.sound, function(){
                    playlist.queue.shift();
                    next.sound.deleteFile();
                    if('undefined' !== next.endPlaying){
                        next.endPlaying()
                    }
                    this.playing = undefined;
                    playlist.playNext();
                });
            } else {
                this.queue.shift();
                next.sound.deleteFile();
                this.playNext();
            }
        }
    }
}

Playlist.prototype.totalLength = function(){
    var total_length = 0;
    for (var i in this.queue) {
        item = this.queue[i]
        total_length += item.sound.length;
    }
    return total_length;
}

module.exports = Playlist;

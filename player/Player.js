var spawn = require('child_process').spawn;

function Player() {
//  console.log('Create Player');
  this.status = 'offair';
  this.play = require('play-sound')(opts = {player: 'vlc'});
  audio = undefined;
}

// Get the sound to play (Download it if not already done)
Player.prototype.playSound = function(sound, cb) {
  var player = this;
  if(this.status != 'onair'){
    sound.getFile(function(){
      console.log('Start music "' + sound.title + '"');
      player.status = 'onair';
      console.log(sound.filename)
      player.audio = spawn('vlc', [sound.filename, '-I dummy', '--play-and-exit']);
      player.audio.on('exit', function(code){
          console.log('End music ' + sound.filename);
          player.status = 'offair'
          if('undefined' !== typeof cb) {
              cb();
          }
    });
  })
  }
}

module.exports = Player;

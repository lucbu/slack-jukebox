var spawn = require('child_process').spawn;

function Player() {
//  console.log('Create Player');
    this.status = 'offair';
    audio = undefined;
}

// Get the sound to play (Download it if not already done)
Player.prototype.playSound = function(sound, cb) {
    var player = this;

    if (this.status !== 'onair') {
        sound.getFile(function() {
            console.log('Start music "' + sound.title + '"');

            player.status = 'onair';

            console.log(sound.filename);

            player.audio = spawn('/Applications/VLC.app/Contents/MacOS/VLC', [sound.filename, '--intf' ,'rc', '--play-and-exit']);

            player.audio.on('exit', function(code) {
                console.log('End music ' + sound.filename);

                delete player.audio;

                player.status = 'offair';

                if ('undefined' !== typeof cb) {
                    cb();
                }
            });
        });
    }
};

module.exports = Player;

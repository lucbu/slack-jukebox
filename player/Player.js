var spawn = require('child_process').spawn;
var os = require('os');

function Player() {
//  console.log('Create Player');
    this.status = 'offair';
    audio = undefined;
}

const VLC_PATH = os.platform() == 'darwin' ? '/Applications/VLC.app/Contents/MacOS/VLC' : 'vlc';

// Get the sound to play (Download it if not already done)
Player.prototype.playSound = function(sound, cb) {
    var player = this;
    console.log("Play sound...");
    if (this.status !== 'onair') {
        sound.getFile(function() {
            console.log('Start music "' + sound.title + '"');

            player.status = 'onair';

            console.log(sound.filename);

	    console.log(VLC_PATH, [sound.filename, '--intf' ,'rc', '--play-and-exit']);
            player.audio = spawn(VLC_PATH, [sound.filename, '--intf' ,'rc', '--play-and-exit']);
	        player.audio.on('error', function(err) { console.log('*PlayerError'); console.log(err); });
            player.audio.on('close', function(close) { console.log('*PlayerClose'); console.log(close); });
	        player.audio.on('disconnect', function(disconnect) { console.log('*PlayerDisconnect'); console.log(disconnect); });
            player.audio.on('exit', function(code) {
                console.log('*PlayerExit');
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

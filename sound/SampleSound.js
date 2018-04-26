var BaseSound = require('./BaseSound.js');
var SampleManager = require('../SampleManager.js');
var inherits = require('util').inherits;

function SampleSound(url, sampleId) {
    // console.log('Create sample sound')
    BaseSound.call(this, url);
    this.title = sampleId;
    this.filter = { filter: 'audioonly'};
}

inherits(SampleSound, BaseSound);

SampleSound.prototype.checkAndSetUrl = function(filename) {
    this.url = filename;
    this.filename = filename;
};

SampleSound.prototype.downloadFile = function(cb) {
    cb();
};

SampleSound.prototype.deleteFile = function() {

};


module.exports = SampleSound;

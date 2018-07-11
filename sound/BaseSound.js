function BaseSound(url) {
    this.file = undefined;
    this.filename = undefined;
    this.url = undefined;
    this.title = undefined;
    this.length = 0;
    this.checkAndSetUrl(url);
    this.downloading = undefined;
    this.timeRange = null;
}

BaseSound.prototype.parseTimeRange = function() {
    var start = this.timeRange.start.split(':');
    var startMins = parseInt(start[0]);
    var startSecs = parseInt(start[1]);

    var startInt = startSecs;

    if (startMins != 0)  {
        startInt += 60 * startMins;
    }

    var end = this.timeRange.end.split(':');
    var endMins = parseInt(end[0]);
    var endSecs = parseInt(end[1]);

    var endInt = endSecs;

    if (endMins != 0)  {
        endInt += 60 * endMins;
    }

    return {start: startInt, end: endInt, delta: endInt - startInt};
};

BaseSound.prototype.checkAndSetUrl = function () {
    throw new Error('Implement BaseSound.checkUrl')
};

BaseSound.prototype.downloadFile = function () {
    throw new Error('Implement BaseSound.downloadFile');
};

BaseSound.prototype.getFile = function (cb) {
    if ('undefined' === typeof this.file) {
        this.downloadFile(cb);
    } else {
        setTimeout(cb, 5000);
    }
};

module.exports = BaseSound;

const config = require('./config');
const fs = require('fs');

var findSampleByFullname = function(fullname, cb) {
    fs.exists(fullname, function() {
        cb(fullname);
    });
};
var findSampleById = function(sampleId, cb) {
    fs.exists(config.samples_folder + sampleId, function() {
        cb(config.samples_folder + sampleId);
    });
};

var listSamples = function(callback) {
    fs.readdir(config.samples_folder, function(err, files) {
        callback(files);
    });
};

var deleteSampleByFullname = function(fullname, cb) {
    findSampleByFullname(fullname, cb)
};

module.exports = {
    deleteSampleByFullname: deleteSampleByFullname,
    findSampleById: findSampleById,
    listSamples: listSamples
};

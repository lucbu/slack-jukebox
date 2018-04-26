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
    findSampleByFullname(fullname, function() {
        fs.unlink(fullname, cb);
    });
};

var deleteSampleById = function(sampleId, cb) {
    findSampleById(sampleId, function(fullname) {
        fs.unlink(fullname, cb);
    });
};

module.exports = {
    deleteSampleByFullname: deleteSampleByFullname,
    deleteSampleById: deleteSampleById,
    findSampleByFullname: findSampleByFullname,
    findSampleById: findSampleById,
    listSamples: listSamples
};

'use strict';

var processCpuTotal = require('./metrics/processCpuTotal');
var processStartTime = require('./metrics/processStartTime');
var osMemoryHeap = require('./metrics/osMemoryHeap');
var processOpenFileDescriptors = require('./metrics/processOpenFileDescriptors');
var processMaxFileDescriptors = require('./metrics/processMaxFileDescriptors');
var eventLoopLag = require('./metrics/eventLoopLag');
var processHandles = require('./metrics/processHandles');
var processRequests = require('./metrics/processRequests');
var gcStats = require('./metrics/gcStats');

var metrics = {
    processCpuTotal: processCpuTotal,
    processStartTime: processStartTime,
    osMemoryHeap: osMemoryHeap,
    processOpenFileDescriptors: processOpenFileDescriptors,
    processMaxFileDescriptors: processMaxFileDescriptors,
    eventLoopLag: eventLoopLag,
    processHandles: processHandles,
    processRequests: processRequests,
    gcStats: gcStats
};

var existingInterval = null;

module.exports = function startDefaultMetrics (disabledMetrics, interval) {
    if(existingInterval !== null) {
        clearInterval(existingInterval);
    }

    disabledMetrics = disabledMetrics || [];
    interval = interval || 10000;

    var metricsInUse = Object.keys(metrics)
        .filter(function (metric) {
            return disabledMetrics.indexOf(metric) < 0;
        })
        .map(function (metric) {
            return metrics[metric]();
        });

    function updateAllMetrics () {
        metricsInUse.forEach(function (metric) {
            metric.call();
        });
    }

    updateAllMetrics();

    existingInterval = setInterval(updateAllMetrics, interval).unref();

    return existingInterval;
};

module.exports.metricsList = Object.keys(metrics);

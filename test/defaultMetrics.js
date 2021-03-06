'use strict';

var optional = require('optional');

describe('defaultMetrics', function() {
	var expect = require('chai').expect;
	var register = require('../index').register;
	var defaultMetrics = require('../index').defaultMetrics;
	var platform;
	var cpuUsage;
	var interval;

	before(function () {
		platform = process.platform;
		cpuUsage = process.cpuUsage;

		Object.defineProperty(process, 'platform', {
			value: 'my-bogus-platform'
		});

		if(cpuUsage) {
			Object.defineProperty(process, 'cpuUsage', {
				value: function () {
					return { user: 1000, system: 10 };
				}
			});
		} else {
			process.cpuUsage = function () {
				return { user: 1000, system: 10 };
			};
		}

		register.clear();
	});

	after(function () {
		Object.defineProperty(process, 'platform', {
			value: platform
		});

		if(cpuUsage) {
			Object.defineProperty(process, 'cpuUsage', {
				value: cpuUsage
			});
		} else {
			delete process.cpuUsage;
		}
	});

	afterEach(function() {
		register.clear();
		clearInterval(interval);
	});

	it('should add metrics to the registry', function() {
		expect(register.getMetricsAsJSON()).to.have.length(0);
		interval = defaultMetrics();

    var gc = optional('gc-stats');
    if(typeof gc === 'function') {
      expect(register.getMetricsAsJSON()).to.have.length(13);
    } else {
      expect(register.getMetricsAsJSON()).to.have.length(10);
    };
	});

	it('should allow blacklisting unwanted metrics', function() {
		expect(register.getMetricsAsJSON()).to.have.length(0);
		interval = defaultMetrics(['osMemoryHeap']);

    var gc = optional('gc-stats');
    if(typeof gc === 'function') {
      expect(register.getMetricsAsJSON()).to.have.length(8);
    } else {
      expect(register.getMetricsAsJSON()).to.have.length(5);
    };
	});

	it('should allow blacklisting all metrics', function() {
		expect(register.getMetricsAsJSON()).to.have.length(0);
		clearInterval(defaultMetrics());
		register.clear();
		expect(register.getMetricsAsJSON()).to.have.length(0);
	});
});

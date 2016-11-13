//< needs(dojo)

define(["dojo/_base/declare","dijit/_WidgetBase", "dijit/_TemplatedMixin", "dijit/_WidgetsInTemplateMixin",
	"dojox/charting/Chart", "dojox/charting/themes/Claro",
	"dojo/store/JsonRest", "dojo/store/Observable",
	"dojox/charting/StoreSeries",
	"dojo/text!./plot/plot.html",
	"dojo/on", "dojo/dom-geometry",
	"dojox/charting/plot2d/Lines", "dojox/charting/axis2d/Default", "dijit/form/ToggleButton",
	"dojo/domReady!"],
    function(declare, WidgetBase, TemplatedMixin, WidgetsInTemplateMixin,
    		Chart, Claro, JsonRest, Observable, StoreSeries, template,
    		On, DomGeom) {
        return declare("plot", [WidgetBase, TemplatedMixin, WidgetsInTemplateMixin], {
        	sensorId: "",
        	name: "",
        	currentValue : "?",
        	unitOfMeasure: "",
        	interval: "/minute",
        	updateCurrentValue: true,
        	templateString: template,
        	baseClass: "plot",
        	steps: {'' : 5, '/minute': 120, '/hour': 3600, '/day': 3600*12 },
        	chart: null,
        	store: null,
        	chartInterval: null,
        	currInterval: null,
        	postCreate: function(){
        		this.inherited(arguments);
        		
	        	this.updateButtons();
	        	this.draw();
	        	this.setTimers();
	        	if (!this.sensorId)
	        		return;
	        	this.createStore();
	        	this.updateChart();
	        	this.initCurrValue();
        	},
        	setTimers: function() {
	        	var ths = this;
				On(this.nowButton, "click", function() {ths.set('interval', '');});
				On(this.minuteButton, "click", function() {ths.set('interval', '/minute');});
				On(this.hourButton, "click", function() {ths.set("interval", '/hour');});
				On(this.dayButton, "click", function() {ths.set("interval", '/day');});

	        	this.chartInterval = setInterval(function() {
	        			if (ths.store)
	        				ths.store.query("?last").forEach(function (res) {
	        					ths.store.notify(res);
	        				});
	        		}, 30000);
	        	if (this.updateCurrentValue)
	        		this.currInterval = setInterval(function(){ths.initCurrValue()}, 5000);
	        },
	        updateButtons: function() {
        		this.nowButton.set('checked', this.interval == '');
        		this.minuteButton.set('checked', this.interval == '/minute');
        		this.hourButton.set('checked', this.interval == '/hour');
        		this.dayButton.set('checked', this.interval == '/day');
	        },
	        _setSensorIdAttr: function(id) {
	        	if (this.sensorId == id)
	        		return;
	        	this._set("sensorId", id);
	        	this.initCurrValue();
	        	this.createStore();
	        	this.updateChart();
	        },
	        _setIntervalAttr: function (value) {
	        	if (this.interval == value)
	        		return;
	        	this._set("interval", value);
	        	this.updateButtons();
	        	this.createStore();
	        	this.updateChart();
	        },
	        _setNameAttr: function(value) {
	        	this._set("name", value);
				this.nameNode.innerHTML = value;
	        },
	        _setCurrentValueAttr: function(value) {
	        	this._set("currentValue", value);
				this.valueNode.innerHTML = value;
	        },
	        _setUnitOfMeasureAttr: function(value) {
	        	this._set("unitOfMeasure", value);
				this.unitNode.innerHTML = this.unitOfMeasure;
	        },
	        createStore: function() {
	        	this.store = Observable(new JsonRest({
	        		target: "sensor/" + this.sensorId + "/value" + this.interval,
	        		idProperty: "time"
	        	}));
	        },
	        updateChart: function() {
	        	this.chart.removeAxis("x");
	        	var step = this.steps[this.interval] * 1000;
	        	var addDay = this.interval != '/minute' && this.interval != '';
	        	this.chart.addAxis("x", { fixUpper: "major", majorTickStep: step*10, minorTickStep: step,
	        		labelFunc: function(text, value, precision) {
	        			var date = new Date(value);
	        			var res = '';
	        			if (addDay) {
	        				var d = date.getDate(); if (d < 9) res += '0';
	        				res += d + ' ';
	        			}
	        			var h = date.getHours(); if (h <9) h = '0' + h;
	        			var m = date.getMinutes(); if (m <9) m = '0' + m;
	        			return res + h + ':' + m;
	        		}
	        	});
	        	this.chart.removeSeries("Values");
				this.chart.addSeries("Values",
					new StoreSeries(this.store, {}, function (item, store) {
						return { x: new Date(item["time"]).getTime(), y: item["value"] };
					}));
	        	this.chart.render();
	        },
	        draw: function () {
	        	this.chart = new Chart(this.chartNode);
	        	this.chart.setTheme(Claro);
	        	this.chart.addPlot("default", {
	        		type: "Lines",
	        		markers: false, hAxis: "x", vAxis: "y"
	        	});
	        	this.chart.addAxis("y", {fixUpper: "major", fixLower: "major", minorLabels: false, vertical: true, fixed: true, includeZero: true});
	        },
	        initCurrValue: function () {
	        	if (!this.sensorId)
	        		return;
	        	if (!this.updateCurrentValue)
	        		return;
	        	var curStore = new JsonRest({target: "sensor/" + this.sensorId + "/value"});
	        	var ths = this;
    			curStore.query("?last").forEach(function (res) {
    				ths.set("currentValue", res.value);
				});
	        },
	        startup: function() {
	        	this.inherited(arguments);
	        	this.resize();
	        },
        	resize: function(w) {
	        	if (!this.chart)
	        		return;
	        	
	        	var chartBox = DomGeom.getMarginBox(this.chartNode);
	        	var buttinsBox = DomGeom.getMarginBox(this.buttonsNode);
	        	var h = w ? w.h - buttinsBox.h : chartBox.h;
	        	this.chart.resize({w : buttinsBox.w, h: h});
        	},
        	uninitialize: function() {
        		this.inherited(arguments);
        		clearInterval(this.chartInterval);
        		clearInterval(this.currInterval);
        	}
        });
    }
);

webpackJsonp([1],[
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var date = __webpack_require__(2);

	__webpack_require__(1);

	var DAY_STEP = 1;
	var MAX_HOUR = 23;
	var HOUR_STEP = 1;
	var MAX_MINUTE = 50;
	var MINUTE_STEP = 10;

	(function (gmu, $, undefined) {
		gmu.define('timePicker', {
			options: {
				title: '选择出行时间',
				delay: 15,
				day: {
					len: 7,
					filter: [],
					format: 'M月d日'
				}
			},
			_create: function () {
				this.selectedDayIndex = 0;
				this.selectedHourIndex = 0;
				this.selectedMinuteIndex = 0;

				this.days = [];
				this.hours = [];
				this.minutes = [];
			},
			_init: function () {

				this._initDays();

				var now = +new Date;
				var minTime = new Date(now + this._options.delay * date.MINUTE_TIMESTAMP);
				var beginHour = minTime.getHours();
				this._initHours(beginHour);

				this.$picker = this.$el.picker({
					data: [this.days, this.hours, this.minutes],
					title: this._options.title
				});

				this._bindEvent();
			},
			_initDays: function () {
				this.days = this._genDays();
			},
			_genDays: function () {
				var days = [];
				var dayConf = this._options.day;
				var zeroTimestamp = +date.getZeroDate(new Date());

				var format = dayConf.format;
				for (var i = 0; i < dayConf.len; i += DAY_STEP) {
					var timestamp = zeroTimestamp + i * date.DAY_TIMESTAMP;

					if (dayConf.filter && i < dayConf.filter.length) {
						days.push({
							value: timestamp,
							text: dayConf.filter[i]
						});
					} else {
						days.push({
							value: timestamp,
							text: date.format(new Date(timestamp), format)
						});
					}
				}
				return days;
			},
			_initHours: function (begin) {
				this.hours = this._genHours(begin);
			},
			_genHours: function (begin) {
				var hours = [];
				if (this.selectedDayIndex === 0) {
					hours.push({
						value: 'now',
						text: '现在'
					});
				}
				for (var i = begin; i <= MAX_HOUR; i += HOUR_STEP) {
					hours.push({
						value: i,
						text: i + '点'
					});
				}
				return hours;
			},
			_initMinutes: function (begin) {
				if (begin === false) {
					this.minutes = [];
				} else {
					this.minutes = this._genMinutes(begin);
				}
			},
			_genMinutes: function (begin) {
				var minutes = [];
				begin = begin % 60;
				for (var i = begin; i <= MAX_MINUTE; i += MINUTE_STEP) {
					minutes.push({
						value: i,
						text: this._formatNum(i) + '分'
					});
				}
				return minutes;
			},
			_formatNum: function (num) {
				return (('' + num).length > 1 ? num : ('0' + num))
			},
			_bindEvent: function () {
				var me = this;
				this.$picker.on('picker.select', function (e, selectedVal, selectedIndex) {
					me.selectedDayIndex = selectedIndex[0];
					me.selectedHourIndex = selectedIndex[1];
					me.selectedMinuteIndex = selectedIndex[2];

					var select = getSelect();
					me.trigger('timePicker.select', select.selectedTime, select.selectedText);
				});

				this.$picker.on('picker.cancel', function () {
					me.trigger('timePicker.cancel');
				});

				this.$picker.on('picker.change', function (e, index, selectedIndex) {
					var now = +new Date;
					var minTime = new Date(now + me._options.delay * date.MINUTE_TIMESTAMP);
					//day change
					if (index === 0) {
						me.selectedDayIndex = selectedIndex;
						me._handleHourAndMinute(minTime);
					}
					//hour change
					else if (index === 1) {
						me.selectedHourIndex = selectedIndex;
						me._handleMinute(minTime);
					} else {
						me.selectedMinuteIndex = selectedIndex;
					}

					var select = getSelect();
					me.trigger('timePicker.change', select.selectedTime, select.selectedText);
				});

				function getSelect() {
					var selectedTime;
					var selectedText;
					if (me.selectedDayIndex === 0 && me.selectedHourIndex === 0) {
						selectedTime = +new Date;
						selectedText = me.hours[0].text;
					} else {
						selectedTime = me.days[me.selectedDayIndex].value +
							me.hours[me.selectedHourIndex].value * date.HOUR_TIMESTAMP +
							me.minutes[me.selectedMinuteIndex].value * date.MINUTE_TIMESTAMP;
						selectedText = me.days[me.selectedDayIndex].text + ' ' +
							me.hours[me.selectedHourIndex].text + ':' +
							me.minutes[me.selectedMinuteIndex].text;
					}

					return {
						selectedTime: selectedTime,
						selectedText: selectedText
					};
				}
			},
			_roundMinute: function (minute) {
				return Math.ceil(minute / MINUTE_STEP) * MINUTE_STEP
			},
			_handleHourAndMinute: function (minTime) {
				var beginHour = 0;
				var beginMinute = 0;
				if (this.days[this.selectedDayIndex].value - +minTime < 0) {
					//more than one day
					if (this.days[this.selectedDayIndex].value - +minTime < -date.DAY_TIMESTAMP) {
						beginHour = 24;
					} else {
						beginHour = minTime.getHours();
						if (minTime.getMinutes() > 51) {
							beginHour += 1;
						}
					}

					this._initHours(beginHour);
					var dist = this.$picker.picker('refill', this.hours, 1);
					this.selectedHourIndex = dist;
					var distHour = this.hours[dist].value;
					if (distHour === beginHour) {
						beginMinute = this._roundMinute(minTime.getMinutes());
					}
					//today now
					if (this.selectedDayIndex === 0 && dist === 0) {
						beginMinute = false;
					}
					this._initMinutes(beginMinute);
					this.selectedMinuteIndex = this.$picker.picker('refill', this.minutes, 2);
				} else {
					this._initHours(beginHour);
					this.selectedHourIndex = this.$picker.picker('refill', this.hours, 1);
					this._initMinutes(beginMinute);
					this.selectedMinuteIndex = this.$picker.picker('refill', this.minutes, 2);
				}
			},
			_handleMinute: function (minTime) {
				if (this.days[this.selectedDayIndex].value - +minTime < 0) {
					var beginMinute = 0;
					var beginHour = minTime.getHours();
					if (this.hours[this.selectedHourIndex].value === beginHour) {
						beginMinute = this._roundMinute(minTime.getMinutes());
					}
					//today now
					if (this.selectedDayIndex === 0 && this.selectedHourIndex === 0) {
						beginMinute = false;
					}
					this._initMinutes(beginMinute);
					this.selectedMinuteIndex = this.$picker.picker('refill', this.minutes, 2);
				}
			},
			show: function () {
				this.$picker.picker('show', function () {
					var now = +new Date;
					var minTime = new Date(now + this._options.delay * date.MINUTE_TIMESTAMP);

					this._initDays();
					//this.$picker.picker(this.days, 0);
					this._handleHourAndMinute(minTime);

				}.bind(this));
			}
		});
	})
	(gmu, gmu.$);

/***/ }
]);
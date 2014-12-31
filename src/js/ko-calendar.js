(function() {

	var binding = 'calendar';

	var Model = function(params) {
		var self = this;

		self.opts = {
			value: ko.observable(),
			current: new Date(),
			selected: null,
			deselectable: true,

			showCalendar: true,
			showToday: true,

			showTime: true,
			showNow: true,
			militaryTime: false
		};

		ko.utils.extend(self.opts, params);

		if(!self.opts.calendar && !self.opts.showTime) {
			console.error('Silly goose, what are you using ko-calendar for?');
			return;
		}

		self.strings = {
			months: [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ],
			days: [ "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" ],
			time: ["AM", "PM"]
		};

		self.constants = {
			daysInWeek: 7,
			dayStringLength: 2
		};

		self.utils = {
			date: {

				/**
				 * Takes a given date and sets the time to midnight
				 * @param  {Date} d The date object to normalize
				 * @return {Date}   The normalized date
				 */
				normalize: function(d) {
					var normalized = new Date(d.getTime());
					normalized.setUTCHours(0, 0, 0);
					return normalized;
				},

				/**
				 * Checks if two date objects are on the same day
				 * @param  {Date}  d1 The first date
				 * @param  {Date}  d2 The second date
				 * @return {Boolean}    Whether or not the dates share the same day
				 */
				isSame: function(d1, d2) {
					if(!d1 || !d2) { return false; }
					return (
						(d1.getUTCMonth() == d2.getUTCMonth()) &&
						(d1.getUTCDate() == d2.getUTCDate()) &&
						(d1.getUTCFullYear() == d2.getUTCFullYear())
					);
				},

				/**
				 * Checks if the two date objects have different months
				 * @param  {Date}  d1 The first date
				 * @param  {Date}  d2 The second date
				 * @return {Boolean}    Whether or not the dates share the same month
				 */
				isSameMonth: function(d1, d2) {
					if(!d1 || !d2) { return false; }
					return d1.getUTCMonth() == d2.getUTCMonth();
				},

				/**
				 * Checks if the given date falls on the weekend (Saturday or Sunday)
				 * @param  {Date}  d The date to check
				 * @return {Boolean}   Whether or not the date falls on a weekend
				 */
				isWeekend: function(d) {
					if(!d) { return false; }
					return d.getUTCDay() === 0 || (d.getUTCDay() == self.constants.daysInWeek - 1);
				}
			},
			strings: {
				pad: function(n) {
					return n < 10 ? "0" + n : n;
				}
			}
		};

		// Date Alias Helpers
		self.current = ko.observable(self.opts.current || new Date()); // The current Date
		self.selected = ko.observable(self.opts.selected); // The selected Date
		self.selected.subscribe(self.opts.value);
		self.opts.value(self.opts.selected);

		self.calendar = {

			// Selects a date
			select: function(data, e) {
				if( self.opts.deselectable && self.utils.date.isSame(self.selected(), data) ) {
					return self.selected(null);
				}
				self.selected(data);
			},
			selectToday: function(data, e) {
				var d = self.utils.date.normalize(new Date());
				self.selected(d);
				self.current(d);
			},
			next: function() {
				self.current(
					new Date( self.current().setUTCMonth(self.current().getUTCMonth()+1) )
				);
			},
			prev: function() {
				self.current(
					new Date( self.current().setUTCMonth(self.current().getUTCMonth()-1) )
				);
			},
			sheet: ko.computed(function() {

				// Current month set to the first day
				var normalized = self.utils.date.normalize(self.current());
				normalized.setUTCDate(1);
				normalized.setUTCDate(normalized.getUTCDate() - normalized.getUTCDay()); // Set our date to the first day of the week from the normalized month

				var weeks = [];
				var week = 0;
				var startedMonth = false;
				var completedMonth = false;
				var completedWeek = false;

				while(true) {
					if(!weeks[week]) { weeks[week] = []; }

					// If we haven't filled the current week up
					if(weeks[week].length !== self.constants.daysInWeek) {

						// Append to the week
						weeks[week].push(new Date(normalized.getTime()));

						// And increment the date
						normalized.setUTCDate( normalized.getUTCDate() + 1 );
					}

					// If we've began working within the current month
					if( normalized.getUTCMonth() == self.current().getUTCMonth() ) { startedMonth = true; }

					// If we've started our current month and we've changed months (and thus completed it)
					if( startedMonth && (normalized.getUTCMonth() !== self.current().getUTCMonth()) ) { completedMonth = true; }

					// If we've completed our month and we are at the end of the week
					if(completedMonth && weeks[week].length == self.constants.daysInWeek) { completedWeek = true; }

					// If we've completed the month and our week
					if(completedMonth && completedWeek) { break; }

					// Otherwise, if we're at the end of the week, increment the current week
					if(weeks[week].length == self.constants.daysInWeek) { week++; }
				}

				return weeks;
			})
		};

		self.time = {
			next: function(data, e) {
				if(!self.selected()) { return self.time.selectNow(); }
				self.selected(
					new Date( data.set( data.get()+1 ) )
				);
			},
			prev: function(data, e) {
				if(!self.selected()) { return self.time.selectNow(); }
				self.selected(
					new Date( data.set( data.get()-1 ) )
				);
			},
			selectNow: function() {
				var d = new Date();
				self.selected(d);
				self.current(d);
			},
			sheet: ko.observableArray([
				{
					type: 'hours',
					get: function(log) {
						return self.selected().getUTCHours();
					},
					set: function(to) { return self.selected().setUTCHours(to); }
				},
				{
					type: 'seconds',
					get: function() { return self.selected().getUTCMinutes(); },
					set: function(to) { return self.selected().setUTCMinutes(to); }
				}
			]),
			text: function(data) {
				if(!self.selected()) {
					return '-';
				}

				switch(data.type) {
					case 'suffix':
						return data.get() ? self.strings.time[1] : self.strings.time[0];
					case 'hours':
						var hours = data.get();
						if(!self.opts.militaryTime && (hours > 12 || hours === 0) ) {
							hours -= 12;
						}
						return Math.abs(hours);
					default:
						return self.utils.strings.pad(data.get());
				}
			}
		};
		if(!self.opts.militaryTime) {
			self.time.sheet.push({
				type: 'suffix',
				get: function() {
					if(self.selected() && self.selected().getUTCHours() < 12 ) {
						return 0;
					}
					return 1;
				},

				// This set function is special because we don't care about the `to` parameter
				set: function(to) {
					var hours = self.selected().getUTCHours();
					if(hours >= 12) {
						hours -= 12;
					}
					else if(hours < 12) {
						hours += 12;
					}
					return self.selected().setUTCHours( hours );
				}
			});
		}
	};

	var Template =
		'<div class="ko-calendar" data-bind="with: $data, visible: opts.showCalendar || opts.showTime">\
			<!-- ko if: opts.showCalendar -->\
			<table data-bind="css: { selected: selected } " class="calendar-sheet">\
				<thead>\
					<tr>\
						<th>\
							<a href="#" data-bind="click: calendar.prev" class="prev">&laquo;</a>\
						</th>\
						<th data-bind="attr: { colspan: constants.daysInWeek - 2 } ">\
							<b data-bind="text: strings.months[current().getUTCMonth()] + \' \' + current().getFullYear()"></b>\
						</th>\
						<th>\
							<a href="#" data-bind="click: calendar.next" class="next">&raquo;</a>\
						</th>\
					</tr>\
					<tr data-bind="foreach: strings.days">\
						<th data-bind="text: $data.substring(0, $parents[1].constants.dayStringLength)"></th>\
					</tr>\
				</thead>\
				<tbody data-bind="foreach: calendar.sheet">\
					<tr class="week" data-bind="foreach: $data">\
						<td class="day" data-bind="css: { weekend: $parents[1].utils.date.isWeekend($data), today: $parents[1].utils.date.isSame(new Date(), $data), inactive: !($parents[1].utils.date.isSameMonth($parents[1].current(), $data)) } ">\
							<a href="javascript:;" data-bind="text: $data.getUTCDate(), attr: { title: $data }, click: $parents[1].calendar.select, css: { active: $parents[1].utils.date.isSame($parents[1].selected(), $data) } "></a>\
						</td>\
					</tr>\
				</tbody>\
				<!-- ko if: opts.showToday -->\
					<tfoot>\
						<tr>\
							<td data-bind="attr: { colspan: constants.daysInWeek } ">\
								<a href="javascript:;" data-bind="click: calendar.selectToday">Today</a>\
							</td>\
						</tr>\
					</tfoot>\
				<!-- /ko -->\
			</table>\
			<!-- /ko -->\
			<!-- ko if: opts.showTime -->\
			<table class="time-sheet">\
				<tbody>\
					<tr data-bind="foreach: time.sheet">\
						<td>\
							<a href="#" class="up" data-bind="click: $parent.time.next"></a>\
						</td>\
					</tr>\
					<tr data-bind="foreach: time.sheet">\
						<td data-bind="css: { colon: $index() === 0, inactive: !$parent.selected() }, text: $parent.time.text($data)"></td>\
					</tr>\
					<tr data-bind="foreach: time.sheet">\
						<td>\
							<a href="#" class="down" data-bind="click: $parent.time.prev"></a>\
						</td>\
					</tr>\
				</tbody>\
				<!-- ko if: opts.showNow -->\
					<tfoot>\
						<tr>\
							<td data-bind="attr: { colspan: time.sheet().length } ">\
								<a href="javascript:;" data-bind="click: time.selectNow">Now</a>\
							</td>\
						</tr>\
					</tfoot>\
				<!-- /ko -->\
			</table>\
			<!-- /ko -->\
		</div>';


	// Component
	ko.components.register(binding, {
		viewModel: Model,
		template: Template
	});

}).call(this);

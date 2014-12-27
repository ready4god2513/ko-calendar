(function() {

	var binding = 'calendar';

	var Model = function(params) {
		var self = this;

		self.opts = {
			value: ko.observable(),
			current: ko.observable(),
			deselectable: false,
			input: false,
			inputRenderer: function() {
				return '<input type="text">';
			}
		};

		ko.utils.extend(self.opts, params);

		self.strings = {
			months: [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ],
			days: [ "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" ]
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
					normalized.setMinutes(0);
					normalized.setHours(0);
					normalized.setSeconds(0);
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
						(d1.getFullYear() == d2.getFullYear())
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
			}
		};

		// Date Alias Helpers
		self.current = ko.observable(self.opts.current || new Date()); // The current Date
		self.selected = ko.observable(); // The selected Date
		self.selected.subscribe(self.opts.value);

		// Selects a date
		self.select = function(data, e) {
			if( self.opts.deselectable && self.utils.date.isSame(self.selected(), data) ) {
				return self.selected(null);
			}
			self.selected(data);
		};

		self.nextMonth = function() {
			self.current(
				new Date( self.current().setMonth(self.current().getUTCMonth()+1) )
			);
		};

		self.prevMonth = function() {
			self.current(
				new Date( self.current().setMonth(self.current().getUTCMonth()-1) )
			);
		};

		self.sheet = ko.computed(function() {

			// Current month set to the first day
			var normalized = self.utils.date.normalize(self.current());
			normalized.setDate(1);
			normalized.setDate(normalized.getUTCDate() - normalized.getUTCDay()); // Set our date to the first day of the week from the normalized month

			var weeks = [],
				week = 0,
				startedMonth = false,
				completedMonth = false,
				completedWeek = false;

			while(true) {
				if(!weeks[week]) { weeks[week] = []; }

				// If we haven't filled the current week up
				if(weeks[week].length !== self.constants.daysInWeek) {

					// Append to the week
					weeks[week].push(new Date(normalized.getTime()));

					// And increment the date
					normalized.setDate( normalized.getUTCDate() + 1 );
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
		});
	};

	self.focused = ko.observable(false);
	self.doFocus = function() { self.focused(true); };
	self.doBlur = function() { self.focused(false); };

	var Template =
		'<div class="ko-calendar" data-bind="with: $data">\
			<!-- ko if: opts.input -->\
			<input type="text" data-bind="event: { focus: doFocus, blur: doBlur }">\
			<!-- /ko -->\
			<div class="calendar-sheet" data-bind="visible: focused() || !opts.input">\
				<table data-bind="css: { selected: selected } ">\
					<thead>\
						<tr>\
							<th>\
								<a href="#" data-bind="click: prevMonth" class="prev">&laquo;</a>\
							</th>\
							<th colspan="5">\
								<b data-bind="text: strings.months[current().getMonth()] + \' \' + current().getFullYear()"></b>\
							</th>\
							<th>\
								<a href="#" data-bind="click: nextMonth" class="next">&raquo;</a>\
							</th>\
						</tr>\
						<tr data-bind="foreach: strings.days">\
							<th data-bind="text: $data.substring(0, $parents[1].constants.dayStringLength)"></th>\
						</tr>\
					</thead>\
					<tbody data-bind="foreach: sheet">\
						<tr class="week" data-bind="foreach: $data">\
							<td class="day" data-bind="css: { weekend: $parents[1].utils.date.isWeekend($data), today: $parents[1].utils.date.isSame(new Date(), $data), inactive: !($parents[1].utils.date.isSameMonth($parents[1].current(), $data)) } ">\
								<a href="javascript:;" data-bind="text: $data.getDate(), attr: { title: $data }, click: $parents[1].select, css: { active: $parents[1].utils.date.isSame($parents[1].selected(), $data) } "></a>\
							</td>\
						</tr>\
					</tbody>\
				</table>\
				</div>\
		</div>';


	// Component
	ko.components.register(binding, {
		viewModel: Model,
		template: Template
	});

	// Binding Handler
	ko.bindingHandlers[binding] = {
		update: function(el, params) {
			el.innerHTML = Template;
		}
	};

}).call(this);

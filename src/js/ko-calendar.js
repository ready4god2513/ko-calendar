(function() {

	var binding = 'calendar';

	var Model = function(params) {
		var self = this;

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
				normalize: function(d) {
					var normalized = new Date(d.getTime());
					normalized.setMinutes(0);
					normalized.setHours(0);
					normalized.setSeconds(0);
					return normalized;
				},

				isSame: function(d1, d2) {
					if(!d1 || !d2) { return false; }
					return (
						(d1.getMonth() == d2.getMonth()) &&
						(d1.getDate() == d2.getDate()) &&
						(d1.getFullYear() == d2.getFullYear())
					);
				},

				isWeekend: function(d) {
					if(!d) { return false; }
					return d.getDay() === 0 || (d.getDay() == self.constants.daysInWeek - 1);
				}
			}
		};

		// Date Alias Helpers
		self.current = ko.observable(new Date()); // The current Date
		self.selected = ko.observable(); // The selected Date

		// Selects a date
		self.select = function(data, e) { self.selected(data); };

		self.nextMonth = function() {
			self.current(
				new Date( self.current().setMonth(self.current().getMonth()+1) )
			);
		};

		self.prevMonth = function() {
			self.current(
				new Date( self.current().setMonth(self.current().getMonth()-1) )
			);
		};

		self.sheet = ko.computed(function() {

			// Current month set to the first day
			var normalized = self.utils.date.normalize(self.current());
			normalized.setDate(1);
			normalized.setDate(normalized.getDate() - normalized.getDay()); // Set our date to the first day of the week from the normalized month

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
					normalized.setDate( normalized.getDate() + 1 );
				}

				// If we've began working within the current month
				if( normalized.getMonth() == self.current().getMonth() ) { startedMonth = true; }

				// If we've started our current month and we've changed months (and thus completed it)
				if( startedMonth && (normalized.getMonth() !== self.current().getMonth()) ) { completedMonth = true; }

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

	var Template =
		'<div class="ko-calendar" data-bind="with: $data">\
			<table>\
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
						<td class="day" data-bind="css: { weekend: $parents[1].utils.date.isWeekend($data), today: $parents[1].utils.date.isSame(new Date(), $data) } ">\
							<a href="javascript:;" data-bind="text: $data.getDate(), attr: { title: $data }, click: $parents[1].select, css: { active: $parents[1].utils.date.isSame($parents[1].selected(), $data) } "></a>\
						</td>\
					</tr>\
				</tbody>\
			</table>\
		</div>';


	// Component
	ko.components.register(binding, {
		viewModel: Model,
		template: Template
	});


}).call(this);

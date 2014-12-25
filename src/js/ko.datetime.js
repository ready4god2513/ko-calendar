ko.components.register('datetime', {
    viewModel: function(params) {
		var self = this;

		self.strings = {
			months: [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec" ],
			days: [ "Sun", "Mon", "Tues", "Wed", "Thurs", "Fri", "Sat" ]
		};

		self.constants = {
			daysInWeek: 7
		};

		self.utils = {
			date: {
				normalize: function(d) {
					var normalized = new Date(d.getTime());
				    normalized.setMinutes(0);
				    normalized.setHours(0);
				    normalized.setSeconds(0);
				    return normalized;
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

		    	if(weeks[week].length !== self.constants.daysInWeek) {
		    		weeks[week].push(new Date(normalized.getTime()));
		    		normalized.setDate( normalized.getDate() + 1 );
		    	}

		    	// If we've began working within the current month
		    	if( normalized.getMonth() == self.current().getMonth() ) { startedMonth = true; }

		    	// If we've changed months and we've started our current month (and thus completed it)
		    	if( startedMonth && (normalized.getMonth() !== self.current().getMonth()) ) { completedMonth = true; }

		    	// If we've completed our month and we are at the end of the week
		    	if(completedMonth && weeks[week].length == self.constants.daysInWeek) { completedWeek = true; }

		    	// If we've completed the month and our week is finished
		    	if(completedMonth && completedWeek) { break; }

		    	// If we're at the end of the week, increment the current week
		    	if(weeks[week].length == self.constants.daysInWeek) { week++; }
		    }

		    return weeks;
		});
    },
    template:
});

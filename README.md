# ko-calendar

A simple datetime picker built with knockout

# Features
* Only dependency is Knockout.js
* Lightweight, ~8kb JS, ~4kb CSS
* Simple, Terse, Legible (looking at any other datepicker)
* Supports Components and Bindings
* Cross browser compatible (Thanks, KO)


# Installing & Building
```sh
$ npm install
$ npm run-script bower # To download Knockout if needed

$ npm run-script build # Compiles source
$ npm run-script build-watch # Compiles and watches source for changes
```

# Usage
ko-calendar depends on Knockout.js 3.2.0+
```html
<head>
	<link href="ko-calendar.min.css" rel="stylesheet" type="text/css">
	<script src="knockout.js" type="text/javascript"></script>
	<script src="ko-calendar.min.js" type="text/javascript"></script>
</head>
```

# API
ko-calendar supports Components and bindings.

### Component
```html
<div data-bind="component: { name: 'calendar', params: opts }"></div>
```

### Inline Binding
```html
<div data-bind="calendar: opts"></div>
```

### Input Binding
```html
<input type="text" data-bind="calendar: opts">
```

# Default Options
```javascript
var opts = {
	value: ko.observable(),
	current: new Date(),
	selected: null,
	deselectable: true,

	showCalendar: true,
	showToday: true,

	showTime: true,
	showNow: true,
	militaryTime: false,

	min: null,
	max: null,

	strings: {
		months: [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ],
		days: [ "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" ],
		time: ["AM", "PM"]
	}
};
```
All options are deeply extended, allowing you to only specify the options you wish to override.
<table>
	<thead>
		<tr>
			<th>Option</th>
			<th>Type</th>
			<th>Default</th>
			<th>Description</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>value</td>
			<td>Observable</td>
			<td>ko.observable()</td>
			<td>The value of the selected date</td>
		</tr>
		<tr>
			<td>current</td>
			<td>Date</td>
			<td>new Date()</td>
			<td>A Date object that will be used to set as the current month/year on the calendar</td>
		</tr>
		<tr>
			<td>selected</td>
			<td>Observable</td>
			<td>null</td>
			<td>Not to be confused with value, used to internally mark what the selected date is. Consider deprecating from the options list</td>
		</tr>
		<tr>
			<td>deselectable</td>
			<td>Boolean</td>
			<td>true</td>
			<td>Allows a selected date to be clicked again to be deselected</td>
		</tr>
		<tr>
			<td>showCalendar</td>
			<td>Boolean</td>
			<td>true</td>
			<td>Show or hide the date selecter</td>
		</tr>
		<tr>
			<td>showToday</td>
			<td>Boolean</td>
			<td>true</td>
			<td>If showCalender is true, shows a button below the calendar that allows the user to quickly select the current day</td>
		</tr>
		<tr>
			<td>showTime</td>
			<td>Boolean</td>
			<td>true</td>
			<td>Show or hide the time selecter</td>
		</tr>
		<tr>
			<td>showNow</td>
			<td>Boolean</td>
			<td>true</td>
			<td>If showTime is true, shows a button below the time that allows the user to quickly select the current time</td>
		</tr>
		<tr>
			<td>militaryTime</td>
			<td>Boolean</td>
			<td>false</td>
			<td>If true, the time format will be 24 hour, but if false, the time format will be 12 hour with support for periods (AM/PM)</td>
		</tr>
		<tr>
			<td>min</td>
			<td>Date</td>
			<td>null</td>
			<td>A Date object that enforces the calendar &apm; time cannot be set before this date</td>
		</tr>
		<tr>
			<td>max</td>
			<td>Date</td>
			<td>null</td>
			<td>A Date object that enforces the calendar &apm; time cannot be set after this date</td>
		</tr>
		<tr>
			<td>strings</td>
			<td>Object</td>
			<td>...</td>
			<td>An object that specifies all strings used for the calendar, useful for localization. Any of the keys within this object may be included.</td>
		</tr>
	</tbody>
</table>

# Roadmap
* Event system
* JS API
* Unit testing

# Screenshot
<img src="http://i.imgur.com/at52A0H.png" width="235">

# License
MIT

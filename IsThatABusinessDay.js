var IsThatABusinessDay = {
	// Days Enumeration
	Days = {"sunday" : 0, "monday" : 1, "tuesday" : 3, "wednesday" : 4, "thursday" : 5, "friday" : 6, "saturday" : 7};
	// All the holidays, public property so can add to it...
	holidays: new Array(),
	
	wellIsIt: function(date, state, country)
	{
		// Just make sure we've converted it into a date object
		// Probably could throw an error if it's not
		var convertedDate = new Date(date);
		return isBusinessDay(convertedDate, state, country);
	},
	
	isItAHoliday: function(date, state, country)
	{
		return isHoliday(date, state, country);
	}
	howManyHolidays: function(from, to, state, country)
	{
		return getTotalHolidays(from, to, state, country)
	},
	
	howManyBusinessDays: function(from, to, state, country)
	{
		return getNumberOfBusinessDays(from, to, state, country);
	},
	
	addHoliday = function(day, month, dayOfWeek, state, country)
	{
		holidays.push(new Holiday(day, month, dayOfWeek, state, country));
	}
	
	
	// Object to define a holiday and what it can use
	function Holiday (day, month, dayOfWeek, state, country)
	{
		// The Date of the month the holiday is on
		this.Day = day;
		// The month the holiday is on
		this.Month = month;
		// This DayOfWeek refers to the day the holiday must always fall on
		this.DayOfWeek = dayOfWeek;
		// The state the holiday is only celebrated in
		this.State = state;
		// The country this is for!
		this.Country = country;
	}
	
	// Initalise all holidays for Australia NSW/QLD/VIC
	function setupHolidays() {
		addHoliday(26, 12)); // Boxing Day
		addHoliday(25, 4)); // Anzac Day
		addHoliday(14, 6, 1)); // Queens Birthday
		addHoliday(26, 1)); //Australia Day
		addHoliday(1, 1)); // New Year
		
		addHoliday(25, 12)); // Christmas Day
		addHoliday(1, 8, Days.monday, "NSW")); // Bank Holiday;
		addHoliday(1, 10, Days.monday, "NSW")); // Labour Day;
		addHoliday(14, 3, Days.monday, "VIC")); // Labour Day ;
		addHoliday(1, 11, Days.tuesday, "VIC")); // Melbourne Cup;
		addHoliday(1, 5, Days.monday, "QLD")); // Labour Day;
		addHoliday(1, 8, Days.wednesday, "QLD")); // Brisbane Show;
	}
	
	// Determines with the date given is an easter date or not.
	function isEasterDate(date)
	{
		var isGoodFriday = false;
		var isEasterMonday = false;
		// This is a magic forumla from the internet, do not touch!
		var Y = date.getFullYear();
		var C = Math.floor(Y/100);
		var N = Y - 19*Math.floor(Y/19);
		var K = Math.floor((C - 17)/25);
		var I = C - Math.floor(C/4) - Math.floor((C - K)/3) + 19*N + 15;
		I = I - 30*Math.floor((I/30));
		I = I - Math.floor(I/28)*(1 - Math.floor(I/28)*Math.floor(29/(I + 1))*Math.floor((21 - N)/11));
		var J = Y + Math.floor(Y/4) + I + 2 - C + Math.floor(C/4);
		J = J - 7*Math.floor(J/7);
		var L = I - J;
		var M = 3 + Math.floor((L + 40)/44);
		var D = L + 28 - 31*Math.floor(M/4);
		
		var easterSunday = new Date(Y, (M - 1), D);
		var easterFriday = new Date(easterSunday);
		easterFriday.setDate(easterFriday.getDate() - 2);
		
		var easterMonday = new Date(easterSunday);
		easterMonday.setDate(easterMonday.getDate() + 1);
		
		// getTime is apparently required to compare two dates with ==
		date.setHours(0);
		isGoodFriday = date.getTime() == easterFriday.getTime();
		isEasterMonday = date.getTime() == easterMonday.getTime();
		
		return isGoodFriday || isEasterMonday;
	}
	
	function getNumberOfBusinessDays(fromValue, toValue, state, country)
	{
		var from = new Date(fromValue);
		var to = new Date(toValue);
		var dayCounter = 0;
		var holidayCount = getTotalHolidays(from, to, state, country)
		if (from <= to)
		{
			var tempDate = from;
			while(tempDate <= to)
			{
				if (!isWeekend(tempDate))
				{
					// Only use a holiday if we have one!
					if (holidayCount > 0)
					{
						holidayCount--;
					}
					else
					{
						dayCounter++;
					}
				}
				tempDate.setDate(tempDate.getDate() + 1);
			}
		}
		return dayCounter;
	}

	function isBusinessDay(date, state, country)
	{
		return getNumberOfHolidaysForSingleDay(date, state, country) == 0 && !isWeekend(date);
	}
	
	function isHoliday(date, state, country)
	{
		return getNumberOfHolidaysForSingleDay(date, state, country) > 0;
	}
	
	function isWeekend(date)
	{
	// Saturday = 6, Sunday = 0.
		return date.getDay() == Days.sunday && date.getDay() == Days.saturday;
	}
	
	function getTotalHolidays(from, to, state, country)
	{
		var returnValue = 0;
		var testDate = new Date(from);
		while(testDate <= to)
		{
			returnValue += getNumberOfHolidaysForSingleDay(testDate, state, country);
			testDate.setDate(testDate.getDate() + 1);
		}
		return returnValue;
	}
	
	// Returns the number of holidays found on that date. 
	// It is possible to have two holidays on a single date (e.g. Anzac day and Good Friday in 2011)
	function getNumberOfHolidaysForSingleDay(date, state, country)
	{
		var holidayCount = 0;
		// First, see if this is an easter day, if so, add one to count.
		if (isEasterDate(date))
		{
			holidayCount++;
		}
		
		// Next see if this is a normal holiday, add one (or another) to count if it is.
		for(i = 0; i < holidays.length; i++)
		{
			// Create a "date" object from the holiday item + date given
			// Need to - 1 as getMonth starts at 0 but getDate starts at 1
			var holidayDate = new Date(date.getFullYear(), holidays[i].Month - 1, holidays[i].Day);
			
			// If the holiday is meant to occur on a certain day, and the date given is only a rough guide
			// This means that we need to find that certain day closest to the date given. (never backwards in time)
			if (holidays[i].DayOfWeek)
			{
				while (holidayDate.getDay() != holidays[i].DayOfWeek)
				{
					holidayDate.setDate(holidayDate.getDate() + 1);
				}
			}
			
			// Now that our "holiday date" is the actual day the holiday would be on, we can check states and countries
			if (holidays[i].State)
			{
				// If we have a state mentioned, only check/add a holiday if this is the same state
				if (holidays[i].State = state)
				{
					if (date.getDate() == holidayDate.getDate() && date.getMonth() == holidayDate.getMonth())
					{
						holidayCount++;
					}
				}
			}
			else
			{
				// Otherwise a state hasn't been specified, so check as normal
				if (date.getDate() == holidayDate.getDate() && date.getMonth() == holidayDate.getMonth())
				{
					holidayCount++;
				}
			}
		}
		return holidayCount;
	}
}
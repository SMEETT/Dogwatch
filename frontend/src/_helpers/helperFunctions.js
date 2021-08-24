const weekdayNames = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
const monthNames = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];

export function leadingZero(n) {
	return n < 10 ? "0" + n : n;
}

export function extractTimeOfDay(date) {
	let TOD = new Date(date);
	const hour = leadingZero(TOD.getHours());
	const minute = leadingZero(TOD.getMinutes());
	TOD = `${hour}:${minute} Uhr`;
	return TOD;
}

export function parseDateToString(date, withWeekdays, shortYear) {
	let dateToParse = new Date(date);
	const weekday = weekdayNames[dateToParse.getDay()];
	const month = monthNames[dateToParse.getMonth()];
	const day = leadingZero(dateToParse.getDate());
	let year = dateToParse.getFullYear();
	if (shortYear) {
		year = `'${year.toString().slice(2, 5)}`;
	}
	if (withWeekdays) {
		return `${weekday} ${day}. ${month} ${year}`;
	} else {
		return `${day}. ${month} ${year}`;
	}
}

export function calculateAge(date) {
	const msPerDay = 86400000;
	const now = Date.now();
	const birthdate = new Date(date);
	const age = Math.ceil((now - birthdate) / msPerDay);
	return age;
}

export function dateFromDayId(dayId) {
	const year = dayId.slice(0, 4);
	const month = dayId.slice(4, 6);
	const day = dayId.slice(6, 8);
	const date = new Date(year, month - 1, day);
	const toReturn = parseDateToString(date);
	return toReturn;
}

export function dayIdFromDate(date) {
	return `${date.getFullYear()}${leadingZero(date.getMonth() + 1)}${leadingZero(date.getDate())}`;
}

// helper-function to generate a unique Id per day (format "yyyymmdd")
// const id = y*1000 + m*100 + d; return id.toString();
export function generateId(date) {
	const y = date.getFullYear();
	const m = leadingZero(date.getMonth() + 1);
	const d = leadingZero(date.getDate());
	const id = y.toString() + m.toString() + d.toString();
	return id;
}

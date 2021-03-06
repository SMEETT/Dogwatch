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
	return new Date(year, month - 1, day);
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

export function dateToString(start_date, end_date, length = "normal") {
	let dateFormatter;

	const dateFormatterNoYear = {
		month: "numeric",
		day: "numeric",
	};

	const dateFormatterShort = {
		year: "2-digit",
		month: "numeric",
		day: "numeric",
	};
	const dateFormatterNormal = {
		year: "2-digit",
		month: "numeric",
		day: "numeric",
		weekday: "short",
	};
	const dateFormatterLong = {
		year: "numeric",
		month: "short",
		day: "numeric",
		weekday: "long",
	};

	switch (length) {
		case "normal":
			dateFormatter = dateFormatterNormal;
			break;
		case "short":
			dateFormatter = dateFormatterShort;
			break;
		case "long":
			dateFormatter = dateFormatterLong;
			break;
		case "noYear":
			dateFormatter = dateFormatterNoYear;
	}

	const dateFormatterUdf = new Intl.DateTimeFormat(undefined, dateFormatter);

	function convertDate(date) {
		if (typeof date === "string" && date.length === 10) {
			const dateParts = date.split("-");
			return new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
		} else {
			return new Date(date);
		}
	}

	function formatDate(date) {
		return dateFormatterUdf.format(date);
	}

	function sameDay(date1, date2) {
		const startDate = date1.setHours(12, 0);
		const endDate = date2.setHours(12, 0);
		return startDate === endDate || start_date > end_date ? true : false;
	}

	// if only one date (start_date) was provided
	if (!end_date || sameDay(convertDate(start_date), convertDate(end_date))) {
		const date = formatDate(convertDate(start_date));
		return date;
		// if both start_date and end_date were provided
	} else {
		const startDate = formatDate(convertDate(start_date));
		const endDate = formatDate(convertDate(end_date));
		return `${startDate} - ${endDate}`;
	}
}

export function yyyymmddToString(date) {
	console.log(date);
	const dateParts = date.split("-");
	const realDate = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
	console.log(realDate);
	return `${leadingZero(realDate.getDate())}. ${monthNames[realDate.getMonth()]} ${realDate.getFullYear()}`;
}

export function ISO8601ToJSDate(datestring) {
	const dateParts = datestring.split("-");
	return new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
}

export function JSDateToISO8601(dateobject) {
	return `${dateobject.getFullYear()}-${leadingZero(parseInt(dateobject.getMonth()) + 1)}-${leadingZero(dateobject.getDate())}`;
}

export function offsetArray(offset, array) {
	for (let i = 0; i < offset; i++) {
		array.push(array.shift());
	}
	return array;
}

<!-- TERMINE index -->
<script>
	import { goto, metatags, redirect } from "@roxi/routify";
	metatags.title = "Dogwatch / Termine";
	metatags.description = "Description coming soon...";
	import { onMount, createEventDispatcher, onDestroy } from "svelte";
	import { fade } from "svelte/transition";
	import { GraphQLClient, gql } from "graphql-request";
	import { menuActive, menuStatus, bottomBarAction, lastSelectedDay, user } from "../../stores/state";
	import { leadingZero, extractTimeOfDay, parseDateToString, calculateAge, dateFromDayId } from "../../_helpers/helperFunctions";
	import DeleteModal from "../_root_components/DeleteModal.svelte";
	import Prefetcher from "@roxi/routify/runtime/Prefetcher.svelte";

	let userIsCaretaker = false;
	let allDays = [];

	let currentlySelectedDay = null;
	let currentDayDisplay = null;

	// ----------------------------------------------
	// INIT, GLOBALS AND LIFECYCLE METHODS
	// ----------------------------------------------

	onMount(() => {
		menuActive.set("appointments");
		let ctx = $lastSelectedDay.apptId ? "appointment" : "day";
		if (!$lastSelectedDay.apptId && !$lastSelectedDay.dayId) {
			ctx = "no_day_selected";
		}
		menuStatus.set({ context: ctx });

		if (localStorage.getItem("appointmentSwitchStatus") === "caretaker") {
			switchToggle.checked = true;
			userIsCaretaker = true;
			$menuStatus.context = "caretaker";
		} else if (localStorage.getItem("appointmentSwitchStatus") === "creator") {
			switchToggle.checked = false;
			userIsCaretaker = false;
			$menuStatus.context = "day";
		}
	});

	// global variable that contains all fetched data
	let fetchedData;

	const weekdayNames = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
	const monthNames = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];

	// later be set by "last Selected" on local Storage
	const dateNow = new Date();
	$lastSelectedDay.dayId = `${dateNow.getFullYear()}${leadingZero(dateNow.getMonth() + 1)}${leadingZero(dateNow.getDate())}`;
	currentlySelectedDay = $lastSelectedDay.dayId;
	currentDayDisplay = dateFromDayId($lastSelectedDay.dayId);
	let initialYear = dateNow.getFullYear();
	let initialMonth = dateNow.getMonth();

	function handleLastSelectedDayAppointments() {
		try {
			const currentDayElement = document.querySelectorAll(`[data-day-id="${$lastSelectedDay.dayId}"]`);
			const extractedAppointmentIds = currentDayElement[0].dataset.appointmentIds;
			handleRenderDay(null, extractedAppointmentIds);
		} catch {}
	}

	// currently selected Year/Month by the user (defauls to what's saved in local storage(or current month/year))
	$: selectedYear = parseInt(initialYear);
	$: selectedMonth = parseInt(initialMonth);

	// a promise we can await in template
	$: promise = generateCalendar(selectedYear, selectedMonth, userIsCaretaker);

	// Variables used in MARKUP to display the currently selected YEAR and MONTH
	$: dte = new Date(selectedYear, selectedMonth);
	$: currentMonthDisplay = monthNames[dte.getMonth()];
	$: currentYearDisplay = dte.getFullYear();
	let selectedAppointment = null;

	$: showDetailview = false;
	$: showAddAppointment = false;

	// ----------------------------------------------
	// ACCORDION (W3 SCHOOLS)
	// https://www.w3schools.com/howto/howto_js_accordion.asp
	// (extended this a little to make nesting possible)
	// ----------------------------------------------

	function handleAccordion() {
		let acc = document.getElementsByClassName("accordion");
		for (let i = 0; i < acc.length; i++) {
			if (acc[i].getAttribute("attached-listener") !== "true") {
				acc[i].addEventListener("click", togglePanel);
				acc[i].setAttribute("attached-listener", "true");
			}
			function togglePanel(e) {
				this.classList.toggle("active");
				var panel = this.nextElementSibling;
				if (panel.id === "rootpanel") {
					if (panel.style.maxHeight) {
						panel.style.maxHeight = null;
					} else {
						panel.style.maxHeight = panel.scrollHeight + "px";
					}
				}
				if (panel.id === "subpanel") {
					if (panel.style.maxHeight) {
						panel.style.maxHeight = null;
					} else {
						panel.style.maxHeight = panel.scrollHeight + "px";
					}
					let rootPanel = panel.closest("#rootpanel");
					let rootPanelCurrentMaxHeight = parseInt(rootPanel.style.maxHeight.slice(0, -2));
					let subPanelCurrentMaxHeight = parseInt(panel.style.maxHeight.slice(0, -2));
					rootPanel.style.maxHeight = rootPanelCurrentMaxHeight + subPanelCurrentMaxHeight + "px";
				}
			}
		}
	}

	// ----------------------------------------------
	// DATA FETCHING
	// ----------------------------------------------
	async function getAppointmentData(rangeStart, rangeEnd) {
		// whatToFetch? "appointments" (created by current user) or "caredates" (appointments current user is assigned to)
		let whatToFetch = null;
		!userIsCaretaker ? (whatToFetch = "appointments") : (whatToFetch = "caredates");
		const rangeStartDate = rangeStart.toISOString();
		const rangeEndDate = rangeEnd.toISOString();

		async function getUser() {
			const endpoint = import.meta.env.VITE_GQL_ENDPOINT_URL;
			const graphQLClient = new GraphQLClient(endpoint, {
				credentials: "include",
				mode: "cors",
			});
			const query = gql`
				query {
					getUser { 
						${whatToFetch} (start_of_range: "${rangeStartDate}", end_of_range: "${rangeEndDate}") {
							id
							creator {
								username
							}
							caretakers {
								username
							}
							start_date
							end_date
							dogs {
								id
								name
								image
								birthday
								race
								gender
								weight
								food_amount
								medications
								walk_duration
								walktimes
								feedtimes
								notes
							}
							notes
						}
					}
				}
			`;
			const data = await graphQLClient.request(query);
			// console.log(JSON.stringify(data, undefined, 2));
			return data.getUser;
		}
		return await getUser().catch((error) => console.error(error));
	}

	// ----------------------------------------------
	// SWITCH MONTHS
	// ----------------------------------------------
	function nextMonth() {
		if (selectedMonth === 11) {
			selectedMonth = 0;
			selectedYear += 1;
		} else {
			selectedMonth += 1;
		}
	}

	function prevMonth() {
		if (selectedMonth === 0) {
			selectedMonth = 11;
			selectedYear -= 1;
		} else {
			selectedMonth -= 1;
		}
	}

	// array of appointmentIds ("yyyymmdd") for all visible days in current view/month
	let apptIds = [];

	// ***********************************************************
	// GENERATE CALENDAR
	// ***********************************************************
	async function generateCalendar(y, m) {
		// calendar month to generate
		const date = new Date(y, m);
		const year = date.getFullYear();
		const month = date.getMonth();
		const msPerDay = 86400000;

		// ----------------------------------------------
		// GET FIRST DAY OFFSET
		// ----------------------------------------------
		function getFirstDayOffset(year, month) {
			let offset;
			const firstDayMonth = new Date(year, month, 1).getDay();
			firstDayMonth === 0 ? (offset = 7) : (offset = firstDayMonth);
			return offset;
		}
		const offset = getFirstDayOffset(year, month);
		const rangeStart = new Date(year, month, -offset + 1);
		const rangeEnd = new Date(year, month, -offset + 42);

		fetchedData = await getAppointmentData(rangeStart, rangeEnd);
		if (userIsCaretaker) {
			fetchedData = fetchedData.caredates;
		} else {
			fetchedData = fetchedData.appointments;
		}

		// reset the array of appointmentIds
		apptIds = [];

		// generate all appointmentIds ("yyyymmdd") for currently viewed month
		// and add a color
		fetchedData.forEach((appointment, index) => {
			// random color generator (thanks StackOverflow!)
			const color = "#" + (((1 << 24) * Math.random()) | 0).toString(16);
			appointment.color = color;
			let start_date = new Date(parseInt(appointment["start_date"])).setHours(12, 0, 0, 0);
			let end_date = new Date(parseInt(appointment["end_date"])).setHours(12, 0, 0, 0);
			const appointmentLen = Math.floor(end_date - start_date) / msPerDay;
			const listOfIds = [];
			for (let i = 0; i <= appointmentLen; i++) {
				const iterDate = new Date(start_date);
				iterDate.setDate(iterDate.getDate() + i);
				listOfIds.push(generateID(iterDate));
			}
			apptIds.push({ ids: listOfIds, color: color });
		});

		function generateOrderOfEvents() {
			fetchedData.forEach((appointment) => {
				const startDate = new Date(parseInt(appointment.start_date));
				const endDate = new Date(parseInt(appointment.end_date));

				function getAppointmentLength(start_date, end_date) {
					const start_dte = new Date(start_date).setHours(12, 0, 0, 0);
					const end_dte = new Date(end_date).setHours(12, 0, 0, 0);
					const len = Math.floor(end_dte - start_dte) / msPerDay;
					return len + 1;
				}
				const appointmentLen = getAppointmentLength(startDate, endDate);

				const allFeedtimes = [];
				const allWalktimes = [];

				appointment.dogs.forEach((dog) => {
					dog.walktimes.forEach((time) => {
						const walktime = new Date(time);
						const objectToPush = { involvedDogs: [dog.name], kind: "walktime", date: walktime };
						allWalktimes.push(objectToPush);
					});
					dog.feedtimes.forEach((time) => {
						const feedtime = new Date(time);
						const objectToPush = { involvedDogs: [dog.name], kind: "feedtime", date: feedtime };
						allFeedtimes.push(objectToPush);
					});
				});

				// filtered Times (look for overlaps)
				const mergedFeedtimes = [];
				const mergedWalktimes = [];
				function combineTimes() {
					allFeedtimes.forEach((feedtimeObject) => {
						const index = mergedFeedtimes.findIndex((element) => element.date.getTime() === feedtimeObject.date.getTime());
						// if not found
						if (index === -1) {
							mergedFeedtimes.push(feedtimeObject);
							// ... else add dog to already existing object
						} else {
							mergedFeedtimes[index].involvedDogs = [...mergedFeedtimes[index].involvedDogs, ...feedtimeObject.involvedDogs];
						}
					});
					allWalktimes.forEach((walktimeObject) => {
						const index = mergedWalktimes.findIndex((element) => element.date.getTime() === walktimeObject.date.getTime());
						// if not found add time ...
						if (index === -1) {
							mergedWalktimes.push(walktimeObject);
							// ... else add dog to already existing object
						} else {
							mergedWalktimes[index].involvedDogs = [...mergedWalktimes[index].involvedDogs, ...walktimeObject.involvedDogs];
						}
					});
				}
				combineTimes();
				const mergedTimes = [...mergedFeedtimes, ...mergedWalktimes];
				const events = [];
				for (let i = 1; i <= appointmentLen; i++) {
					// first day
					if (i === 1) {
						const comparableStartDate = new Date(startDate);
						comparableStartDate.setFullYear(1899);
						comparableStartDate.setMonth(11);
						comparableStartDate.setDate(31);
						const filteredTimesDayOne = mergedTimes.filter((dogTimeObject) => {
							return dogTimeObject.date.getTime() >= comparableStartDate.getTime();
						});
						const toPushFirstDay = { date: startDate, events: filteredTimesDayOne };
						events.push(toPushFirstDay);
					} else if (i === appointmentLen) {
						const comparableEndDate = new Date(endDate);
						comparableEndDate.setFullYear(1899);
						comparableEndDate.setMonth(11);
						comparableEndDate.setDate(31);
						const filteredTimesLastDay = mergedTimes.filter((dogTimeObject) => {
							return dogTimeObject.date.getTime() <= comparableEndDate.getTime();
						});
						const toPushLastDay = { date: endDate, events: filteredTimesLastDay };
						events.push(toPushLastDay);
					} else {
						const inbetweenDate = new Date(startDate);
						inbetweenDate.setDate(inbetweenDate.getDate() + i - 1);
						const toPushBetweenDay = { date: inbetweenDate, events: mergedTimes };
						events.push(toPushBetweenDay);
					}
				}
				events.forEach((day) => {
					day.events.sort((a, b) => a.date - b.date);
				});
				appointment.events = events;
			});
		}

		// helper function to filter for all appointment id's (as they are in the database)
		// that are attached to the iterated day
		// later used to look up the corresponding appointment(s) in 'fetchedData'
		function getAppointmentIds(y, m, d) {
			const dateToCheck = new Date(y, m, d, 12, 0, 0, 0).getTime();
			const appointmentIds = [];
			for (let i = 0; i < fetchedData.length; i++) {
				// console.log(fetchedData[i]);
				let start_date = new Date(parseInt(fetchedData[i]["start_date"])).setHours(12, 0, 0, 0);
				let end_date = new Date(parseInt(fetchedData[i]["end_date"])).setHours(12, 0, 0, 0);

				if (start_date === dateToCheck || end_date === dateToCheck) {
					appointmentIds.push(fetchedData[i].id);
				}

				if (start_date < dateToCheck && end_date > dateToCheck) {
					appointmentIds.push(fetchedData[i].id);
				}
			}
			return appointmentIds;
		}

		// helper-function to generate a unique Id per day (format "yyyymmdd")
		// const id = y*1000 + m*100 + d; return id.toString();
		function generateID(date) {
			const y = date.getFullYear();
			const m = leadingZero(date.getMonth() + 1);
			const d = leadingZero(date.getDate());
			const id = y.toString() + m.toString() + d.toString();
			return id;
		}

		const daysInMonth = new Date(year, month + 1, 0).getDate();
		const days = [];

		// array of day-objects used in template-engine
		for (let i = -offset + 1; i <= 42 - offset; i++) {
			const dt = new Date(year, month, i);
			const objectToPush = {
				id: generateID(dt),
				y: dt.getFullYear(),
				m: dt.getMonth(),
				d: leadingZero(dt.getDate()),
				// grey-out days when they are not part of the current month
				active: i > 0 && i <= daysInMonth,
				appointmentIds: getAppointmentIds(y, m, i),
			};
			days.push(objectToPush);
		}

		// get Data if there's already an appointment selected (on revisit of 'Appointments')
		// if ($lastSelectedDay.apptId) {
		// 	selectedAppointment = fetchedData.find((appointment) => parseInt(appointment.id) === parseInt($lastSelectedDay.apptId));
		// }

		generateOrderOfEvents();
		return days;
	}

	// array of objects ({id, depth}) to keep track of "depth" per day
	// a depth of 0 means there's one appointment on that day, 1 equals two
	// and so on. The corresponding object's depth-property
	// is incremented each time an appointment (or part of an appointment) is
	// found on the the corresponding day (see below)
	let usedIds = [];
	// ***********************************************************
	// RENDER APPOINTMENT-INDICATOR-BARS
	// ***********************************************************
	function renderAppointmentIndicatorBars() {
		// reset usedIds
		usedIds = [];

		// apptIds is an array of arrays ([appointment[dayIds ("yyyymmdd"), ...], ...])
		// and needs to be sorted (we want to start with the first day on which an appointment appears
		// and go through all of them in order)
		var sortedApptIds = apptIds.sort(function (a, b) {
			return a.ids[0] - b.ids[0];
		});
		sortedApptIds.forEach((appointment) => {
			// depth describes the amount of appointments on a single day
			let depth = 0;
			// for-loop that goes over all day-id's ("yyyymmdd") belonging to the currently iterated appointment ('appointment')
			for (let i = 0; i < appointment.ids.length; i++) {
				const dayId = appointment.ids[i];
				// we check if the current day is already recorded in our
				// "usedIds"-array...
				// returns an (empty) array
				let currentDayObject = null;
				currentDayObject = usedIds.filter((obj) => {
					return obj.id === dayId;
				});

				// if we found an object corresponding to the currently iterated dayId,
				// we increment its 'depth' (and use the new value for our local "depth" variable,
				// see below)
				if (currentDayObject.length !== 0) {
					currentDayObject[0].depth = currentDayObject[0].depth + 1;
					depth = currentDayObject[0].depth;
					// if the current day doesn't exist yet, we create the initial object with a 'depth' of 0
				} else {
					usedIds.push({ id: dayId, depth: 0 });
				}

				let previousDayId = null;
				let previousDayObject = null;
				// if i > 0 we are at least on day 2 of the currently iterated appointment...
				if (i > 0) {
					// ... and can grab the previous' days' Id (of our currently iterated appointment)
					previousDayId = appointment.ids[i - 1];
					// ... which must have a record in "usedIds"...
					previousDayObject = usedIds.filter((obj) => {
						return obj.id === previousDayId;
					});
				}

				if (i === 0) {
					depth = 0;
				}

				// if we have both, an object for currentDay and previousDay.. (and therefor a 'depth' for both)
				if (currentDayObject.length !== 0 && previousDayObject) {
					// ... we calculate the amount of "steps" our indicator-bar must be pushed down (starting at the top)
					// when the previous day has a depth of 3 (meaning it's the fourth indicator-bar on the previous day)
					// ... and is therefor pushed four times the indicator-bars' height below the "day", and we assume that
					// ... on the current day we already have one appointment (meaning we have a depth of 1 when we include the current day)
					// ... we would calculate 3 - 1 = 2 which tells us that the current day needs two times its own heights margin from the top
					// ... to be on the same height as the bar on the previous day it belongs to. Simple actually.
					// console.log(dayId);
					// console.log(previousDayObject[0].depth);
					depth = previousDayObject[0].depth - currentDayObject[0].depth;
					currentDayObject[0].depth = previousDayObject[0].depth;
					// if the current day had no record yet there's no bar above it and we can set the previous-days' depth as our
					// ... new depth (and also use it locally)
				} else if (previousDayObject && currentDayObject.length === 0) {
					depth = previousDayObject[0].depth;
					currentDayObject = usedIds.filter((obj) => {
						return obj.id === dayId;
					});
					currentDayObject[0].depth = previousDayObject[0].depth;
				}

				// try/catch cause day with "dayId" might not be visible on the current calendar-view (needs a fix)
				try {
					const targetContainer = document.getElementById(dayId);
					const barToAppend = document.createElement("div");
					barToAppend.style.width = "100%";
					barToAppend.style.backgroundColor = appointment.color;
					barToAppend.style.height = "1rem";
					barToAppend.style.marginTop = `${depth}rem`;
					targetContainer.append(barToAppend);
				} catch {
					console.log("appointment not in this view");
				}
			}
		});
	}

	// ----------------------------------------------
	// HANDLE RENDER DAY
	// ----------------------------------------------
	let allAppointmentsForSelectedDay = [];
	function handleRenderDay(incomingEvent = null, providedAppointmentIds = null) {
		allAppointmentsForSelectedDay = [];
		let arrayOfAppointmentIds = [];
		showDetailview = true;
		if (!providedAppointmentIds) {
			arrayOfAppointmentIds = incomingEvent.target.dataset.appointmentIds.split(",");
			lastSelectedDay.update((obj) => {
				obj.dayId = incomingEvent.target.dataset.dayId;
				return obj;
			});
		} else {
			arrayOfAppointmentIds = providedAppointmentIds.split(",");
		}

		if (arrayOfAppointmentIds[0] !== "") {
			arrayOfAppointmentIds.forEach((id) => {
				let foundAppointment = fetchedData.find((appointment) => parseInt(id) === parseInt(appointment.id));
				allAppointmentsForSelectedDay.push(foundAppointment);
			});
		}
	}

	// ----------------------------------------------
	// SET ACTIVE STATE FOR CURRENTLY SELECTED DAY (OR APPOINTMENT)
	// ----------------------------------------------

	async function setActiveState(incomingEvent) {
		const e = incomingEvent;
		currentlySelectedDay = e.target.dataset.dayId;
		currentDayDisplay = dateFromDayId(e.target.dataset.dayId);
	}

	// ----------------------------------------------
	// DELETE APPOINTMENT
	// ----------------------------------------------
	async function handleDeleteAppointment() {
		async function deleteAppointment() {
			const endpoint = import.meta.env.VITE_GQL_ENDPOINT_URL;
			const graphQLClient = new GraphQLClient(endpoint, {
				credentials: "include",
				mode: "cors",
			});
			const mutation = gql`
				mutation {
					deleteAppointment(id: ${parseInt($lastSelectedDay.apptId)}) {
						id
					}
				}
			`;
			const data = await graphQLClient.request(mutation);
			$bottomBarAction = "";
			// console.log(JSON.stringify(data, undefined, 2));
			return data.deleteAppointment;
		}
		await deleteAppointment().catch((error) => console.error(error));
		selectedAppointment = null;
		$lastSelectedDay = { dayId: null, apptId: null };
		promise = generateCalendar(selectedYear, selectedMonth);
	}

	onDestroy(() => {
		console.log("APPOINTMENTS DESTROYED!");
	});

	let switchToggle;
	function switchTheSwitch() {
		console.log(switchToggle);
		switchToggle.checked = true;
		userIsCaretaker = !userIsCaretaker;
	}
</script>

<div class="wrapper">
	<div class="headline">
		<div class="wrapper-switcher">
			<button class="btn" on:click|stopPropagation={prevMonth}>
				<svg width="26" height="40" viewBox="0 0 30 44" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path d="M2 22L28 2V42L2 22Z" stroke="var(--color-headline)" stroke-width="4" stroke-linejoin="round" />
				</svg>
			</button>
			<button class="ml-16 mr-8 btn" on:click|stopPropagation={nextMonth}>
				<svg width="26" height="40" viewBox="0 0 30 44" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path d="M28 22L2 2V42L28 22Z" stroke="var(--color-headline)" stroke-width="4" stroke-linejoin="round" />
				</svg>
			</button>
			<h1 class="color-headline">{currentMonthDisplay}</h1>
		</div>
		<p class="headline-label">{currentYearDisplay}</p>
		<!-- <p class="label">Termine</p> -->
		<button on:click={switchTheSwitch}>Switch</button>
		<label class="switch">
			<input
				bind:this={switchToggle}
				type="checkbox"
				on:click={() => {
					userIsCaretaker = !userIsCaretaker;
					if ($menuStatus.context === "day") {
						$menuStatus.context = "caretaker";
						localStorage.setItem("appointmentSwitchStatus", "caretaker");
					} else if ($menuStatus.context === "caretaker") {
						$menuStatus.context = "day";
						localStorage.setItem("appointmentSwitchStatus", "creator");
					}
				}}
			/>
			<span class="slider round" />
		</label>
	</div>
	<div style="margin-top: -2rem" class="separator" />
	<div class="wrapper-calendar debug-border">
		{#await promise}
			<div class="wrapper-spinner">
				<div class="lds-ring">
					<div />
					<div />
					<div />
					<div />
				</div>
			</div>
		{:then allDays}
			<div in:fade class="wrapper-days">
				{#each weekdayNames as weekdayName, index}
					<p class="weekday-name">{weekdayName}</p>
				{/each}
				{#each allDays as day, index}
					<div class="appt-container" id={day.id}>
						<div
							on:click={setActiveState}
							class:day-active={currentlySelectedDay == day.id}
							class="day"
							class:regular-text={day.active}
							class:regular-text-inactive={!day.active}
							data-day-id={day.id}
							data-appointment-ids={day.appointmentIds}
							on:click={handleRenderDay}
						>
							{day.d}
						</div>
					</div>
				{/each}
				<!-- <p use:addHoverToAppointments /> -->
				<p use:renderAppointmentIndicatorBars />
			</div>
			<div in:fade class="wrapper-detailview">
				<div class="separator" />
				<div class="wrapper-current-selected-day">
					<h1 class="color-dark" style="margin-left: 0">{currentDayDisplay}</h1>
				</div>
				{#if allAppointmentsForSelectedDay.length > 0}
					{#each allAppointmentsForSelectedDay as selectedAppointment}
						<div class="wrapper-appt">
							<button class="accordion regular-text" style={`border: 3px solid ${selectedAppointment.color}`}
								>{`${parseDateToString(parseInt(selectedAppointment.start_date), false)} - ${parseDateToString(
									parseInt(selectedAppointment.end_date),
									false
								)}`}</button
							>
							<div class="panel" id="rootpanel">
								<div class="wrapper-fields mt-16">
									<div>
										<p class="label mb-8">Ersteller</p>
										<p class="regular-text mb-8">{selectedAppointment.creator.username}</p>
									</div>

									<div>
										<p class="label mb-8">Aufpasser</p>
										{#each selectedAppointment.caretakers as caretaker}
											<p class="regular-text mb-8">{caretaker.username}</p>
										{/each}
									</div>
									<div>
										<p class="label mb-8">Ankunft</p>
										<p class="regular-text">
											{extractTimeOfDay(parseInt(selectedAppointment.start_date))}
										</p>
									</div>
									<div>
										<p class="label mb-8">Abholung</p>
										<p class="regular-text">
											{extractTimeOfDay(parseInt(selectedAppointment.end_date))}
										</p>
									</div>

									<div class="wrapper-events">
										<p class="label mb-8">Hunde</p>
										{#each selectedAppointment.dogs as currentDog}
											<button class="accordion regular-text">{currentDog.name}</button>
											<div class="panel" id="subpanel">
												<div in:fade class="wrapper-detailview">
													<!-- <h2 class="date">30/01/20 - 04/01/21</h2> -->
													<div style="margin-top: 1rem" class="wrapper-image">
														<img class="image" src={currentDog.image} alt="" />
													</div>
													<div class="wrapper-fields">
														<div>
															<p class="label mb-8">Alter</p>
															<p class="regular-text mb-8">{calculateAge(currentDog.birthday)} Tage</p>
														</div>

														<div>
															<p class="label mb-8">Rasse</p>
															<p class="regular-text mb-8">{currentDog.race}</p>
														</div>
														<div>
															<p class="label mb-8">Geschlecht</p>
															<p class="regular-text mb-8">{currentDog.gender}</p>
														</div>
														<div>
															<p class="label mb-8">Gewicht</p>
															<p class="regular-text mb-8">
																{currentDog.weight} kg
															</p>
														</div>
														<div>
															<p class="label mb-8">Futtermenge</p>
															<p class="regular-text mb-8">
																{currentDog.food_amount} g
															</p>
														</div>
														<div>
															<p class="label mb-8">Medikamente</p>
															{#each currentDog.medications as medication}
																<p class="regular-text mb-8">
																	{medication}
																</p>
															{/each}
															{#if currentDog.medications.length === 0}
																<p class="regular-text mb-8">-</p>
															{/if}
														</div>
														<div>
															<p class="label mb-8">Spaziergaenge</p>
															{#each currentDog.walktimes as walktime}
																<p class="regular-text mb-8">
																	{extractTimeOfDay(walktime)}
																</p>
															{/each}
														</div>
														<div>
															<p class="label mb-8">Fuetterungen</p>
															{#each currentDog.feedtimes as feedtime}
																<p class="regular-text mb-8">
																	{extractTimeOfDay(feedtime)}
																</p>
															{/each}
														</div>
														<div>
															<p class="label mb-8">Spaziergang Dauer</p>
															<p class="regular-text mb-8">
																{currentDog.walk_duration} min
															</p>
														</div>
														<div class="notes mb-8">
															<p class="label mb-8">Notizen</p>
															{#if currentDog.notes}
																<p class="regular-text mb-8 line-height-125">
																	{currentDog.notes}
																</p>
															{:else}
																<p class="regular-text mb-8">-</p>
															{/if}
														</div>
													</div>
												</div>
											</div>
											<p use:handleAccordion />
										{/each}
									</div>
									<div class="wrapper-events">
										<p class="label mb-8">Ablauf</p>
										{#each selectedAppointment.events as event}
											<button class="accordion regular-text">{parseDateToString(event.date)}</button>
											<div class="panel" id="subpanel">
												{#each event.events as evt}
													<div class="event regular-text">
														<div class="event-top-row">
															{extractTimeOfDay(evt.date)}
															{#if evt.kind === "walktime"}
																<p class="regular-text">&nbsp;Spaziergang</p>
															{:else if evt.kind === "feedtime"}
																<p class="regular-text">&nbsp;Fütterung</p>
															{/if}
														</div>
														<div class="event-bottom-row">
															[{evt.involvedDogs}]
														</div>
													</div>
												{/each}
												{#if event.events.length < 1}
													<div class="event-bottom-row">
														<p class="regular-text">-</p>
													</div>
												{/if}
											</div>
											<p use:handleAccordion />
										{/each}
									</div>
									<div style="margin-bottom: 5rem;" class="notes">
										<p class="label mb-8">Notizen</p>
										{#if selectedAppointment.notes !== "null"}
											<p class="regular-text line-height-125">
												{selectedAppointment.notes}
											</p>
										{:else}
											<p class="regular-text">-</p>
										{/if}
									</div>
								</div>
							</div>
						</div>
						<p use:handleAccordion />
					{/each}
				{:else}
					<p class="regular-text">Noch keine Termine an diesem Tag.</p>
				{/if}
			</div>
			<p use:handleLastSelectedDayAppointments />
		{:catch error}
			<p style="color: red">{error.message}</p>
		{/await}
	</div>
</div>
{#if $bottomBarAction === "delete_appointment"}
	<DeleteModal on:deleteEntity={handleDeleteAppointment}>
		"{selectedAppointment.start_date}"
	</DeleteModal>
{/if}

<style>
	.wrapper-current-selected-day {
		margin-bottom: 3rem;
		margin-top: 2rem;
		padding: 0;
		/* border: 1px solid red; */
	}

	:global(appt-bar) {
		height: 1rem;
		width: 30px;
		color: red;
		background-color: red;
		height: 40px;
	}

	:global(testing) {
		border: 20px solid red;
		width: 20rem;
		height: 20rem;
	}

	/* .wrapper-appt {
		border: 1px solid red;
	} */

	.appt-container {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.wrapper {
		min-height: 35rem;
	}

	.event-top-row {
		display: flex;
		align-items: center;
		margin-bottom: 1rem;
	}

	.event-bottom-row {
		display: flex;
		align-items: center;
	}

	.event {
		display: flex;
		flex-direction: column;
		border: 1px solid var(--inactive);
		padding: 1rem;
		width: 100%;
		height: auto;
		background-color: transparent;
		/* margin-top: 1rem; */
		margin-bottom: 1rem;
		border-radius: 5px;
	}
	.wrapper-events {
		grid-column: 1/3;
	}

	.notes {
		grid-column: 1 / 3;
		height: auto;
	}

	.day {
		display: flex;
		width: 95%;
		margin-right: 5%;
		min-height: 4rem;
		margin-top: 5%;
		border-radius: 5px;

		justify-content: center;
		align-items: center;
		cursor: pointer;
	}

	.day-appt {
		display: flex;
		width: 100%;
		min-height: 4rem;
		margin-top: 5%;
		justify-content: center;
		align-items: center;
		cursor: pointer;
		flex-direction: column;
	}

	.day:hover {
		border: 1px solid var(--light);
		cursor: pointer;
	}

	:global(.day-active) {
		cursor: pointer;
		color: var(--dark);
		border: 1px solid var(--dark);
	}

	.appt-sda {
		border: 1px solid var(--light);
		margin-right: 5%;
		border-radius: 5px;
		width: 95%;
	}

	.appt-start {
		border-left: 1px solid var(--light);
		border-top: 1px solid var(--light);
		border-bottom: 1px solid var(--light);
		border-top-left-radius: 5px;
		border-bottom-left-radius: 5px;
	}

	.appt-between {
		border-bottom: 0.5px solid var(--light);
		border-top: 1px solid var(--light);
	}

	.appt-end {
		border-right: 1px solid var(--light);
		border-bottom: 1px solid var(--light);
		border-top: 1px solid var(--light);
		margin-right: 5%;
		width: 95%;
		border-top-right-radius: 5px;
		border-bottom-right-radius: 5px;
	}

	:global(.appt-hover) {
		background-color: var(--light);
		color: var(--bright);
		border: 0px solid var(--dark);
	}

	.wrapper-days {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
	}

	.weekday-name {
		display: flex;
		text-transform: uppercase;
		font-size: 1.2rem;
		font-weight: 400;
		width: 95%;
		margin-right: 5%;
		align-items: center;
		justify-content: center;
		margin-bottom: 1.6rem;
		color: var(--inactive);
	}
</style>

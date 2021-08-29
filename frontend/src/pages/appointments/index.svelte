<!-- TERMINE index -->
<script>
	import { goto, metatags, redirect } from "@roxi/routify";
	metatags.title = "Dogwatch / Termine";
	metatags.description = "Description coming soon...";
	import { onMount, createEventDispatcher, onDestroy } from "svelte";
	import { fade } from "svelte/transition";
	import { GraphQLClient, gql } from "graphql-request";
	import { menuSelection, menuContext, bottomBarAction, lastSelectedDay, statusModalMessages } from "../../stores/state";
	import { leadingZero, extractTimeOfDay, parseDateToString, calculateAge, dateFromDayId, dayIdFromDate, generateId } from "../../_helpers/helperFunctions";
	import DeleteModal from "../_root_components/DeleteModal.svelte";
	import DotMenu from "../_root_components/DotMenu.svelte";

	let showCaredates = false;
	let currentlySelectedDay = null;
	let switchToggle;
	let switchAccept = {};
	let showDeleteModal = false;

	function setAcceptSwitchStatus(bool) {
		console.log("switch", switchAccept);
		if (bool) {
			switchAccept.checked = true;
		} else {
			switchAccept.checked = false;
		}
	}

	function updateAcceptStatus(appointment) {
		async function update() {
			const endpoint = import.meta.env.VITE_GQL_ENDPOINT_URL;
			const graphQLClient = new GraphQLClient(endpoint, {
				credentials: "include",
				mode: "cors",
			});
			const mutation = gql`
				mutation {
					changeAcceptStatus(appointmentId: ${appointment.id}, accepted: ${appointment.accepted}) {
                        id
                        accepted
                    }
				}
			`;

			const data = await graphQLClient.request(mutation);
			return data;
		}
		update()
			.then((v) => {
				console.log(v);
				return true;
			})
			.catch((error) => {
				console.log(error);
				return false;
			});
	}

	// global variable that contains all fetched data
	let fetchedData;

	const weekdayNames = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
	const monthNames = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];

	// ----------------------------------------------
	// INIT, GLOBALS AND LIFECYCLE METHODS
	// ----------------------------------------------

	if (localStorage.getItem("appointmentSwitchStatus") === "caretaker") {
		showCaredates = true;
	}
	if (localStorage.getItem("appointmentSwitchStatus") === "creator") {
		showCaredates = false;
	}

	onMount(() => {
		console.log("onMount()");
		// Mark "Appointments" in Menu
		menuSelection.set("appointments");
		$menuContext.context = "day";

		if (localStorage.getItem("appointmentSwitchStatus") === "caretaker") {
			switchToggle.checked = true;
			showCaredates = true;
			$menuContext.context = "caretaker";
		} else if (localStorage.getItem("appointmentSwitchStatus") === "creator") {
			switchToggle.checked = false;
			showCaredates = false;
			$menuContext.context = "day";
		}
	});

	// later be set by "last Selected" on local Storage
	const todayId = dayIdFromDate(new Date());
	$lastSelectedDay.dayId = todayId;

	function markToday() {
		try {
			const elementToday = document.querySelectorAll(`[data-day-id="${todayId}"]`)[0];
			elementToday.classList.add("today");
		} catch {}
	}

	function handleLastSelectedDayAppointments() {
		try {
			const currentDayElement = document.querySelectorAll(`[data-day-id="${$lastSelectedDay.dayId}"]`);
			const extractedAppointmentIds = currentDayElement[0].dataset.appointmentIds;
			handleRenderDay(null, extractedAppointmentIds);
		} catch {}
	}

	// currently selected Year/Month by the user (set to what's saved in local storage (or defaults to date 'now'))
	$: selectedYear = parseInt(new Date().getFullYear());
	$: selectedMonth = parseInt(new Date().getMonth());

	// a promiseToGenerateCalendar we can await in template
	// the argument 'showCaredates' is passed to monitor its value and re-generate the calendar if it changes (user toggles switch)
	$: promiseToGenerateCalendar = generateCalendar(selectedYear, selectedMonth, showCaredates);

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
				this.firstChild.nextElementSibling.classList.toggle("active");
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
		!showCaredates ? (whatToFetch = "appointments") : (whatToFetch = "caredates");
		const rangeStartDate = rangeStart.toISOString();
		const rangeEndDate = rangeEnd.toISOString();

		async function getUser() {
			const endpoint = import.meta.env.VITE_GQL_ENDPOINT_URL;
			const graphQLClient = new GraphQLClient(endpoint, {
				credentials: "include",
				mode: "cors",
			});
			const buildQuery = (whatToFetch) => {
				return gql`
				query {
					getUser { 
						${whatToFetch} (start_of_range: "${rangeStartDate}", end_of_range: "${rangeEndDate}") {
							id
                            start_date
							end_date
                            accepted
                            color
							creator {
								username
							}
							caretaker {
								username
							}
                            observers {
                                username
                            }
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
			};
			console.log("whatToFetch", whatToFetch);

			if (whatToFetch === "appointments") {
				console.log("fetching created appointments");
				const createdAppointments = await graphQLClient.request(buildQuery("createdAppointments"));
				console.log("result", createdAppointments.getUser);
				return createdAppointments.getUser.createdAppointments;
			} else if (whatToFetch === "caredates") {
				console.log("fetching caredates appointments");
				console.log("query output", buildQuery("caretakerAppointments"));
				const caretakerAppointments = await graphQLClient.request(buildQuery("caretakerAppointments"));
				const observerAppointments = await graphQLClient.request(buildQuery("observerAppointments"));
				console.log("result", [caretakerAppointments.getUser, observerAppointments.getUser]);
				return [caretakerAppointments.getUser.caretakerAppointments, observerAppointments.getUser.observerAppointments];
			}

			// console.log(JSON.stringify(data, undefined, 2));
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
		console.log("generating Calendar");
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
		if (showCaredates) {
			console.log("fetched[0]", fetchedData[0]);
			console.log("typeof", typeof fetchedData[0]);
			fetchedData[0].forEach((appointment) => {
				appointment.role = "caretaker";
			});
			fetchedData[1].forEach((appointment) => {
				appointment.role = "observer";
			});
			console.log("end of loops");
			fetchedData = [...fetchedData[0], ...fetchedData[1]];
		}
		// } else {
		// 	fetchedData = fetchedData.appointments;
		// }
		console.log("fetchedData after", fetchedData);

		// reset the array of appointmentIds
		apptIds = [];
		// generate all appointmentIds ("yyyymmdd") for currently viewed month
		fetchedData.forEach((appointment, index) => {
			const start_date = new Date(parseInt(appointment["start_date"])).setHours(12, 0, 0, 0);
			const end_date = new Date(parseInt(appointment["end_date"])).setHours(12, 0, 0, 0);
			const appointmentLen = Math.floor(end_date - start_date) / msPerDay;
			const listOfIds = [];
			for (let i = 0; i <= appointmentLen; i++) {
				const iterDate = new Date(start_date);
				iterDate.setDate(iterDate.getDate() + i);
				listOfIds.push(generateId(iterDate));
			}
			apptIds.push({ ids: listOfIds, color: appointment.color });
			console.log("apptIds-----------------------", apptIds);
		});

		function generateOrderOfEvents() {
			fetchedData.forEach((appointment) => {
				if (appointment.dogs.length === 0) {
					appointment.events = [];
				} else {
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
				}
			});
		}

		// helper function to filter for all appointment id's (as they are in the database)
		// that are attached to the iterated day
		// later used to look up the corresponding appointment(s) in 'fetchedData'
		function getAppointmentIds(y, m, d) {
			const dateToCheck = new Date(y, m, d, 12, 0, 0, 0).getTime();
			const appointmentIds = [];
			for (let i = 0; i < fetchedData.length; i++) {
				const start_date = new Date(parseInt(fetchedData[i]["start_date"])).setHours(12, 0, 0, 0);
				const end_date = new Date(parseInt(fetchedData[i]["end_date"])).setHours(12, 0, 0, 0);

				if (start_date === dateToCheck || end_date === dateToCheck) {
					appointmentIds.push(fetchedData[i].id);
				}
				if (start_date < dateToCheck && end_date > dateToCheck) {
					appointmentIds.push(fetchedData[i].id);
				}
			}
			return appointmentIds;
		}

		const daysInMonth = new Date(year, month + 1, 0).getDate();
		const days = [];

		// array of day-objects used in template-engine
		for (let i = -offset + 1; i <= 42 - offset; i++) {
			const dt = new Date(year, month, i);
			const objectToPush = {
				id: generateId(dt),
				y: dt.getFullYear(),
				m: dt.getMonth(),
				d: leadingZero(dt.getDate()),
				// grey-out days when they are not part of the current month
				active: i > 0 && i <= daysInMonth,
				appointmentIds: getAppointmentIds(y, m, i),
			};
			days.push(objectToPush);
		}

		generateOrderOfEvents();
		return days;
	}

	// ***********************************************************
	// RENDER APPOINTMENT-INDICATOR-BARS
	// ***********************************************************
	// array of objects ({id, depth}) to keep track of "depth" per day
	// a depth of 0 means there's one appointment on that day, 1 equals two
	// and so on. The corresponding object's depth-property
	// is incremented each time an appointment (or part of an appointment) is
	// found on the the corresponding day (see below)
	let usedIds = [];
	function renderAppointmentIndicatorBars() {
		// reset usedIds
		usedIds = [];

		// apptIds is an array of arrays ([appointment[dayIds ("yyyymmdd"), ...], ...])
		// and needs to be sorted (we want to start with the first day on which an appointment appears
		// and go through all of them in order)
		var sortedApptIds = apptIds.sort(function (a, b) {
			return a.ids[0] - b.ids[0];
		});
		console.log("sortedApptIds", sortedApptIds);
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
					currentDayObject[0].depth = currentDayObject[0].depth + 0.8;
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
					barToAppend.style.height = "0.5rem";
					depth = depth + 0.3;
					barToAppend.style.marginTop = `${depth}rem`;
					targetContainer.append(barToAppend);
				} catch {}
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
		// showDetailview = true;
		if (!providedAppointmentIds) {
			arrayOfAppointmentIds = incomingEvent.target.dataset.appointmentIds.split(",");
			$lastSelectedDay.dayId = incomingEvent.target.dataset.dayId;
		} else {
			arrayOfAppointmentIds = providedAppointmentIds.split(",");
		}

		if (arrayOfAppointmentIds[0] !== "") {
			arrayOfAppointmentIds.forEach((id) => {
				let foundAppointment = fetchedData.find((appointment) => parseInt(id) === parseInt(appointment.id));
				allAppointmentsForSelectedDay.push(foundAppointment);
			});
		}
		allAppointmentsForSelectedDay.sort(function (a, b) {
			return a.start_date - b.start_date;
		});
	}

	// ----------------------------------------------
	// DELETE APPOINTMENT
	// ----------------------------------------------
	let appointmentToDelete = null;
	function deleteAppointmentThroughModal(appointment) {
		showDeleteModal = true;
		appointmentToDelete = appointment;
	}

	async function handleDeleteAppointment() {
		async function deleteAppointment() {
			const endpoint = import.meta.env.VITE_GQL_ENDPOINT_URL;
			const graphQLClient = new GraphQLClient(endpoint, {
				credentials: "include",
				mode: "cors",
			});
			const mutation = gql`
				mutation {
					deleteAppointment(id: ${parseInt(appointmentToDelete.id)}) {
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
		const filteredAppointments = allAppointmentsForSelectedDay.filter((appointment) => {
			return appointment.id !== appointmentToDelete.id;
		});
		allAppointmentsForSelectedDay = filteredAppointments;
		showDeleteModal = false;
		promiseToGenerateCalendar = generateCalendar(selectedYear, selectedMonth);
	}

	// ----------------------------------------------
	// EDIT APPOINTMENT
	// ----------------------------------------------
	async function handleEditAppointment(appointment) {
		$goto(`/appointments/edit/${appointment.id}`);
	}
</script>

<div class="wrapper">
	<div class="headline">
		<!-- Buttons to switch Month -->
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
			<h1 class="color-headline" style="margin: 0">{monthNames[selectedMonth]}</h1>
		</div>
		<p class="headline-label">{selectedYear}</p>
		<!-- Switch to toggle createdAppointments <> caretakerAppointments/observerAppointments -->
		<label class="switch">
			<input
				bind:this={switchToggle}
				type="checkbox"
				on:click={() => {
					showCaredates = !showCaredates;
					if ($menuContext.context === "day") {
						$menuContext.context = "caretaker";
						localStorage.setItem("appointmentSwitchStatus", "caretaker");
						$statusModalMessages = { code: 200, message: "Angezeigte Termine: Aufpasser" };
					} else if ($menuContext.context === "caretaker") {
						$menuContext.context = "day";
						localStorage.setItem("appointmentSwitchStatus", "creator");
						$statusModalMessages = { code: 200, message: "Angezeigte Termine: Ersteller" };
					}
				}}
			/>
			<span class="slider round" />
		</label>
	</div>
	<div style="margin-top: -2rem" class="separator" />
	<div class="wrapper-calendar">
		{#await promiseToGenerateCalendar}
			<div class="wrapper-spinner">
				<div class="lds-ring">
					<div />
					<div />
					<div />
					<div />
				</div>
			</div>
		{:then generatedDays}
			<div in:fade class="wrapper-days">
				{#each weekdayNames as weekdayName}
					<p class="weekday-name">{weekdayName}</p>
				{/each}
				{#each generatedDays as day}
					<div class="appt-container" id={day.id}>
						<div
							on:click={() => (currentlySelectedDay = day.id)}
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
				<p use:renderAppointmentIndicatorBars />
			</div>
			<div in:fade class="wrapper-detailview">
				<div class="separator" />
				<div class="wrapper-current-selected-day">
					<h1 class="color-dark" style="margin-left: 0">{dateFromDayId($lastSelectedDay.dayId)}</h1>
				</div>
				{#if allAppointmentsForSelectedDay.length > 0}
					{#each allAppointmentsForSelectedDay as iteratedAppointment}
						<div class="wrapper-appt">
							<button class="accordion regular-text" style={`border: 2px solid ${iteratedAppointment.color}; display: flex; align-items: center`}>
								<div>
									{`${parseDateToString(parseInt(iteratedAppointment.start_date), false, true)} - ${parseDateToString(
										parseInt(iteratedAppointment.end_date),
										false,
										true
									)}`}
								</div>
								<div class="accordion-button-inner">
									<!-- Icon "(not)Accepted" -->
									<div style="display: flex; align-items: center; margin-right: 1rem">
										{#if iteratedAppointment.accepted === false}
											<span style="border-radius: 20%; background-color: #F61969; width: 1rem; height: 1rem" />
										{:else}
											<span style="border-radius: 20%; background-color: #00D964; width: 1rem; height: 1rem" />
										{/if}
									</div>
								</div>
							</button>
							<div class="panel" id="rootpanel">
								{#if $menuContext.context === "day"}
									<div class="wrapper-context-icons">
										<button in:fade class="icon" on:click|stopPropagation={deleteAppointmentThroughModal(iteratedAppointment)}>
											<svg width="25" height="30" viewBox="0 0 32 38" fill="none" xmlns="http://www.w3.org/2000/svg">
												<path
													d="M19.1429 30.2449H20.8571C21.0845 30.2449 21.3025 30.153 21.4632 29.9894C21.624 29.8257 21.7143 29.6038 21.7143 29.3725V13.6684C21.7143 13.437 21.624 13.2151 21.4632 13.0515C21.3025 12.8878 21.0845 12.7959 20.8571 12.7959H19.1429C18.9155 12.7959 18.6975 12.8878 18.5368 13.0515C18.376 13.2151 18.2857 13.437 18.2857 13.6684V29.3725C18.2857 29.6038 18.376 29.8257 18.5368 29.9894C18.6975 30.153 18.9155 30.2449 19.1429 30.2449ZM30.8571 5.81633H24.9707L22.5421 1.69401C22.2374 1.17709 21.8062 0.749355 21.2907 0.452479C20.7752 0.155603 20.193 -0.000286701 19.6007 3.95834e-07H12.3993C11.8072 -3.55355e-05 11.2253 0.155974 10.7101 0.452837C10.1949 0.749701 9.76394 1.1773 9.45929 1.69401L7.02929 5.81633H1.14286C0.839753 5.81633 0.549062 5.93889 0.334735 6.15704C0.120408 6.37519 0 6.67108 0 6.97959L0 8.14286C0 8.45138 0.120408 8.74726 0.334735 8.96541C0.549062 9.18357 0.839753 9.30612 1.14286 9.30612H2.28571V33.7347C2.28571 34.6602 2.64694 35.5479 3.28992 36.2024C3.9329 36.8568 4.80497 37.2245 5.71429 37.2245H26.2857C27.195 37.2245 28.0671 36.8568 28.7101 36.2024C29.3531 35.5479 29.7143 34.6602 29.7143 33.7347V9.30612H30.8571C31.1602 9.30612 31.4509 9.18357 31.6653 8.96541C31.8796 8.74726 32 8.45138 32 8.14286V6.97959C32 6.67108 31.8796 6.37519 31.6653 6.15704C31.4509 5.93889 31.1602 5.81633 30.8571 5.81633ZM12.2743 3.70137C12.3125 3.63665 12.3665 3.58314 12.4311 3.54605C12.4957 3.50897 12.5687 3.48958 12.6429 3.4898H19.3571C19.4312 3.48971 19.504 3.50915 19.5685 3.54623C19.6329 3.58331 19.6869 3.63676 19.725 3.70137L20.9721 5.81633H11.0279L12.2743 3.70137ZM26.2857 33.7347H5.71429V9.30612H26.2857V33.7347ZM11.1429 30.2449H12.8571C13.0845 30.2449 13.3025 30.153 13.4632 29.9894C13.624 29.8257 13.7143 29.6038 13.7143 29.3725V13.6684C13.7143 13.437 13.624 13.2151 13.4632 13.0515C13.3025 12.8878 13.0845 12.7959 12.8571 12.7959H11.1429C10.9155 12.7959 10.6975 12.8878 10.5368 13.0515C10.376 13.2151 10.2857 13.437 10.2857 13.6684V29.3725C10.2857 29.6038 10.376 29.8257 10.5368 29.9894C10.6975 30.153 10.9155 30.2449 11.1429 30.2449Z"
													fill="var(--dark)"
												/>
											</svg>
										</button>
										<button
											in:fade
											class="icon"
											on:click|stopPropagation={handleEditAppointment(iteratedAppointment)}
											style="margin-top: -0.2rem"
										>
											<svg width="32" height="28" viewBox="0 0 42 37" fill="none" xmlns="http://www.w3.org/2000/svg">
												<path
													d="M29.335 24.9262L31.6684 22.614C32.033 22.2527 32.6674 22.5056 32.6674 23.0259V33.5318C32.6674 35.4465 31.0996 37 29.1673 37H3.50008C1.56774 37 0 35.4465 0 33.5318V8.09798C0 6.18322 1.56774 4.62974 3.50008 4.62974H23.4432C23.9609 4.62974 24.2234 5.25113 23.8589 5.61964L21.5255 7.9318C21.4161 8.04018 21.2703 8.09798 21.1098 8.09798H3.50008V33.5318H29.1673V25.3308C29.1673 25.1791 29.2256 25.0346 29.335 24.9262ZM40.754 10.3451L21.6057 29.3193L15.0139 30.0418C13.1034 30.2514 11.4773 28.6545 11.6888 26.747L12.418 20.2152L31.5663 1.24098C33.2361 -0.41366 35.9341 -0.41366 37.5966 1.24098L40.7467 4.3624C42.4165 6.01704 42.4165 8.6977 40.754 10.3451V10.3451ZM33.5497 12.5778L29.3131 8.37978L15.7649 21.812L15.2326 26.5302L19.9942 26.0028L33.5497 12.5778ZM38.2748 6.81907L35.1247 3.69765C34.8258 3.40141 34.3372 3.40141 34.0455 3.69765L31.7924 5.93033L36.0289 10.1284L38.2821 7.89567C38.5738 7.5922 38.5738 7.11531 38.2748 6.81907V6.81907Z"
													fill="var(--dark)"
												/>
											</svg>
										</button>
									</div>
								{/if}
								{#if iteratedAppointment.role === "caretaker"}
									<label class="switch">
										<input
											bind:this={switchAccept}
											checked={iteratedAppointment.accepted}
											type="checkbox"
											on:click={() => {
												console.log("Toggle Accept");
												iteratedAppointment.accepted = !iteratedAppointment.accepted;
												updateAcceptStatus(iteratedAppointment);
											}}
										/>
										<span class="slider round" />
									</label>
									<!-- <p use:setAcceptSwitchStatus={iteratedAppointment.accepted} /> -->
								{/if}
								<div class="wrapper-fields mt-16">
									<div>
										<p class="label mb-8">Ersteller</p>
										<p class="regular-text mb-8">
											{iteratedAppointment.creator.username}
										</p>
									</div>

									<div>
										<p class="label mb-8">Aufpasser</p>
										{#if !iteratedAppointment.caretaker}
											<p class="regular-text">-</p>
										{:else}
											<p class="regular-text mb-8">
												{iteratedAppointment.caretaker.username}
											</p>
										{/if}
									</div>
									<div>
										<p class="label mb-8">Beobachter</p>
										{#if iteratedAppointment.observers.length === 0}
											<p class="regular-text">-</p>
										{:else}
											{#each iteratedAppointment.observers as observer}
												<p class="regular-text mb-8" style="margin-bottom: 1rem">
													{observer.username}
												</p>
											{/each}
										{/if}
									</div>
									<div>
										<p class="label mb-8">Termin Status</p>
										{#if iteratedAppointment.accepted === true}
											<p class="regular-text mb-8">Bestaetigt</p>
										{:else}
											<p class="regular-text mb-8">Nicht bestaetigt</p>
										{/if}
									</div>
									<div>
										<p class="label mb-8">Ankunft</p>
										<p class="regular-text" style="display: flex; align-items: center">
											<svg xmlns="http://www.w3.org/2000/svg" width="18" height="5" fill="none" style="margin-right: 0.5rem"
												><path
													d="M2.571 0c1.123 0 2.074.692 2.426 1.667H18v1.667H4.997a2.5 2.5 0 0 1-.939 1.21c-.435.299-.954.458-1.487.457a2.61 2.61 0 0 1-1.818-.732C.271 3.799 0 3.163 0 2.5S.271 1.201.753.732A2.61 2.61 0 0 1 2.571 0h0z"
													fill="var(--dark)"
												/></svg
											>
											{extractTimeOfDay(parseInt(iteratedAppointment.start_date))}
										</p>
									</div>
									<div>
										<p class="label mb-8">Abholung</p>
										<p class="regular-text" style="display: flex; align-items: center">
											<svg xmlns="http://www.w3.org/2000/svg" width="18" height="5" fill="none" style="margin-right: 0.5rem"
												><path
													d="M15.429 0c-1.123 0-2.074.692-2.426 1.667H0v1.667h13.003a2.5 2.5 0 0 0 .939 1.21c.435.299.954.458 1.487.457a2.61 2.61 0 0 0 1.818-.732C17.729 3.799 18 3.163 18 2.5s-.271-1.299-.753-1.768A2.61 2.61 0 0 0 15.429 0h0z"
													fill="var(--dark)"
												/></svg
											>
											{extractTimeOfDay(parseInt(iteratedAppointment.end_date))}
										</p>
									</div>
									<div class="wrapper-events">
										<p class="label mb-8">Hunde</p>
										{#if iteratedAppointment.dogs.length === 0}
											<p class="regular-text">-</p>
										{/if}
										{#each iteratedAppointment.dogs as currentDog}
											<button class="accordion regular-text" style="display:flex; align-items: center">
												<div>
													{currentDog.name}
												</div>
												<div class="accordion-button-inner" />
											</button>
											<div class="panel" id="subpanel">
												<div in:fade class="wrapper-detailview">
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
															<p class="regular-text mb-8 line-height-125">{currentDog.race}</p>
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
															<p class="label mb-8">Fütterungen</p>
															{#each currentDog.feedtimes as feedtime}
																<p class="regular-text mb-8" style="display: flex; align-items: center">
																	<svg
																		xmlns="http://www.w3.org/2000/svg"
																		width="18"
																		height="18"
																		fill="none"
																		stroke="var(--dark)"
																		stroke-width="1.5"
																		stroke-linejoin="round"
																		style="margin-right: 0.5rem"
																		><path d="M9 17A8 8 0 1 0 9 1a8 8 0 1 0 0 16z" /><path
																			d="M9 4.429V9l2.286 2.286"
																			stroke-linecap="round"
																		/></svg
																	>
																	{extractTimeOfDay(feedtime)}
																</p>
															{/each}
														</div>
														<div>
															<p class="label mb-8">Spaziergänge</p>
															{#each currentDog.walktimes as walktime}
																<p class="regular-text mb-8" style="display: flex; align-items: center">
																	<svg
																		xmlns="http://www.w3.org/2000/svg"
																		width="18"
																		height="18"
																		fill="none"
																		stroke="var(--dark)"
																		stroke-width="1.5"
																		stroke-linejoin="round"
																		style="margin-right: 0.5rem"
																		><path d="M9 17A8 8 0 1 0 9 1a8 8 0 1 0 0 16z" /><path
																			d="M9 4.429V9l2.286 2.286"
																			stroke-linecap="round"
																		/></svg
																	>
																	{extractTimeOfDay(walktime)}
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
										{/each}
										<p use:handleAccordion />
									</div>
									<div class="wrapper-events">
										<p class="label mb-8">Ablauf</p>
										{#if iteratedAppointment.events.length === 0}
											<p class="regular-text">-</p>
										{:else}
											{#each iteratedAppointment.events as event}
												<button class="accordion regular-text" style="display:flex; align-items: center">
													<div>
														{parseDateToString(event.date)}
													</div>
													<div class="accordion-button-inner" />
												</button>
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
										{/if}
									</div>
									<div style="margin-bottom: 5rem;">
										<p class="label mb-8">Notizen</p>
										{#if iteratedAppointment.notes !== ""}
											<p class="regular-text line-height-125">
												{iteratedAppointment.notes}
											</p>
										{:else}
											<p class="regular-text">-</p>
										{/if}
									</div>
								</div>
							</div>
						</div>
					{/each}
				{:else}
					<p class="regular-text">Noch keine Termine an diesem Tag</p>
				{/if}
			</div>
			<p use:handleLastSelectedDayAppointments />
			<p use:handleAccordion />
			<p use:markToday />
		{:catch error}
			<p style="color: red">{error.message}</p>
		{/await}
	</div>
</div>
{#if showDeleteModal}
	<DeleteModal on:deleteEntity={handleDeleteAppointment} on:closeModal={() => (showDeleteModal = false)} typeToDelete={"appointment"} />
{/if}

<style>
	:global(.today) {
		border: 1px solid var(--light);
	}

	:global(.day-active) {
		cursor: pointer;
		color: var(--dark);
		border: 1px solid var(--dark);
	}

	:global(.appt-hover) {
		background-color: var(--light);
		color: var(--bright);
		border: 0px solid var(--dark);
	}

	.wrapper-context-icons {
		display: flex;
		align-items: center;
	}

	.wrapper-current-selected-day {
		margin-bottom: 1.5rem;
		margin-top: 2rem;
		padding: 0;
	}

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

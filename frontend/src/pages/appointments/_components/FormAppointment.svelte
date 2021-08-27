<!-- TERMINE index -->
<script>
	import { goto, metatags, redirect } from "@roxi/routify";
	metatags.title = "Dogwatch / Termine / Hinzufügen";
	metatags.description = "Description coming soon...";
	import { onMount, onDestroy } from "svelte";
	import * as yup from "yup";
	import { GraphQLClient, gql } from "graphql-request";

	import { menuSelection, menuContext, bottomBarAction, liveValidation, statusModalMessages, lastSelectedDay } from "../../../stores/state";
	import { leadingZero } from "../../../_helpers/helperFunctions";

	import randomColor from "randomcolor"; // import the script

	let extractedYear;
	let extractedMonth;
	let extractedDay;
	let currentDate;

	// formContext can be "add" or "edit"
	export let formContext;
	export let toUpdateAppointmentData;

	let appointmentData = {
		dogs: [],
		caretaker: null,
		observers: [],
		start_date: null,
		end_date: null,
		notes: null,
	};

	let start_date_selections = { hour: 0, minute: 0 };
	let end_date_selections = { year: null, month: null, day: null, hour: 0, minute: 0 };

	let fetchedDogs = [];
	let selectedDog = null;
	let dropdownSelectDogs;

	let fetchedContacts = [];

	let selectedCaretaker = null;
	let dropdownSelectCaretaker;

	let selectedObserver = null;
	let dropdownSelectObserver;

	$: titleDate = renderTitleDates(end_date_selections.year, end_date_selections.month, end_date_selections.day);

	function renderTitleDates() {
		console.log("RENDER TITLE DATe");
		console.log(end_date_selections);
		const start_date = new Date(extractedYear, extractedMonth, extractedDay);
		const end_date = new Date(end_date_selections.year, end_date_selections.month, end_date_selections.day);
		const start_date_fixed = start_date.setHours(12, 0, 0, 0);
		const end_date_fixed = end_date.setHours(12, 0, 0, 0);
		if (start_date_fixed === end_date_fixed || end_date_fixed < start_date_fixed) {
			return `${extractedDay}. ${monthNames[extractedMonth]}`;
		} else {
			const end_date_day = end_date.getDate();
			const end_date_month = monthNames[end_date.getMonth()];
			const end_date_year = end_date.getFullYear();
			return `${extractedDay}. ${monthNames[extractedMonth]} - ${end_date_day}. ${end_date_month}`;
		}
	}

	const monthNames = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];
	const end_date_ranges = { days: null, years: [] };
	let titleDate;

	function getDaysInMonth(date) {
		// const date = new Date(ISOdate);
		const year = date.getFullYear();
		const month = date.getMonth();
		// console.log("getDaysInMonth");
		// console.log("getDaysInMonth Date:", date);
		// console.log("daysInMonth: ", new Date(year, month + 1, 0).getDate());
		return new Date(year, month + 1, 0).getDate();
	}

	// ********************************************************
	// ON MOUNT
	// ********************************************************
	let colorTest;

	onMount(() => {
		console.log("lastSelected", $lastSelectedDay.dayId);
		if ($lastSelectedDay.dayId) {
			console.log("mounting with dayId");
			menuSelection.set("appointments");
			menuContext.set({ context: "appointment_add" });
			bottomBarAction.set("");
			liveValidation.set(false);
			console.log("on mount");
			if (formContext === "add") {
				extractedYear = parseInt($lastSelectedDay.dayId.slice(0, 4));
				extractedMonth = parseInt($lastSelectedDay.dayId.slice(4, 6)) - 1;
				extractedDay = parseInt($lastSelectedDay.dayId.slice(6, 8));
			} else if (formContext === "edit") {
				console.log("context EDIT, to update data", toUpdateAppointmentData);
				const start_date = new Date(parseInt(toUpdateAppointmentData.start_date));
				console.log("startDate", start_date);
				extractedYear = start_date.getFullYear();
				extractedMonth = start_date.getMonth();
				extractedDay = start_date.getDate();
			}
			// titleDate = `${extractedDay}. ${monthNames[extractedMonth]}`;

			console.log("onMount() extractedYear:", extractedYear);

			// appointmentData.start_date = new Date(extractedYear, extractedMonth, extractedDay).toISOString();

			end_date_selections.year = extractedYear;
			end_date_selections.month = extractedMonth;
			end_date_selections.day = extractedDay;

			currentDate = new Date(extractedYear, extractedMonth, extractedDay);
			end_date_ranges.days = getDaysInMonth(currentDate);
			end_date_ranges.years = (function () {
				let year = parseInt(currentDate.getFullYear());
				const range = [];
				for (let i = 0; i < 10; i++) {
					let yearToPush = year + i;
					range.push(yearToPush);
				}
				return range;
			})();

			initFetch();
		} else {
			$goto("/appointments");
		}
	});

	function onAppointmentDataToUpdate() {
		console.log("toUpdateDate", toUpdateAppointmentData);
		appointmentData = toUpdateAppointmentData;
		appointmentData.start_date = new Date(parseInt(appointmentData.start_date)).toISOString();
		appointmentData.end_date = new Date(parseInt(appointmentData.end_date)).toISOString();
		const extracted_start_date = new Date(appointmentData.start_date);
		start_date_selections = {
			hour: String(leadingZero(extracted_start_date.getHours())),
			minute: String(leadingZero(extracted_start_date.getMinutes())),
		};
		const extracted_end_date = new Date(appointmentData.end_date);
		end_date_selections = {
			year: extracted_end_date.getFullYear(),
			month: extracted_end_date.getMonth(),
			day: extracted_end_date.getDate(),
			hour: String(leadingZero(extracted_end_date.getHours())),
			minute: String(leadingZero(extracted_end_date.getMinutes())),
		};
		console.log("eds", end_date_selections);
		fetchedContacts = fetchedContacts.filter((element) => element.id !== appointmentData.caretaker.id);

		appointmentData.observers.forEach((observer) => {
			fetchedContacts = fetchedContacts.filter((element) => element.id !== observer.id);
		});
		fetchedContacts.sort();

		appointmentData.dogs.forEach((dog) => {
			fetchedDogs = fetchedDogs.filter((element) => element.id !== dog.id);
			fetchedDogs.sort();
		});
		console.log("appointmentData ------------------------", appointmentData);
	}

	// used as proxy so we can call this onMount() and await in markup
	async function initFetch() {
		const data = await getData();
		fetchedDogs = data.dogs;
		fetchedContacts = data.contacts;

		if (toUpdateAppointmentData) {
			onAppointmentDataToUpdate();
		}
		return;
	}

	// ********************************************************
	// FETCH DATA
	// ********************************************************
	async function getData() {
		async function getUser() {
			const endpoint = import.meta.env.VITE_GQL_ENDPOINT_URL;
			const graphQLClient = new GraphQLClient(endpoint, {
				credentials: "include",
				mode: "cors",
			});
			const query = gql`
				query {
					getUser {
						dogs {
							id
							name
						}
						contacts {
							id
							username
						}
					}
				}
			`;
			const data = await graphQLClient.request(query);
			console.log(JSON.stringify(data, undefined, 2));
			return data.getUser;
		}
		return await getUser().catch((error) => console.error(error));
	}

	// ********************************************************
	// FORM DATA
	// ********************************************************
	// ----------------------------------------------------
	// DOGS
	// ----------------------------------------------------

	function addDog() {
		if (selectedDog) {
			appointmentData.dogs = [selectedDog, ...appointmentData.dogs];
			console.log(appointmentData);
			fetchedDogs = fetchedDogs.filter((element) => element !== selectedDog);
			fetchedDogs.sort();
			dropdownSelectDogs.selectedIndex = 0;
			selectedDog = null;
		}
	}

	function addAllDogs() {
		appointmentData.dogs = [...appointmentData.dogs, ...fetchedDogs];
		fetchedDogs = [];
		dropdownSelectDogs.selectedIndex = 0;
	}

	function removeDog(dog) {
		appointmentData.dogs = appointmentData.dogs.filter((element) => element !== dog);
		fetchedDogs = [...fetchedDogs, dog];
		fetchedDogs.sort();
		selectedDog = null;
	}

	// ----------------------------------------------------
	// CARETAKER
	// ----------------------------------------------------
	function addCaretaker() {
		console.log("add caretaker");
		if (selectedCaretaker) {
			if (appointmentData.caretaker !== null) {
				fetchedContacts = [...fetchedContacts, appointmentData.caretaker];
				fetchedContacts.sort();
			}
			appointmentData.caretaker = selectedCaretaker;
			console.log(appointmentData);
			fetchedContacts = fetchedContacts.filter((element) => element !== selectedCaretaker);
			fetchedContacts.sort();
			dropdownSelectCaretaker.selectedIndex = 0;
			selectedCaretaker = null;
		}
	}

	function removeCaretaker(caretaker) {
		appointmentData.caretaker = null;
		fetchedContacts = [...fetchedContacts, caretaker];
		fetchedContacts.sort();
		selectedCaretaker = null;
	}

	// ----------------------------------------------------
	// OBSERVERS
	// ----------------------------------------------------

	function addObserver() {
		console.log("add observer");
		if (selectedObserver) {
			appointmentData.observers = [selectedObserver, ...appointmentData.observers];
			fetchedContacts = fetchedContacts.filter((element) => element !== selectedObserver);
			fetchedContacts.sort();
			dropdownSelectObserver.selectedIndex = 0;
			selectedObserver = null;
		}
	}

	function removeObserver(observer) {
		appointmentData.observers = appointmentData.observers.filter((element) => element !== observer);
		fetchedContacts = [...fetchedContacts, observer];
		fetchedContacts.sort();
		selectedObserver = null;
	}

	// ----------------------------------------------------
	// START DATE
	// ----------------------------------------------------

	function setStartdate() {
		console.log("setStartdate");
		console.log("start_date_selections", start_date_selections);
		if (start_date_selections.hour && start_date_selections.minute) {
			const dateToSave = new Date(
				extractedYear,
				extractedMonth,
				extractedDay,
				parseInt(start_date_selections.hour),
				parseInt(start_date_selections.minute)
			);
			appointmentData.start_date = dateToSave.toISOString();
			console.log("appointmentData", appointmentData);
		}
	}

	// ----------------------------------------------------
	// END DATE
	// ----------------------------------------------------
	function setEnddate() {
		console.log("set endDate");
		console.log(end_date_selections);
		console.log(end_date_selections);
		const newCurrentDate = new Date(end_date_selections.year, end_date_selections.month, 1);
		console.log("newCurrentDate", newCurrentDate);
		end_date_ranges.days = getDaysInMonth(newCurrentDate);
		console.log("selection", end_date_selections.day);
		console.log("range", end_date_ranges.days);
		if (end_date_selections.day > end_date_ranges.days) {
			end_date_selections.day = end_date_ranges.days;
		}

		if (end_date_selections.hour && end_date_selections.minute) {
			const dateToSave = new Date(
				end_date_selections.year,
				end_date_selections.month,
				end_date_selections.day,
				parseInt(end_date_selections.hour),
				parseInt(end_date_selections.minute)
			);

			console.log("dateToSave", dateToSave);
			appointmentData.end_date = dateToSave.toISOString();
			console.log("dateToSave ISO", appointmentData.end_date);
			console.log("ISO back to Date", new Date(dateToSave));
			console.log("appointmentData", appointmentData);
		}
	}

	// ********************************************************
	// VALIDATION
	// ********************************************************

	// errors Frontend-Validation
	let appointmentValidationErrors = {};

	// ----------------------------------------------------
	// NEW APPOINTMENT SCHEMA
	// ----------------------------------------------------
	const schema_appointment = yup.object().shape({
		dogs: yup.array().of(
			yup.object().shape({
				id: yup.number().required(),
				name: yup.string().required(),
			})
		),
		// .required()
		// .min(1, "Bitte Hund(e) hinzufuegen")

		caretaker: yup.object().shape({
			id: yup.number().required(),
			username: yup.string().required(),
		}),

		observers: yup.array().of(
			yup.object().shape({
				id: yup.number().required(),
				username: yup.string().required(),
			})
		),
		// .required()
		// .min(1, "Bitte Aufpasser hinzufuegen"),
		start_date: yup.date().required("Bitte Startdatum angeben").typeError("Bitte Ankunftszeit angeben"),
		end_date: yup
			.date()
			.required("Bitte Enddatum angeben")
			.required(yup.ref("start_date"), "Startddatum fehlt")
			.typeError("Bitte Abholzeit angeben")
			.min(yup.ref("start_date"), "Zeitpunkt der Abholung liegt vor der Ankunft"),
		notes: yup.string().nullable(),
	});
	// ----------------------------------------------------
	// VALIDATION
	// ----------------------------------------------------
	const validate = async (schema, data, errors) => {
		try {
			await schema.validate(data, { abortEarly: false });
			// alert(JSON.stringify(get(data), null, 2));
			errors = {};
			appointmentValidationErrors = {};
			return true;
		} catch (err) {
			console.log(errors);
			errors = extractErrors(err);
			console.log(errors);
			appointmentValidationErrors = errors;
			console.log(appointmentValidationErrors);
			$statusModalMessages = { code: 1, message: "Bitte die fehlenden Felder ausfuellen" };
			return false;
		}
	};

	// ----------------------------------------------------
	// EXTRACT VALIDATION ERRORS (FRONTEND)
	// ----------------------------------------------------
	function extractErrors(err) {
		return err.inner.reduce((acc, err) => {
			return { ...acc, [err.path]: err.message };
		}, {});
	}

	$: validateLive(appointmentData);
	function validateLive() {
		if ($liveValidation) {
			validate(schema_appointment, appointmentData, appointmentValidationErrors);
		}
	}

	// ********************************************************
	// Write TO DB
	// ********************************************************

	async function writeAppointmentToDB() {
		if (await validate(schema_appointment, appointmentData, appointmentValidationErrors)) {
			async function writeAppointment() {
				const endpoint = import.meta.env.VITE_GQL_ENDPOINT_URL;
				const graphQLClient = new GraphQLClient(endpoint, {
					credentials: "include",
					mode: "cors",
				});

				appointmentData.color = randomColor({
					luminosity: "light",
					hue: "random",
				});

				const dogIds = [];
				appointmentData.dogs.forEach((dog) => {
					dogIds.push(parseInt(dog.id));
				});

				const observerIds = [];
				appointmentData.observers.forEach((observer) => {
					observerIds.push(parseInt(observer.id));
				});

				const mutation = gql`
			    mutation {
			        addAppointment(
                        start_date: "${appointmentData.start_date}",
                        end_date: "${appointmentData.end_date}",
			            caretaker: ${appointmentData.caretaker.id},
                        observers: ${JSON.stringify(observerIds)},
			            dogs: ${JSON.stringify(dogIds)},
                        notes: "${appointmentData.notes}",
                        color: "${appointmentData.color}"
			        ){
						id
                        status
			        }
			    }
			`;
				const data = await graphQLClient.request(mutation);
				console.log("returned data from GQL", data);
				if (data.addAppointment.status.code === 200) {
					statusModalMessages.set({ code: 200, message: `Termin wurde erfolgreich angelegt.` });
				} else if (data.addAppointment.status.code === 401) {
					statusModalMessages.set({ code: 401, message: "Benutzer nicht angemeldet." });
				} else {
					statusModalMessages.set({ code: 1, message: "Unbekannter Fehler beim hinzufuegen eines neuen Termins" });
				}
				console.log(data.addAppointment.status);
				console.log(JSON.stringify(data, undefined, 2));
				return data.addAppointment;
			}
			writeAppointment()
				.then((appointment) => {
					console.log(appointment);
					$goto("/appointments");
				})
				.catch((error) => console.error(error));
		} else {
			return false;
		}
	}

	async function updateAppointmentInDB() {
		if (await validate(schema_appointment, appointmentData, appointmentValidationErrors)) {
			async function writeAppointment() {
				const endpoint = import.meta.env.VITE_GQL_ENDPOINT_URL;
				const graphQLClient = new GraphQLClient(endpoint, {
					credentials: "include",
					mode: "cors",
				});

				console.log("appointmentData", appointmentData);

				const dogIds = [];
				appointmentData.dogs.forEach((dog) => {
					dogIds.push(parseInt(dog.id));
				});

				const observerIds = [];
				appointmentData.observers.forEach((observer) => {
					observerIds.push(parseInt(observer.id));
				});

				const mutation = gql`
			    mutation {
			        updateAppointment(
                        start_date: "${appointmentData.start_date}",
                        end_date: "${appointmentData.end_date}",
                        accepted: false,
			            caretaker: ${appointmentData.caretaker},
                        observers: ${JSON.stringify(observerIds)},
			            dogs: ${JSON.stringify(dogIds)},
                        notes: "${appointmentData.notes}",
                        color: "${appointmentData.color}"
			        ){
						id
						status
			        }
			    }
			`;
				const data = await graphQLClient.request(mutation);
				if (data.updateAppointment.status.code === 200) {
					statusModalMessages.set({ code: 200, message: `Termin wurde erfolgreich aktualisiert.` });
				} else if (data.updateAppointment.status.code === 401) {
					statusModalMessages.set({ code: 401, message: "Benutzer nicht angemeldet." });
				} else {
					statusModalMessages.set({ code: 1, message: "Unbekannter Fehler beim bearbeiten eines Termins" });
				}
				console.log(data.updateAppointment.status);
				console.log(JSON.stringify(data, undefined, 2));
				return data.updateAppointment;
			}
			writeAppointment()
				.then((appointment) => {
					$goto("/appointments");
				})
				.catch((error) => console.error(error));
		} else {
			return false;
		}
	}

	$: {
		if ($bottomBarAction === "appointment_save") {
			console.log("trying to write Appointment to DB...");
			$bottomBarAction = "";
			if (formContext === "add") {
				writeAppointmentToDB();
			}
			if (formContext === "edit") {
				updateAppointmentInDB();
			}
		}
	}

	// ********************************************************
	// ON DESTROY
	// ********************************************************

	onDestroy(() => {
		console.log("onDestroy() addAppointment");
		$liveValidation = false;
		console.log(appointmentData);
	});
</script>

{#await initFetch}
	<div class="wrapper-spinner">
		<div class="lds-ring">
			<div />
			<div />
			<div />
			<div />
		</div>
	</div>
{:then}
	<div class="wrapper">
		<div class="headline debug-border">
			<p class="h1 color-headline">{titleDate}</p>
			<p class="headline-label">{extractedYear}</p>
			<!-- <p class="label">Termin anlegen</p> -->
		</div>
		<div style="margin-top: -2rem" class="separator" />

		<div class="wrapper-form">
			<!-- ******************************************************** -->
			<!-- DOGS -->
			<!-- ******************************************************** -->
			<p class="label color-dark">Hunde</p>
			<div class="display-flex mt-8">
				<!-- svelte-ignore a11y-no-onchange -->
				<select bind:this={dropdownSelectDogs} bind:value={selectedDog} on:change={addDog} class:selected={appointmentData.dogs.length > 0}>
					<option value="" disabled selected>Bitte auswählen</option>
					{#each fetchedDogs as dog}
						<option value={dog}>{dog.name}</option>
					{/each}
				</select>
				<button on:click={addAllDogs} class="btn btn-regular ml-8">Alle Hunde hinzufügen</button>
			</div>
			{#if appointmentValidationErrors.dogs}
				<p class="form-validation-error mt-8">({appointmentValidationErrors.dogs})</p>
			{/if}
			<!-- ----------------------------------------------------- -->
			<!-- LIST OF ADDED DOGS -->
			<!-- ----------------------------------------------------- -->
			<div class="wrapper-list">
				{#each appointmentData.dogs as dog}
					<div class="list-item mt-8 regular-text">
						{dog.name}
						<button on:click={() => removeDog(dog)} class="btn btn-w-icon">
							<svg width="16" height="16" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path
									fill-rule="evenodd"
									clip-rule="evenodd"
									d="M10.2476 10.1872C9.95471 10.4801 9.47984 10.4801 9.18695 10.1872L1.18719 2.18718C0.894302 1.89428 0.894309 1.41941 1.18721 1.12652C1.4801 0.833633 1.95498 0.83364 2.24787 1.12654L10.2476 9.12654C10.5405 9.41944 10.5405 9.89431 10.2476 10.1872Z"
									fill="var(--dark)"
								/>
								<path
									fill-rule="evenodd"
									clip-rule="evenodd"
									d="M10.2479 1.12652C10.5407 1.41941 10.5408 1.89428 10.2479 2.18718L2.24811 10.1872C1.95522 10.4801 1.48035 10.4801 1.18745 10.1872C0.894554 9.89431 0.894547 9.41944 1.18744 9.12654L9.18719 1.12654C9.48008 0.83364 9.95495 0.833633 10.2479 1.12652Z"
									fill="var(--dark)"
								/>
							</svg>
						</button>
					</div>
				{/each}
			</div>
			<!-- ******************************************************** -->
			<!-- CARETAKER -->
			<!-- ******************************************************** -->
			<p class="label color-dark mt-20">Aufpasser</p>
			<div class="display-flex mt-8">
				<!-- svelte-ignore a11y-no-onchange -->
				<select
					bind:this={dropdownSelectCaretaker}
					bind:value={selectedCaretaker}
					on:change={addCaretaker}
					class:selected={appointmentData.caretaker !== null}
				>
					<option value="" disabled selected>Bitte auswählen</option>
					{#each fetchedContacts as contact}
						<option value={contact}>{contact.username}</option>
					{/each}
				</select>
			</div>
			{#if appointmentValidationErrors.caretaker}
				<p class="form-validation-error mt-8">({appointmentValidationErrors.caretaker})</p>
			{/if}
			<!-- ----------------------------------------------------- -->
			<!-- ADDED CARETAKER -->
			<!-- ----------------------------------------------------- -->
			{#if appointmentData.caretaker !== null}
				<div class="wrapper-list">
					<div class="list-item mt-8 regular-text">
						{appointmentData.caretaker.username}
						<button on:click={() => removeCaretaker(appointmentData.caretaker)} class="btn btn-w-icon">
							<svg width="16" height="16" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path
									fill-rule="evenodd"
									clip-rule="evenodd"
									d="M10.2476 10.1872C9.95471 10.4801 9.47984 10.4801 9.18695 10.1872L1.18719 2.18718C0.894302 1.89428 0.894309 1.41941 1.18721 1.12652C1.4801 0.833633 1.95498 0.83364 2.24787 1.12654L10.2476 9.12654C10.5405 9.41944 10.5405 9.89431 10.2476 10.1872Z"
									fill="var(--dark)"
								/>
								<path
									fill-rule="evenodd"
									clip-rule="evenodd"
									d="M10.2479 1.12652C10.5407 1.41941 10.5408 1.89428 10.2479 2.18718L2.24811 10.1872C1.95522 10.4801 1.48035 10.4801 1.18745 10.1872C0.894554 9.89431 0.894547 9.41944 1.18744 9.12654L9.18719 1.12654C9.48008 0.83364 9.95495 0.833633 10.2479 1.12652Z"
									fill="var(--dark)"
								/>
							</svg>
						</button>
					</div>
				</div>
			{/if}
			<!-- ******************************************************** -->
			<!-- OBSERVERS -->
			<!-- ******************************************************** -->
			<p class="label color-dark mt-20">Beobachter</p>
			<div class="display-flex mt-8">
				<!-- svelte-ignore a11y-no-onchange -->
				<select
					bind:this={dropdownSelectObserver}
					bind:value={selectedObserver}
					on:change={addObserver}
					class:selected={appointmentData.observers.length > 0}
				>
					<option value="" disabled selected>Bitte auswählen</option>
					{#each fetchedContacts as contact}
						<option value={contact}>{contact.username}</option>
					{/each}
				</select>
			</div>
			{#if appointmentValidationErrors.observers}
				<p class="form-validation-error mt-8">({appointmentValidationErrors.observers})</p>
			{/if}
			<!-- ----------------------------------------------------- -->
			<!-- LIST OF ADDED OBSERVERS -->
			<!-- ----------------------------------------------------- -->
			<div class="wrapper-list">
				{#each appointmentData.observers as observer}
					<div class="list-item mt-8 regular-text">
						{observer.username}
						<button on:click={() => removeObserver(observer)} class="btn btn-w-icon">
							<svg width="16" height="16" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path
									fill-rule="evenodd"
									clip-rule="evenodd"
									d="M10.2476 10.1872C9.95471 10.4801 9.47984 10.4801 9.18695 10.1872L1.18719 2.18718C0.894302 1.89428 0.894309 1.41941 1.18721 1.12652C1.4801 0.833633 1.95498 0.83364 2.24787 1.12654L10.2476 9.12654C10.5405 9.41944 10.5405 9.89431 10.2476 10.1872Z"
									fill="var(--dark)"
								/>
								<path
									fill-rule="evenodd"
									clip-rule="evenodd"
									d="M10.2479 1.12652C10.5407 1.41941 10.5408 1.89428 10.2479 2.18718L2.24811 10.1872C1.95522 10.4801 1.48035 10.4801 1.18745 10.1872C0.894554 9.89431 0.894547 9.41944 1.18744 9.12654L9.18719 1.12654C9.48008 0.83364 9.95495 0.833633 10.2479 1.12652Z"
									fill="var(--dark)"
								/>
							</svg>
						</button>
					</div>
				{/each}
			</div>
			<!-- ******************************************************** -->
			<!-- START TIME -->
			<!-- ******************************************************** -->
			<!-- DROPDOWN TO ADD TIME -->
			<p class="label color-dark mt-20">Ankunft</p>
			<div class="wrapper-selects mt-8">
				<!-- svelte-ignore a11y-no-onchange -->
				<select bind:value={start_date_selections.hour} on:change={setStartdate} class:selected={start_date_selections.hour}>
					<option value="" disabled selected>Stunde</option>
					{#each { length: 24 } as _, i}
						<option>{String(leadingZero(i))}</option>
					{/each}
				</select>
				<!-- svelte-ignore a11y-no-onchange -->
				<select bind:value={start_date_selections.minute} on:change={setStartdate} class="ml-8" class:selected={start_date_selections.minute}>
					<option value="" disabled selected>Minute</option>
					<option>00</option>
					<option>15</option>
					<option>30</option>
					<option>45</option>
				</select>
				<p class="regular-text ml-8">Uhr</p>
			</div>
			{#if appointmentValidationErrors.start_date}
				<p class="form-validation-error mt-8">({appointmentValidationErrors.start_date})</p>
			{/if}
			<!-- ******************************************************** -->
			<!-- END TIME/DATE -->
			<!-- ******************************************************** -->
			<!-- DROPDOWN TO ADD TIME -->
			<p class="label color-dark mt-20">Abholung</p>
			<!-- DATE SELECT -->
			<div class="wrapper-selects mt-8">
				<!-- svelte-ignore a11y-no-onchange -->
				<select bind:value={end_date_selections.day} on:change={setEnddate} class:selected={end_date_selections.day !== null}>
					{#each { length: end_date_ranges.days } as _, dayIndex}
						<option value={dayIndex + 1}>{dayIndex + 1}</option>
					{/each}
				</select>

				<!-- svelte-ignore a11y-no-onchange -->
				<select class="ml-8" bind:value={end_date_selections.month} on:change={setEnddate} class:selected={end_date_selections.month !== null}>
					{#each monthNames as monthName}
						<option value={monthNames.indexOf(monthName)}>{monthName}</option>
					{/each}
				</select>

				<!-- svelte-ignore a11y-no-onchange -->
				<select class="ml-8" bind:value={end_date_selections.year} on:change={setEnddate} class:selected={end_date_selections.year !== null}>
					{#each end_date_ranges.years as year}
						<option value={year}>{year}</option>
					{/each}
				</select>
			</div>
			<div class="wrapper-selects mt-8">
				<!-- svelte-ignore a11y-no-onchange -->
				<select bind:value={end_date_selections.hour} on:change={setEnddate} class:selected={end_date_selections.hour}>
					<option value="" disabled selected>Stunde</option>
					{#each { length: 24 } as _, i}
						<option>{String(leadingZero(i))}</option>
					{/each}
				</select>
				<!-- svelte-ignore a11y-no-onchange -->
				<select bind:value={end_date_selections.minute} on:change={setEnddate} class="ml-8" class:selected={end_date_selections.minute}>
					<option value="" disabled selected>Minute</option>
					<option>00</option>
					<option>15</option>
					<option>30</option>
					<option>45</option>
				</select>
				<p class="regular-text ml-8">Uhr</p>
			</div>

			{#if appointmentValidationErrors.end_date}
				<p class="form-validation-error mt-8">({appointmentValidationErrors.end_date})</p>
			{/if}
			<!-- ******************************************************** -->
			<!-- NOTES -->
			<!-- ******************************************************** -->
			<p class="label color-dark mt-32">Notizen</p>
			<div>
				<textarea bind:value={appointmentData.notes} class="notes mt-8" cols="30" rows="10" />
			</div>
		</div>
	</div>
{/await}

<style>
</style>

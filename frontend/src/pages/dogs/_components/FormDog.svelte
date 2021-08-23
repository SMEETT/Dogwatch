<script>
	import { goto, metatags, redirect } from "@roxi/routify";
	metatags.title = "Dogwatch / Hunde / Hinzufügen";
	metatags.description = "Description coming soon...";
	import { onMount, onDestroy } from "svelte";
	import * as yup from "yup";
	import { GraphQLClient, gql } from "graphql-request";

	import Cropper from "svelte-easy-crop";
	// import Resizer from "react-image-file-resizer";
	// const resize = Resizer.imageFileResizer;

	import imageFileResizer from "../../../_helpers/imageResizer";
	const resize = imageFileResizer.imageFileResizer;

	import { menuSelection, menuContext, bottomBarAction, liveValidation, statusModalMessages } from "../../../stores/state";
	import { leadingZero } from "../../../_helpers/helperFunctions";

	let image;

	let dogData = {
		medications: [],
		walktimes: [],
		feedtimes: [],
		notes: "",
		// name: null,
		// ageYears: null,
		// ageMonths: null,
		// gender: null,
		// race: null,
		// weight: null,
		// food_amount: null,
		// walk_duration: null,
		// notes: null,
	};

	// formContext can be "add" or "edit"
	export let formContext;
	export let toUpdateDogData;

	if (toUpdateDogData) {
		console.log("incoming data for edit dog");
		dogData = toUpdateDogData;
		image = dogData.image;
	}

	let titleFormContext;

	if (formContext === "edit") {
		titleFormContext = "Hund bearbeiten";
	} else if (formContext === "add") {
		titleFormContext = "Hund anlegen";
	}

	// ********************************************************
	// FORM DATA
	// ********************************************************
	// ----------------------------------------------------
	// BIRTHDAY
	// ----------------------------------------------------
	let birthday;
	const monthNames = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];
	function convertBirthday() {
		// birthday comes in format yyyy-mm-dd
		// and gets split into [yyyy, mm, dd]
		const array = birthday.split("-");
		const bday = new Date(array[0], array[1] - 1, array[2]);
		const ISOString = bday.toISOString();
		dogData.birthday = ISOString;
	}
	// ----------------------------------------------------
	// GENDER
	// ----------------------------------------------------
	const genders = ["Männlich", "Weiblich", "Divers"];

	// ----------------------------------------------------
	// MEDICATION
	// ----------------------------------------------------
	let medication;
	let medicationInput;
	function addMedication() {
		if (medication) {
			dogData.medications = [medication, ...dogData.medications];
			console.log(dogData.medications);
			medication = "";
			medicationInput.focus();
		}
	}
	function removeMedication(med) {
		dogData.medications = dogData.medications.filter((t) => t !== med);
	}

	// ----------------------------------------------------
	// WALKTIMES
	// ----------------------------------------------------
	let walktime = { hour: null, minute: null };
	let walktimeHourInput, walktimeMinuteInput;
	$: if (walktime.hour !== null && walktime.minute !== null) {
		// let walktimeToAdd = { hour: parseInt(walktime.hour), minute: parseInt(walktime.minute) };
		// var d = new Date(year, month, day, hours, minutes, seconds, milliseconds);
		const walktimeToDate = new Date(0, 0, 0, parseInt(walktime.hour), parseInt(walktime.minute), 0, 0);
		const walktimeToAdd = walktimeToDate.toISOString();
		dogData.walktimes = [walktimeToAdd, ...dogData.walktimes];
		dogData.walktimes.sort();
		walktime.hour = null;
		walktime.minute = null;
		walktimeHourInput.selectedIndex = 0;
		walktimeMinuteInput.selectedIndex = 0;
		walktimeHourInput.blur();
		walktimeMinuteInput.blur();
	}

	function removeWalktime(time) {
		dogData.walktimes = dogData.walktimes.filter((t) => t !== time);
	}
	// ----------------------------------------------------
	// FEEDTIMES
	// ----------------------------------------------------
	let feedtime = { hour: null, minute: null };
	let feedtimeHourInput, feedtimeMinuteInput;
	$: if (feedtime.hour !== null && feedtime.minute !== null) {
		const feedtimeAsDate = new Date(0, 0, 0, parseInt(feedtime.hour), parseInt(feedtime.minute), 0, 0);
		const feedtimeToAdd = feedtimeAsDate.toISOString();
		dogData.feedtimes = [feedtimeToAdd, ...dogData.feedtimes];
		dogData.feedtimes.sort();
		feedtime.hour = null;
		feedtime.minute = null;
		feedtimeHourInput.selectedIndex = 0;
		feedtimeMinuteInput.selectedIndex = 0;
		feedtimeHourInput.blur();
		feedtimeMinuteInput.blur();
		console.log(dogData.feedtimes);
	}

	function removeFeedtime(time) {
		dogData.feedtimes = dogData.feedtimes.filter((t) => t !== time);
	}

	// ********************************************************
	// VALIDATION
	// ********************************************************

	// errors Frontend-Validation
	let dogValidationErrors = {};

	// ----------------------------------------------------
	// NEW APPOINTMENT SCHEMA
	// ----------------------------------------------------
	const schema_newDog = yup.object().shape({
		name: yup.string().required("Name fehlt").max(20),
		birthday: yup.date().required("Geburtsdatum bitte angeben"),
		race: yup.string().required("Rasse bitte angeben").max(20),
		gender: yup.string().required("Bitte geben Sie das Geschlecht an"),
		weight: yup.number().required("Gewicht bitte angeben"),
		food_amount: yup.number().required("Futtermenge bitte angeben"),
		medications: yup.array().of(yup.string()),
		walk_duration: yup.number().required("Dauer bitte angeben"),
		walktimes: yup.array().of(yup.date()).min(1, "Spaziergaenge fehlen"),
		feedtimes: yup.array().of(yup.date()).min(1, "Fuetterungszeiten fehlen"),
		notes: yup.string().nullable().max(500, "Der eingebene Text ist zu lang"),
	});
	// ----------------------------------------------------
	// VALIDATION
	// ----------------------------------------------------
	const validate = async (schema, data, errors) => {
		try {
			await schema.validate(data, { abortEarly: false });
			// alert(JSON.stringify(get(data), null, 2));
			errors = {};
			dogValidationErrors = {};
			return true;
		} catch (err) {
			console.log(errors);
			errors = extractErrors(err);
			console.log(errors);
			dogValidationErrors = errors;
			console.log(dogValidationErrors);
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

	$: validateLive(dogData);
	function validateLive() {
		if ($liveValidation) {
			validate(schema_newDog, dogData, dogValidationErrors);
		}
	}

	// ********************************************************
	// Write TO DB
	// ********************************************************

	async function writeDogToDB() {
		console.log("WRITE DOG TO DB!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
		if (await validate(schema_newDog, dogData, dogValidationErrors)) {
			async function writeDog() {
				const endpoint = import.meta.env.VITE_GQL_ENDPOINT_URL;
				const graphQLClient = new GraphQLClient(endpoint, {
					credentials: "include",
					mode: "cors",
				});

				const mutation = gql`
			    mutation {
			        addDog(
			            name: "${dogData.name}",
                        image: "${dogData.image}",
			            birthday: "${dogData.birthday}",
			            race: "${dogData.race}",
			            gender: "${dogData.gender}",
			            weight: ${dogData.weight},
			            food_amount: ${dogData.food_amount},
			            medications: ${JSON.stringify(dogData.medications)},
			            walk_duration: ${dogData.walk_duration},
			            walktimes: ${JSON.stringify(dogData.walktimes)},
			            feedtimes: ${JSON.stringify(dogData.feedtimes)},
			            notes: "${dogData.notes}"
			        ){
                        id
						name
						status
			        }
			    }
			`;
				const data = await graphQLClient.request(mutation);
				if (data.addDog.status.code === 409) {
					statusModalMessages.set({ code: 400, message: `"${dogData.name}" existiert bereits.` });
				} else if (data.addDog.status.code === 200) {
					statusModalMessages.set({ code: 200, message: `"${dogData.name}" wurde erfolgreich angelegt.` });
				} else if (data.addDog.status.code === 401) {
					statusModalMessages.set({ code: 401, message: "Benutzer nicht angemeldet." });
				} else {
					statusModalMessages.set({ code: 1, message: "Unbekannter Fehler beim hinzufuegen eines Hundes" });
				}
				console.log(data.addDog.status);
				console.log(JSON.stringify(data, undefined, 2));
				return data.addDog;
			}
			writeDog()
				.then((dog) => {
					if (dog.status.code === 200) {
						$goto(`/dogs/${parseInt(dog.id)}`);
					}
				})
				.catch((error) => console.error(error));
		} else {
			// console.log("Doggo baaaad");
		}
	}

	async function updateDogInDB() {
		if (await validate(schema_newDog, dogData, dogValidationErrors)) {
			async function writeDog() {
				const endpoint = import.meta.env.VITE_GQL_ENDPOINT_URL;
				const graphQLClient = new GraphQLClient(endpoint, {
					credentials: "include",
					mode: "cors",
				});

				const mutation = gql`
			    mutation {
			        updateDog(
                        id: ${parseInt(dogData.id)},
                        image: "${dogData.image}",
			            name: "${dogData.name}",
			            birthday: "${dogData.birthday}",
			            race: "${dogData.race}",
			            gender: "${dogData.gender}",
			            weight: ${dogData.weight},
			            food_amount: ${dogData.food_amount},
			            medications: ${JSON.stringify(dogData.medications)},
			            walk_duration: ${dogData.walk_duration},
			            walktimes: ${JSON.stringify(dogData.walktimes)},
			            feedtimes: ${JSON.stringify(dogData.feedtimes)},
			            notes: "${dogData.notes}"
			        ){
						name
						status
			        }
			    }
			`;
				const data = await graphQLClient.request(mutation);
				console.log("gql returned DATA after dog update", data);
				if (data.updateDog.status.code === 409) {
					statusModalMessages.set({ code: 400, message: `"${dogData.name}" existiert bereits.` });
				} else if (data.updateDog.status.code === 200) {
					statusModalMessages.set({ code: 200, message: `"${dogData.name}" wurde erfolgreich aktualisiert` });
				} else if (data.updateDog.status.code === 401) {
					statusModalMessages.set({ code: 401, message: "Benutzer nicht angemeldet." });
				} else {
					statusModalMessages.set({ code: 1, message: "Unbekannter Fehler beim aktualisieren eines Hundes" });
				}
				console.log(data.updateDog.status);
				console.log(JSON.stringify(data, undefined, 2));
			}
			writeDog()
				.then(() => {
					$goto(`/dogs/${parseInt(dogData.id)}`);
				})
				.catch((error) => console.error(error));
		} else {
			// console.log("Doggo baaaad");
		}
	}

	$: {
		if ($bottomBarAction === "dog_save") {
			console.log("trying to write Appointment to DB...");
			$bottomBarAction = "";
			if (formContext === "add") {
				writeDogToDB();
			}
			if (formContext === "edit") {
				updateDogInDB();
			}
		}
	}

	let crop = { x: 0, y: 0 };
	let zoom = 1;
	let croppedImage;

	// todo: loading spinner on resize
	async function handleImage(e) {
		let rawFile = e.target.files[0];
		zoom = 2;
		image = null;
		crop = { x: 0, y: 0 };
		console.log("handleImage", crop);
		// const rawImage = URL.createObjectURL(rawFile);
		const resizeImage = (file) => {
			return new Promise((resolve, reject) => {
				resize(file, 500, 500, "JPEG", 90, 0, (uri) => resolve(uri), "blob");
			});
		};
		resizeImage(rawFile).then((resizedImage) => {
			console.log(resizedImage);
			let base64String = null;
			var reader = new FileReader();
			reader.readAsDataURL(resizedImage);
			reader.onloadend = function () {
				base64String = reader.result;
				image = base64String;
				// console.log("image base64", image);
			};
		});
		// image = await resizeImage(rawFile);
		// console.log(e.target.files);
	}

	async function cropComplete(e) {
		console.log("cropComplete", crop);
		croppedImage = await getCroppedImg(image, e.detail.pixels);
		resize(
			croppedImage,
			180,
			180,
			"JPEG",
			85,
			0,
			(uri) => {
				dogData.image = uri;
			},
			"base64",
			180,
			180
		);

		// let base64String = null;
		// var reader = new FileReader();
		// reader.readAsDataURL(croppedImage);
		// reader.onloadend = function () {
		// 	base64String = reader.result;
		// 	dogData.image = base64String;
		// };
		// fetch(croppedImage).then((res) => {
		// 	console.log("fetch");
		// 	croppedImage = res.blob().then((blob) => {
		// 		let base64String = null;
		// 		var reader = new FileReader();
		// 		reader.readAsDataURL(blob);
		// 		reader.onloadend = function () {
		// 			base64String = reader.result;
		// 			dogData.image = base64String;
		// 		};
		// 	});
		// });
	}

	const createImage = (url) =>
		new Promise((resolve, reject) => {
			const image = new Image();
			image.addEventListener("load", () => resolve(image));
			image.addEventListener("error", (error) => reject(error));
			image.setAttribute("crossOrigin", "anonymous"); // needed to avoid cross-origin issues on CodeSandbox
			image.src = url;
		});

	function getRadianAngle(degreeValue) {
		return (degreeValue * Math.PI) / 180;
	}

	async function getCroppedImg(imageSrc, pixelCrop, rotation = 0) {
		const image = await createImage(imageSrc);
		const canvas = document.createElement("canvas");
		const ctx = canvas.getContext("2d");

		const maxSize = Math.max(image.width, image.height);
		const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

		// set each dimensions to double largest dimension to allow for a safe area for the
		// image to rotate in without being clipped by canvas context
		canvas.width = safeArea;
		canvas.height = safeArea;

		// translate canvas context to a central location on image to allow rotating around the center.
		ctx.translate(safeArea / 2, safeArea / 2);
		ctx.rotate(getRadianAngle(rotation));
		ctx.translate(-safeArea / 2, -safeArea / 2);

		// draw rotated image and store data.
		ctx.drawImage(image, safeArea / 2 - image.width * 0.5, safeArea / 2 - image.height * 0.5);
		const data = ctx.getImageData(0, 0, safeArea, safeArea);

		// set canvas width to final desired crop size - this will clear existing context
		canvas.width = pixelCrop.width;
		canvas.height = pixelCrop.height;

		// paste generated rotate image with correct offsets for x,y crop values.
		ctx.putImageData(data, Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x), Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y));

		// As Base64 string
		// return canvas.toDataURL('image/jpeg');
		const resizeImage = (file) => {
			return new Promise((resolve, reject) => {
				resize(file, 180, 180, "JPEG", 70, 0, (uri) => resolve(uri), "blob");
			});
		};
		// return base64String.substr(base64String.indexOf(", ") + 1);

		return new Promise((resolve) => {
			canvas.toBlob((file) => {
				resolve(file);
			}, "image/jpeg");
		});

		// As a blob
		// return new Promise((resolve) => {
		// 	canvas.toBlob((file) => {
		// 		resizeImage(file).then((resizedImg) => {
		// 			let base64String = null;
		// 			var reader = new FileReader();
		// 			reader.readAsDataURL(resizedImg);
		// 			reader.onloadend = function () {
		// 				base64String = reader.result;
		// 				if (base64String) {
		// 					resolve(base64String.substr(base64String.indexOf(", ") + 1));
		// 				}
		// 			};
		// 		});
		// 	}, "image/jpeg");
		// });
	}

	// ********************************************************
	// ON DESTROY
	// ********************************************************
	onDestroy(() => {
		console.log("onDestroy() addDog");
		$liveValidation = false;
	});
</script>

<div class="wrapper">
	<p style="margin-top: -7rem" class="label color-dark label-appointments">{titleFormContext}</p>
	<!-- -------------------------------------- -->
	<!-- NAME -->
	<!-- -------------------------------------- -->
	<input class:selected={dogData.name} bind:value={dogData.name} class="h1 mt-16" placeholder="Name" type="text" />
	{#if dogValidationErrors.name}
		<p class="form-validation-error mt-8">({dogValidationErrors.name})</p>
	{/if}
	<div class="wrapper-capture">
		<!-- <img src={image} alt="" /> -->
		{#if image}
			<div class="wrapper-cropper">
				<Cropper
					{image}
					cropShape="rect"
					aspect="1"
					bind:crop
					bind:zoom
					showGrid={false}
					cropSize={{ width: 180, height: 180 }}
					restrictPosition={true}
					minZoom={1}
					maxZoom={3}
					on:cropcomplete={cropComplete}
				/>
			</div>
		{:else}
			<img style="margin-top: 3.2rem" alt="dog profile pic" src="/images/image_profile_ph.png" />
		{/if}
		<div class="image-upload">
			<label style="width: 180px; align-items: center" class="btn btn-regular" for="file-input"> Bild wählen.. </label>
			<input id="file-input" on:change={handleImage} type="file" accept="image/*" />
		</div>
	</div>
	<!-- -------------------------------------- -->
	<!-- BIRTHDAY -->
	<!-- -------------------------------------- -->
	<p class="label color-dark mt-32">Geburtstag</p>
	<div class="wrapper-selects mt-8">
		<span class="datepicker-toggle">
			<span class:selected={birthday} class="datepicker-toggle-button">
				{#if dogData.birthday}
					{new Date(dogData.birthday).getDate()}.
					{monthNames[new Date(dogData.birthday).getMonth()]}
					{new Date(dogData.birthday).getFullYear()}
				{:else}
					Bitte angeben
				{/if}
			</span>
			<input bind:value={birthday} on:change={convertBirthday} type="date" class="datepicker-input" />
		</span>
	</div>
	{#if dogValidationErrors.birthday}
		<p class="form-validation-error mt-8">({dogValidationErrors.birthday})</p>
	{/if}
	<!-- -------------------------------------- -->
	<!-- RACE -->
	<!-- -------------------------------------- -->
	<p class="label color-dark mt-32">Rasse</p>
	<div class="mt-8">
		<input class:selected={dogData.race} bind:value={dogData.race} placeholder="Bitte angeben" type="text" />
	</div>
	{#if dogValidationErrors.race}
		<p class="form-validation-error mt-8">({dogValidationErrors.race})</p>
	{/if}
	<!-- -------------------------------------- -->
	<!-- GENDER -->
	<!-- -------------------------------------- -->
	<p class="label color-dark mt-32">Geschlecht</p>
	<div class="mt-8">
		<select class:selected={dogData.gender} bind:value={dogData.gender} name="gender" id="">
			<option value="" disabled selected>Bitte auswählen</option>
			{#each genders as gender}
				<option name={gender}>{gender}</option>
			{/each}
		</select>
	</div>
	{#if dogValidationErrors.gender}
		<p class="form-validation-error mt-8">({dogValidationErrors.gender})</p>
	{/if}
	<!-- -------------------------------------- -->
	<!-- WEIGHT -->
	<!-- -------------------------------------- -->
	<p class="label color-dark mt-32">Gewicht</p>
	<div class="wrapper-input-w-suffix mt-8">
		<input type="number" min="1" step="1" class:selected={dogData.weight} bind:value={dogData.weight} class="appearance-none" placeholder="Bitte angeben" />
		<p class="input-field-unit sib" class:selected={dogData.weight}>kg</p>
	</div>
	{#if dogValidationErrors.weight}
		<p class="form-validation-error mt-8">({dogValidationErrors.weight})</p>
	{/if}
	<!-- -------------------------------------- -->
	<!-- FOOD AMOUNT -->
	<!-- -------------------------------------- -->
	<p class="label color-dark mt-32">Futtermenge</p>
	<div class="wrapper-input-w-suffix mt-8">
		<input
			type="number"
			min="1"
			step="1"
			class:selected={dogData.food_amount}
			bind:value={dogData.food_amount}
			class="appearance-none"
			placeholder="Bitte angeben"
		/>
		<p class="input-field-unit sib" class:selected={dogData.food_amount}>g</p>
	</div>
	{#if dogValidationErrors.food_amount}
		<p class="form-validation-error mt-8">({dogValidationErrors.food_amount})</p>
	{/if}
	<!-- -------------------------------------- -->
	<!-- MEDICATION -->
	<!-- -------------------------------------- -->
	<!-- TEXTFIELD TO ADD MED -->
	<p class="label color-dark mt-32">Medikamente</p>
	<div class="wrapper-input-w-suffix mt-8">
		<input bind:this={medicationInput} type="text" class:selected={medication} bind:value={medication} placeholder="Bitte angeben" />
		<button on:click={addMedication} class:selected={medication} class="button-add-medication sib">
			<svg width="20" height="20" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path
					fill-rule="evenodd"
					clip-rule="evenodd"
					d="M14.0635 7.6571C14.0635 8.07131 13.7277 8.4071 13.3135 8.40709L1.99992 8.40692C1.58571 8.40691 1.24993 8.07112 1.24993 7.65691C1.24994 7.24269 1.58573 6.90691 1.99995 6.90692L13.3135 6.90709C13.7277 6.9071 14.0635 7.24289 14.0635 7.6571Z"
					fill="var(--inactive)"
				/>
				<path
					fill-rule="evenodd"
					clip-rule="evenodd"
					d="M7.6569 1.24993C8.07112 1.24993 8.40691 1.58571 8.40692 1.99992L8.40709 13.3135C8.4071 13.7277 8.07132 14.0635 7.6571 14.0635C7.24289 14.0635 6.9071 13.7277 6.90709 13.3135L6.90692 1.99995C6.90691 1.58573 7.24269 1.24994 7.6569 1.24993Z"
					fill="var(--inactive)"
				/>
			</svg>
		</button>
	</div>
	<!-- LIST OF MEDS -->
	<div class="wrapper-list">
		{#each dogData.medications as medication}
			<div class="list-item mt-8 regular-text">
				{medication}
				<button on:click={() => removeMedication(medication)} class="btn btn-w-icon">
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
		{#if dogValidationErrors.medications}
			<p class="form-validation-error mt-8">({dogValidationErrors.medications})</p>
		{/if}
	</div>
	<!-- -------------------------------------- -->
	<!-- WALK DURATION -->
	<!-- -------------------------------------- -->
	<p class="label color-dark mt-32">Spaziergang Dauer</p>
	<div class="wrapper-input-w-suffix mt-8">
		<input
			type="number"
			min="1"
			step="1"
			class:selected={dogData.walk_duration}
			bind:value={dogData.walk_duration}
			class="appearance-none"
			placeholder="Bitte angeben"
		/>
		<p class="input-field-unit sib" class:selected={dogData.walk_duration}>min</p>
	</div>
	{#if dogValidationErrors.walk_duration}
		<p class="form-validation-error mt-8">({dogValidationErrors.walk_duration})</p>
	{/if}
	<!-- -------------------------------------- -->
	<!-- WALKS -->
	<!-- -------------------------------------- -->
	<!-- DROPDOWN TO ADD TIME -->
	<p class="label color-dark mt-32">Spaziergänge</p>
	<div class="wrapper-selects mt-8">
		<select bind:this={walktimeHourInput} class:selected={walktime.hour !== null} bind:value={walktime.hour} name="age-years" id="">
			<option value="" disabled selected>Stunde</option>
			{#each { length: 24 } as _, i}
				<option>{leadingZero(i)}</option>
			{/each}
		</select>
		<select bind:this={walktimeMinuteInput} class="ml-16" class:selected={walktime.minute !== null} bind:value={walktime.minute} name="age-months" id="">
			<option value="" disabled selected>Minute</option>
			<option>00</option>
			<option>15</option>
			<option>30</option>
			<option>45</option>
		</select>
	</div>
	<!-- LIST OF WALKTIMES -->
	<div class="wrapper-list">
		{#each dogData.walktimes as walktime}
			<div class="list-item mt-8 regular-text">
				{leadingZero(new Date(walktime).getHours())} : {leadingZero(new Date(walktime).getMinutes())} Uhr
				<button on:click={() => removeWalktime(walktime)} class="btn btn-w-icon">
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
	{#if dogValidationErrors.walktimes}
		<p class="form-validation-error mt-8">({dogValidationErrors.walktimes})</p>
	{/if}
	<!-- -------------------------------------- -->
	<!-- FEEDING -->
	<!-- -------------------------------------- -->
	<!-- DROPDOWN TO ADD FEEDTIME -->
	<p class="label color-dark mt-32">Fütterungen</p>
	<div class="wrapper-selects mt-8">
		<select bind:this={feedtimeHourInput} class:selected={feedtime.hour !== null} bind:value={feedtime.hour} name="age-years" id="">
			<option value="" disabled selected>Stunde</option>
			{#each { length: 24 } as _, i}
				<option>{leadingZero(i)}</option>
			{/each}
		</select>
		<select bind:this={feedtimeMinuteInput} class="ml-16" class:selected={feedtime.minute !== null} bind:value={feedtime.minute} name="age-months" id="">
			<option value="" disabled selected>Minute</option>
			<option>00</option>
			<option>15</option>
			<option>30</option>
			<option>45</option>
		</select>
	</div>
	<!-- LIST OF FEEDTIMES -->
	<div class="wrapper-list">
		{#each dogData.feedtimes as feedtime}
			<div class="list-item mt-8 regular-text">
				{leadingZero(new Date(feedtime).getHours())} : {leadingZero(new Date(feedtime).getMinutes())} Uhr
				<button on:click={() => removeFeedtime(feedtime)} class="btn btn-w-icon">
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
	{#if dogValidationErrors.feedtimes}
		<p class="form-validation-error mt-8">({dogValidationErrors.feedtimes})</p>
	{/if}
	<!-- -------------------------------------- -->
	<!-- NOTES -->
	<!-- -------------------------------------- -->
	<p class="label color-dark mt-32">Notizen</p>
	<div>
		<textarea bind:value={dogData.notes} class="notes mt-8" cols="30" rows="10" />
	</div>
	<p class="regular-text mt-8">{dogData.notes.length}/500 Zeichen</p>
	{#if dogValidationErrors.notes}
		<p class="form-validation-error mt-8">({dogValidationErrors.notes})</p>
	{/if}
</div>

<style>
	.input-field-unit {
		font-size: 1.5rem;
		width: 3.2rem;
		display: flex;
		justify-content: center;
		align-items: center;
		/* padding-right: 1.6rem; */
		color: var(--inactive);
	}

	.wrapper-input-w-suffix {
		display: flex;
	}

	.selected {
		color: var(--dark);
		border-color: var(--dark);
	}
</style>

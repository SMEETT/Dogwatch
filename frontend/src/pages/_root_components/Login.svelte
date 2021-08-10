<!-- routify:options reset -->
<script>
	import { metatags, goto } from "@roxi/routify";
	import { null_to_empty } from "svelte/internal";
	metatags.title = "Dogwatch / Login";
	metatags.description = "Description coming soon...";
	import { isAuthenticated, authenticating, checkAuthCookie, liveValidation, statusModalMessages, newlyRegisteredEmail } from "../../stores/state";

	import { login } from "../../stores/state";
	import * as yup from "yup";

	const loginData = {
		email: null,
		password: null,
	};

	if ($newlyRegisteredEmail) {
		loginData.email = $newlyRegisteredEmail;
	}

	console.log("newRegistrationEmail", $newlyRegisteredEmail);

	function handleKeyPress(e) {
		if (e.charCode === 13) {
			console.log("enter pressed");
			handleSubmit();
		}
	}

	async function handleSubmit() {
		if (await validate(schema_login, loginData, loginValidationErrors)) {
			if (await login(loginData.email, loginData.password)) {
				$newlyRegisteredEmail = null;
				$goto("/appointments");
				statusModalMessages.set({ code: 200, message: "Login erfolgreich" });
			} else {
				$authenticating = false;
				console.log("login failed");
				$statusModalMessages = { code: 400, message: "Falsche E-Mail Adresse/Passwort" };
			}
		}
	}

	// ********************************************************
	// VALIDATION
	// ********************************************************

	// errors Frontend-Validation
	let loginValidationErrors = {};

	// ----------------------------------------------------
	// NEW APPOINTMENT SCHEMA
	// ----------------------------------------------------
	const schema_login = yup.object().shape({
		email: yup.string().email("Ungueltige E-Mail Adresse").required("Bitte E-Mail angeben").typeError("Bitte E-Mail angeben"),
		password: yup.string().required("Passwort bitte angeben").typeError("Bitte Passwort angeben"),
	});

	// ----------------------------------------------------
	// VALIDATION
	// ----------------------------------------------------
	const validate = async (schema, data, errors) => {
		try {
			await schema.validate(data, { abortEarly: false });
			// alert(JSON.stringify(get(data), null, 2));
			errors = {};
			loginValidationErrors = {};
			return true;
		} catch (err) {
			console.log(errors);
			errors = extractErrors(err);
			console.log(errors);
			loginValidationErrors = errors;
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

	$: validateLive(loginData);
	function validateLive() {
		if ($liveValidation) {
			validate(schema_login, loginData, loginValidationErrors);
		}
	}
</script>

<!-- Login Index -->

<div class="headline">
	<h1 class="color-headline" style="margin-left: 0rem">Einloggen</h1>
</div>
<div style="margin-top: -2rem" class="separator" />

<form>
	<label for="email">E-Mail:</label><br />
	<input type="text" id="email" name="email" bind:value={loginData.email} />
	{#if loginValidationErrors.email}
		<p class="form-validation-error" style="margin-bottom: 2rem">({loginValidationErrors.email})</p>
	{/if}
	<label for="password">Passwort:</label><br />
	<input type="password" id="password" name="password" bind:value={loginData.password} on:keypress={handleKeyPress} />
	{#if loginValidationErrors.password}
		<p class="form-validation-error">({loginValidationErrors.password})</p>
	{/if}
</form>
<button on:click={handleSubmit} class="btn btn-regular">Einloggen</button>

<div class="wrapper-to-register">
	<p>Sie haben noch keinen Account? <a class="generic" href="/register">REGISTRIEREN</a></p>
</div>

<style>
	.wrapper-to-register {
		font-size: 1.5rem;
		margin-top: 4rem;
		line-height: 150%;
	}

	input {
		border: 1px solid var(--dark);
		border-radius: 5px;
		padding-left: 1rem;
		margin-top: 0.5rem;
		margin-bottom: 1rem;
	}

	button {
		margin-top: 2rem;
		width: 100%;
	}
</style>

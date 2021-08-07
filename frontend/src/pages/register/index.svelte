<!-- routify:options reset -->
<script>
	import { metatags, goto } from "@roxi/routify";
	import { null_to_empty } from "svelte/internal";
	metatags.title = "Dogwatch / Registrieren";
	metatags.description = "Description coming soon...";
	import { isAuthenticated, authenticating, checkAuthCookie, liveValidation, statusModalMessages, newlyRegisteredEmail } from "../../stores/state";
	import { GraphQLClient, gql } from "graphql-request";

	import { login } from "../../stores/state";
	import * as yup from "yup";

	let email;
	let password;
	let passwordConfirmation;

	const registerData = {
		username: null,
		email: null,
		password: null,
		passwordConfirmation: null,
	};

	async function handleSubmit() {
		// check if a user with the used e-mail alreadty exists

		if (await validate(schema_register, registerData, registerValidationErrors)) {
			if (await register(registerData.username, registerData.email, registerData.password)) {
				$goto("/appointments");
				statusModalMessages.set({ code: 200, message: "Erfolgreich registriert" });
			} else {
				console.log("registration failed");
				$statusModalMessages = { code: 400, message: "Felder bitte korrekt ausfuellen" };
			}
		}
	}

	// ********************************************************
	// VALIDATION
	// ********************************************************

	// errors Frontend-Validation
	let registerValidationErrors = {};

	// ----------------------------------------------------
	// NEW APPOINTMENT SCHEMA
	// ----------------------------------------------------
	const schema_register = yup.object().shape({
		username: yup.string().required("Bitte Benutzernamen angeben").typeError("Bitte Benutzernamen angeben"),
		email: yup.string().email("Ungueltige E-Mail Adresse").required("Bitte E-Mail angeben").typeError("Bitte E-Mail angeben"),
		password: yup.string().required("Passwort bitte angeben").typeError("Bitte Passwort angeben"),
		passwordConfirmation: yup
			.string()
			.required("Passwort bitte bestaetigen")
			.typeError("Bitte Passwort bestaetigen")
			.oneOf([yup.ref("password"), null], "Passwoerter muessen identisch sein"),
	});

	// ----------------------------------------------------
	// VALIDATION
	// ----------------------------------------------------
	const validate = async (schema, data, errors) => {
		try {
			await schema.validate(data, { abortEarly: false });
			// alert(JSON.stringify(get(data), null, 2));
			errors = {};
			registerValidationErrors = {};
			return true;
		} catch (err) {
			console.log(errors);
			errors = extractErrors(err);
			console.log(errors);
			registerValidationErrors = errors;
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

	$: validateLive(registerData);
	function validateLive() {
		if ($liveValidation) {
			validate(schema_register, registerData, registerValidationErrors);
		}
	}

	const register = async (username, email, password) => {
		async function registerUser() {
			const endpoint = import.meta.env.VITE_GQL_ENDPOINT_URL;
			const graphQLClient = new GraphQLClient(endpoint, {
				credentials: "include",
				mode: "cors",
			});
			const mutation = gql`
				mutation {
					registerUser(username: "${username}", email: "${email}", password: "${password}")
				}
			`;

			const data = await graphQLClient.request(mutation);
			if (data.registerUser.status === 200) {
				console.log(JSON.stringify(data, undefined, 2));
				$newlyRegisteredEmail = data.registerUser.email;
				return true;
			} else if (data.registerUser.status === 409) {
				console.log("User with that email already exists");
				throw new Error("User with that name already exists");
			} else {
				throw new Error("Registration Failed");
			}
		}

		return registerUser()
			.then(() => {
				return true;
			})
			.catch((error) => {
				console.log(error);
				return false;
			});
	};
</script>

<!-- Login Index -->

<div class="headline">
	<h1 class="color-headline" style="margin-left: 0rem">Registrieren</h1>
</div>
<div style="margin-top: -2rem" class="separator" />

<form form>
	<label for="username">Benuztername:</label><br />
	<input type="text" id="username" name="username" bind:value={registerData.username} />
	{#if registerValidationErrors.username}
		<p class="form-validation-error" style="margin-bottom: 2rem">({registerValidationErrors.username})</p>
	{/if}
	<label for="email">E-Mail:</label><br />
	<input type="text" id="email" name="email" bind:value={registerData.email} />
	{#if registerValidationErrors.email}
		<p class="form-validation-error" style="margin-bottom: 2rem">({registerValidationErrors.email})</p>
	{/if}
	<label for="password">Password:</label><br />
	<input type="password" id="password" name="password" bind:value={registerData.password} />
	{#if registerValidationErrors.password}
		<p class="form-validation-error" style="margin-bottom: 2rem">({registerValidationErrors.password})</p>
	{/if}
	<label for="password-confirmation">Password bestaetigen:</label><br />
	<input type="password" id="password-confirmation" name="password-confirmation" bind:value={registerData.passwordConfirmation} />
	{#if registerValidationErrors.passwordConfirmation}
		<p class="form-validation-error" style="margin-bottom: 2rem">({registerValidationErrors.passwordConfirmation})</p>
	{/if}
</form>
<button on:click={handleSubmit} class="btn btn-regular">Registrieren</button>

<div class="wrapper-to-login">
	<p>Sie haben bereits einen Account? <a class="generic" href="/login">EINLOGGEN</a></p>
</div>

<style>
	.wrapper-to-login {
		font-size: 1.5rem;
		margin-top: 4rem;
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

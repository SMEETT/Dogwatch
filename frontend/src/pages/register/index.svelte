<!-- routify:options reset -->
<script>
	import { metatags, goto } from "@roxi/routify";
	metatags.title = "Dogwatch / Registrieren";
	metatags.description = "Description coming soon...";
	import { liveValidation, statusModalMessages, newlyRegisteredEmail, loadLocale } from "../../stores/state";
	import { GraphQLClient, gql } from "graphql-request";

	import StatusModal from "../_root_components/StatusModal.svelte";

	import * as yup from "yup";

	const loc = loadLocale();

	const registerData = {
		username: null,
		email: null,
		password: null,
		passwordConfirmation: null,
	};

	async function handleSubmit() {
		if (await validate(schema_register, registerData, registerValidationErrors)) {
			const registerAttempt = await register(registerData.username, registerData.email, registerData.password);

			if (registerAttempt === true) {
				$goto("/appointments");
				statusModalMessages.set({ code: 200, message: loc.register.val.modalRegisterSuccess });
			} else {
				statusModalMessages.set({ code: 400, message: registerAttempt.message });
			}
		}
	}

	// ********************************************************
	// VALIDATION
	// ********************************************************
	let registerValidationErrors = {};
	// ----------------------------------------------------
	// NEW APPOINTMENT SCHEMA
	// ----------------------------------------------------
	const schema_register = yup.object().shape({
		username: yup.string().required(loc.register.val.userProvide).typeError(loc.register.val.userProvide),
		email: yup.string().email(loc.shared.val.emailInvalid).required(loc.shared.val.emailProvide).typeError(loc.shared.val.emailProvide),
		password: yup.string().required(loc.shared.val.pwdProvide).typeError(loc.shared.val.pwdProvide),
		passwordConfirmation: yup
			.string()
			.required(loc.register.val.pwdConfirm)
			.typeError(loc.register.val.pwdConfirm)
			.oneOf([yup.ref("password"), null], loc.register.val.pwdNoMatch),
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
			errors = extractErrors(err);
			registerValidationErrors = errors;
			$statusModalMessages = { code: 1, message: loc.shared.val.modalFields };
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
				console.log(data.registerUser.status);
				throw new Error(loc.register.val.userExists);
			} else {
				throw new Error(loc.register.val.modalRegisterFailed);
			}
		}

		return registerUser()
			.then(() => {
				return true;
			})
			.catch((error) => {
				console.log(error);
				return error;
			});
	};
</script>

<!-- Login Index -->

<div class="headline">
	<h1 class="color-headline" style="margin-left: 0rem">{loc.register.title}</h1>
</div>
<div style="margin-top: -2rem" class="separator" />

<form form>
	<label for="username">{loc.shared.labels.username}:</label><br />
	<input class:selected={registerData.username} type="text" id="username" name="username" bind:value={registerData.username} />
	{#if registerValidationErrors.username}
		<p class="form-validation-error" style="margin-bottom: 2rem">({registerValidationErrors.username})</p>
	{/if}
	<label for="email">{loc.shared.labels.email}:</label><br />
	<input class:selected={registerData.email} type="text" id="email" name="email" bind:value={registerData.email} />
	{#if registerValidationErrors.email}
		<p class="form-validation-error" style="margin-bottom: 2rem">({registerValidationErrors.email})</p>
	{/if}
	<label for="password">{loc.shared.labels.password}:</label><br />
	<input class:selected={registerData.password} type="password" id="password" name="password" bind:value={registerData.password} />
	{#if registerValidationErrors.password}
		<p class="form-validation-error" style="margin-bottom: 2rem">
			({registerValidationErrors.password})
		</p>
	{/if}
	<label for="password-confirmation">{loc.register.passwordConfirm}:</label>
	<input
		class:selected={registerData.passwordConfirmation}
		type="password"
		id="password-confirmation"
		name="password-confirmation"
		bind:value={registerData.passwordConfirmation}
	/>
	{#if registerValidationErrors.passwordConfirmation}
		<p class="form-validation-error" style="margin-bottom: 2rem">({registerValidationErrors.passwordConfirmation})</p>
	{/if}
</form>
<button on:click={handleSubmit} class="btn btn-regular">{loc.register.submit}</button>

<div class="wrapper-to-login">
	<p>{loc.register.infotext} <a class="generic" style="text-transform: uppercase;" href="/login">{loc.register.loginLink}</a></p>
</div>

<StatusModal />

<style>
	#email {
		text-transform: lowercase;
	}

	.wrapper-to-login {
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

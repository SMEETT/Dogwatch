<!-- routify:options reset -->
<script>
	import { metatags, goto } from "@roxi/routify";
	metatags.title = "Dogwatch / Login";
	metatags.description = "Description coming soon...";
	import { isAuthenticated, authenticating, checkAuthCookie } from "../../stores/state";

	import { login } from "../../stores/state";

	let email;
	let password;

	async function handleSubmit() {
		if (await login(email, password)) {
			$goto("/appointments");
		} else {
			console.log("login failed");
		}
	}
</script>

<!-- Login Index -->

<div class="headline">
	<h1 class="color-headline" style="margin-left: 0rem">Login</h1>
</div>
<div style="margin-top: -2rem" class="separator" />

<form form>
	<label for="email">E-Mail:</label><br />
	<input type="text" id="email" name="email" bind:value={email} /><br /><br />
	<label for="password">Password:</label><br />
	<input type="password" id="password" name="password" bind:value={password} /><br /><br />
</form>
<button on:click={handleSubmit} class="btn btn-regular">Absenden</button>

<style>
	input {
		border: 1px solid var(--dark);
		border-radius: 5px;
		padding-left: 1rem;
		margin-top: 0.5rem;
	}

	button {
		margin-top: 2rem;
		width: 100%;
	}
</style>

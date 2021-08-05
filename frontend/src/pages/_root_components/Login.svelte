<!-- routify:options reset -->
<script>
	import { metatags } from "@roxi/routify";
	metatags.title = "Dogwatch / Login";
	metatags.description = "Description coming soon...";
	import { login } from "../../stores/state";

	let email;
	let password;

	function handleSubmit() {
		console.log(document.cookie);
		login(email, password);
	}
</script>

<!-- Login Index -->

<h1>Login</h1>
<form form on:submit|preventDefault={handleSubmit}>
	<label for="email">E-Mail:</label><br />
	<input type="text" id="email" name="email" bind:value={email} /><br /><br />
	<label for="password">Password:</label><br />
	<input type="text" id="password" name="password" bind:value={password} /><br /><br />
	<input id="btnSubmit" type="submit" value="Submit" />
</form>

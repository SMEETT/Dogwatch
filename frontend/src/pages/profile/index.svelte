<script>
	import { GraphQLClient, gql } from "graphql-request";
	import { menuSelection, menuContext, statusModalMessages, loadLocale, user } from "../../stores/state";
	import { onDestroy, onMount } from "svelte";
	import { metatags, goto, url } from "@roxi/routify";
	import { fade } from "svelte/transition";

	import DeleteModal from "../_root_components/DeleteModal.svelte";

	// promise we await in template
	let userFetchPromise = new Promise((resolve, reject) => {});
	const loc = loadLocale();

	let showDeleteModal = false;

	let preferences = { firstDayOfWeek: null, color: null };

	/// U S E L E S S !!
	$: updatePreferences(preferences);
	function updatePreferences(preferences) {
		const mutation = gql`
			mutation { 
                updateUserPreferences (preferences: { firstDayOfWeek: ${preferences.firstDayOfWeek}, color: "${preferences.color}" })
                    {
                        id
                        username
                        preferences
                    }
            }
		`;
		// console.log(mutation);
		// console.log(JSON.stringify(preferences));
		// const json = JSON.stringify(preferences);
		// console.log("this", json);
		// console.log("updatePreferences()");
		// console.log(preferences);
	}

	onMount(() => {
		menuSelection.set("profile");
		menuContext.set({ context: "profile", idToUse: null });
		console.log("locale", navigator.language);
	});

	async function fetchUser() {
		const endpoint = import.meta.env.VITE_GQL_ENDPOINT_URL;
		const graphQLClient = new GraphQLClient(endpoint, {
			credentials: "include",
			mode: "cors",
		});
		const query = gql`
			query {
				getUser {
					username
					preferences
					email
				}
			}
		`;
		const data = await graphQLClient.request(query);
		console.log(JSON.stringify(data, undefined, 2));
		userFetchPromise = data.getUser;
		console.log(data.getUser.preferences);
		// only used in development, makes sure that we always have
		// the full skeleton of the "preferences"-object for each user
		if (data.getUser.preferences.firstDayOfWeek === undefined) {
			preferences = { firstDayOfWeek: 1, color: "red" };
			updateUserPreferences();
		} else {
			preferences = data.getUser.preferences;
			console.log("fetched preferences", data.getUser.preferences);
		}
	}

	fetchUser();

	async function updateUserPreferences() {
		const endpoint = import.meta.env.VITE_GQL_ENDPOINT_URL;
		const graphQLClient = new GraphQLClient(endpoint, {
			credentials: "include",
			mode: "cors",
		});
		const mutation = gql`
			mutation { 
                updateUserPreferences (preferences: { firstDayOfWeek: ${preferences.firstDayOfWeek}, color: "${preferences.color}" })
                    {
                        id
                        username
                        preferences
                    }
            }
		`;
		localStorage.setItem("firstDayOfWeek", preferences.firstDayOfWeek);
		const data = await graphQLClient.request(mutation);
		console.log(JSON.stringify(data, undefined, 2));
		$statusModalMessages = { code: 200, message: "Einstellungen erfolgreich aktualisiert" };
	}

	onDestroy(() => {});
</script>

<div class="wrapper regular-text">
	<div class="headline">
		<h1 class="color-headline" style="margin-left: 0rem">Profil</h1>
	</div>
	<div style="margin-top: -2rem" class="separator" />
	{#await userFetchPromise}
		...fetching preferences
	{:then user}
		<div class="wrapper">
			<p>{user.username}</p>
			<p>{user.email}</p>
			<p>{user.preferences.language}</p>
		</div>

		<p class="label color-dark mt-32">Erster Tag der Woche</p>
		<div class="mt-8">
			<!-- svelte-ignore a11y-no-onchange -->
			<select class:selected={preferences.firstDayOfWeek !== null} bind:value={preferences.firstDayOfWeek}>
				{#each loc.globals.weekdayNames as weekday, index}
					<option value={index} selected={preferences.firstDayOfWeek}>{weekday}</option>
				{/each}
			</select>
		</div>
		<p class="label color-dark mt-32">Lieblingsfarbe</p>
		<div class="mt-8">
			<!-- svelte-ignore a11y-no-onchange -->
			<select class:selected={preferences.color} bind:value={preferences.color}>
				<option value="red">Rot</option>
				<option value="blue">Blau</option>
				<option value="green">Gruen</option>
			</select>
		</div>
	{/await}
	<button on:click={updateUserPreferences} class="btn btn-regular mt-16">Einstellungen Speichern</button>
</div>

<style>
	.wrapper {
		display: flex;
		flex-direction: column;
		height: 100%;
	}

	.name {
		margin-bottom: 1rem;
	}

	.email {
		font-size: 1.2rem;
	}
</style>

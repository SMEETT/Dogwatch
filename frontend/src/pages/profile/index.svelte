<script>
	import { GraphQLClient, gql } from "graphql-request";
	import { menuSelection, menuContext, statusModalMessages, loadLocale, user } from "../../stores/state";
	import { onDestroy, onMount } from "svelte";

	import { metatags, redirect, url } from "@roxi/routify";
	const loc = loadLocale();

	metatags.title = loc.profile.misc.pageTitle;

	// promise we await in template
	let userFetchPromise = new Promise((resolve, reject) => {});

	let preferences = { firstDayOfWeek: null, measurement: null };

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
		preferences = data.getUser.preferences;
		console.log("fetched preferences", data.getUser.preferences);
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
                updateUserPreferences (preferences: { firstDayOfWeek: ${preferences.firstDayOfWeek}, measurement: "${preferences.measurement}" })
                    {
                        id
                        username
                        preferences
                    }
            }
		`;
		localStorage.setItem("firstDayOfWeek", preferences.firstDayOfWeek);
		localStorage.setItem("measurement", preferences.measurement);
		const data = await graphQLClient.request(mutation);
		console.log(JSON.stringify(data, undefined, 2));
		$statusModalMessages = { code: 200, message: loc.profile.modal.saveSuccess };
	}

	onDestroy(() => {});
</script>

<div class="wrapper regular-text">
	<div class="headline">
		<h1 class="color-headline" style="margin-left: 0rem">{loc.profile.misc.headline}</h1>
	</div>
	<div style="margin-top: -2rem" class="separator" />
	{#await userFetchPromise}
		...fetching preferences
	{:then user}
		<div class="wrapper">
			<p class="username">{user.username}</p>
			<p>{user.email}</p>
		</div>

		<p class="label color-dark mt-32">{loc.profile.labels.firstDayOfWeek}</p>
		<div class="mt-8">
			<!-- svelte-ignore a11y-no-onchange -->
			<select class:selected={preferences.firstDayOfWeek !== null} bind:value={preferences.firstDayOfWeek}>
				{#each loc.globals.weekdayNames as weekday, index}
					<option value={index} selected={preferences.firstDayOfWeek}>{weekday}</option>
				{/each}
			</select>
		</div>
	{/await}
	<button on:click={updateUserPreferences} class="btn btn-regular mt-16">{loc.profile.misc.btnSaveSettings}</button>
</div>

<style>
	.wrapper {
		display: flex;
		flex-direction: column;
		height: 100%;
	}

	.username {
		font-size: 2rem;
		margin-bottom: 1rem;
	}
</style>

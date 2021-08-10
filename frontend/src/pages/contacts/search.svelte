<script>
	import { GraphQLClient, gql } from "graphql-request";
	import { menuActive, menuStatus, bottomBarAction, statusModalMessages } from "../../stores/state";
	import { onDestroy, onMount } from "svelte";
	import { metatags, goto, url } from "@roxi/routify";
	import { fade } from "svelte/transition";

	let searchResultPromise = new Promise((resolve, reject) => {});

	onMount(() => {
		menuActive.set("contacts");
		menuStatus.set({ context: "contacts", idToUse: null });
	});

	function viewList() {
		$goto("/contacts/list");
	}

	let searchterm = null;

	async function search() {
		if (searchterm) {
			searchterm = searchterm.trim();
			console.log(searchterm);
			const endpoint = import.meta.env.VITE_GQL_ENDPOINT_URL;
			const graphQLClient = new GraphQLClient(endpoint, {
				credentials: "include",
				mode: "cors",
			});
			const query = gql`
			query {
				findContact (searchterm: "${searchterm}" )
					{
						id
						username
						email
					}
				}

		`;
			const data = await graphQLClient.request(query);
			console.log(data);
			// console.log(JSON.stringify(data.contacts, undefined, 2));
			if (data) {
				searchResultPromise = data.findContact;
				console.log(searchResultPromise);
			}
		}
	}

	function handleKeyPress(e) {
		if (e.charCode === 13) {
			console.log("enter pressed");
			search();
		}
	}

	async function addContact(id) {
		console.log(searchterm);
		const endpoint = import.meta.env.VITE_GQL_ENDPOINT_URL;
		const graphQLClient = new GraphQLClient(endpoint, {
			credentials: "include",
			mode: "cors",
		});
		const mutation = gql`
			mutation {
				addContact (contactId: ${id} )
				}

		`;
		const data = await graphQLClient.request(mutation);
		$statusModalMessages = { code: 200, message: "Kontakt erfolgreich hinzugefuegt" };
		$goto("/contacts/list");
		console.log(data);
		// console.log(JSON.stringify(data.contacts, undefined, 2));
		console.log(searchResultPromise);
	}

	onDestroy(() => {});
</script>

<div class="wrapper regular-text">
	<div class="headline debug-border">
		<div class="wrapper-switcher debug-border">
			<button class="btn" on:click|stopPropagation={viewList}>
				<svg width="26" height="40" viewBox="0 0 30 44" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path d="M2 22L28 2V42L2 22Z" stroke="var(--color-headline)" stroke-width="4" stroke-linejoin="round" />
				</svg>
			</button>
			<button class="ml-16 mr-8 btn" on:click|stopPropagation={viewList}>
				<svg width="26" height="40" viewBox="0 0 30 44" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path d="M28 22L2 2V42L28 22Z" stroke="var(--color-headline)" stroke-width="4" stroke-linejoin="round" />
				</svg>
			</button>
			<h1 class="color-headline">Suche</h1>
		</div>
		<p class="label">Kontakte</p>
	</div>
	<div style="margin-top: -2rem" class="separator" />
	<div class="search-bar">
		<input
			bind:value={searchterm}
			on:keypress={handleKeyPress}
			class="searchfield"
			class:selected={searchterm}
			placeholder="E-Mail oder Benutzername"
			type="text"
		/>
		<button class="btn" on:click={search}><span class="icon-search ml-8" /></button>
	</div>
	{#await searchResultPromise then result}
		<div class="wrapper-contact mt-16">
			<p class="name">{result.username}</p>
			<p class="email">{result.email}</p>
			<button on:click={addContact(result.id)} class="btn btn-regular mt-8">Hinzufügen</button>
		</div>
	{/await}
</div>

<style>
	.wrapper {
		display: flex;
		flex-direction: column;
		height: 100%;
	}

	.search-bar {
		display: flex;
	}

	.searchfield {
		background-color: transparent;
	}

	.icon-search {
		display: flex;
		background: url("/images/icons/general_ui/icon_search.svg") no-repeat center center;
		width: 3.2rem;
		height: 16px;
		height: 100%;
		border: 1px solid var(--dark);
	}

	.icon-search:hover {
		background: url("/images/icons/general_ui/icon_search_white.svg") no-repeat center center;
		background-color: var(--dark);
		cursor: pointer;
	}

	input {
		border: 1px solid var(--dark);
		padding-left: 1rem;
	}

	.wrapper-contact {
		display: flex;
		flex-direction: column;
		border: 1px solid var(--dark);
		padding: 1rem;
		margin-bottom: 2rem;
	}

	.name {
		margin-bottom: 1rem;
	}

	.email {
		font-size: 1.2rem;
	}

	.selected {
		color: var(--dark);
		border: 1px solid red;
		border-color: var(--dark);
	}
</style>

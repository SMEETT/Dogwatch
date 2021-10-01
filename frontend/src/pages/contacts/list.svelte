<script>
	import { GraphQLClient, gql } from "graphql-request";
	import { menuSelection, menuContext, statusModalMessages, checkAuthCookie, loadLocale } from "../../stores/state";
	import { onDestroy, onMount } from "svelte";
	import { metatags, goto, url } from "@roxi/routify";
	import { fade } from "svelte/transition";

	import DeleteModal from "../_root_components/DeleteModal.svelte";

	let contactFetchPromise = new Promise((resolve, reject) => {});

	let showDeleteModal = false;
	let searchResultPromise = new Promise((resolve, reject) => {});

	const loc = loadLocale();

	import { quintOut } from "svelte/easing";
	import { crossfade } from "svelte/transition";

	const [send, receive] = crossfade({
		duration: (d) => Math.sqrt(d * 200),

		fallback(node, params) {
			const style = getComputedStyle(node);
			const transform = style.transform === "none" ? "" : style.transform;

			return {
				duration: 600,
				easing: quintOut,
				css: (t) => `
					transform: ${transform} scale(${t});
					opacity: ${t}
				`,
			};
		},
	});

	onMount(() => {
		menuSelection.set("contacts");
		menuContext.set({ context: "contacts", idToUse: null });
	});

	async function fetchContacts() {
		const endpoint = import.meta.env.VITE_GQL_ENDPOINT_URL;
		const graphQLClient = new GraphQLClient(endpoint, {
			credentials: "include",
			mode: "cors",
		});
		const query = gql`
			query {
				getUser {
					contacts {
						id
						username
						email
					}
				}
			}
		`;
		const data = await graphQLClient.request(query);
		if (data.getUser.contacts) {
			console.log("got data", data);
			contactFetchPromise = data.getUser.contacts;
		} else {
			$goto("/login");
		}
	}

	fetchContacts();

	let contactToDelete = null;
	function removeContactThroughModal(contact) {
		if (!checkAuthCookie()) {
			console.log("no auth to delete contact, redirecting...");
			$goto("/login");
		} else {
			showDeleteModal = true;
			contactToDelete = contact;
			console.log("toDelete", contactToDelete);
		}
	}

	async function handleDeleteContact() {
		const endpoint = import.meta.env.VITE_GQL_ENDPOINT_URL;
		const graphQLClient = new GraphQLClient(endpoint, {
			credentials: "include",
			mode: "cors",
		});
		const mutation = gql`
			mutation { removeContact (contactId: ${contactToDelete.id})}
		`;
		const data = await graphQLClient.request(mutation);
		console.log(JSON.stringify(data, undefined, 2));
		fetchContacts();
		$statusModalMessages = { code: 200, message: loc.contacts.modal.deleteSuccess };
		showDeleteModal = false;
	}

	// SEARCH

	let searchterm = null;
	let noResult = false;

	async function search() {
		if (!checkAuthCookie()) {
			$goto("/login");
		} else {
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
				console.log("search-result-data", data);
				// console.log(JSON.stringify(data.contacts, undefined, 2));
				if (data.findContact) {
					searchResultPromise = data.findContact;
					console.log(searchResultPromise);
					noResult = false;
				} else {
					noResult = true;
				}
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
		if (!checkAuthCookie()) {
			$goto("/login");
		} else {
			console.log(searchterm);
			const endpoint = import.meta.env.VITE_GQL_ENDPOINT_URL;
			const graphQLClient = new GraphQLClient(endpoint, {
				credentials: "include",
				mode: "cors",
			});
			const mutation = gql`
			mutation {
				addContact (contactId: ${id}) {
                    id
                    username
                    email
                    }
				}

		`;
			const data = await graphQLClient.request(mutation);
			$statusModalMessages = { code: 200, message: loc.contacts.modal.addSuccess };
			console.log("search Result data", data);
			// console.log(JSON.stringify(data.contacts, undefined, 2));
			console.log("dataaaa", data.addContact);
			console.log("contacts", contactFetchPromise);
			console.log(searchResultPromise);
			if (
				contactFetchPromise.find((el) => {
					return el.id === data.addContact.id;
				})
			) {
				$statusModalMessages = { code: 400, message: loc.contacts.modal.alreadyExists };
				// searchResultPromise = new Promise((resolve, reject) => {});
			} else {
				contactFetchPromise = [...contactFetchPromise, data.addContact];
				searchResultPromise = new Promise((resolve, reject) => {});
				searchterm = "";
			}
		}
	}

	onDestroy(() => {});
</script>

<div class="wrapper regular-text">
	<div class="headline debug-border">
		<h1 style="margin-left: -0.5rem" class="color-headline">{loc.contacts.labels.contacts}</h1>
	</div>
	<div style="margin-top: -2rem" class="separator" />
	<div in:fade>
		<p class="label mb-16">{loc.contacts.labels.search}</p>
		<div class="search-bar">
			<input
				bind:value={searchterm}
				on:keypress={handleKeyPress}
				class="searchfield"
				class:selected={searchterm}
				placeholder={loc.contacts.placeholders.search}
				type="text"
			/>
			<button class="btn" on:click={search}><span class="icon-search ml-8" /></button>
		</div>
		{#if noResult}
			<p class="mt-16 mb-16 ml-8">{loc.contacts.misc.noResult}</p>
		{:else}
			{#await searchResultPromise then result}
				<p class="label mt-16" in:fade>{loc.contacts.labels.searchResults}</p>
				<div class="wrapper-contact mt-16" in:receive|local={{ key: result.id }} out:send|local={{ key: result.id }}>
					<p class="name">{result.username}</p>
					<p class="email">{result.email}</p>
					<button on:click={addContact(result.id)} class="btn btn-regular mt-8">{loc.contacts.misc.btnAdd}</button>
				</div>
				<!-- <div class="separator" style="margin-top: 1rem" /> -->
			{/await}
		{/if}
		{#await contactFetchPromise}
			...fetching contacts
		{:then contacts}
			{#if contacts.length > 0}
				<p class="label mb-16 mt-16">{loc.contacts.labels.contactList}</p>
			{/if}
			{#each contacts as contact}
				<div class="wrapper-contact" in:receive|local={{ key: contact.id }} out:send|local={{ key: contact.id }}>
					<p class="name">{contact.username}</p>
					<p class="email">{contact.email}</p>
					<button on:click={removeContactThroughModal(contact)} class="btn btn-regular mt-8">{loc.contacts.misc.btnDelete}</button>
				</div>
			{/each}
		{/await}
	</div>
</div>

{#if showDeleteModal}
	<DeleteModal on:deleteEntity={handleDeleteContact} on:closeModal={() => (showDeleteModal = false)}>
		"{contactToDelete.username}"
	</DeleteModal>
{/if}

<style>
	.wrapper {
		display: flex;
		flex-direction: column;
		height: 100%;
	}

	.wrapper-contact {
		display: flex;
		flex-direction: column;
		border: 1px solid var(--dark);
		padding: 1rem;
		margin-bottom: 2rem;
		border-radius: 5px;
	}

	.name {
		margin-bottom: 1rem;
	}

	.email {
		font-size: 1.2rem;
	}

	.search-bar {
		display: flex;
	}

	.searchfield {
		background-color: transparent;
		border-radius: 5px;
	}

	.icon-search {
		display: flex;
		background: url("/images/icons/icon_search.svg") no-repeat center center;
		width: 3.2rem;
		height: 100%;
		border: 1px solid var(--dark);
		border-radius: 5px;
	}

	.icon-search:hover {
		background: url("/images/icons/icon_search_white.svg") no-repeat center center;
		background-color: var(--dark);
		cursor: pointer;
	}

	input {
		border: 1px solid var(--dark);
		padding-left: 1rem;
	}
</style>

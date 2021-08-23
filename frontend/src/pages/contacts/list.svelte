<script>
	import { GraphQLClient, gql } from "graphql-request";
	import { menuSelection, menuContext, statusModalMessages } from "../../stores/state";
	import { onDestroy, onMount } from "svelte";
	import { metatags, goto, url } from "@roxi/routify";
	import { fade } from "svelte/transition";

	import DeleteModal from "../_root_components/DeleteModal.svelte";

	let contactFetchPromise = new Promise((resolve, reject) => {});

	let showDeleteModal = false;

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
		contactFetchPromise = data.getUser.contacts;
	}

	fetchContacts();

	function viewSearch() {
		$goto("/contacts/search");
	}

	let contactToDelete = null;
	function removeContactThroughModal(contact) {
		showDeleteModal = true;
		contactToDelete = contact;
		console.log("toDelete", contactToDelete);
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
		$statusModalMessages = { code: 200, message: "Kontakt erfolgreich entfernt" };
		showDeleteModal = false;
	}

	onDestroy(() => {});
</script>

<div class="wrapper regular-text">
	<div class="headline debug-border">
		<div class="wrapper-switcher debug-border">
			<button class="btn" on:click|stopPropagation={viewSearch}>
				<svg width="26" height="40" viewBox="0 0 30 44" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path d="M2 22L28 2V42L2 22Z" stroke="var(--color-headline)" stroke-width="4" stroke-linejoin="round" />
				</svg>
			</button>
			<button class="ml-16 mr-8 btn" on:click|stopPropagation={viewSearch}>
				<svg width="26" height="40" viewBox="0 0 30 44" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path d="M28 22L2 2V42L28 22Z" stroke="var(--color-headline)" stroke-width="4" stroke-linejoin="round" />
				</svg>
			</button>
			<h1 class="color-headline">Liste</h1>
		</div>
		<p class="label">Kontakte</p>
	</div>
	<div style="margin-top: -2rem" class="separator" />
	{#await contactFetchPromise}
		...fetching contacts
	{:then contacts}
		{#each contacts as contact}
			<div class="wrapper-contact">
				<p class="name">{contact.username}</p>
				<p class="email">{contact.email}</p>
				<button on:click={removeContactThroughModal(contact)} class="btn btn-regular mt-8">Entfernen</button>
			</div>
		{/each}
	{/await}
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
	}

	.name {
		margin-bottom: 1rem;
	}

	.email {
		font-size: 1.2rem;
	}
</style>

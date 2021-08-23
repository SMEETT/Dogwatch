<script>
	import { metatags, goto, url } from "@roxi/routify";
	metatags.title = "Dogwatch / Hunde";
	metatags.description = "Description coming soon...";
	import { onMount, onDestroy } from "svelte";
	import { menuSelection, menuContext } from "../../stores/state";
	import { GraphQLClient, gql } from "graphql-request";
	import { usersDogsIds } from "../../stores/state";

	let infoMessage = "";
	let promise = new Promise((resolove, reject) => {});

	async function getDogIds() {
		async function getDogs() {
			const endpoint = import.meta.env.VITE_GQL_ENDPOINT_URL;
			const graphQLClient = new GraphQLClient(endpoint, {
				credentials: "include",
				mode: "cors",
			});
			const query = gql`
				query {
					getUser {
						dogs {
							id
						}
					}
				}
			`;
			const data = await graphQLClient.request(query);
			console.log(JSON.stringify(data, undefined, 2));
			return data.getUser;
		}
		return await getDogs().catch((error) => console.error(error));
	}

	onMount(() => {
		menuSelection.set("dogs");
		console.log($menuContext);
		$menuContext = { context: "dog_none" };
		console.log($menuContext.context);
		promise = getDogIds();
		promise.then((data) => {
			const dogsIds = [];
			console.log("dataaaaaaaaaaaa", data);
			data.dogs.forEach((dog) => {
				dogsIds.push(parseInt(dog.id));
			});
			dogsIds.sort((a, b) => a - b);
			if (dogsIds.length > 0) {
				$goto(`/dogs/${dogsIds[0]}`);
			} else {
				infoMessage = "Sie haben noch keine Hunde angelegt";
			}
		});
	});

	onDestroy(() => {
		$menuContext = { context: null };
	});
</script>

{#await promise}
	<div class="wrapper-spinner">
		<div class="lds-ring">
			<div />
			<div />
			<div />
			<div />
		</div>
	</div>
{:then}
	<p class="regular-text">{infoMessage}</p>
{/await}

<style>
</style>

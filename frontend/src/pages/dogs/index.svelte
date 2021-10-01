<script>
	import { metatags, goto, url } from "@roxi/routify";
	metatags.title = "Dogwatch / Hunde";
	metatags.description = "Description coming soon...";
	import { onMount, onDestroy } from "svelte";
	import { menuSelection, menuContext, loadLocale } from "../../stores/state";
	import { GraphQLClient, gql } from "graphql-request";
	const loc = loadLocale();

	let message = "";
	let promiseDogIds = new Promise((resolove, reject) => {});

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
			return data.getUser.dogs;
		}
		return await getDogs()
			.then((data) => {
				if (data === null) {
					console.log("we should redirect in this case");
					$goto("/login");
				} else {
					return data;
				}
			})
			.catch((error) => console.error(error));
	}

	onMount(() => {
		menuSelection.set("dogs");
		$menuContext = { context: "dog_none" };
		promiseDogIds = getDogIds();
		promiseDogIds.then((dogs) => {
			if (dogs) {
				const dogIds = [];
				dogs.forEach((dog) => {
					dogIds.push(parseInt(dog.id));
				});
				dogIds.sort((a, b) => a - b);
				if (dogIds.length > 0) {
					$goto(`/dogs/${dogIds[0]}`);
				} else {
					message = loc.dogs.misc.noDogsYet;
				}
			}
		});
	});

	onDestroy(() => {
		$menuContext = { context: null };
	});
</script>

{#await promiseDogIds}
	<div class="wrapper-spinner">
		<div class="lds-ring">
			<div />
			<div />
			<div />
			<div />
		</div>
	</div>
{:then}
	<p style="margin-top: -6rem" class="regular-text">{message}</p>
{/await}

<style>
</style>

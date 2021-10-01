<script>
	import { goto, metatags, redirect, params } from "@roxi/routify";
	metatags.title = "Dogwatch / Hunde / Hinzufügen";
	metatags.description = "Description coming soon...";
	import { onMount, onDestroy } from "svelte";
	import * as yup from "yup";
	import { GraphQLClient, gql } from "graphql-request";

	import { menuSelection, menuContext, bottomBarAction, liveValidation, statusModalMessages } from "../../../stores/state";
	import { leadingZero } from "../../../_helpers/helperFunctions";

	import FormDog from "../_components/FormDog.svelte";

	// ********************************************************
	// ON MOUNT
	// ********************************************************
	onMount(() => {
		menuSelection.set("dogs");
		menuContext.set({ context: "dog_add" });
		liveValidation.set(false);
	});

	const fetchPromise = fetchDog(parseInt($menuContext.idToUse));

	async function fetchDog(dogId) {
		console.log("fetchDog dogId", dogId);
		console.log($menuContext);
		async function getDog() {
			const endpoint = import.meta.env.VITE_GQL_ENDPOINT_URL;
			const graphQLClient = new GraphQLClient(endpoint, {
				credentials: "include",
				mode: "cors",
			});
			const query = gql`
				query {
					getDog(id: ${dogId}) {
							id
                            name
                            image
                            birthday
                            race
                            gender
                            weight
                            food_amount
                            medications
                            walk_duration
                            walktimes
                            feedtimes
                            notes
					}
				}
			`;
			const data = await graphQLClient.request(query);
			// console.log(JSON.stringify(data, undefined, 2));
			return data.getDog;
		}
		return await getDog()
			.then((data) => {
				console.log("dog edit data", data);
				if (!data.id) {
					console.log("we should redirect in this case");
					$goto("/login");
				} else {
					return data;
				}
			})
			.catch((error) => console.error(error));
	}
</script>

{#await fetchPromise}
	...fetching
{:then fetchedDogData}
	<FormDog toUpdateDogData={fetchedDogData} formContext="edit" />
{/await}

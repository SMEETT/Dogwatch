<script>
	import { params, redirect } from "@roxi/routify";
	import { GraphQLClient, gql } from "graphql-request";
	import { menuSelection, menuContext, bottomBarAction, loadLocale } from "../../stores/state";
	import { onDestroy, onMount } from "svelte";
	import { metatags, goto, url } from "@roxi/routify";
	import { fade } from "svelte/transition";

	import { extractTimeOfDay, calculateAge } from "../../_helpers/helperFunctions";
	import DeleteModal from "../_root_components/DeleteModal.svelte";

	const loc = loadLocale();

	// call function "main" when the parameter 'dog' changes (on visiting another route /dogs/[dog])
	$: main($params.dog);

	// Id's used for navigation
	let dogsIds;

	let currentDogsIndex;
	// we initialize 'currentDog' with a pending promise...
	let currentDog = new Promise((resolve, reject) => {});

	onMount(() => {
		$menuSelection = "dogs";
		$menuContext.context = "dog";
		$menuContext.idToUse = $params.dog;
	});

	async function main() {
		// only fetch when there is a parameter present
		if ($params.dog) {
			menuContext.set({ context: "dog", idToUse: $params.dog });
			async function getDogData() {
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
						}
					`;
					const data = await graphQLClient.request(query);
					// console.log(JSON.stringify(data, undefined, 2));
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

			// if 'currentDog' resolves we can render the data in template
			currentDog = new Promise((resolve, reject) => {
				getDogData().then((dogs) => {
					if (dogs) {
						let currDog = dogs.find((dog) => $params.dog === dog.id);
						const ids = [];
						dogs.forEach((dog) => {
							ids.push(parseInt(dog.id));
						});
						ids.sort((a, b) => a - b);
						dogsIds = ids;
						currentDogsIndex = ids.indexOf(parseInt($params.dog));
						if (currDog) {
							resolve(currDog);
						} else {
							// reject leads to a catch in template (where we redirect to '/dogs')
							// cause it indicates that a dog with the requested Id doesn't exist
							reject();
						}
					}
				});
			});
		}
	}

	function nextDog() {
		if (currentDogsIndex + 1 === dogsIds.length) {
			$goto(`/dogs/${dogsIds[0]}`);
		} else {
			$goto(`/dogs/${dogsIds[currentDogsIndex + 1]}`);
		}
	}

	function prevDog() {
		if (currentDogsIndex === 0) {
			$goto(`/dogs/${dogsIds[dogsIds.length - 1]}`);
		} else {
			$goto(`/dogs/${dogsIds[currentDogsIndex - 1]}`);
		}
	}

	async function handleDeleteDog() {
		async function deleteDog() {
			const endpoint = import.meta.env.VITE_GQL_ENDPOINT_URL;
			const graphQLClient = new GraphQLClient(endpoint, {
				credentials: "include",
				mode: "cors",
			});
			const mutation = gql`
				mutation {
					deleteDog(id: ${parseInt($params.dog)}) {
						id
                        name
					}
				}
			`;
			const data = await graphQLClient.request(mutation);
			$bottomBarAction = "";
			// console.log(JSON.stringify(data, undefined, 2));
			return data.deleteDog;
		}
		await deleteDog().catch((error) => console.error(error));
		console.log("delete done");
		$redirect("/dogs");
	}

	onDestroy(() => {
		// console.log("DOG VIEW DESTROYED");
	});
</script>

{#await currentDog}
	<div class="wrapper-spinner">
		<div class="lds-ring">
			<div />
			<div />
			<div />
			<div />
		</div>
	</div>
{:then currentDog}
	<div class="wrapper regular-text">
		<div class="headline">
			<div class="wrapper-switcher">
				<button class="btn" on:click|stopPropagation={prevDog}>
					<svg width="26" height="40" viewBox="0 0 30 44" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M2 22L28 2V42L2 22Z" stroke="var(--color-headline)" stroke-width="4" stroke-linejoin="round" />
					</svg>
				</button>
				<button class="ml-16 btn" on:click|stopPropagation={nextDog}>
					<svg width="26" height="40" viewBox="0 0 30 44" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M28 22L2 2V42L28 22Z" stroke="var(--color-headline)" stroke-width="4" stroke-linejoin="round" />
					</svg>
				</button>
				<h1 class="color-headline">{currentDog.name}</h1>
			</div>
			<p class="headline-label">{currentDogsIndex + 1}/{dogsIds.length}</p>
			<!-- <p class="label">Hunde</p> -->
		</div>
		<div style="margin-top: -2rem" class="separator" />

		<div in:fade class="wrapper-detailview">
			<!-- <h2 class="date">30/01/20 - 04/01/21</h2> -->
			<div class="wrapper-image">
				{#if currentDog.image !== "undefined"}
					<img class="image" src={currentDog.image} alt="" />
				{:else}
					<img class="image" src="/images/image_profile_ph.png" alt="" />
				{/if}
			</div>
			<div class="separator" />
			<div class="wrapper-fields">
				<div>
					<p class="label mb-8">{loc.dogs.labels.age}</p>
					<p class="regular-text mb-8">{calculateAge(currentDog.birthday)} Tage</p>
				</div>

				<div>
					<p class="label mb-8">{loc.dogs.labels.race}</p>
					<p class="regular-text mb-8 line-height-125">{currentDog.race}</p>
				</div>
				<div>
					<p class="label mb-8">{loc.dogs.labels.gender}</p>
					<p class="regular-text mb-8">{currentDog.gender}</p>
				</div>
				<div>
					<p class="label mb-8">{loc.dogs.labels.weight}</p>
					<p class="regular-text mb-8">
						{currentDog.weight} kg
					</p>
				</div>
				<div>
					<p class="label mb-8">{loc.dogs.labels.foodAmount}</p>
					<p class="regular-text mb-8">
						{currentDog.food_amount} g
					</p>
				</div>
				<div>
					<p class="label mb-8">{loc.dogs.labels.walkDuration}</p>
					<p class="regular-text mb-8">
						{currentDog.walk_duration} min
					</p>
				</div>

				<div>
					<p class="label mb-8">{loc.dogs.labels.feedTimes}</p>
					{#each currentDog.feedtimes as feedtime}
						<p class="regular-text mb-8" style="display: flex; align-items: center">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="18"
								height="18"
								fill="none"
								stroke="var(--dark)"
								stroke-width="1.5"
								stroke-linejoin="round"
								style="margin-right: 0.5rem"
								><path d="M9 17A8 8 0 1 0 9 1a8 8 0 1 0 0 16z" /><path d="M9 4.429V9l2.286 2.286" stroke-linecap="round" /></svg
							>
							{extractTimeOfDay(feedtime)}
						</p>
					{/each}
				</div>
				<div>
					<p class="label mb-8">{loc.dogs.labels.walkTimes}</p>
					{#each currentDog.walktimes as walktime}
						<p class="regular-text mb-8" style="display: flex; align-items: center">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="18"
								height="18"
								fill="none"
								stroke="var(--dark)"
								stroke-width="1.5"
								stroke-linejoin="round"
								style="margin-right: 0.5rem"
								><path d="M9 17A8 8 0 1 0 9 1a8 8 0 1 0 0 16z" /><path d="M9 4.429V9l2.286 2.286" stroke-linecap="round" /></svg
							>
							{extractTimeOfDay(walktime)}
						</p>
					{/each}
				</div>
				<div>
					<p class="label mb-8">{loc.dogs.labels.medication}</p>
					{#each currentDog.medications as medication}
						<p class="regular-text mb-8">
							{medication}
						</p>
					{/each}
					{#if currentDog.medications.length === 0}
						<p class="regular-text mb-8">-</p>
					{/if}
				</div>
				<div class="notes">
					<p class="label mb-8">{loc.shared.labels.notes}</p>
					{#if currentDog.notes}
						<p class="regular-text mb-8 line-height-125">
							{currentDog.notes}
						</p>
					{:else}
						<p class="regular-text mb-8">-</p>
					{/if}
				</div>
			</div>
		</div>
	</div>
	{#if $bottomBarAction === "dog_delete"}
		<DeleteModal on:deleteEntity={handleDeleteDog}>
			"{currentDog.name}"
		</DeleteModal>
	{/if}
{:catch error}
	<!-- when we don't have data we redirect to /dogs -->
	{$redirect("/dogs")}
{/await}

<style>
	.test-wrapper {
		/* width: 100%; */
		right: 2.4rem;
		left: 2.4rem;
		position: fixed;
		justify-content: space-between;
		align-items: center;
		display: flex;
		bottom: calc(var(--bottombar-height) + 1rem);
		background-color: var;
	}

	.wrapper {
		display: flex;
		flex-direction: column;
		height: 50%;
	}

	.notes {
		grid-column: 1 / 3;
		height: auto;
	}
</style>

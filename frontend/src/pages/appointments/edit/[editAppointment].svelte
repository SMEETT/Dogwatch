<script>
	import { goto, metatags, redirect, params } from "@roxi/routify";
	metatags.title = "Dogwatch / Termine / Bearbeiten";
	metatags.description = "Description coming soon...";
	import { onMount, onDestroy } from "svelte";
	import * as yup from "yup";
	import { GraphQLClient, gql } from "graphql-request";

	import { menuActive, menuStatus, lastSelectedDay, bottomBarAction, liveValidation, statusModalMessages } from "../../../stores/state";

	import FormAppointment from "../_components/FormAppointment.svelte";

	// ********************************************************
	// ON MOUNT
	// ********************************************************
	onMount(() => {
		menuActive.set("appointments");
		menuStatus.set({ context: "appointment", idToUse: parseInt($lastSelectedDay.apptId) });
		liveValidation.set(false);
	});

	const fetchPromise = fetchAppointment(parseInt($params.editAppointment));

	async function fetchAppointment(appointmentId) {
		async function getAppointment() {
			const endpoint = import.meta.env.VITE_GQL_ENDPOINT_URL;
			const graphQLClient = new GraphQLClient(endpoint, {
				credentials: "include",
				mode: "cors",
			});
			const query = gql`
				query {
					getAppointment(id: ${appointmentId}) {
							id
                            start_date
                            end_date
                            dogs {
                                id
                                name
                            }
                            caretakers {
                                id
                                username
                            }
                            notes
					}
				}
			`;
			const data = await graphQLClient.request(query);
			console.log("Edit Appointment Data", JSON.stringify(data, undefined, 2));
			return data.getAppointment;
		}
		return await getAppointment().catch((error) => console.error(error));
	}
</script>

{#await fetchPromise}
	...fetching
{:then fetchedAppointmentData}
	<FormAppointment toUpdateAppointmentData={fetchedAppointmentData} formContext="edit" />
{/await}

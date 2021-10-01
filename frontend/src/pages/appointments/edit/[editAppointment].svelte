<script>
	import { goto, metatags, redirect, params } from "@roxi/routify";
	metatags.title = "Dogwatch / Termine / Bearbeiten";
	metatags.description = "Description coming soon...";
	import { GraphQLClient, gql } from "graphql-request";

	import FormAppointment from "../_components/FormAppointment.svelte";

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
                            caretaker {
                                id
                                username
                            }
                            observers {
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
		return await getAppointment()
			.then((data) => {
				console.log("edit appointment data", data);
				if (data === null) {
					console.log("401!");
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
{:then fetchedAppointmentData}
	<FormAppointment toUpdateAppointmentData={fetchedAppointmentData} formContext="edit" />
{/await}

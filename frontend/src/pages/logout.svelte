<!-- routify:options reset -->
<script>
	import { metatags, redirect, goto } from "@roxi/routify";
	import BottomBar from "./_root_components/BottomBar.svelte";
	import { isAuthenticated, authenticating, checkAuthCookie, statusModalMessages } from "../stores/state";

	import { GraphQLClient, gql } from "graphql-request";
	console.log("Logout");

	async function main() {
		const endpoint = import.meta.env.VITE_GQL_ENDPOINT_URL;

		const graphQLClient = new GraphQLClient(endpoint, {
			credentials: "include",
			mode: "cors",
		});

		const mutation = gql`
			mutation {
				logoutUser
			}
		`;

		const data = await graphQLClient.request(mutation);
		console.log(JSON.stringify(data, undefined, 2));
		$statusModalMessages = { code: 200, message: "Logout erfolgreich" };
		$goto("/login");
	}

	isAuthenticated.set(false);
	main().catch((error) => console.error(error));
</script>

<BottomBar />

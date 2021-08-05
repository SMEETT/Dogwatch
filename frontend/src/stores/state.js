import { writable, readable, get } from "svelte/store";
import { GraphQLClient, gql } from "graphql-request";
import * as yup from "yup";

export const lastSelectedDay = writable({});

export const menuStatus = writable({ context: null, idToUse: null });
export const menuActive = writable(null);
export const menuAction = writable(null);

export const statusModalMessages = writable({ code: null, message: null });
export const liveValidation = writable(false);

// ********************************************************
// DOG ID's
// ********************************************************

export const usersDogsIds = writable();

// ********************************************************
// LOGIN / AUTH
// ********************************************************
export const isAuthenticated = writable(false);
export const authenticating = writable(false);

export const user = writable({
	username: null,
	metadata: null,
	isAuthenticated: null,
});

export const checkAuthCookie = () => {
	const cookies = Object.fromEntries(document.cookie.split("; ").map((x) => x.split("=")));
	if (cookies.isAuthenticated === "true") {
		isAuthenticated.set(true);
	} else {
		isAuthenticated.set(false);
	}
};

export const login = (email, password) => {
	authenticating.set(true);
	async function loginUser() {
		const endpoint = import.meta.env.VITE_GQL_ENDPOINT_URL;
		const graphQLClient = new GraphQLClient(endpoint, {
			credentials: "include",
			mode: "cors",
		});
		const mutation = gql`
				mutation {
					loginUser(email: "${email}", password: "${password}")
				}
			`;

		const data = await graphQLClient.request(mutation);
		if (data.loginUser.status === 200) {
			authenticating.set(false);
			isAuthenticated.set(true);
		} else {
			console.log(data.loginUser.message);
			authenticating.set(false);
		}
		console.log(JSON.stringify(data, undefined, 2));
	}
	loginUser().catch((error) => console.error(error));
};

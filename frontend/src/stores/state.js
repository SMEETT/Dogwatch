import { writable, readable, get } from "svelte/store";
import { GraphQLClient, gql } from "graphql-request";
import * as yup from "yup";

export const lastSelectedDay = writable({});

export const menuContext = writable({ context: null, idToUse: null });
export const menuSelection = writable(null);
export const bottomBarAction = writable(null);

export const statusModalMessages = writable({ code: null, message: null });
export const liveValidation = writable(false);
export const newlyRegisteredEmail = writable(null);

// ********************************************************
// DOG ID's
// ********************************************************

export const usersDogsIds = writable();

// ********************************************************
// LOGIN / AUTH
// ********************************************************
export const isAuthenticated = writable(false);
export const authenticating = writable(false);
export const userLanguage = writable(null);

export const user = writable({
	username: null,
	metadata: null,
	isAuthenticated: null,
});

export const checkAuthCookie = () => {
	const cookies = Object.fromEntries(document.cookie.split("; ").map((x) => x.split("=")));
	if (cookies.isAuthenticated === "true") {
		console.log("cookie found");
		return true;
		// isAuthenticated.set(true);
	} else {
		return false;
		// isAuthenticated.set(false);
	}
};

export function requestUserPreference(preference) {
	async function fetchUser() {
		const endpoint = import.meta.env.VITE_GQL_ENDPOINT_URL;
		const graphQLClient = new GraphQLClient(endpoint, {
			credentials: "include",
			mode: "cors",
		});
		const query = gql`
			query {
				getUser {
					preferences
				}
			}
		`;
		const data = await graphQLClient.request(query);
		console.log(JSON.stringify(data, undefined, 2));
		localStorage.setItem(`${preference}`, data.getUser.preferences[`${preference}`]);
		return data.getUser.preferences[`${preference}`];
	}
	return fetchUser();
}

// load locales
import { en } from "../loc/en";
import { de } from "../loc/de";
import { ru } from "../loc/ru";
export function loadLocale() {
	let loc;
	switch (navigator.language.slice(0, 2)) {
		case "de":
			loc = de;
			break;
		case "ru":
			loc = ru;
			break;
		default:
			loc = en;
	}
	return loc;
}

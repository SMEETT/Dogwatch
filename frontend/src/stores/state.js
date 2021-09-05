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
		isAuthenticated.set(true);
	} else {
		isAuthenticated.set(false);
	}
};

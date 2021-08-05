<script>
	import { goto, metatags, redirect } from "@roxi/routify";
	metatags.title = "Dogwatch / Hunde / Hinzufügen";
	metatags.description = "Description coming soon...";
	import { onMount, onDestroy } from "svelte";
	import * as yup from "yup";
	import { GraphQLClient, gql } from "graphql-request";

	import { menuActive, menuStatus, menuAction, liveValidation, statusModalMessages } from "../../stores/state";
	import { leadingZero } from "../../_helpers/helperFunctions";

	import FormDog from "./_components/FormDog.svelte";

	// ********************************************************
	// ON MOUNT
	// ********************************************************
	onMount(() => {
		menuActive.set("dogs");
		menuStatus.set({ context: "add_dog" });
		liveValidation.set(false);
	});

	// ********************************************************
	// Write TO DB
	// ********************************************************
</script>

<FormDog formContext="add" toUpdateDogData={null} />

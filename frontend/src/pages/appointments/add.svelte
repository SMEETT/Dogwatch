<script>
	import { goto, metatags, redirect } from "@roxi/routify";
	metatags.title = "Dogwatch / Termine / Hinzufügen";
	metatags.description = "Description coming soon...";
	import { onMount, onDestroy } from "svelte";
	import * as yup from "yup";
	import { GraphQLClient, gql } from "graphql-request";

	import { menuActive, menuStatus, menuAction, liveValidation, statusModalMessages } from "../../stores/state";
	import { leadingZero } from "../../_helpers/helperFunctions";

	import FormAppointment from "./_components/FormAppointment.svelte";

	// ********************************************************
	// ON MOUNT
	// ********************************************************
	onMount(() => {
		menuActive.set("appointments");
		menuStatus.set({ context: "add_appointment" });
		liveValidation.set(false);
	});

	// ********************************************************
	// Write TO DB
	// ********************************************************
</script>

<FormAppointment formContext="add" toUpdateAppointmentData={null} />

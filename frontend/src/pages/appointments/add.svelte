<script>
	import { goto, metatags, redirect } from "@roxi/routify";
	metatags.title = "Dogwatch / Termine / Hinzufügen";
	metatags.description = "Description coming soon...";
	import { onMount, onDestroy } from "svelte";
	import * as yup from "yup";
	import { GraphQLClient, gql } from "graphql-request";

	import { menuSelection, menuContext, bottomBarAction, liveValidation, statusModalMessages } from "../../stores/state";
	import { leadingZero } from "../../_helpers/helperFunctions";

	import FormAppointment from "./_components/FormAppointment.svelte";

	// ********************************************************
	// ON MOUNT
	// ********************************************************
	onMount(() => {
		menuSelection.set("appointments");
		menuContext.set({ context: "appointment_add" });
		liveValidation.set(false);
	});

	// ********************************************************
	// Write TO DB
	// ********************************************************
</script>

<FormAppointment formContext="add" toUpdateAppointmentData={null} />

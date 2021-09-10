<script>
	import { metatags } from "@roxi/routify";
	metatags.title = "Dogwatch / Hunde / Hinzufügen";
	metatags.description = "Description coming soon...";
	import { onMount } from "svelte";

	import { menuSelection, menuContext, liveValidation } from "../../stores/state";

	import FormDog from "./_components/FormDog.svelte";

	// ********************************************************
	// ON MOUNT
	// ********************************************************
	onMount(() => {
		menuSelection.set("dogs");
		menuContext.set({ context: "dog_add" });
		liveValidation.set(false);
	});

	// ********************************************************
	// Write TO DB
	// ********************************************************
</script>

<FormDog formContext="add" toUpdateDogData={null} />

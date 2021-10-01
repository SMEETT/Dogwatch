<script>
	import { metatags } from "@roxi/routify";
	metatags.title = "Dogwatch / Hunde / Hinzufügen";
	metatags.description = "Description coming soon...";
	import { onMount } from "svelte";
	import { goto } from "@roxi/routify";

	import { menuSelection, menuContext, liveValidation, checkAuthCookie } from "../../stores/state";

	import FormDog from "./_components/FormDog.svelte";

	// ********************************************************
	// ON MOUNT
	// ********************************************************
	onMount(() => {
		menuSelection.set("dogs");
		menuContext.set({ context: "dog_add" });
		liveValidation.set(false);
		if (!checkAuthCookie()) {
			$goto("/login");
		}
	});

	// ********************************************************
	// Write TO DB
	// ********************************************************
</script>

<FormDog formContext="add" toUpdateDogData={null} />

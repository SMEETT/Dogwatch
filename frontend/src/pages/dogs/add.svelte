<script>
	import { metatags } from "@roxi/routify";
	import { onMount } from "svelte";
	import { goto } from "@roxi/routify";

	import { menuSelection, menuContext, liveValidation, checkAuthCookie, loadLocale } from "../../stores/state";

	const loc = loadLocale();
	metatags.title = loc.dogs.misc.pageTitle;
	metatags.description = "Description coming soon...";

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

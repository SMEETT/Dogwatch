<!-- routify:options reset -->
<script>
	import { metatags, redirect } from "@roxi/routify";
	metatags.title = "Dogwatch / Login";
	metatags.description = "Description coming soon...";
	import Login from "../_root_components/Login.svelte";
	import BottomBar from "../_root_components/BottomBar.svelte";
	import StatusModal from "../_root_components/StatusModal.svelte";
</script>

<Login />
<!-- <BottomBar /> -->
<StatusModal />

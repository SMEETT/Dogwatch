<!-- routify:options preload="proximity" -->
<script>
	import Serviceworker from "../Serviceworker.svelte";
	import { onDestroy } from "svelte";
	import { goto } from "@roxi/routify";
	import { isAuthenticated, authenticating, checkAuthCookie } from "../stores/state";
	import Login from "./_root_components/Login.svelte";

	import BottomBar from "./_root_components/BottomBar.svelte";
	import StatusModal from "./_root_components/StatusModal.svelte";
	import DeleteModal from "./_root_components/DeleteModal.svelte";

	import { metatags, redirect, url } from "@roxi/routify";
	metatags.title = "Dogwatch / Login";
	metatags.description = "Description coming soon...";

	// onDestroy(() => {
	//     $isAuthenticated = false;
	// })
</script>

<!-- Servicworker, disabled for now -->
<!-- <Serviceworker /> -->

{#if $authenticating}
	authenticating...
{:else if $isAuthenticated || checkAuthCookie()}
	<p>slot</p>
	<slot />
{:else}
	<Login />
{/if}

<!-- {#if $isAuthenticated}
	<p>isAuth</p>
	{$authenticating}
{/if} -->

<StatusModal />
<BottomBar />

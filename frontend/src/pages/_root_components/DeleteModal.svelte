<script>
	import { statusModalMessages, bottomBarAction } from "../../stores/state";
	import { fade } from "svelte/transition";
	import { createEventDispatcher } from "svelte";

	function closeModal() {
		$bottomBarAction = "";
	}

	const dispatch = createEventDispatcher();

	export let typeToDelete = "efefef";

	function dispatchDelete() {
		dispatch("deleteEntity");
	}

	function dispatchCloseModal() {
		console.log("dispatched closeModal");
		dispatch("closeModal");
	}
</script>

<div
	transition:fade={{ duration: 100 }}
	class="wrapper regular-text line-height-125"
	class:bg-green={$statusModalMessages.code === 200}
	class:bg-red={$statusModalMessages.code !== 200}
>
	<div class="container-message">
		<div class="top-row">
			<div class="wrapper-headline">
				{#if typeToDelete === "appointment"}
					<p class="regular-text">Wollen Sie diesen Termin wirklich löschen?</p>
				{:else}
					<p class="regular-text">Wollen Sie <span><slot /></span> wirklich löschen?</p>
				{/if}
			</div>
		</div>
		<div class="bottom-row">
			<button class="btn-delete" on:click={dispatchDelete}>LÖSCHEN</button>
			<button class="btn-abort" on:click={closeModal} on:click={dispatchCloseModal}>ABBRECHEN</button>
		</div>
	</div>
</div>
<div transition:fade={{ duration: 100 }} on:click={closeModal} on:click={dispatchCloseModal} class="shadow-box" />

<style>
	.btn-delete {
		background-color: red;
		border: 0;
		color: var(--bright);
		width: 10rem;
		height: 3.2rem;
		border-radius: 5px;
		margin-right: 4rem;
	}

	span {
		font-weight: 700;
	}

	.btn-abort {
		background-color: var(--bright);
		border: 1px solid var(--dark);
		color: var(--dark);
		border-radius: 5px;
		width: 10rem;
		height: 3.2rem;
	}

	.btn-abort:hover {
		background-color: var(--dark);
		color: var(--bright);
		cursor: pointer;
	}

	.top-row {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.bottom-row {
		display: flex;
		justify-content: center;
	}

	.btn-delete:hover {
		background-color: var(--dark);
		cursor: pointer;
	}

	.wrapper {
		align-items: center;
		justify-content: center;
		transition: 0.3s;
		width: 98%;
		height: auto;
		min-height: 12rem;
		max-height: 12rem;
		position: fixed;
		margin: auto;
		top: 20%;
		bottom: 20%;
		left: 1%;
		right: 1%;
		z-index: 5;
		font-size: 1.6rem;
		background-color: var(--bright);
		border-radius: 5px;
		color: var(--bright);
		box-shadow: 0 1.4px 1px rgba(0, 0, 0, 0.043), 0 3.6px 2.4px rgba(0, 0, 0, 0.062), 0 7.4px 5px rgba(0, 0, 0, 0.078), 0 15.3px 10.2px rgba(0, 0, 0, 0.097),
			0 42px 28px rgba(0, 0, 0, 0.14);
	}

	.shadow-box {
		background-color: rgba(0, 0, 0, 0.5);
		z-index: 2;
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;
		position: fixed;
	}

	.btn-close {
		width: 32px;
		height: 32px;
		background: none;
		border: none;
		cursor: pointer;
	}

	svg:hover path {
		fill: var(--dark);
	}

	svg.x:hover path {
		fill: var(--light);
		stroke: var(--light);
	}

	.container-message {
		height: 100%;
		color: var(--dark);
		padding: 1rem 2rem;
		display: grid;
		grid-template-rows: 1fr 1fr;
		grid-template-columns: 1fr;
		align-items: center;
		justify-content: center;
	}
</style>

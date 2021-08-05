<script>
	import { statusModalMessages } from "../../stores/state";
	import { fade } from "svelte/transition";

	function closeStatusModal() {
		statusModalMessages.set({});
	}

	function autoClose() {
		setTimeout(() => {
			closeStatusModal();
		}, 10000);
	}
</script>

{#if $statusModalMessages.code}
	<div
		transition:fade={{ duration: 100 }}
		class="wrapper regular-text line-height-125"
		class:bg-green={$statusModalMessages.code === 200}
		class:bg-red={$statusModalMessages.code !== 200}
		on:click={closeStatusModal}
		use:autoClose
	>
		<div class="container-message">{$statusModalMessages.message}</div>
		<div class="bar">
			<button class="x" on:click={closeStatusModal}>
				<svg class="x" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path
						d="M2 22.0005C17.3043 6.69611 21.7101 2.29031 22 2.00046"
						stroke="var(--bright)"
						stroke-width="3"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
					<path
						d="M22 22C6.69565 6.69565 2.28985 2.28986 2 2"
						stroke="var(--bright)"
						stroke-width="3"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
			</button>
		</div>
	</div>
{/if}

<style>
	.wrapper {
		display: grid;
		grid-template-columns: 5fr 1fr;
		grid-template-rows: auto;
		align-items: center;
		justify-content: center;
		transition: 0.3s;
		width: 100%;
		height: auto;
		min-height: 8rem;
		position: fixed;
		bottom: 8.4rem;
		left: 0%;
		right: 5%;
		z-index: 2;
		font-size: 1.6rem;
		background-color: red;
		color: var(--bright);
		box-shadow: 0 1.4px 1px rgba(0, 0, 0, 0.043), 0 3.6px 2.4px rgba(0, 0, 0, 0.062), 0 7.4px 5px rgba(0, 0, 0, 0.078), 0 15.3px 10.2px rgba(0, 0, 0, 0.097),
			0 42px 28px rgba(0, 0, 0, 0.14);
	}

	button {
		width: 32px;
		height: 32px;
		background: none;
		border: none;
		cursor: pointer;
	}

	svg:hover path {
		fill: var(--dark);
	}

	.bar {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
	}

	svg.x:hover path {
		fill: var(--dark);
		stroke: var(--dark);
	}

	.container-message {
		height: 100%;
		padding: 1rem 2rem;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.bg-red {
		background-color: red;
	}

	.bg-green {
		background-color: green;
	}
</style>

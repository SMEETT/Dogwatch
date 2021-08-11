<script>
	let menuVisible = false;

	let menuHeight = 0;
	let menuOpacity = 0;
	let menuPointer = "none";

	function toggleDotMenu() {
		console.log("toggleDotMenu()");
		if (menuVisible) {
			console.log("hideMenu");
			menuHeight = 0;
			menuOpacity = 0;
			menuPointer = "none";
		} else {
			console.log("showMenu");
			menuHeight = 8;
			menuOpacity = 100;
			menuPointer = "auto";
		}
		menuVisible = !menuVisible;
	}
</script>

<div class="wrapper" on:click={toggleDotMenu}>
	<svg width="4" height="19" viewBox="0 0 4 19" fill="none" xmlns="http://www.w3.org/2000/svg">
		<path
			d="M1.9762 4.14395C1.4642 4.14395 1.0402 3.97595 0.704195 3.63995C0.368195 3.28795 0.200195 2.85595 0.200195 2.34395C0.200195 1.83195 0.368195 1.40795 0.704195 1.07195C1.0402 0.719945 1.4642 0.543945 1.9762 0.543945C2.4882 0.543945 2.9122 0.719945 3.2482 1.07195C3.5842 1.40795 3.7522 1.83195 3.7522 2.34395C3.7522 2.85595 3.5842 3.28795 3.2482 3.63995C2.9122 3.97595 2.4882 4.14395 1.9762 4.14395Z"
			fill="black"
		/>
		<path
			d="M1.9762 11.1439C1.4642 11.1439 1.0402 10.9759 0.704195 10.6399C0.368195 10.2879 0.200195 9.85595 0.200195 9.34395C0.200195 8.83195 0.368195 8.40795 0.704195 8.07195C1.0402 7.71995 1.4642 7.54395 1.9762 7.54395C2.4882 7.54395 2.9122 7.71995 3.2482 8.07195C3.5842 8.40795 3.7522 8.83195 3.7522 9.34395C3.7522 9.85595 3.5842 10.2879 3.2482 10.6399C2.9122 10.9759 2.4882 11.1439 1.9762 11.1439Z"
			fill="black"
		/>
		<path
			d="M1.9762 18.1439C1.4642 18.1439 1.0402 17.9759 0.704195 17.6399C0.368195 17.2879 0.200195 16.8559 0.200195 16.3439C0.200195 15.8319 0.368195 15.4079 0.704195 15.0719C1.0402 14.7199 1.4642 14.5439 1.9762 14.5439C2.4882 14.5439 2.9122 14.7199 3.2482 15.0719C3.5842 15.4079 3.7522 15.8319 3.7522 16.3439C3.7522 16.8559 3.5842 17.2879 3.2482 17.6399C2.9122 17.9759 2.4882 18.1439 1.9762 18.1439Z"
			fill="black"
		/>
	</svg>
	<div class="menu" style="height:{menuHeight}rem; opacity:{menuOpacity}; pointer-events: {menuPointer}">
		<p class="link">Account verwalten</p>
		<p class="link">Abmelden</p>
	</div>
</div>

<style>
	.wrapper {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 2rem;
		height: 3rem;
		position: relative;
		/* border: 1px solid blue; */
		/* border: 1px solid red; */
	}

	.link {
		font-size: 1.5rem;
		font-weight: 700;
		font-family: "Nunito";
	}

	.menu {
		/* border: 1px solid red; */
		background-color: var(--light);
		position: absolute;
		display: flex;
		flex-direction: column;
		/* align-items: center; */
		justify-content: space-evenly;
		padding-left: 2rem;
		width: 18rem;
		top: 3.5rem;
		right: 0rem;
		border-radius: 10px;
		transition: 0.3s;
	}
</style>

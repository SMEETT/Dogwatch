<script>
	import { menuStatus, menuActive, bottomBarAction, liveValidation, lastSelectedDay } from "../../stores/state";
	import { onMount, onDestroy } from "svelte";
	import { url, goto } from "@roxi/routify";
	import { fade } from "svelte/transition";

	let menuVisible = false;
	let menuHeight = 0;
	let menuOpacity = 0;
	let menuPointer = "none";
	let radius = 10;

	onMount(() => {
		// console.log("BottomBar mounted");
	});

	onDestroy(() => {
		// console.log("Bottomo Bar destroyed");
	});

	// ----------------------------------------------
	// GENERAL
	// ----------------------------------------------
	function goBack() {
		console.log("clicked goBack");
		window.history.back();
	}

	function toggleMenu(e) {
		console.log("toggleMenu!");
		if (menuVisible) {
			menuHeight = 0;
			menuOpacity = 0;
			menuPointer = "none";
			radius = 10;
		} else {
			menuHeight = 27;
			menuOpacity = 100;
			menuPointer = "auto";
			radius = 0;
		}
		menuVisible = !menuVisible;
	}

	// ----------------------------------------------
	// CRUD CALENDAR
	// ----------------------------------------------
	function editAppointment() {
		console.log("clicked add appointment");
		menuStatus.set({ context: "appointment", idToUse: parseInt($lastSelectedDay.apptId) });
		$goto(`/appointments/edit/${$menuStatus.idToUse}`);
	}
	function deleteAppointment() {
		bottomBarAction.set("delete_appointment");
		console.log("clicked delete appointment");
	}
	function addAppointment() {
		$goto("/appointments/add");
		console.log("clicked add appointment");
	}
	function saveAppointment() {
		console.log("clicked save appointment");
		liveValidation.set(true);
		bottomBarAction.set("writeAppointment");
	}

	// ----------------------------------------------
	// CRUD DOGS
	// ----------------------------------------------
	function editDog() {
		console.log("clicked edit dog");
		$goto(`/dogs/edit/${$menuStatus.idToUse}`);
	}
	function deleteDog() {
		bottomBarAction.set("delete_dog");
		console.log("clicked delete dog");
	}
	function addDog() {
		console.log("clicked add dog");
		$goto("/dogs/add");
	}
	function saveDog() {
		console.log("clicked save dog");
		liveValidation.set(true);
		bottomBarAction.set("writeDog");
	}
</script>

<!-- ----------------------------------------- -->
<!-- // MENU -->
<!-- ----------------------------------------- -->

<div on:click|stopPropagation={toggleMenu} style="height:{menuHeight}rem; opacity: {menuOpacity}%; pointer-events: {menuPointer}" class="wrapper-menu">
	<button class="x" on:click|stopPropagation={toggleMenu}>
		<svg class="x" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path
				d="M2 22.0005C17.3043 6.69611 21.7101 2.29031 22 2.00046"
				stroke="var(--bright)"
				stroke-width="3"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
			<path d="M22 22C6.69565 6.69565 2.28985 2.28986 2 2" stroke="var(--bright)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
		</svg>
	</button>
	<button
		class:menu-selected={$menuActive === "logout"}
		on:click|stopPropagation={toggleMenu}
		on:click={() => menuActive.set("logout")}
		on:click={() => $goto("/logout")}
		class="menu-link">Logout</button
	>
	<button
		class:menu-selected={$menuActive === "profile"}
		on:click|stopPropagation={toggleMenu}
		on:click={() => menuActive.set("profile")}
		on:click={() => $goto("/profile")}
		class="menu-link">Profil</button
	>
	<button
		class:menu-selected={$menuActive === "contacts"}
		on:click|stopPropagation={toggleMenu}
		on:click={() => menuActive.set("contacts")}
		on:click={() => $goto("/contacts/list")}
		class="menu-link">Kontakte</button
	>
	<button
		class:menu-selected={$menuActive === "dogs"}
		on:click|stopPropagation={toggleMenu}
		on:click={() => menuActive.set("dogs")}
		on:click={() => $goto("/dogs")}
		class="menu-link">Hunde</button
	>
	<button
		class:menu-selected={$menuActive === "appointments"}
		on:click|stopPropagation={toggleMenu}
		on:click={() => menuActive.set("appointments")}
		on:click={() => $goto("/appointments")}
		class="menu-link">Termine</button
	>
</div>
<div on:click|stopPropagation={toggleMenu} style="border-top-left-radius:{radius}px; border-top-right-radius:{radius}px" class="wrapper-bottombar">
	<!-- ----------------------------------------- -->
	<!-- // CONTEXT: APPOINTMENT (viewing an appointment that you can EDIT or DELETE) -->
	<!-- ----------------------------------------- -->
	{#if $menuStatus.context === "appointment"}
		<div class="wrapper-context-icons">
			<button in:fade class="icon" on:click|stopPropagation={deleteAppointment}>
				<svg width="32" height="38" viewBox="0 0 32 38" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path
						d="M19.1429 30.2449H20.8571C21.0845 30.2449 21.3025 30.153 21.4632 29.9894C21.624 29.8257 21.7143 29.6038 21.7143 29.3725V13.6684C21.7143 13.437 21.624 13.2151 21.4632 13.0515C21.3025 12.8878 21.0845 12.7959 20.8571 12.7959H19.1429C18.9155 12.7959 18.6975 12.8878 18.5368 13.0515C18.376 13.2151 18.2857 13.437 18.2857 13.6684V29.3725C18.2857 29.6038 18.376 29.8257 18.5368 29.9894C18.6975 30.153 18.9155 30.2449 19.1429 30.2449ZM30.8571 5.81633H24.9707L22.5421 1.69401C22.2374 1.17709 21.8062 0.749355 21.2907 0.452479C20.7752 0.155603 20.193 -0.000286701 19.6007 3.95834e-07H12.3993C11.8072 -3.55355e-05 11.2253 0.155974 10.7101 0.452837C10.1949 0.749701 9.76394 1.1773 9.45929 1.69401L7.02929 5.81633H1.14286C0.839753 5.81633 0.549062 5.93889 0.334735 6.15704C0.120408 6.37519 0 6.67108 0 6.97959L0 8.14286C0 8.45138 0.120408 8.74726 0.334735 8.96541C0.549062 9.18357 0.839753 9.30612 1.14286 9.30612H2.28571V33.7347C2.28571 34.6602 2.64694 35.5479 3.28992 36.2024C3.9329 36.8568 4.80497 37.2245 5.71429 37.2245H26.2857C27.195 37.2245 28.0671 36.8568 28.7101 36.2024C29.3531 35.5479 29.7143 34.6602 29.7143 33.7347V9.30612H30.8571C31.1602 9.30612 31.4509 9.18357 31.6653 8.96541C31.8796 8.74726 32 8.45138 32 8.14286V6.97959C32 6.67108 31.8796 6.37519 31.6653 6.15704C31.4509 5.93889 31.1602 5.81633 30.8571 5.81633ZM12.2743 3.70137C12.3125 3.63665 12.3665 3.58314 12.4311 3.54605C12.4957 3.50897 12.5687 3.48958 12.6429 3.4898H19.3571C19.4312 3.48971 19.504 3.50915 19.5685 3.54623C19.6329 3.58331 19.6869 3.63676 19.725 3.70137L20.9721 5.81633H11.0279L12.2743 3.70137ZM26.2857 33.7347H5.71429V9.30612H26.2857V33.7347ZM11.1429 30.2449H12.8571C13.0845 30.2449 13.3025 30.153 13.4632 29.9894C13.624 29.8257 13.7143 29.6038 13.7143 29.3725V13.6684C13.7143 13.437 13.624 13.2151 13.4632 13.0515C13.3025 12.8878 13.0845 12.7959 12.8571 12.7959H11.1429C10.9155 12.7959 10.6975 12.8878 10.5368 13.0515C10.376 13.2151 10.2857 13.437 10.2857 13.6684V29.3725C10.2857 29.6038 10.376 29.8257 10.5368 29.9894C10.6975 30.153 10.9155 30.2449 11.1429 30.2449Z"
						fill="var(--bright)"
					/>
				</svg>
			</button>
			<button in:fade class="icon" on:click|stopPropagation={editAppointment}>
				<svg width="42" height="37" viewBox="0 0 42 37" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path
						d="M29.335 24.9262L31.6684 22.614C32.033 22.2527 32.6674 22.5056 32.6674 23.0259V33.5318C32.6674 35.4465 31.0996 37 29.1673 37H3.50008C1.56774 37 0 35.4465 0 33.5318V8.09798C0 6.18322 1.56774 4.62974 3.50008 4.62974H23.4432C23.9609 4.62974 24.2234 5.25113 23.8589 5.61964L21.5255 7.9318C21.4161 8.04018 21.2703 8.09798 21.1098 8.09798H3.50008V33.5318H29.1673V25.3308C29.1673 25.1791 29.2256 25.0346 29.335 24.9262ZM40.754 10.3451L21.6057 29.3193L15.0139 30.0418C13.1034 30.2514 11.4773 28.6545 11.6888 26.747L12.418 20.2152L31.5663 1.24098C33.2361 -0.41366 35.9341 -0.41366 37.5966 1.24098L40.7467 4.3624C42.4165 6.01704 42.4165 8.6977 40.754 10.3451V10.3451ZM33.5497 12.5778L29.3131 8.37978L15.7649 21.812L15.2326 26.5302L19.9942 26.0028L33.5497 12.5778ZM38.2748 6.81907L35.1247 3.69765C34.8258 3.40141 34.3372 3.40141 34.0455 3.69765L31.7924 5.93033L36.0289 10.1284L38.2821 7.89567C38.5738 7.5922 38.5738 7.11531 38.2748 6.81907V6.81907Z"
						fill="var(--bright)"
					/>
				</svg>
			</button>
		</div>
	{/if}
	<!-- ----------------------------------------- -->
	<!-- // CONTEXT: DAY (wihtout appointment where you can ADD a new appointment) -->
	<!-- ----------------------------------------- -->
	{#if $menuStatus.context === "day"}
		<div class="wrapper-context-icons">
			<button in:fade class="icon" on:click|stopPropagation={addAppointment}>
				<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path
						d="M25.1429 14.8571V17.1429C25.1429 17.6143 24.7571 18 24.2857 18H18V24.2857C18 24.7571 17.6143 25.1429 17.1429 25.1429H14.8571C14.3857 25.1429 14 24.7571 14 24.2857V18H7.71429C7.24286 18 6.85714 17.6143 6.85714 17.1429V14.8571C6.85714 14.3857 7.24286 14 7.71429 14H14V7.71429C14 7.24286 14.3857 6.85714 14.8571 6.85714H17.1429C17.6143 6.85714 18 7.24286 18 7.71429V14H24.2857C24.7571 14 25.1429 14.3857 25.1429 14.8571ZM32 3.42857V28.5714C32 30.4643 30.4643 32 28.5714 32H3.42857C1.53571 32 0 30.4643 0 28.5714V3.42857C0 1.53571 1.53571 0 3.42857 0H28.5714C30.4643 0 32 1.53571 32 3.42857ZM28.5714 28.1429V3.85714C28.5714 3.62143 28.3786 3.42857 28.1429 3.42857H3.85714C3.62143 3.42857 3.42857 3.62143 3.42857 3.85714V28.1429C3.42857 28.3786 3.62143 28.5714 3.85714 28.5714H28.1429C28.3786 28.5714 28.5714 28.3786 28.5714 28.1429Z"
						fill="var(--bright)"
					/>
				</svg>
			</button>
		</div>
	{/if}

	<!-- ----------------------------------------- -->
	<!-- // CONTEXT: ADD_DOG (adding a dog that you can SAVE or DISCARD) -->
	<!-- ----------------------------------------- -->
	{#if $menuStatus.context === "add_dog"}
		<div class="wrapper-context-icons">
			<button in:fade class="icon" on:click|stopPropagation={goBack}>
				<svg width="48" height="32" viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path
						fill-rule="evenodd"
						clip-rule="evenodd"
						d="M43.7595 0C45.5816 0 47.0588 1.45955 47.0588 3.26V28.74C47.0588 30.5405 45.5816 32 43.7595 32H16.565C15.7062 32 14.8812 31.6691 14.2654 31.0777L0.999748 18.3377C0.360609 17.7239 0 16.8807 0 16C0 15.1193 0.360609 14.2761 0.999748 13.6623L14.2654 0.922308C14.8812 0.330869 15.7062 0 16.565 0H43.7595ZM16.565 28.74L3.29936 16L16.565 3.26H43.7595V28.74H16.565Z"
						fill="var(--bright)"
					/>
					<path
						fill-rule="evenodd"
						clip-rule="evenodd"
						d="M38.3308 7.52946C39.0759 8.2354 39.0759 9.37993 38.3308 10.0859L23.1468 24.4706C22.4017 25.1765 21.1936 25.1765 20.4485 24.4705C19.7034 23.7646 19.7034 22.6201 20.4485 21.9142L35.6325 7.52943C36.3776 6.82351 37.5857 6.82353 38.3308 7.52946Z"
						fill="var(--bright)"
					/>
					<path
						fill-rule="evenodd"
						clip-rule="evenodd"
						d="M20.4485 7.52946C21.1936 6.82353 22.4017 6.82351 23.1468 7.52943L38.3308 21.9141C39.0759 22.6201 39.0759 23.7646 38.3308 24.4705C37.5857 25.1765 36.3776 25.1765 35.6325 24.4706L20.4485 10.0858C19.7034 9.37993 19.7034 8.2354 20.4485 7.52946Z"
						fill="var(--bright)"
					/>
				</svg>
			</button>
			<button in:fade class="icon" on:click|stopPropagation={saveDog}>
				<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path
						d="M30.9958 6.99579L25.0042 1.00421C24.3612 0.361231 23.4892 4.75483e-06 22.5799 0H3.42857C1.535 0 0 1.535 0 3.42857V28.5714C0 30.465 1.535 32 3.42857 32H28.5714C30.465 32 32 30.465 32 28.5714V9.42014C32 8.51083 31.6388 7.63876 30.9958 6.99579V6.99579ZM19.4286 3.42857V9.14286H10.2857V3.42857H19.4286ZM28.1429 28.5714H3.85714C3.74348 28.5714 3.63447 28.5263 3.5541 28.4459C3.47372 28.3655 3.42857 28.2565 3.42857 28.1429V3.85714C3.42857 3.74348 3.47372 3.63447 3.5541 3.5541C3.63447 3.47372 3.74348 3.42857 3.85714 3.42857H6.85714V10.8571C6.85714 11.8039 7.62464 12.5714 8.57143 12.5714H21.1429C22.0896 12.5714 22.8571 11.8039 22.8571 10.8571V3.70586L28.4459 9.29464C28.4857 9.33444 28.5173 9.3817 28.5388 9.4337C28.5604 9.4857 28.5714 9.54143 28.5714 9.59771V28.1429C28.5714 28.2565 28.5263 28.3655 28.4459 28.4459C28.3655 28.5263 28.2565 28.5714 28.1429 28.5714V28.5714ZM16 14.2857C12.5341 14.2857 9.71429 17.1055 9.71429 20.5714C9.71429 24.0374 12.5341 26.8571 16 26.8571C19.4659 26.8571 22.2857 24.0374 22.2857 20.5714C22.2857 17.1055 19.4659 14.2857 16 14.2857ZM16 23.4286C14.4246 23.4286 13.1429 22.1469 13.1429 20.5714C13.1429 18.996 14.4246 17.7143 16 17.7143C17.5754 17.7143 18.8571 18.996 18.8571 20.5714C18.8571 22.1469 17.5754 23.4286 16 23.4286Z"
						fill="var(--bright)"
					/>
				</svg>
			</button>
		</div>
	{/if}

	<!-- ----------------------------------------- -->
	<!-- // CONTEXT: NO_DOGS -->
	<!-- ----------------------------------------- -->

	{#if $menuStatus.context === "no_dogs"}
		<div class="wrapper-context-icons">
			<button in:fade class="icon" on:click|stopPropagation={addDog}>
				<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path
						d="M25.1429 14.8571V17.1429C25.1429 17.6143 24.7571 18 24.2857 18H18V24.2857C18 24.7571 17.6143 25.1429 17.1429 25.1429H14.8571C14.3857 25.1429 14 24.7571 14 24.2857V18H7.71429C7.24286 18 6.85714 17.6143 6.85714 17.1429V14.8571C6.85714 14.3857 7.24286 14 7.71429 14H14V7.71429C14 7.24286 14.3857 6.85714 14.8571 6.85714H17.1429C17.6143 6.85714 18 7.24286 18 7.71429V14H24.2857C24.7571 14 25.1429 14.3857 25.1429 14.8571ZM32 3.42857V28.5714C32 30.4643 30.4643 32 28.5714 32H3.42857C1.53571 32 0 30.4643 0 28.5714V3.42857C0 1.53571 1.53571 0 3.42857 0H28.5714C30.4643 0 32 1.53571 32 3.42857ZM28.5714 28.1429V3.85714C28.5714 3.62143 28.3786 3.42857 28.1429 3.42857H3.85714C3.62143 3.42857 3.42857 3.62143 3.42857 3.85714V28.1429C3.42857 28.3786 3.62143 28.5714 3.85714 28.5714H28.1429C28.3786 28.5714 28.5714 28.3786 28.5714 28.1429Z"
						fill="var(--bright)"
					/>
				</svg>
			</button>
		</div>
	{/if}

	<!-- ----------------------------------------- -->
	<!-- // CONTEXT: DOG (viewing a dog that you can EDIT or DELETE but also ADD a new one) -->
	<!-- ----------------------------------------- -->
	{#if $menuStatus.context === "dog"}
		<div class="wrapper-context-icons">
			<button in:fade class="icon" on:click|stopPropagation={deleteDog}>
				<svg width="32" height="38" viewBox="0 0 32 38" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path
						d="M19.1429 30.2449H20.8571C21.0845 30.2449 21.3025 30.153 21.4632 29.9894C21.624 29.8257 21.7143 29.6038 21.7143 29.3725V13.6684C21.7143 13.437 21.624 13.2151 21.4632 13.0515C21.3025 12.8878 21.0845 12.7959 20.8571 12.7959H19.1429C18.9155 12.7959 18.6975 12.8878 18.5368 13.0515C18.376 13.2151 18.2857 13.437 18.2857 13.6684V29.3725C18.2857 29.6038 18.376 29.8257 18.5368 29.9894C18.6975 30.153 18.9155 30.2449 19.1429 30.2449ZM30.8571 5.81633H24.9707L22.5421 1.69401C22.2374 1.17709 21.8062 0.749355 21.2907 0.452479C20.7752 0.155603 20.193 -0.000286701 19.6007 3.95834e-07H12.3993C11.8072 -3.55355e-05 11.2253 0.155974 10.7101 0.452837C10.1949 0.749701 9.76394 1.1773 9.45929 1.69401L7.02929 5.81633H1.14286C0.839753 5.81633 0.549062 5.93889 0.334735 6.15704C0.120408 6.37519 0 6.67108 0 6.97959L0 8.14286C0 8.45138 0.120408 8.74726 0.334735 8.96541C0.549062 9.18357 0.839753 9.30612 1.14286 9.30612H2.28571V33.7347C2.28571 34.6602 2.64694 35.5479 3.28992 36.2024C3.9329 36.8568 4.80497 37.2245 5.71429 37.2245H26.2857C27.195 37.2245 28.0671 36.8568 28.7101 36.2024C29.3531 35.5479 29.7143 34.6602 29.7143 33.7347V9.30612H30.8571C31.1602 9.30612 31.4509 9.18357 31.6653 8.96541C31.8796 8.74726 32 8.45138 32 8.14286V6.97959C32 6.67108 31.8796 6.37519 31.6653 6.15704C31.4509 5.93889 31.1602 5.81633 30.8571 5.81633ZM12.2743 3.70137C12.3125 3.63665 12.3665 3.58314 12.4311 3.54605C12.4957 3.50897 12.5687 3.48958 12.6429 3.4898H19.3571C19.4312 3.48971 19.504 3.50915 19.5685 3.54623C19.6329 3.58331 19.6869 3.63676 19.725 3.70137L20.9721 5.81633H11.0279L12.2743 3.70137ZM26.2857 33.7347H5.71429V9.30612H26.2857V33.7347ZM11.1429 30.2449H12.8571C13.0845 30.2449 13.3025 30.153 13.4632 29.9894C13.624 29.8257 13.7143 29.6038 13.7143 29.3725V13.6684C13.7143 13.437 13.624 13.2151 13.4632 13.0515C13.3025 12.8878 13.0845 12.7959 12.8571 12.7959H11.1429C10.9155 12.7959 10.6975 12.8878 10.5368 13.0515C10.376 13.2151 10.2857 13.437 10.2857 13.6684V29.3725C10.2857 29.6038 10.376 29.8257 10.5368 29.9894C10.6975 30.153 10.9155 30.2449 11.1429 30.2449Z"
						fill="var(--bright)"
					/>
				</svg>
			</button>
			<button in:fade class="icon" on:click|stopPropagation={editDog}>
				<svg width="42" height="37" viewBox="0 0 42 37" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path
						d="M29.335 24.9262L31.6684 22.614C32.033 22.2527 32.6674 22.5056 32.6674 23.0259V33.5318C32.6674 35.4465 31.0996 37 29.1673 37H3.50008C1.56774 37 0 35.4465 0 33.5318V8.09798C0 6.18322 1.56774 4.62974 3.50008 4.62974H23.4432C23.9609 4.62974 24.2234 5.25113 23.8589 5.61964L21.5255 7.9318C21.4161 8.04018 21.2703 8.09798 21.1098 8.09798H3.50008V33.5318H29.1673V25.3308C29.1673 25.1791 29.2256 25.0346 29.335 24.9262ZM40.754 10.3451L21.6057 29.3193L15.0139 30.0418C13.1034 30.2514 11.4773 28.6545 11.6888 26.747L12.418 20.2152L31.5663 1.24098C33.2361 -0.41366 35.9341 -0.41366 37.5966 1.24098L40.7467 4.3624C42.4165 6.01704 42.4165 8.6977 40.754 10.3451V10.3451ZM33.5497 12.5778L29.3131 8.37978L15.7649 21.812L15.2326 26.5302L19.9942 26.0028L33.5497 12.5778ZM38.2748 6.81907L35.1247 3.69765C34.8258 3.40141 34.3372 3.40141 34.0455 3.69765L31.7924 5.93033L36.0289 10.1284L38.2821 7.89567C38.5738 7.5922 38.5738 7.11531 38.2748 6.81907V6.81907Z"
						fill="var(--bright)"
					/>
				</svg>
			</button>
			<button in:fade class="icon" on:click|stopPropagation={addDog}>
				<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path
						d="M25.1429 14.8571V17.1429C25.1429 17.6143 24.7571 18 24.2857 18H18V24.2857C18 24.7571 17.6143 25.1429 17.1429 25.1429H14.8571C14.3857 25.1429 14 24.7571 14 24.2857V18H7.71429C7.24286 18 6.85714 17.6143 6.85714 17.1429V14.8571C6.85714 14.3857 7.24286 14 7.71429 14H14V7.71429C14 7.24286 14.3857 6.85714 14.8571 6.85714H17.1429C17.6143 6.85714 18 7.24286 18 7.71429V14H24.2857C24.7571 14 25.1429 14.3857 25.1429 14.8571ZM32 3.42857V28.5714C32 30.4643 30.4643 32 28.5714 32H3.42857C1.53571 32 0 30.4643 0 28.5714V3.42857C0 1.53571 1.53571 0 3.42857 0H28.5714C30.4643 0 32 1.53571 32 3.42857ZM28.5714 28.1429V3.85714C28.5714 3.62143 28.3786 3.42857 28.1429 3.42857H3.85714C3.62143 3.42857 3.42857 3.62143 3.42857 3.85714V28.1429C3.42857 28.3786 3.62143 28.5714 3.85714 28.5714H28.1429C28.3786 28.5714 28.5714 28.3786 28.5714 28.1429Z"
						fill="var(--bright)"
					/>
				</svg>
			</button>
		</div>
	{/if}

	<!-- ----------------------------------------- -->
	<!-- // CONTEXT: ADD_APPOINTMENT -->
	<!-- ----------------------------------------- -->
	{#if $menuStatus.context === "add_appointment"}
		<div class="wrapper-context-icons">
			<button in:fade class="icon" on:click|stopPropagation={goBack}>
				<svg width="48" height="32" viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path
						fill-rule="evenodd"
						clip-rule="evenodd"
						d="M43.7595 0C45.5816 0 47.0588 1.45955 47.0588 3.26V28.74C47.0588 30.5405 45.5816 32 43.7595 32H16.565C15.7062 32 14.8812 31.6691 14.2654 31.0777L0.999748 18.3377C0.360609 17.7239 0 16.8807 0 16C0 15.1193 0.360609 14.2761 0.999748 13.6623L14.2654 0.922308C14.8812 0.330869 15.7062 0 16.565 0H43.7595ZM16.565 28.74L3.29936 16L16.565 3.26H43.7595V28.74H16.565Z"
						fill="var(--bright)"
					/>
					<path
						fill-rule="evenodd"
						clip-rule="evenodd"
						d="M38.3308 7.52946C39.0759 8.2354 39.0759 9.37993 38.3308 10.0859L23.1468 24.4706C22.4017 25.1765 21.1936 25.1765 20.4485 24.4705C19.7034 23.7646 19.7034 22.6201 20.4485 21.9142L35.6325 7.52943C36.3776 6.82351 37.5857 6.82353 38.3308 7.52946Z"
						fill="var(--bright)"
					/>
					<path
						fill-rule="evenodd"
						clip-rule="evenodd"
						d="M20.4485 7.52946C21.1936 6.82353 22.4017 6.82351 23.1468 7.52943L38.3308 21.9141C39.0759 22.6201 39.0759 23.7646 38.3308 24.4705C37.5857 25.1765 36.3776 25.1765 35.6325 24.4706L20.4485 10.0858C19.7034 9.37993 19.7034 8.2354 20.4485 7.52946Z"
						fill="var(--bright)"
					/>
				</svg>
			</button>
			<button in:fade class="icon" on:click|stopPropagation={saveAppointment}>
				<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path
						d="M30.9958 6.99579L25.0042 1.00421C24.3612 0.361231 23.4892 4.75483e-06 22.5799 0H3.42857C1.535 0 0 1.535 0 3.42857V28.5714C0 30.465 1.535 32 3.42857 32H28.5714C30.465 32 32 30.465 32 28.5714V9.42014C32 8.51083 31.6388 7.63876 30.9958 6.99579V6.99579ZM19.4286 3.42857V9.14286H10.2857V3.42857H19.4286ZM28.1429 28.5714H3.85714C3.74348 28.5714 3.63447 28.5263 3.5541 28.4459C3.47372 28.3655 3.42857 28.2565 3.42857 28.1429V3.85714C3.42857 3.74348 3.47372 3.63447 3.5541 3.5541C3.63447 3.47372 3.74348 3.42857 3.85714 3.42857H6.85714V10.8571C6.85714 11.8039 7.62464 12.5714 8.57143 12.5714H21.1429C22.0896 12.5714 22.8571 11.8039 22.8571 10.8571V3.70586L28.4459 9.29464C28.4857 9.33444 28.5173 9.3817 28.5388 9.4337C28.5604 9.4857 28.5714 9.54143 28.5714 9.59771V28.1429C28.5714 28.2565 28.5263 28.3655 28.4459 28.4459C28.3655 28.5263 28.2565 28.5714 28.1429 28.5714V28.5714ZM16 14.2857C12.5341 14.2857 9.71429 17.1055 9.71429 20.5714C9.71429 24.0374 12.5341 26.8571 16 26.8571C19.4659 26.8571 22.2857 24.0374 22.2857 20.5714C22.2857 17.1055 19.4659 14.2857 16 14.2857ZM16 23.4286C14.4246 23.4286 13.1429 22.1469 13.1429 20.5714C13.1429 18.996 14.4246 17.7143 16 17.7143C17.5754 17.7143 18.8571 18.996 18.8571 20.5714C18.8571 22.1469 17.5754 23.4286 16 23.4286Z"
						fill="var(--bright)"
					/>
				</svg>
			</button>
		</div>
	{/if}

	<!-- ----------------------------------------- -->
	<!-- // HAMBURGER ICON (always rendered) -->
	<!-- ----------------------------------------- -->
	<div />
	<div class="wrapper-hamburger-icon">
		<button in:fade class="icon" on:click|stopPropagation={toggleMenu}>
			<svg width="32" height="30" viewBox="0 0 32 30" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path
					fill-rule="evenodd"
					clip-rule="evenodd"
					d="M0 2.12885C0 0.953119 0.765028 0 1.70874 0H30.2913C31.235 0 32 0.953119 32 2.12885C32 3.30458 31.235 4.2577 30.2913 4.2577H1.70874C0.765028 4.2577 0 3.30458 0 2.12885Z"
					fill="var(--bright)"
				/>
				<path
					fill-rule="evenodd"
					clip-rule="evenodd"
					d="M0 27.6751C0 26.4994 0.765028 25.5463 1.70874 25.5463H30.2913C31.235 25.5463 32 26.4994 32 27.6751C32 28.8508 31.235 29.804 30.2913 29.804H1.70874C0.765028 29.804 0 28.8508 0 27.6751Z"
					fill="var(--bright)"
				/>
				<path
					fill-rule="evenodd"
					clip-rule="evenodd"
					d="M0 14.9019C0 13.7262 0.765028 12.7731 1.70874 12.7731H30.2913C31.235 12.7731 32 13.7262 32 14.9019C32 16.0777 31.235 17.0308 30.2913 17.0308H1.70874C0.765028 17.0308 0 16.0777 0 14.9019Z"
					fill="var(--bright)"
				/>
			</svg>
		</button>
	</div>
</div>

<style>
	.test {
		border: 1px solid red;
	}

	.wrapper-bottombar {
		position: fixed;
		padding: 0rem 1.5rem;
		bottom: 0;
		left: 0;
		width: 100%;
		/* right: 5%;
		left: 5%; */
		width: 100%;
		margin-left: 0;
		height: var(--bottombar-height);
		background-color: var(--light);
		display: flex;
		align-items: center;
		justify-content: space-between;
		transition: 0.3s;
		/* border: 5px solid var(--bg-color); */
		/* border-bottom: 6px solid var(--bg-color); */
		/* border-left: 5px solid white;
		border-right: 5px solid white; */

		/* border-top: 5px solid var(--dark); */
	}

	button.menu-link {
		text-decoration: none;
		font-weight: 800;
		color: var(--bright);
		height: 4rem;
		font-size: 2.4rem;
		display: flex;
		align-items: center;
		font-family: "Nunito";
		letter-spacing: normal;
		/* margin-bottom: 3.6rem; */
	}

	button.menu-link:hover {
		color: var(--dark);
	}

	button.menu-selected {
		color: var(--dark) !important;
	}

	.wrapper-menu {
		padding: 1rem 2.4rem;
		position: fixed;
		height: 0;
		bottom: calc(var(--bottombar-height) + 0.2rem);
		background: var(--light);
		display: flex;
		/* right: 5%; */
		left: 0;
		width: 100%;
		transition: 0.3s;
		flex-direction: column;
		align-items: flex-end;
		justify-content: center;
		z-index: 3;
		border-top-left-radius: 15px;
		border-top-right-radius: 15px;
		/* border: 5px solid white; */
		border-bottom: 1px solid var(--bright);
		/* border-left: 5px solid var(--bg-color);
		border-right: 5px solid var(--bg-color);
		border-top: 5px solid var(--bg-color); */
	}

	.wrapper-context-icons {
		display: flex;
		align-items: flex-end;
	}

	svg:hover path {
		fill: var(--dark);
	}

	svg.x:hover path {
		fill: var(--dark);
		stroke: var(--dark);
	}

	button {
		background: none;
		border: none;
		cursor: pointer;
	}

	button.x {
		width: 48px;
		height: 48px;
	}

	button.x {
		margin-right: -1rem;
		/* margin-top: 2.4rem; */
	}

	button.icon {
		margin-right: 2rem;
	}
</style>

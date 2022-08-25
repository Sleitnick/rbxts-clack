import { GuiService, UserInputService } from "@rbxts/services";

export namespace Clack {
	/**
	 * Represents the various preferred input types.
	 */
	export enum InputType {
		/**
		 * Represents a preference for mouse and keyboard.
		 */
		MouseKeyboard,

		/**
		 * Represents a preference for touch.
		 */
		Touch,

		/**
		 * Represents a preference for gamepad.
		 */
		Gamepad,
	}
}

type ObserverFn = (inputType: Clack.InputType) => void;

let currentPreferredInputType: Clack.InputType;
const observers = new Array<ObserverFn>();

/**
 * Get the currently-preferred input type. This simply represents the
 * last input the user made. Users may change their preferred input type
 * during gameplay, and it is important to respond to those changes.
 *
 * To observe ongoing changes to the preferred input, use `observePreferredInput`.
 * @returns Currently preferred input type
 */
export function getPreferredInput(): Clack.InputType {
	return currentPreferredInputType;
}

/**
 * Observes the currently-preferred input type. The user's preferred input
 * type is determined by the user's last input. For instance, if the last
 * input was a mouse or keyboard, then `Clack.InputType.MouseKeyboard` would
 * be the preferred input type.
 *
 * This can be useful for dynamically changing UI prompts and other game elements
 * to represent the proper control schema for the user.
 *
 * ```ts
 * observePreferredInput((preferred) => print(preferred));
 * ```
 *
 * A common pattern is to have a switch statement on the preferred input type:
 * ```ts
 * observePreferredInput((preferred) => {
 * 	switch (preferred) {
 * 		case Clack.InputType.MouseKeyboard:
 * 			break;
 * 		case Clack.InputType.Touch:
 * 			break;
 * 		case Clack.InputType.Gamepad:
 * 			break;
 * 	}
 * });
 * ```
 *
 * @param observer Callback function to receive the preferred input type
 * @returns Unsubscriber function, which can be called to stop observing
 */
export function observePreferredInput(observer: ObserverFn): () => void {
	observers.push(observer);
	task.spawn(observer, currentPreferredInputType);
	return () => {
		const index = observers.indexOf(observer);
		if (index !== -1) {
			observers.unorderedRemove(index);
		}
	};
}

function setPreferred(preferred: Clack.InputType) {
	if (preferred === currentPreferredInputType) return;
	currentPreferredInputType = preferred;
	observers.forEach((observer) => task.spawn(observer, preferred));
}

function determineInitialPreferred() {
	// Try to determine preferred input from other sources.
	if (GuiService.IsTenFootInterface()) {
		// Prefer gamepad if running on console.
		setPreferred(Clack.InputType.Gamepad);
	} else {
		// Determine preferred from currently-enabled devices.
		if (UserInputService.KeyboardEnabled && UserInputService.MouseEnabled) {
			setPreferred(Clack.InputType.MouseKeyboard);
		} else if (UserInputService.TouchEnabled) {
			setPreferred(Clack.InputType.Touch);
		} else if (UserInputService.GamepadEnabled) {
			setPreferred(Clack.InputType.Gamepad);
		} else {
			// Failed to determine input device; default to MouseKeyboard.
			setPreferred(Clack.InputType.MouseKeyboard);
		}
	}
}

function determinePreferred(inputType: Enum.UserInputType) {
	// Determine preferred input from last-used input type.
	if (inputType === Enum.UserInputType.Touch) {
		setPreferred(Clack.InputType.Touch);
	} else if (inputType === Enum.UserInputType.Keyboard || inputType.Name.sub(1, 5) === "Mouse") {
		setPreferred(Clack.InputType.MouseKeyboard);
	} else if (inputType.Name.sub(1, 7) === "Gamepad") {
		setPreferred(Clack.InputType.Gamepad);
	} else if (currentPreferredInputType === undefined) {
		determineInitialPreferred();
	}
}

determinePreferred(UserInputService.GetLastInputType());
UserInputService.LastInputTypeChanged.Connect(determinePreferred);

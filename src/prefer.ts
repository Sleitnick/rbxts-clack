import { UserInputService } from "@rbxts/services";

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
 * @param observer Callback function to receive the preferred input type
 * @returns Unsubscriber function, which can be called to stop observing
 *
 * ```ts
 * observePreferredInput((preferred) => print(preferred));
 * ```
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

function determinePreferred(inputType: Enum.UserInputType) {
	if (inputType === Enum.UserInputType.Touch) {
		setPreferred(Clack.InputType.Touch);
	} else if (inputType === Enum.UserInputType.Keyboard || inputType.Name.sub(0, 4) === "Mouse") {
		setPreferred(Clack.InputType.MouseKeyboard);
	} else if (inputType.Name.sub(0, 6) === "Gamepad") {
		setPreferred(Clack.InputType.Gamepad);
	}
}

determinePreferred(UserInputService.GetLastInputType());
UserInputService.LastInputTypeChanged.Connect(determinePreferred);

import { GuiService, UserInputService } from "@rbxts/services";
import { Trove } from "@rbxts/trove";
import { Clack } from "./types";

type ObserverFn = (inputType: Clack.InputType) => void;

/**
 * Represents the preferred input of the local player.
 */
export class Prefer {
	private readonly trove = new Trove();

	private currentPreferredInputType: Clack.InputType | undefined;
	private observers = new Array<ObserverFn>();

	constructor() {
		this.listenForInputChanges();
	}

	/**
	 * Returns the currently-preferred input type. This simply represents the
	 * last input the user made. Users may change their preferred input type
	 * during gameplay, and it is important to respond to those changes.
	 *
	 * To observe ongoing changes to the preferred input, use `observePreferredInput()`.
	 * @returns Currently preferred input type
	 */
	public getPreferredInput(): Clack.InputType {
		return this.currentPreferredInputType!;
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
	 * prefer.observePreferredInput((preferred) => print(preferred));
	 * ```
	 *
	 * A common pattern is to have a switch statement on the preferred input type:
	 * ```ts
	 * prefer.observePreferredInput((preferred) => {
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
	 * @returns Unsubscribe function, which can be called to stop observing
	 */
	public observePreferredInput(observer: ObserverFn): () => void {
		this.observers.push(observer);
		task.spawn(observer, this.currentPreferredInputType!);
		return () => {
			const index = this.observers.indexOf(observer);
			if (index !== -1) {
				this.observers.unorderedRemove(index);
			}
		};
	}

	private listenForInputChanges() {
		const setPreferred = (preferred: Clack.InputType) => {
			if (preferred === this.currentPreferredInputType) return;
			this.currentPreferredInputType = preferred;
			this.observers.forEach((observer) => task.spawn(observer, preferred));
		};

		const determineInitialPreferred = () => {
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
		};

		const determinePreferred = (inputType: Enum.UserInputType) => {
			// Determine preferred input from last-used input type.
			if (inputType === Enum.UserInputType.Touch) {
				setPreferred(Clack.InputType.Touch);
			} else if (inputType === Enum.UserInputType.Keyboard || inputType.Name.sub(1, 5) === "Mouse") {
				setPreferred(Clack.InputType.MouseKeyboard);
			} else if (inputType.Name.sub(1, 7) === "Gamepad") {
				setPreferred(Clack.InputType.Gamepad);
			} else if (this.currentPreferredInputType === undefined) {
				determineInitialPreferred();
			}
		};

		determinePreferred(UserInputService.GetLastInputType());
		this.trove.connect(UserInputService.LastInputTypeChanged, determinePreferred);
	}

	public destroy() {
		this.trove.destroy();
	}
}

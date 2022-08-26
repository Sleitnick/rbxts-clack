import { Signal } from "@rbxts/beacon";
import { UserInputService } from "@rbxts/services";
import { Trove } from "@rbxts/trove";

/**
 * Represents the user's keyboard.
 */
export class Keyboard {
	/**
	 * Fired when the user presses down on a key.
	 *
	 * ```ts
	 * keyboard.keyDown.connect((keyCode, processed) => print(keyCode));
	 * ```
	 */
	public keyDown = new Signal<[key: Enum.KeyCode, processed: boolean]>();

	/**
	 * Fired when the user releases a key.
	 *
	 * ```ts
	 * keyboard.keyUp.connect((keyCode, processed) => print(keyCode));
	 * ```
	 */
	public keyUp = new Signal<[key: Enum.KeyCode, processed: boolean]>();

	private trove = new Trove();

	private keysDown = new Set<Enum.KeyCode>();

	/**
	 * Constructs a new keyboard object.
	 */
	constructor() {
		this.trove.add(this.keyDown);
		this.trove.add(this.keyUp);
		this.trove.add(
			UserInputService.InputBegan.Connect((input, processed) => {
				if (input.UserInputType === Enum.UserInputType.Keyboard) {
					if (!processed) {
						this.keysDown.add(input.KeyCode);
					}
					this.keyDown.Fire(input.KeyCode, processed);
				}
			}),
		);
		this.trove.add(
			UserInputService.InputEnded.Connect((input, processed) => {
				if (input.UserInputType === Enum.UserInputType.Keyboard) {
					this.keysDown.delete(input.KeyCode);
					this.keyUp.Fire(input.KeyCode, processed);
				}
			}),
		);
	}

	/**
	 * Checks if a key is down. This will only return `true` for keys
	 * that were pressed and not processed.
	 * @param keyCode
	 * @returns `true` if the key is down.
	 *
	 * ```ts
	 * if (keyboard.isKeyDown(Enum.KeyCode.W)) print("W down");
	 * ```
	 */
	public isKeyDown(keyCode: Enum.KeyCode): boolean {
		return this.keysDown.has(keyCode);
	}

	/**
	 * The same as `isKeyDown()`, except will also work for key presses
	 * that were processed.
	 * @param keyCode
	 * @returns `true` if the key is down.
	 */
	public isKeyDownAllowProcessed(keyCode: Enum.KeyCode): boolean {
		return UserInputService.IsKeyDown(keyCode);
	}

	/**
	 * Checks if both keys are down.
	 * @param keyCodePrimary
	 * @param keyCodeSecondary
	 * @returns `true` if both are down
	 *
	 * ```ts
	 * if (keyboard.isKeyComboDown(Enum.KeyCode.LeftControl, Enum.KeyCode.R)) print("CTRL+R");
	 * ```
	 */
	public isKeyComboDown(keyCodePrimary: Enum.KeyCode, keyCodeSecondary: Enum.KeyCode): boolean {
		return this.isKeyDown(keyCodePrimary) && this.isKeyDown(keyCodeSecondary);
	}

	/**
	 * The same as `isKeyComboDown()`, except will also work for key presses
	 * that were processed.
	 * @param keyCodePrimary
	 * @param keyCodeSecondary
	 * @returns `true` if both are down
	 */
	public isKeyComboDownAllowProcessed(keyCodePrimary: Enum.KeyCode, keyCodeSecondary: Enum.KeyCode): boolean {
		return this.isKeyDownAllowProcessed(keyCodePrimary) && this.isKeyDownAllowProcessed(keyCodeSecondary);
	}

	/**
	 * Checks if at least one of the keys is down.
	 * @param keyCode1
	 * @param keyCode2
	 * @returns `true` if one of the keys is down
	 *
	 * ```ts
	 * const forward = keyboard.isEitherKeyDown(Enum.KeyCode.W, Enum.KeyCode.Up);
	 * ```
	 */
	public isEitherKeyDown(keyCode1: Enum.KeyCode, keyCode2: Enum.KeyCode): boolean {
		return this.isKeyDown(keyCode1) || this.isKeyDown(keyCode2);
	}

	/**
	 * The same as `isEitherKeyDown()`, except will also work for key presses
	 * that were processed.
	 * @param keyCode1
	 * @param keyCode2
	 * @returns `true` if one of the keys is down
	 */
	public isEitherKeyDownAllowProcessed(keyCode1: Enum.KeyCode, keyCode2: Enum.KeyCode): boolean {
		return this.isKeyDownAllowProcessed(keyCode1) || this.isKeyDownAllowProcessed(keyCode2);
	}

	/**
	 * Cleans up the keyboard. Disconnects all events.
	 */
	public destroy() {
		this.trove.destroy();
	}
}

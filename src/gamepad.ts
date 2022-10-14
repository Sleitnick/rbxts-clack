import { Signal } from "@rbxts/beacon";
import { GuiService, HapticService, UserInputService } from "@rbxts/services";
import { Trove } from "@rbxts/trove";

function getActiveGamepad(): Clack.GamepadType | undefined {
	let activeGamepad: Enum.UserInputType | undefined = undefined;
	const navGamepads = UserInputService.GetNavigationGamepads();
	if (navGamepads.size() > 1) {
		navGamepads.forEach((navGamepad) => {
			if (activeGamepad === undefined || navGamepad.Value < activeGamepad.Value) {
				activeGamepad = navGamepad;
			}
		});
	} else {
		UserInputService.GetConnectedGamepads().forEach((connectedGamepad) => {
			if (activeGamepad === undefined || connectedGamepad.Value < activeGamepad.Value) {
				activeGamepad = connectedGamepad;
			}
		});
	}
	if (activeGamepad && !UserInputService.GetGamepadConnected(activeGamepad)) {
		activeGamepad = undefined;
	}
	return activeGamepad;
}

export namespace Clack {
	/**
	 * Represents all `Enum.KeyCode` gamepad buttons.
	 */
	export type GamepadButton =
		| Enum.KeyCode.ButtonA
		| Enum.KeyCode.ButtonB
		| Enum.KeyCode.ButtonY
		| Enum.KeyCode.ButtonX
		| Enum.KeyCode.ButtonL1
		| Enum.KeyCode.ButtonL2
		| Enum.KeyCode.ButtonL3
		| Enum.KeyCode.ButtonR1
		| Enum.KeyCode.ButtonR2
		| Enum.KeyCode.ButtonR3
		| Enum.KeyCode.ButtonSelect
		| Enum.KeyCode.ButtonStart;

	/**
	 * Represents all `Enum.UserInputType` gamepads.
	 */
	export type GamepadType =
		| Enum.UserInputType.Gamepad1
		| Enum.UserInputType.Gamepad2
		| Enum.UserInputType.Gamepad3
		| Enum.UserInputType.Gamepad4
		| Enum.UserInputType.Gamepad5
		| Enum.UserInputType.Gamepad6
		| Enum.UserInputType.Gamepad7
		| Enum.UserInputType.Gamepad8;

	/**
	 * Represents all `Enum.KeyCode` thumbsticks.
	 */
	export type GamepadThumbstick = Enum.KeyCode.Thumbstick1 | Enum.KeyCode.Thumbstick2;

	/**
	 * Represents all `Enum.KeyCode` triggers.
	 */
	export type GamepadTrigger = Enum.KeyCode.ButtonL2 | Enum.KeyCode.ButtonR2;

	/**
	 * Remaps `value` to get rid of any deadzone on the low-end.
	 * @param value Input value
	 * @param threshold Low threshold
	 * @returns Remapped value
	 */
	export function applyDeadzone(value: number, threshold: number): number {
		const absValue = math.abs(value);
		if (absValue < threshold) {
			return 0;
		}
		return ((absValue - threshold) / (1 - threshold)) * math.sign(value);
	}
}

/**
 * Represents a single Gamepad, which can be either dynamically tied to the currently-active
 * gamepad, or forced to a specific gamepad.
 */
export class Gamepad {
	/**
	 * Fired when the user presses down on a gamepad button.
	 */
	public buttonDown = new Signal<[button: Clack.GamepadButton, processed: boolean]>();

	/**
	 * Fired when a user releases a gamepad button.
	 */
	public buttonUp = new Signal<[button: Clack.GamepadButton, processed: boolean]>();

	/**
	 * Fired when the gamepad is connected.
	 *
	 * If gamepad is in dynamic mode (i.e. a gamepad was _not_ explicitly
	 * set in the constructor), then this may fire if the currently-active
	 * gamepad changes.
	 */
	public connected = new Signal<void>();

	/**
	 * Fired when the gamepad is disconnected.
	 *
	 * If gamepad is in dynamic mode (i.e. a gamepad was _not_ explicitly
	 * set in the constructor), then this may fire if the currently-active
	 * gamepad changes.
	 */
	public disconnected = new Signal<void>();

	/**
	 * Fired when the gamepad changes.
	 *
	 * This will only occur when gamepad is in dynamic mode (i.e. a gamepad was
	 * _not_ explicitly set in the constructor).
	 */
	public gamepadChanged = new Signal<[gamepad: Clack.GamepadType | undefined]>();

	/**
	 * The default deadzone used. Values for thumbsticks and triggers will be
	 * remapped to a range of `[0, 1]` from the range `[deadzone, 1]`.
	 */
	public defaultDeadzone = 0.05;

	/**
	 * The current input state of the gamepad.
	 *
	 * ```ts
	 * const leftThumbstick = gamepad.state.get(Enum.KeyCode.Thumbstick1);
	 * print(leftThumbstick.Position);
	 * ```
	 */
	public state = new Map<Enum.KeyCode, InputObject>();

	private trove = new Trove();
	private gamepadTrove = new Trove();
	private setMotorIds = new Map<Enum.VibrationMotor, number>();
	private gamepad: Clack.GamepadType | undefined;

	/**
	 * Create a new wrapper around a gamepad controller.
	 * @param gamepadOverride If set, the gamepad will be locked to this gamepad input. Otherwise,
	 * stays dynamic to the currently-active gamepad.
	 */
	constructor(gamepadOverride?: Clack.GamepadType) {
		this.trove.add(this.gamepadTrove);
		this.setupGamepad(gamepadOverride);
		this.setupMotors();
	}

	private setupActiveGamepad(gamepad?: Clack.GamepadType) {
		const lastGamepad = this.gamepad;
		if (gamepad === lastGamepad) return;
		this.gamepadTrove.clean();
		this.state.clear();
		this.gamepad = gamepad;
		if (!gamepad) {
			this.disconnected.Fire();
			this.gamepadChanged.Fire(undefined);
			return;
		}
		UserInputService.GetGamepadState(gamepad).forEach((input) => {
			this.state.set(input.KeyCode, input);
		});
		this.gamepadTrove.add(() => this.stopMotors());
		this.gamepadTrove.add(
			UserInputService.InputBegan.Connect((input, processed) => {
				if (input.UserInputType === gamepad) {
					this.buttonDown.Fire(input.KeyCode as Clack.GamepadButton, processed);
				}
			}),
		);
		this.gamepadTrove.add(
			UserInputService.InputEnded.Connect((input, processed) => {
				if (input.UserInputType === gamepad) {
					this.buttonUp.Fire(input.KeyCode as Clack.GamepadButton, processed);
				}
			}),
		);
		if (lastGamepad === undefined) {
			this.connected.Fire();
		}
		this.gamepadChanged.Fire(gamepad);
	}

	private setupGamepad(gamepadOverride?: Clack.GamepadType) {
		if (gamepadOverride) {
			// Forced gamepad
			this.trove.add(
				UserInputService.GamepadConnected.Connect((gp) => {
					if (gp === gamepadOverride) {
						this.setupActiveGamepad(gamepadOverride);
					}
				}),
			);
			this.trove.add(
				UserInputService.GamepadDisconnected.Connect((gp) => {
					if (gp === gamepadOverride) {
						this.setupActiveGamepad(undefined);
					}
				}),
			);
			if (UserInputService.GetGamepadConnected(gamepadOverride)) {
				this.setupActiveGamepad(gamepadOverride);
			}
		} else {
			// Dynamic gamepad
			const checkToSetupActive = () => {
				const active = getActiveGamepad();
				if (active !== this.gamepad) {
					this.setupActiveGamepad(active);
				}
			};
			this.trove.add(UserInputService.GamepadConnected.Connect(checkToSetupActive));
			this.trove.add(UserInputService.GamepadDisconnected.Connect(checkToSetupActive));
			this.setupActiveGamepad(getActiveGamepad());
		}
	}

	private setupMotors() {
		Enum.VibrationMotor.GetEnumItems().forEach((motor) => this.setMotorIds.set(motor, 0));
	}

	/**
	 * Check if vibration is supported for the currently-represented gamepad.
	 * @returns `true` if vibration is supported for the current gamepad
	 */
	public isVibrationSupported(): boolean {
		return this.gamepad ? HapticService.IsVibrationSupported(this.gamepad) : false;
	}

	/**
	 * Get the position of the given thumbstick.
	 * @param thumbstick
	 * @param deadzoneThreshold Optional deadzone threshold; defaults to `this.defaultDeadzone`
	 * @returns Thumbstick position
	 */
	public getThumbstick(thumbstick: Clack.GamepadThumbstick, deadzoneThreshold?: number): Vector2 {
		const pos = this.state.get(thumbstick)?.Position ?? Vector3.zero;
		const deadzone = deadzoneThreshold ?? this.defaultDeadzone;
		return new Vector2(Clack.applyDeadzone(pos.X, deadzone), Clack.applyDeadzone(pos.Y, deadzone));
	}

	/**
	 * Get the position of the given trigger.
	 * @param trigger
	 * @param deadzoneThreshold Optional deadzone threshold; defaults to `this.defaultDeadzone`
	 * @returns Trigger position
	 */
	public getTrigger(trigger: Clack.GamepadTrigger, deadzoneThreshold?: number): number {
		return Clack.applyDeadzone(
			this.state.get(trigger)?.Position?.Z ?? 0,
			deadzoneThreshold ?? this.defaultDeadzone,
		);
	}

	/**
	 * Checks if the given gamepad button is down
	 * @param button
	 * @returns `true` if the button is down
	 */
	public isButtonDown(button: Clack.GamepadButton): boolean {
		if (!this.gamepad) return false;
		return UserInputService.IsGamepadButtonDown(this.gamepad, button);
	}

	/**
	 * Checks if the given motor is supported for this gamepad.
	 * @param motor
	 * @returns `true` if the motor is supported
	 */
	public isMotorSupported(motor: Enum.VibrationMotor): boolean {
		if (!this.gamepad) return false;
		return HapticService.IsMotorSupported(this.gamepad, motor);
	}

	/**
	 * Sets the intensity of the motor.
	 * @param motor
	 * @param intensity In the range of `[0, 1]`
	 */
	public setMotor(motor: Enum.VibrationMotor, intensity: number) {
		if (!this.gamepad) return -1;
		this.setMotorIds.set(motor, this.setMotorIds.get(motor) ?? 0 + 1);
		HapticService.SetMotor(this.gamepad, motor, math.clamp(intensity, 0, 1));
	}

	/**
	 * Turns on the given motor for `duration` seconds.
	 * @param motor
	 * @param intensity In the range of `[0, 1]`
	 * @param duration Duration of the pulse in seconds
	 */
	public pulseMotor(motor: Enum.VibrationMotor, intensity: number, duration: number) {
		const id = this.setMotor(motor, intensity);
		const thread = task.delay(duration, () => {
			if (this.setMotorIds.get(motor) !== id) return;
			this.stopMotor(motor);
		});
		this.gamepadTrove.add(thread);
	}

	/**
	 * Stops the given motor (alias for `gamepad.setMotor(0)`).
	 * @param motor
	 */
	public stopMotor(motor: Enum.VibrationMotor) {
		this.setMotor(motor, 0);
	}

	/**
	 * Stops all of the motors.
	 *
	 * This method is also automatically called when the gamepad
	 * is destroyed.
	 */
	public stopMotors() {
		Enum.VibrationMotor.GetEnumItems().forEach((motor) => {
			if (this.isMotorSupported(motor)) {
				this.stopMotor(motor);
			}
		});
	}

	/**
	 * Check if the currently-represented gamepad is connected.
	 * @returns `true` if connected.
	 */
	public isConnected(): boolean {
		return this.gamepad ? UserInputService.GetGamepadConnected(this.gamepad) : false;
	}

	/**
	 * Get the currently-represented gamepad `Enum.UserInputType`.
	 * @returns Gamepad `Enum.UserInputType` (e.g. `Enum.UserInputType.Gamepad1`)
	 */
	public getGamepadType(): Clack.GamepadType | undefined {
		return this.gamepad;
	}

	/**
	 * Sets `GuiService.AutoSelectGuiEnabled` to `enabled`.
	 * @param enabled
	 */
	public setAutoSelectGui(enabled: boolean) {
		GuiService.AutoSelectGuiEnabled = enabled;
	}

	/**
	 * Returns the value of `GuiService.AutoSelectGuiEnabled`
	 * @returns `GuiService.AutoSelectGuiEnabled`
	 */
	public isAutoSelectGuiEnabled(): boolean {
		return GuiService.AutoSelectGuiEnabled;
	}

	/**
	 * Clean up the gamepad. Disconnect all events and turn
	 * off all motors.
	 */
	public destroy() {
		this.trove.destroy();
	}
}

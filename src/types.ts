export namespace Clack {
	export type TouchTapEvent = [touchPositions: Vector2[], processed: boolean];
	export type TouchTapInWorldEvent = [position: Vector2, processed: boolean];
	export type TouchEvent = [touch: InputObject, processed: boolean];
	export type TouchLongPressEvent = [touchPositions: InputObject[], state: Enum.UserInputState, processed: boolean];
	export type TouchPanEvent = [
		touchPositions: InputObject[],
		totalTranslation: Vector2,
		velocity: Vector2,
		state: Enum.UserInputState,
		processed: boolean,
	];
	export type TouchPinchEvent = [
		touchPositions: InputObject[],
		scale: number,
		velocity: number,
		state: Enum.UserInputState,
		processed: boolean,
	];
	export type TouchRotateEvent = [
		touchPositions: InputObject[],
		rotation: number,
		velocity: number,
		state: Enum.UserInputState,
		processed: boolean,
	];
	export type TouchSwipeEvent = [swipeDirection: Enum.SwipeDirection, numberOfTouches: number, processed: boolean];

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
	 * Represents `Enum.UserInputType` mouse buttons.
	 */
	export type MouseButton = Enum.UserInputType.MouseButton1 | Enum.UserInputType.MouseButton2;

	/** Enum representing the user's preferred input type. */
	export const enum InputType {
		/** User prefers mouse & keyboard input. */
		MouseKeyboard = "MouseKeyboard",

		/** User prefers touch input. */
		Touch = "Touch",

		/** User prefers gamepad input. */
		Gamepad = "Gamepad",
	}
}

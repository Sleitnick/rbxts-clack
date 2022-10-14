import { Signal } from "@rbxts/beacon";
import { UserInputService } from "@rbxts/services";
import { Trove } from "@rbxts/trove";

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
}

/**
 * Represents touch input.
 */
export class Touch {
	private trove = new Trove();

	private touchTap?: Signal<Clack.TouchTapEvent>;
	private touchTapInWorld?: Signal<Clack.TouchTapInWorldEvent>;
	private touchMoved?: Signal<Clack.TouchEvent>;
	private touchLongPress?: Signal<Clack.TouchLongPressEvent>;
	private touchPan?: Signal<Clack.TouchPanEvent>;
	private touchPinch?: Signal<Clack.TouchPinchEvent>;
	private touchRotate?: Signal<Clack.TouchRotateEvent>;
	private touchSwipe?: Signal<Clack.TouchSwipeEvent>;
	private touchStarted?: Signal<Clack.TouchEvent>;
	private touchEnded?: Signal<Clack.TouchEvent>;

	/**
	 * Gets a signal that is fired when the `UserInputService.TouchTap` signal is fired.
	 * @returns Signal
	 */
	public getTouchTapSignal(): Signal<Clack.TouchTapEvent> {
		let s = this.touchTap;
		if (!s) {
			s = this.touchTap = this.trove.add(new Signal());
			this.trove.add(
				UserInputService.TouchTap.Connect((touchPositions, processed) => {
					s?.Fire(touchPositions, processed);
				}),
			);
		}
		return s;
	}

	/**
	 * Gets a signal that is fired when the `UserInputService.TouchTapInWorld` signal is fired.
	 * @returns Signal
	 */
	public getTouchTapInWorldSignal(): Signal<Clack.TouchTapInWorldEvent> {
		let s = this.touchTapInWorld;
		if (!s) {
			s = this.touchTapInWorld = this.trove.add(new Signal());
			this.trove.add(
				UserInputService.TouchTapInWorld.Connect((position, processed) => {
					s?.Fire(position, processed);
				}),
			);
		}
		return s;
	}

	/**
	 * Gets a signal that is fired when the `UserInputService.TouchMoved` signal is fired.
	 * @returns Signal
	 */
	public getTouchMovedSignal(): Signal<Clack.TouchEvent> {
		let s = this.touchMoved;
		if (!s) {
			s = this.touchMoved = this.trove.add(new Signal());
			this.trove.add(
				UserInputService.TouchMoved.Connect((touch, processed) => {
					s?.Fire(touch, processed);
				}),
			);
		}
		return s;
	}

	/**
	 * Gets a signal that is fired when the `UserInputService.TouchLongPress` signal is fired.
	 * @returns Signal
	 */
	public getTouchLongPressSignal(): Signal<Clack.TouchLongPressEvent> {
		let s = this.touchLongPress;
		if (!s) {
			s = this.touchLongPress = this.trove.add(new Signal());
			this.trove.add(
				UserInputService.TouchLongPress.Connect((touchPositions, state, processed) => {
					s?.Fire(touchPositions, state, processed);
				}),
			);
		}
		return s;
	}

	/**
	 * Gets a signal that is fired when the `UserInputService.TouchPan` signal is fired.
	 * @returns Signal
	 */
	public getTouchPanSignal(): Signal<Clack.TouchPanEvent> {
		let s = this.touchPan;
		if (!s) {
			s = this.touchPan = this.trove.add(new Signal());
			this.trove.add(
				UserInputService.TouchPan.Connect((touchPositions, totalTranslation, velocity, state, processed) => {
					s?.Fire(touchPositions, totalTranslation, velocity, state, processed);
				}),
			);
		}
		return s;
	}

	/**
	 * Gets a signal that is fired when the `UserInputService.TouchPinch` signal is fired.
	 * @returns Signal
	 */
	public getTouchPinchSignal(): Signal<Clack.TouchPinchEvent> {
		let s = this.touchPinch;
		if (!s) {
			s = this.touchPinch = this.trove.add(new Signal());
			this.trove.add(
				UserInputService.TouchPinch.Connect((touchPositions, scale, velocity, state, processed) => {
					s?.Fire(touchPositions, scale, velocity, state, processed);
				}),
			);
		}
		return s;
	}

	/**
	 * Gets a signal that is fired when the `UserInputService.TouchRotate` signal is fired.
	 * @returns Signal
	 */
	public getTouchRotateSignal(): Signal<Clack.TouchRotateEvent> {
		let s = this.touchRotate;
		if (!s) {
			s = this.touchRotate = this.trove.add(new Signal());
			this.trove.add(
				UserInputService.TouchRotate.Connect((touchPositions, rotation, velocity, state, processed) => {
					s?.Fire(touchPositions, rotation, velocity, state, processed);
				}),
			);
		}
		return s;
	}

	/**
	 * Gets a signal that is fired when the `UserInputService.TouchSwipe` signal is fired.
	 * @returns Signal
	 */
	public getTouchSwipeSignal(): Signal<Clack.TouchSwipeEvent> {
		let s = this.touchSwipe;
		if (!s) {
			s = this.touchSwipe = this.trove.add(new Signal());
			this.trove.add(
				UserInputService.TouchSwipe.Connect((swipeDirection, numberOfTouches, processed) => {
					s?.Fire(swipeDirection, numberOfTouches, processed);
				}),
			);
		}
		return s;
	}

	/**
	 * Gets a signal that is fired when the `UserInputService.TouchStarted` signal is fired.
	 * @returns Signal
	 */
	public getTouchStartedSignal(): Signal<Clack.TouchEvent> {
		let s = this.touchStarted;
		if (!s) {
			s = this.touchStarted = this.trove.add(new Signal());
			this.trove.add(
				UserInputService.TouchStarted.Connect((touch, processed) => {
					s?.Fire(touch, processed);
				}),
			);
		}
		return s;
	}

	/**
	 * Gets a signal that is fired when the `UserInputService.TouchEnded` signal is fired.
	 * @returns Signal
	 */
	public getTouchEndedSignal(): Signal<Clack.TouchEvent> {
		let s = this.touchEnded;
		if (!s) {
			s = this.touchEnded = this.trove.add(new Signal());
			this.trove.add(
				UserInputService.TouchEnded.Connect((touch, processed) => {
					s?.Fire(touch, processed);
				}),
			);
		}
		return s;
	}

	/**
	 * Returns the value of `UserInputService.TouchEnabled`.
	 * @returns `UserInputService.TouchEnabled`
	 */
	public isTouchEnabled(): boolean {
		return UserInputService.TouchEnabled;
	}

	/**
	 * Destroys the touch object. Disconnects all events.
	 */
	public destroy() {
		this.trove.destroy();
	}
}

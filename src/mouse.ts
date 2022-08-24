import { Signal } from "@rbxts/beacon";
import { UserInputService, Workspace } from "@rbxts/services";
import { Trove } from "@rbxts/trove";

namespace Clack {
	/**
	 * Represents `Enum.UserInputType` mouse buttons.
	 */
	export type MouseButton = Enum.UserInputType.MouseButton1 | Enum.UserInputType.MouseButton2;
}

type ButtonSignal = [position: Vector3];

const RAY_DISTANCE = 1000;

/**
 * Represents the user's mouse.
 */
export class Mouse {
	private trove: Trove = new Trove();

	private mouseDownSignals = new Map<Clack.MouseButton, Signal<ButtonSignal>>();
	private mouseUpSignals = new Map<Clack.MouseButton, Signal<ButtonSignal>>();
	private scrollSignal?: Signal<number>;

	/**
	 * Constructs a new mouse object.
	 */
	constructor() {
		this.trove.add(
			UserInputService.InputBegan.Connect((input, processed) => {
				if (processed) return;
				if (
					input.UserInputType === Enum.UserInputType.MouseButton1 ||
					input.UserInputType === Enum.UserInputType.MouseButton2
				) {
					const signal = this.mouseDownSignals.get(input.UserInputType);
					if (signal) {
						signal.Fire(input.Position);
					}
				}
			}),
		);
		this.trove.add(
			UserInputService.InputEnded.Connect((input, processed) => {
				if (processed) return;
				if (
					input.UserInputType === Enum.UserInputType.MouseButton1 ||
					input.UserInputType === Enum.UserInputType.MouseButton2
				) {
					const signal = this.mouseUpSignals.get(input.UserInputType);
					if (signal) {
						signal.Fire(input.Position);
					}
				}
			}),
		);
	}

	/**
	 * Retrieves a signal that will be fired when `button` is pressed down.
	 *
	 * ```ts
	 * mouse.getButtonDownSignal(Enum.UserInputType.MouseButton1).connect((position) => {
	 * 	print(`Left button down at ${position}`);
	 * });
	 * ```
	 *
	 * @param button
	 * @returns `Signal<ButtonSignal>`
	 */
	public getButtonDownSignal(button: Clack.MouseButton): Signal<ButtonSignal> {
		let signal = this.mouseDownSignals.get(button);
		if (!signal) {
			signal = new Signal<ButtonSignal>();
			this.trove.add(signal);
			this.mouseDownSignals.set(button, signal);
		}
		return signal;
	}

	/**
	 * Retrieves a signal that will be fired when `button` is released.
	 *
	 * ```ts
	 * mouse.getButtonUpSignal(Enum.UserInputType.MouseButton1).connect((position) => {
	 * 	print(`Left button up at ${position}`);
	 * });
	 * ```
	 *
	 * @param button
	 * @returns `Signal<ButtonSignal>`
	 */
	public getButtonUpSignal(button: Clack.MouseButton): Signal<ButtonSignal> {
		let signal = this.mouseUpSignals.get(button);
		if (!signal) {
			signal = new Signal<ButtonSignal>();
			this.trove.add(signal);
			this.mouseUpSignals.set(button, signal);
		}
		return signal;
	}

	/**
	 * Checks if the given button is currently being pressed down.
	 *
	 * ```ts
	 * if (mouse.isButtonDown(Enum.UserInputType.MouseButton1)) {
	 * 	print("Left mouse button down");
	 * }
	 * ```
	 *
	 * @param button
	 * @returns `true` if being pressed down
	 */
	public isButtonDown(button: Clack.MouseButton): boolean {
		return UserInputService.IsMouseButtonPressed(button);
	}

	/**
	 * Retrieves a signal that will be fired when the mouse wheel is moved.
	 *
	 * ```ts
	 * mouse.getScrollSignal().connect((scrollAmount) => {
	 * 	print(`Scrolled: ${scrollAmount}`);
	 * });
	 * ```
	 *
	 * @returns `Signal<number>`
	 */
	public getScrollSignal(): Signal<number> {
		if (!this.scrollSignal) {
			const signal = this.trove.add(new Signal<number>());
			this.scrollSignal = signal;
			this.trove.add(
				UserInputService.InputChanged.Connect((input, processed) => {
					if (processed) return;
					if (input.UserInputType === Enum.UserInputType.MouseWheel) {
						signal.Fire(input.Position.Z);
					}
				}),
			);
		}
		return this.scrollSignal;
	}

	/**
	 * Gets the current position of the mouse on the screen.
	 * @returns Mouse position
	 */
	public getPosition(): Vector2 {
		return UserInputService.GetMouseLocation();
	}

	/**
	 * Gets the current delta movement of the mouse for the given
	 * frame while the mouse is locked. This _only_ works when the
	 * mouse is locked.
	 * @returns Delta mouse position.
	 */
	public getDelta(): Vector2 {
		return UserInputService.GetMouseDelta();
	}

	/**
	 * Get a `Ray` representing a ray from the mouse's position into 3D space.
	 * @param overridePosition Optional position to use instead of the mouse's position
	 * @param overrideCamera Optional camera to use instead of `Workspace.CurrentCamera`
	 * @returns Mouse ray
	 */
	public getRay(overridePosition?: Vector2, overrideCamera?: Camera): Ray {
		const mousePos = overridePosition ?? UserInputService.GetMouseLocation();
		const viewportMouseRay =
			(overrideCamera ?? Workspace.CurrentCamera)?.ViewportPointToRay(mousePos.X, mousePos.Y) ?? new Ray();
		return viewportMouseRay;
	}

	/**
	 * Cast a ray into 3D space.
	 * @param raycastParams Raycast parameters
	 * @param distance The distance in studs to cast the ray (defaults to `1000`)
	 * @param overridePosition Optional position to use instead of the mouse's position
	 * @param overrideCamera Optional camera to use instead of `Workspace.CurrentCamera`
	 * @param worldModel Optional world model to use instead of Workspace
	 * @returns Raycast result, if any
	 */
	public raycast(
		raycastParams: RaycastParams,
		distance: number = RAY_DISTANCE,
		overridePosition?: Vector2,
		overrideCamera?: Camera,
		worldModel?: WorldModel,
	): RaycastResult | undefined {
		const ray = this.getRay(overridePosition, overrideCamera);
		return (worldModel ?? Workspace).Raycast(ray.Origin, ray.Direction.mul(distance), raycastParams);
	}

	/**
	 * Projects outward from the mouse by `distance` and returns the Vector3 world space position. This
	 * is much cheaper than raycasting and should be used if obstructions don't matter.
	 * @param distance The distance in studs to project (defaults to `1000`)
	 * @param overridePosition Optional position to use instead of the mouse's position
	 * @param overrideCamera Optional camera to use instead of `Workspace.CurrentCamera`
	 * @returns World position
	 */
	public project(distance: number = RAY_DISTANCE, overridePosition?: Vector2, overrideCamera?: Camera): Vector3 {
		const ray = this.getRay(overridePosition, overrideCamera);
		return ray.Origin.add(ray.Direction.Unit.mul(distance));
	}

	/**
	 * Locks the mouse in its current position.
	 *
	 * **NOTE:** `mouse.unlock()` must be explicitly called to unlock the
	 * mouse. Destroying the mouse will not unlock it.
	 */
	public lock() {
		UserInputService.MouseBehavior = Enum.MouseBehavior.LockCurrentPosition;
	}

	/**
	 * Locks the mouse at the center of the screen.
	 *
	 * **NOTE:** `mouse.unlock()` must be explicitly called to unlock the
	 * mouse. Destroying the mouse will not unlock it.
	 */
	public lockCenter() {
		UserInputService.MouseBehavior = Enum.MouseBehavior.LockCenter;
	}

	/**
	 * Unlocks the mouse. If the mouse is locked via `mouse.lock()` or
	 * `mouse.lockCenter()`, then this method must be called to unlock
	 * it. Destroying the mouse will _not_ call this method.
	 */
	public unlock() {
		UserInputService.MouseBehavior = Enum.MouseBehavior.Default;
	}

	/**
	 * Calls `mouse.unlock()` and `mouse.destroy()`.
	 */
	public unlockAndDestroy() {
		this.unlock();
		this.destroy();
	}

	/**
	 * Destroys the mouse object. Disconnects all events.
	 */
	public destroy() {
		this.trove.destroy();
	}
}

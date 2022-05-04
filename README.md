# Clack

User input helper classes.

## Examples

Below are examples of the input classes. The examples are not an exhaustive list of the APIs available.

### Preferred Input

The preferred input is based on the last input the user has made. Because players can change their desired input during gameplay, it is helpful to watch for these changes in order to help direct the player in the best way possible.

For instance, if there are UI elements that show the player the control schema for the game, using `observePreferredInput` can be used to dynamically change this display if the user switches between using a gamepad and using a mouse/keyboard.

```ts
print(`Preferred: ${tostring(getPreferredInput())}`);

observePreferredInput((preferred) => {
	print(`Preferred: ${tostring(preferred)}`);
	if (preferred === Clack.InputType.MouseKeyboard) {
		print("Prefer mouse and keyboard");
	} else if (preferred === Clack.InputType.Touch) {
		print("Prefer touch");
	} else if (preferred === Clack.InputType.Gamepad) {
		print("Prefer gamepad");
	}
});
```

### Mouse

Watch for mouse input.

```ts
const mouse = new Mouse();

mouse.getButtonDownSignal(Enum.UserInputType.MouseButton1).connect(() => {
	print("Left button down");
});

print(mouse.getPosition());

const result = mouse.raycast(new RaycastParams());
```

### Keyboard

Watch for keyboard input.

```ts
const keyboard = new Keyboard();

keyboard.keyDown.connect((keyCode) => {
	print(`Key down: ${tostring(keyCode)}`);
});

keyboard.keyUp.connect((keyCode) => {
	print(`Key up: ${tostring(keyCode)}`);
});

print("W down", keyboard.isKeyDown(Enum.KeyCode.W));

print("CTRL+S", keyboard.isKeyComboDown(Enum.KeyCode.LeftControl, Enum.KeyCode.S));

print("Forward", keyboard.isEitherKeyDown(Enum.KeyCode.W, Enum.KeyCode.Up));
```

### Gamepad

Watch for gamepad input.

```ts
const gamepad = new Gamepad();

gamepad.buttonDown.connect((button) => {
	print(`Button down: ${tostring(button)}`);
});

gamepad.setMotor(Enum.VibrationMotor.Large, 1);
gamepad.stopMotor(Enum.VibrationMotor.Large);
gamepad.pulseMotor(Enum.VibrationMotor.Large, 1, 0.2);

const leftThumbstickPos = gamepad.getThumbstick(Enum.KeyCode.Thumbstick1);
print(`Left thumbstick position: ${tostring(leftThumbstickPos)}`);
```

### Touch

Watch for touch input.

```ts
const touch = new Touch();

touch.getTouchTapSignal().connect((touchPositions, processed) => {
	print("Touched");
});
```

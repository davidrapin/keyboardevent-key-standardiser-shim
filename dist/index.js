'use strict';

export const KEYMAP = {
  'Up': 'ArrowUp', // IE, Edge, Firefox 36
  'Down': 'ArrowDown',
  'Left': 'ArrowLeft',
  'Right': 'ArrowRight',
  'Del': 'Delete', // IE (9?), Firefox 36
  'Crsel': 'CrSel', // IE (9?), Firefox 36
  'Exsel': 'ExSel', // IE (9?), Firefox 36
  'Esc': 'Escape', // IE (9?), Firefox 36
  'Apps': 'ContextMenu', // IE (9?), Firefox 36
  'OS': 'Meta', // IE, Firefox          // Win key on windows, super & hyper on linux. 
  'Scroll': 'ScrollLock', // IE
  'Spacebar': ' ', // IE 11, Firefox 36
  'Nonconvert': 'NonConvert', // IE (9?), Firefox 36
  'Decimal': '.' || ',', // Depends on browser encoding afaik. Can we easily detect which one to use?
  'Separator': ',' || '.', // Presumably always opposite to 'Decimal'
  'Multiply': '*',
  'Add': '+',
  'Divide': '/',
  'Subtract': '-',
  'MediaNextTrack': 'MediaTrackNext', // IE (9?), Firefox 36
  'MediaPreviousTrack': 'MediaTrackPrevious', // IE (9?), Firefox 36
  'MediaFastForward': 'FastFwd', // Firefox 36?
  'Live': 'TV', // Firefox 36
  'Zoom': 'ZoomToggle', // IE (9?), Firefox 36
  'SelectMedia': 'LaunchMediaPlayer', // IE (9?), Firefox 36
  // Firefox 36+, not included by default since they are rarely used and will stop working if the shim restores native keys
  'MediaSelect': 'LaunchMediaPlayer', // Firefox 37-48
  'VolumeUp': 'AudioVolumeUp', // IE (9?), Firefox 48
  'VolumeDown': 'AudioVolumeDown', // IE (9?), Firefox 48
  'VolumeMute': 'AudioVolumeMute' // IE (9?), Firefox 48
};

// By verifying that we get known good keys we can restore the native event.key behaviour.
// XXX: Verify what values Edge gives for 'Delete' etc.
export const VERIFIED_KEYS = {
  'ArrowUp': true,
  'ArrowDown': true,
  'ArrowLeft': true,
  'ArrowRight': true
  // 'Delete': true,
  // 'Escape': true,
  // 'ContextMenu': true,
  // 'ScrollLock': true,
  // ' ': true,
  // 'NonConvert': true,
};

function shimKeys() {
  if (!window.KeyboardEvent) {
    return;
  }
  const proto = KeyboardEvent.prototype;
  const nativeDescriptor = Object.getOwnPropertyDescriptor(proto, 'key');

  // Basic check to make sure we are not overwriting a polyfill or ourselves.
  if (!nativeDescriptor || !/\{\s*\[native code\]\s*\}/.test('' + nativeDescriptor.get)) {
    return;
  }

  // Define our own event.key getters & setters
  delete proto.key;
  Object.defineProperty(proto, 'key', {
    configurable: true,
    enumerable: true,
    get() {
      const nativeKey = nativeDescriptor.get.call(this);

      // Unload the shim and restore native key getter if we already get correct keys
      if (VERIFIED_KEYS[nativeKey]) {
        console.info(`Event.key verified good by "${nativeKey}", restoring native key handling.`);
        delete proto.key;
        Object.defineProperty(proto, 'key', nativeDescriptor);
        return nativeKey;
      }

      // Cache the key so that we don't need to call the getter again.
      return this.key = KEYMAP[nativeKey] || nativeKey;
    },
    set(value) {
      Object.defineProperty(this, 'key', { value, enumerable: true, writable: false });
      return value;
    }
  });
}

shimKeys();
export function normalizeRequestPin(value) {
  const text = String(value ?? '').trim().toUpperCase();
  const pin = /^\d{6}$/.test(text) ? `PIN-${text}` : text;
  if (!/^PIN-\d{6}$/.test(pin)) throw new Error('Invalid request PIN');
  return pin;
}

// Handle the complete clipboard value before the input's maxLength truncates it.
export function pasteRequestPin(event, setDigits) {
  try {
    const pin = normalizeRequestPin(event.clipboardData.getData('text'));
    event.preventDefault();
    setDigits(pin.slice(4));
  } catch {
    // Keep ordinary input handling for partial/invalid pasted text.
  }
}

export async function copyRequestPin(value) {
  const pin = normalizeRequestPin(value);
  try {
    if (typeof navigator.clipboard?.writeText === 'function') {
      await navigator.clipboard.writeText(pin);
      return;
    }
  } catch {
    // Permissions and browser support vary; try the selected-text fallback.
  }

  const activeElement = document.activeElement;
  const selection = document.getSelection();
  const ranges = selection ? Array.from({ length: selection.rangeCount }, (_, i) => selection.getRangeAt(i).cloneRange()) : [];
  const inputSelection = activeElement && typeof activeElement.selectionStart === 'number'
    ? [activeElement.selectionStart, activeElement.selectionEnd, activeElement.selectionDirection] : null;
  const field = document.createElement('textarea');
  field.value = pin;
  field.readOnly = true;
  field.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;padding:0;border:0;opacity:0;font-size:16px;';
  try {
    document.body.appendChild(field);
    field.focus({ preventScroll: true });
    field.select();
    field.setSelectionRange(0, pin.length);
    if (document.execCommand('copy') !== true) throw new Error('PIN copy failed');
  } finally {
    field.remove();
    activeElement?.focus({ preventScroll: true });
    if (inputSelection) activeElement.setSelectionRange(...inputSelection);
    if (selection) {
      selection.removeAllRanges();
      ranges.forEach(range => selection.addRange(range));
    }
  }
}

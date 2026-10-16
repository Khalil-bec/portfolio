/**
 * Ruler readout + driver (ticket 102).
 *
 * Fixed right-edge overlay in the outer edge lane (width `--lane-ruler`):
 * 0–100 ticks, a blue progress fill, and a draggable thumb carrying the
 * page-depth `%` readout (`EN 42%` / `FR 42 %`). The thumb is a real slider
 * (focusable, arrows/Home/End/PageUp/PageDown, `aria-valuenow` = depth %);
 * the keys themselves are handled globally by the scroll driver
 * (src/motion/scroll-driver.js), so focus stays on the thumb while it moves.
 *
 * Dragging the thumb (pointer capture) jumps straight to the grabbed depth;
 * touch elsewhere scrolls natively while the ruler stays readout-only.
 * Digits and `%` are chrome, not copy (spec §Data); the slider name comes
 * from the `ruler.aria` dictionary key like any other string.
 */

let state = null;

/** Move the page to the depth grabbed on the track (instant — follows the pointer). */
function jumpToClientY(clientY) {
  const { track, driver } = state;
  const rect = track.getBoundingClientRect();
  if (rect.height <= 0) return;
  const ratio = Math.min(Math.max((clientY - rect.top) / rect.height, 0), 1);
  driver.scrollToY(ratio * driver.maxScroll(), { immediate: true });
}

function onPointerDown(event) {
  if (event.button !== undefined && event.button !== 0) return;
  event.preventDefault();
  state.thumb.setPointerCapture(event.pointerId);
  state.dragging = true;
  jumpToClientY(event.clientY);
}

function onPointerMove(event) {
  if (!state.dragging) return;
  jumpToClientY(event.clientY);
}

function endDrag() {
  state.dragging = false;
}

/**
 * Mount the ruler view against the driver. Renders nothing until the driver's
 * `frame()` calls `render()`; safe to call before the dictionaries bind (the
 * slider name fills via `data-i18n-attr` like the nav labels).
 */
export function initRuler(driver) {
  const ruler = document.querySelector("[data-ruler]");
  if (!ruler || !driver) return null;

  const track = ruler.querySelector("[data-ruler-track]");
  const progress = ruler.querySelector("[data-ruler-progress]");
  const thumb = ruler.querySelector("[data-ruler-thumb]");
  const readout = ruler.querySelector("[data-ruler-readout]");
  if (!track || !progress || !thumb || !readout) return null;

  state = { ruler, track, progress, thumb, readout, driver, dragging: false, lastText: "" };

  thumb.addEventListener("pointerdown", onPointerDown);
  thumb.addEventListener("pointermove", onPointerMove);
  thumb.addEventListener("pointerup", endDrag);
  thumb.addEventListener("pointercancel", endDrag);

  driver.setView({
    render(ratio, text) {
      const trackHeight = track.clientHeight;
      const thumbHeight = thumb.offsetHeight;
      const travel = Math.max(0, trackHeight - thumbHeight);
      progress.style.height = `${ratio * trackHeight}px`;
      thumb.style.top = `${ratio * travel}px`;
      if (text !== state.lastText) {
        state.lastText = text;
        readout.textContent = text;
        const percent = driver.percent();
        thumb.setAttribute("aria-valuenow", String(percent));
        thumb.setAttribute("aria-valuetext", text);
      }
    },
  });

  // Paint the initial position (top of page) even before the first frame.
  driver.frame();

  return state;
}

/** Re-render the readout (call after a language switch changes its format). */
export function refreshRuler() {
  if (!state) return;
  state.driver.frame();
}

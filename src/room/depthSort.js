/**
 * Sorts scene entities back-to-front for correct isometric occlusion: an
 * entity further "back" in the room draws behind one further "forward",
 * regardless of what order they were added in (insertion order for
 * placed items, or whatever order a caller happens to list entities in).
 *
 * `getDepth` maps an entity to a single comparable number -- the caller
 * decides what that number means (a grid index like row+col, a
 * screen-space Y coordinate, anything consistent across every entity
 * being sorted together). That's what keeps this usable for any kind of
 * positioned entity (placed items, the cat, anything added to the scene
 * later) instead of being hardcoded to furniture specifically.
 *
 * Array.prototype.sort is stable (guaranteed since ES2019), so entities
 * with equal depth keep their relative order rather than jittering.
 */
export function sortByDepth(entities, getDepth) {
  return [...entities].sort((a, b) => getDepth(a) - getDepth(b));
}

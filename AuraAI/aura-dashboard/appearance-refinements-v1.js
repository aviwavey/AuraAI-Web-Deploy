// Presentation-only additions to the pinned Visual release. No account or room
// state is read or changed; the light artwork and landing-message spacing match
// the public interface.
const lightRing = new URL('./accord-unity-clover-light-v1.svg', import.meta.url).href;
function refineRing(root) {
  const rings = root.matches?.('.rooms-unity') ? [root] : root.querySelectorAll?.('.rooms-unity') || [];
  for (const ring of rings) {
    const image = ring.querySelector('.rooms-unity__art--light');
    if (image && image.src !== lightRing) image.src = lightRing;
    const copy = ring.querySelector('.rooms-unity__content p');
    if (copy && !copy.dataset.auraThreeLines) {
      copy.dataset.auraThreeLines = 'true';
      copy.replaceChildren('Choose a conversation from the left', document.createElement('br'),
        'or create a new', document.createElement('br'), 'permissioned conversation.');
    }
  }
}
refineRing(document);
new MutationObserver(records => {
  for (const record of records) for (const node of record.addedNodes) {
    if (node.nodeType === Node.ELEMENT_NODE) refineRing(node);
  }
}).observe(document.querySelector('#app') || document.body, { childList: true, subtree: true });

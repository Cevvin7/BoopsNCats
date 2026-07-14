// ThaleahFat by Rick Hoppmann, licensed CC-BY 4.0 (see README.md for the
// required attribution). Loaded via the FontFace API rather than a static
// CSS @font-face url() -- a plain .css file's url() isn't rewritten for
// the GitHub Pages subpath the way import.meta.env.BASE_URL is, and every
// other public/ asset in this app already goes through BASE_URL for
// exactly that reason (see the matching comment in Room.jsx).
const THALEAHFAT_URL = `${import.meta.env.BASE_URL}fonts/ThaleahFat.ttf`;

const thaleahFat = new FontFace('ThaleahFat', `url(${THALEAHFAT_URL})`, { display: 'swap' });

thaleahFat
  .load()
  .then((loadedFace) => {
    document.fonts.add(loadedFace);
  })
  .catch((error) => {
    console.error('Failed to load ThaleahFat font:', error);
  });

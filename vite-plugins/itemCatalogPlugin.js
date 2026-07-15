import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const VIRTUAL_MODULE_ID = 'virtual:item-catalog';
const RESOLVED_VIRTUAL_MODULE_ID = `\0${VIRTUAL_MODULE_ID}`;

// Each item lives as its own folder under public/items/<id>/, holding one
// JSON descriptor (any filename -- the folder name is what's trusted as
// the id, not whatever the file happens to claim) plus its sprite image,
// if it has one yet. import.meta.glob can't see into public/ (Vite only
// analyzes the src/ module graph there, copying public/ verbatim instead
// of processing it), so a plain glob import can't do this discovery --
// this plugin does the equivalent by reading the folder at build/dev
// time and exposing the result as a virtual module. Adding a new item is
// then just "drop a folder in public/items/ with a JSON file (and a
// sprite, if it has real art) in it" -- no source file to remember to
// register it in.
export function itemCatalogPlugin() {
  let projectRoot = process.cwd();

  return {
    name: 'item-catalog',
    configResolved(config) {
      projectRoot = config.root;
    },
    resolveId(id) {
      if (id === VIRTUAL_MODULE_ID) return RESOLVED_VIRTUAL_MODULE_ID;
    },
    load(id) {
      if (id !== RESOLVED_VIRTUAL_MODULE_ID) return;

      const itemsDir = join(projectRoot, 'public', 'items');
      const entries = readdirSync(itemsDir, { withFileTypes: true }).filter((entry) => entry.isDirectory());

      const items = entries.map((entry) => {
        const folderPath = join(itemsDir, entry.name);

        const jsonFileName = readdirSync(folderPath).find((fileName) => fileName.endsWith('.json'));
        if (!jsonFileName) {
          throw new Error(`public/items/${entry.name}/ has no .json descriptor file.`);
        }

        const jsonPath = join(folderPath, jsonFileName);
        this.addWatchFile(jsonPath);
        const data = JSON.parse(readFileSync(jsonPath, 'utf-8'));

        return { ...data, id: entry.name }; // folder name wins over whatever the JSON's own "id" claims
      });

      return `export const DISCOVERED_ITEMS = ${JSON.stringify(items)};`;
    },
  };
}

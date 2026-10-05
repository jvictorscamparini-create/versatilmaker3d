import { rmSync } from 'node:fs';
for (const name of ['dist', 'build']) rmSync(new URL('../' + name, import.meta.url), {recursive:true,force:true});

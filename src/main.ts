import fs from 'fs';
import { promisify as _p } from 'util';
const writeFile = _p(fs.writeFile);
import path from 'path';
import readline from 'readline';

const package_info = {
    version: "0.0.1-alpha.1"
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const package_default = `export const Name = "{{name}}";

export const Version = "{{version}}";

import { Main } from "{{entry}}";

Main();
`;

function query(q: string): Promise<string> {
    return new Promise((resolve, reject) => {
        rl.question(q, (answer) => {
            resolve(answer);
        });
    });
}

(async () => {
    console.log(`Deno Initializer - v${package_info.version}`);
    if(process.argv.find(e=>e=="-h"||e=="--help")) {
        console.log(`--help
Deno Initializer creates an initial package.ts file that can be run by deno to easily start your deno application.

Arguments:
    -h, --help: Show this help info.
    -d, --default: Use all default values, skipping prompts.
`);
    } else {
        let name, version, entry;
        let dir = path.parse(process.cwd());
        if(process.argv.find(e=>e=="-d" || e=="--default")) {
            console.log("Using all defaults.");
            name = dir.name;
            version = "1.0.0";
            entry = "./main.ts";
        } else {
            name = await query(`Package Name (${dir.name}): `);
            if(name == "") name = dir.name;
            version = await query("Package Version (1.0.0): ");
            if(version == "") version = "1.0.0";
            entry = await query("Entry Point (./main.ts): ");
            if(entry == "") entry = "./main.ts";
            entry = path.resolve(entry);
            if(!path.isAbsolute(entry)) entry = `./${entry}`;
        }
        await writeFile(path.join(process.cwd(), 'package.ts'), package_default.replace('{{name}}', name).replace('{{version}}', version).replace('{{entry}}', entry));
        console.log("Bye!");
    }
    process.exit(0);
})();
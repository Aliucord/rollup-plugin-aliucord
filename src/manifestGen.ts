import { readFile, writeFile } from "fs/promises";
import { Plugin } from "rollup";

function readJson(file: string) {
    return readFile(file, "utf-8").then(JSON.parse).catch(_ => ({}));
}

async function makePluginManifest(manifestPath: string, baseManifestPath: string) {
    const baseManifest = await readJson(baseManifestPath);

    const pluginManifest = await readJson(manifestPath);
    if (!pluginManifest.version)
        throw new Error("No version specified. Please specify one and try again");

    const manifest = Object.assign({}, baseManifest, pluginManifest);
    manifest.name ||= process.env.plugin;
    manifest.description ||= "No description provided.";

    if (!manifest.license) {
        throw new Error("No license specified. Please specify one in the base or plugin manifest and try again.");
    }

    if (!manifest.authors?.length) {
        if (manifest.author) {
            manifest.authors = [manifest.author];
            delete manifest.author;
        } else {
            throw new Error("manifest.authors must be specified.");
        }
    }

    for (const field of ["name", "version", "description", "license"]) {
        if (typeof manifest[field] !== "string")
            throw `manifest.${field} must be a string, not a ${typeof manifest[field]}`;
    }

    for (const author of manifest.authors) {
        if (typeof author.name !== "string" || typeof author.id !== "string")
            throw new Error("Malformed manifest.authors. Must be an array of Objects containing name and id of type string");
    }

    return manifest;
}

export function makeManifest(options: { baseManifest: string, manifest: string }): Plugin {
    return {
        name: "ManifestGenerator",
        async generateBundle() {
            const manifest = await makePluginManifest(options.manifest, options.baseManifest);
            this.emitFile({
                type: "asset",
                fileName: `${process.env.plugin}-manifest.json`,
                source: JSON.stringify(manifest)
            })
        }
    };
}
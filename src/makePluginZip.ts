import { createWriteStream } from "fs";
import { Plugin } from "rollup";
import { ZipFile } from "yazl";

export function makePluginZip({ zipPath }: { zipPath: string; }): Plugin {
    return {
        name: "MakePluginZip",

        writeBundle(options, bundle) {
            const outFile = options.file!.split("/");
            if (!outFile) return;
            const file = outFile.pop()!;
            const path = outFile.join("/");

            if (!process.env.manifestPath) throw new Error("makeManifest must be above this task");

            const zip = new ZipFile();
            zip.addFile(options.file!, `index.js.bundle`);
            zip.addFile(process.env.manifestPath, `manifest.json`);

            zip.outputStream.pipe(createWriteStream(zipPath));
            zip.end();
        }
    };
};
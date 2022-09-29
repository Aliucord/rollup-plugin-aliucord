import { OutputBundle, OutputOptions, Plugin } from "rollup";
import { ZipFile } from "yazl";

export function makePluginZip(): Plugin {
    return {
        name: "MakePluginZip",

        async generateBundle(options: OutputOptions, bundle: OutputBundle) {
            // Parse output filename
            const file = options.file?.split("/")!.pop()!;

            // Load manifest output
            const manifestFile = bundle[`${process.env.plugin}-manifest.json`]
            if (!manifestFile) throw new Error("makeManifest must be above this task");
            if (manifestFile.type !== "asset") throw new Error("Manifest file type was not asset");

            // Load hermes output
            const bundleFile = bundle[`${file}.bundle`]
            if (!bundleFile) throw new Error("Hermes bundle output unable to be found");
            if (bundleFile.type !== "asset") throw new Error("Bundle file type was not asset");

            const zip = new ZipFile();

            zip.addBuffer(Buffer.from(bundleFile.source), "index.js.bundle", {
                mtime: new Date(0),
                compress: false
            })
            zip.addBuffer(Buffer.from(manifestFile.source), "manifest.json", {
                mtime: new Date(0),
                compress: false
            })

            zip.end();

            // Read outputStream into a buffer
            const chunks: Buffer[] = [];
            for await (const chunk of zip.outputStream) {
                chunks.push(
                    typeof chunk === "string"
                        ? Buffer.from(chunk)
                        : chunk
                );
            }
            const zipBuffer = Buffer.concat(chunks)

            this.emitFile({
                type: "asset",
                fileName: `${process.env.plugin}.zip`,
                source: zipBuffer
            })
        }
    };
};
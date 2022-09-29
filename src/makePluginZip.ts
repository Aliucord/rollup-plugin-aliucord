import { OutputBundle, OutputOptions, Plugin } from "rollup";
import { ZipFile } from "yazl";

function readStream(stream: NodeJS.ReadableStream) {
    const chunks: Buffer[] = [];
    return new Promise<Buffer>((resolve, reject) => {
        stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
        stream.on('error', (err) => reject(err));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
    })
}

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
            const zipData = readStream(zip.outputStream);

            zip.addBuffer(Buffer.from(bundleFile.source), "index.js.bundle")
            zip.addBuffer(Buffer.from(manifestFile.source), "manifest.json")

            zip.end();

            this.emitFile({
                type: "asset",
                fileName: `${process.env.plugin}.zip`,
                source: await zipData // By this point the promise will be done, so just await it
            })
        }
    };
};
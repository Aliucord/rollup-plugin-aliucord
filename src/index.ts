import { spawn } from "child_process";
import { Plugin } from "rollup";
import swc from "rollup-plugin-swc";
import { hermes } from "rollup-plugin-hermes";

function autoDeploy(): Plugin {
    return {
        name: "AutoDeploy",
        writeBundle(options, bundle) {
            const process = spawn("adb", ["push", options.file!! + ".bundle", "/sdcard/AliucordRN/plugins/"], {
                cwd: __dirname
            });

            process.on("close", (code) => {
                if (code === 0) {
                    console.log("Deployed");
                } else {
                    console.error("Failed to deploy");
                }
            });
        }
    };
}
export function aliucordPlugin(pluginOptions?: { hermesPath: string; autoDeploy: boolean }): Plugin {
    return {
        name: "AliucordPlugin",
        footer: "window.aliu.api.PluginManager._register(__ACP);delete window.__ACP",

        options(options) {
            options.external = /^(aliucord(\/.+)?|react(-native)?)$/;

            options.plugins ??= [];
            options.plugins.push(
                swc({
                    jsc: {
                        target: "es5",
                        minify: {
                            compress: true
                        }
                    }
                })
            );
            options.plugins.push(hermes(pluginOptions));
            if (pluginOptions?.autoDeploy) options.plugins.push(autoDeploy());

            return options;
        },

        outputOptions(options) {
            options.name = "__ACP";
            options.format = "iife";
            options.globals = (name: string) => {
                switch (name) {
                    case "aliucord":
                        return "window.aliu";
                    case "react":
                        return "window.aliu.metro.React";
                    case "react-native":
                        return "window.aliu.metro.ReactNative";
                }

                if (name.startsWith("aliucord")) return `window.aliu.${name.slice(9).replace("/", ".")}`;

                return name;
            };

            return options;
        }
    };
}

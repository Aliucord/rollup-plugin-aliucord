# rollup-plugin-aliucord

Rollup plugin used for compiling and deploying RN plugins

## Usage

```js
export default defineConfig({
    plugins: [
        aliucord(options)
    ]
});
```

Options (all optional):
| Name | Type | Description |
| ---- | ---- | ----------- |
| `hermesPath` | `string` | Path to a custom `hermesc` package |
| `autoDeploy` | `boolean \| "push-only"` | Automatically deploy build to your device with adb |
| `internalHelpers` | `boolean` | Enable SWC helpers |
| `minify` | `boolean` | Enable minifying before compiling to hbc |
| `packageName` | `string` | Package name of the app to auto-restart when deploying |

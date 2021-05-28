# Test extension

To test this polyfill, run these 2 commands in parallel:

```sh
npm run demo:watch
npx web-ext run --target=chromium
```

You should see the changes applied by both `static.*` and `dynamic.*` files, respectively files loaded via manifest and via the `.register` API.

Also open the background script console to see any errors.

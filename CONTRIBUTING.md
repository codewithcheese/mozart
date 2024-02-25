# Mozart Contributing Guide

### Develop locally

To develop locally, fork the Mozart repository and clone it in your local machine. The package manager used to install and link dependencies must be [pnpm](https://pnpm.io/).

Mozart extension was developed using Vite, React and [CRXJS Vite Plugin](https://crxjs.dev/vite-plugin). The combination supports automatic building and hot reloading.

To develop:

1. Run `pnpm i` in Mozart's root folder.
2. Run `pnpm run dev` to start Vite dev server. 
3. Go to `vivaldi:extensions` and enable developer mode
4. Click "Load unpacked", navigate to your Mozart directory and select the newly built `./dist` directory.

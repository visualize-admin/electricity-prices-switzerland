# ElCom Electricity Price Website

## Development Environment

To start the development environment, you need [Node.js](https://nodejs.org/en/) (v12 LTS recommended) and [Yarn](https://classic.yarnpkg.com/lang/en/) as package manager.

The usage of [Nix](https://nixos.org) to install system-level packages is recommended.

### Setting up the dev environment

Ensure that Node.js and Yarn are available in your environment

#### Install system-level dependencies

Either use the installers

- [Node.js installer](https://nodejs.org/en/)
- [Yarn installation](https://classic.yarnpkg.com/en/docs/install)

Or – if using Nix – entering a new Nix shell will install Node.js and Yarn automatically:

```sh
nix-shell
```
#### Run the application setup

Run the setup script:

```sh
yarn setup
```

This will install npm dependencies and run setup scripts.

### Dev server

Once the application's set up, you can start the development server with

```sh
yarn dev
```

> 👉 In [Visual Studio Code](https://code.visualstudio.com/), you also can run the **default build task** (CMD-SHIFT-B) to start the dev server, database server, and TypeScript checker (you'll need [Nix](https://nixos.org) for that to work).

## Versioning

New versions of `package.json` are built on CI into a separate image that will be deployed to the test environment.

```sh
yarn version
```

This will prompt for a new version. The `postversion` script will automatically try to push the created version tag to the origin repo.

## Deployment

Docker TBD

## Localization

New localizable strings can be extracted from the source code with

```sh
yarn locales:extract
```

This will update the translation files in `src/locales/*/messages.po`.

After updating the translation PO files, run

```sh
yarn locales:compile
```

To make the translations available to the application. _Note: this step will run automatically on `yarn build`._
# ElCom Electricity Price Website

## Configuration through Environment Variables

| Variable                 | Required | Example Value                                                               |
| ------------------------ | -------- | --------------------------------------------------------------------------- |
| `SPARQL_ENDPOINT`        | yes      | `https://lindas.admin.ch/query`                                             |
| `SPARQL_EDITOR`          | yes      | `https://lindas.admin.ch/sparql`                                            |
| `GITLAB_WIKI_TOKEN`      | yes      | `xyz`                                                                       |
| `GITLAB_WIKI_URL`        | yes      | `https://gitlab.ldbar.ch/api/v4/projects/9999/wikis`                        |
| `I18N_DOMAINS`           |          | `{"de": "www.elcom.local", "fr": "fr.elcom.local", "it": "it.elcom.local"}` |
| `BASIC_AUTH_CREDENTIALS` |          | `user:password`                                                             |
| `MATOMO_ID`              |          | `123`                                                                       |
| `CURRENT_PERIOD`         |          | `2022`                                                                      |
| `FIRST_PERIOD`           |          | `2009`                                                                      |

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

## Preparing geodata

Run

```sh
make geodata
```

Since Switzerland's municipalities can change each year, the yearly [Shapefiles from 2010 on prepared by BFS](https://www.bfs.admin.ch/bfs/de/home/dienstleistungen/geostat/geodaten-bundesstatistik/administrative-grenzen/generalisierte-gemeindegrenzen.html) will be downloaded and transformed into [TopoJSON](https://github.com/topojson/topojson) format which can be loaded efficiently client-side.

The detailed transformation steps are described in this project's `Makefile`.

## Http Proxy

On CloudFoundry, an HTTP proxy is used for external requests. This is for example used to fetch
the gitlab content.

For some of the server requests (SAML requests), we must _not_ use this proxy.

This is why the normal behavior of global-agent to
automatically use the proxy, has been deactivated
through the use of the env variable GLOBAL_AGENT_FORCE_GLOBAL_AGENT=false.

For external requests that should use the proxy,
we can use `https.globalAgent`. Then global-agent
uses the proxy.

```
const https = require('https')
const data = fetch(url, {
  agent: https.globalAgent
})
```

## EIAM certificates

EIAM certificates are used to authenticate against the GEVER API serving
the electricity provider documents.

They are stored in 1Password as "Elcom PWD certificates".

EIAM certificate content and password are passed as environment variable.
The certificate content is a p12 certificate encoded as base 64.

In dev, you have to edit env.local to add the `EIAM_CERTIFICATE_CONTENT` and `EIAM_CERTIFICATE_PASSWORD` variables.

```bash
# Get the base64 certificate content that can be put in EIAM_CERTIFICATE_CONTENT
cat ../../../vault/svc.spw-d.elcom.admin.ch.p12 | base64
```

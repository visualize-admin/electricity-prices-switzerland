# ElCom Electricity Price Website

An electricity price comparison website for Switzerland that provides interactive maps, charts, and time-series visualizations of electricity prices from Swiss providers. Built with Next.js 15, TypeScript, and Material-UI, the application combines data from SPARQL/RDF (LINDAS), DuckDB, and SQL sources into a unified GraphQL API.

**For development patterns and coding guidelines, see [Claude.md](./Claude.md).**

## Configuration through Environment Variables

| Variable                    | Required | Example Value                                                                                    |
| --------------------------- | -------- | ------------------------------------------------------------------------------------------------ |
| `SPARQL_ENDPOINT`           | yes      | `https://lindas.admin.ch/query`                                                                  |
| `SPARQL_EDITOR`             | yes      | `https://lindas.admin.ch/sparql`                                                                 |
| `GITLAB_WIKI_TOKEN`         | yes      | `xyz`                                                                                            |
| `GITLAB_WIKI_URL`           | yes      | `https://gitlab.ldbar.ch/api/v4/projects/9999/wikis`                                             |
| `I18N_DOMAINS`              |          | `{"de": "www.elcom.local", "fr": "fr.elcom.local", "it": "it.elcom.local"}`                      |
| `BASIC_AUTH_CREDENTIALS`    |          | `user:password`                                                                                  |
| `MATOMO_ID`                 |          | `123`                                                                                            |
| `CURRENT_PERIOD`            |          | `2022`                                                                                           |
| `FIRST_PERIOD`              |          | `2009`                                                                                           |
| `PUBLIC_URL`                | no       | `http://localhost:3000`                                                                          |
| `EIAM_CERTIFICATE_PASSWORD` | yes      | See in Elcom PWD certificates in 1Password                                                       |
| `EIAM_CERTIFICATE_CONTENT`  | yes      | See in Elcom PWD certificates in 1Password. Result of `cat certificate.p12 \| base64`            |
| `GEVER_BINDING_IPSTS`       |          | `https://idp-cert.gate-r.eiam.admin.ch/auth/sts/v14/certificatetransport`. Ask Roger Flurry.     |
| `GEVER_BINDING_RPSTS`       |          | `https://feds-r.eiam.admin.ch/adfs/services/trust/13/issuedtokenmixedsymmetricbasic256`          |
| `GEVER_BINDING_SERVICE`     |          | `https://api-bv.egov-abn.uvek.admin.ch/BusinessManagement/GeverService/GeverServiceAdvanced.svc` |

## Development Environment

To start the development environment, you need [Node.js](https://nodejs.org/en/) (v22 recommended) and [Yarn](https://classic.yarnpkg.com/lang/en/) as package manager.

The usage of [Nix](https://nixos.org) to install system-level packages is recommended.

### Setting up the dev environment

Ensure that Node.js and Yarn are available in your environment

#### Install system-level dependencies

Either use the installers

- [Node.js installer](https://nodejs.org/en/)
- [Yarn installation](https://classic.yarnpkg.com/en/docs/install)

Or – if using Nix – entering a new Nix shell will install Node.js and Yarn automatically:

```sh
nix develop
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

> 👉 In [Visual Studio Code](https://code.visualstudio.com/), you also can run the **default build task** (CMD-SHIFT-B) to start the dev server, and TypeScript checker (you'll need [Nix](https://nixos.org) for that to work).

## Versioning

New versions of `package.json` are built on CI into a separate image that will be deployed to the test environment.

```sh
yarn version
```

This will prompt for a new version. The `postversion` script will automatically try to push the created version tag to the origin repo.

## Localization

The application supports German (de), French (fr), Italian (it), English (en), and AA (test language). Translations are managed using Lingui with Accent for translation management.

[Project in Accent](https://accent.interactivethings.io/app/projects/1ce6adef-33b9-45e5-8eaf-a1f6b6ba1ebd).

### Workflow

```sh
# Extract translatable strings from source code
yarn locales:extract

# Manage translations via Accent interface
yarn locales:browse

# Pull translations from Accent service
yarn locales:sync

# Compile translations (runs automatically during yarn build)
yarn locales:compile
```

## Preparing geodata

Run

```sh
make geodata
```

Since Switzerland's municipalities can change each year, the yearly [Shapefiles from 2010 on prepared by BFS](https://www.bfs.admin.ch/bfs/de/home/dienstleistungen/geostat/geodaten-bundesstatistik/administrative-grenzen/generalisierte-gemeindegrenzen.html) will be downloaded and transformed into [TopoJSON](https://github.com/topojson/topojson) format which can be loaded efficiently client-side.

The detailed transformation steps are described in this project's `Makefile`.

## Http Proxy

On the government infrastructure, an HTTP proxy is used for external requests. This is for example used to fetch
the gitlab content. The proxy is configured via the `./configure-proxy.js` script that is
required in the `package.json` start command. It uses the `HTTP_PROXY` environment variable

- For some of the server requests (SAML requests), we must _not_ use this proxy, and the agent
  is configured there manually.
- For external requests that should use the proxy, we can use `https.globalAgent`.

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

## Load testing

See [Load Testing](./docs/load-testing.md) document for more information.

## Docker

Both the frontend and the screenshot service can be built as docker images
and spin up through docker-compose.

```bash
yarn docker:build # Build the image and tag it as interactivethings/electricity-prices-switzerland
docker compose up
```

Trivy is used for vulnerability scanning and must pass for the image to be
accepted on the Federal Administration infrastructure. A check is done before
publishing the docker image on GHCR. It can also be run against a local image.

```bash
yarn docker:trivy # Runs trivy against interactivethings/electricity-prices-switzerland:latest
```

## SPARQL notebook

A notebook containing Elcom specific SPARQL queries is available at [./book.sparqlbook](./book.sparqlbook).
You need the [SPARQL Notebook Extension](https://marketplace.visualstudio.com/items?itemName=Zazuko.sparql-notebook)
to open it.

## Home map screenshots

It is possible to regenerate the home map screenshots automatically using Playwright.

```bash
yarn design:generate-home-maps
```

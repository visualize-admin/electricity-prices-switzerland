# ElCom Electricity Price Website

## Configuration through Environment Variables

| Variable                                    | Required | Example Value                                                                                    |
| ------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------ |
| `SPARQL_ENDPOINT`                           | yes      | `https://lindas.admin.ch/query`                                                                  |
| `SPARQL_EDITOR`                             | yes      | `https://lindas.admin.ch/sparql`                                                                 |
| `SPARQL_ENDPOINT_SUPPORTS_CACHING_PER_CUBE` | no       | false                                                                                            |
| `GITLAB_WIKI_TOKEN`                         | yes      | `xyz`                                                                                            |
| `GITLAB_WIKI_URL`                           | yes      | `https://gitlab.ldbar.ch/api/v4/projects/9999/wikis`                                             |
| `I18N_DOMAINS`                              |          | `{"de": "www.elcom.local", "fr": "fr.elcom.local", "it": "it.elcom.local"}`                      |
| `BASIC_AUTH_CREDENTIALS`                    |          | `user:password`                                                                                  |
| `MATOMO_ID`                                 |          | `123`                                                                                            |
| `CURRENT_PERIOD`                            |          | `2022`                                                                                           |
| `FIRST_PERIOD`                              |          | `2009`                                                                                           |
| `EIAM_CERTIFICATE_PASSWORD`                 | yes      | See in Elcom PWD certificates in 1Password                                                       |
| `EIAM_CERTIFICATE_CONTENT`                  | yes      | See in Elcom PWD certificates in 1Password. Result of `cat certificate.p12 \| base64`            |
| `GEVER_BINDING_IPSTS`                       |          | `https://idp-cert.gate-r.eiam.admin.ch/auth/sts/v14/certificatetransport`. Ask Roger Flurry.     |
| `GEVER_BINDING_RPSTS`                       |          | `https://feds-r.eiam.admin.ch/adfs/services/trust/13/issuedtokenmixedsymmetricbasic256`          |
| `GEVER_BINDING_SERVICE`                     |          | `https://api-bv.egov-abn.uvek.admin.ch/BusinessManagement/GeverService/GeverServiceAdvanced.svc` |

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

To load test, we use the k6 platform and its ability to import HAR
session recordings. We generate automatically a HAR via a Playwright test designed to mimick a typical user journey and import it into k6.

### Update the test on k6.io

After an update to the application, it is necessary to update the
test on k6 so that the chunks URL are correct. To make the update
painless, Playwright is used to automatically navigate across the
site, and then save the session requests as an HAR file.

1. Record the HAR

The HAR is generated automatically from a Playwright test.

```bash
yarn run e2e:k6:har
```

You can also generate an HAR from a different environment than ref by
using the ELCOM_ENV env variable.

```bash
ELCOM_ENV=abn yarn run e2e:k6:har
```

The command will open a browser and will navigate through various pages.
After the test, an HAR will be generated in the root directory.

2. Import the HAR file into K6

```
yarn e2e:k6:update
```

ℹ️ Check the command in `package.json` if you want to change the HAR uploaded or the
test being updated

Make sure the options of the Scenario correspond to what you want as k6
resets them when you import the HAR (you might want to increase the
number of VUs to 50 for example).

### Editing the test

The preferred way to edit the test is to use the [Recorder inside VSCode](https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright).
This way it is easy to quickly generate a test.

- Add testIds in case the generated selectors are not understandable.
- Add sleeps to make sure the test is not too quick and "human like"

## Docker

Both the frontend and the screenshot service can be built as docker images
and spin up through docker-compose.

```
yarn docker:build
yarn docker:build-screenshot
docker compose up
```

To mimick a cloud infrastructure where the /api/screenshot route is routed
to "screenshots" instances, the traefik reverse proxy is used.

## SPARQL notebook

A notebook containing Elcom specific SPARQL queries is available at [./book.sparqlbook](./book.sparqlbook).
You need the [SPARQL Notebook Extension](https://marketplace.visualstudio.com/items?itemName=Zazuko.sparql-notebook)
to open it.

## Mocked data

Currently, the Sunshine pages rely on mocked data since the real data is not yet ready for production use. The mock data system is designed to protect operator anonymity while still providing realistic data for development and testing.

### How mocked data works

The mock data is based on real CSV files provided by Elcom. For privacy and security reasons, these CSV files are encrypted in the repository and can only be accessed by decrypting them with the correct password (`PREVIEW_PASSWORD` environment variable).

Key aspects of the mocked data system:

1. **Data sources**: The original data is stored as encrypted CSV files in the repository:

   - `observations`: Individual measurements for each operator
   - `energy`: Energy data prepared in the [elcom-sunshine-data-analysis](https://github.com/interactivethings/elcom-sunshine-data-analysis) project
   - `peer-groups`: Peer groups for each operator, derived from the energy data
   - `Sunshine 2024/2025`: Yearly sunshine data files

2. **Server-side processing**: When the application runs, the CSV files are:

   - Decrypted on first request using the `PREVIEW_PASSWORD`
   - Loaded into a DuckDB instance (an in-memory database)
   - Processed through SQL queries to extract and transform relevant data
   - You can see which SQL views are created through `npm run mocks:debug-views`. You can also see sample data, for example `npm run mocks:debug-views -- --view stability_metrics --sample` will show you sample data for the `stability_metrics` view.

3. **Anonymized operator data**: To preserve anonymity while the data is not yet public:

   - Operator names are replaced with fictional names
   - Operator IDs are also anonymized
   - The actual data values remain intact to preserve statistical accuracy

4. **Mock file generation**: Mock files can be regenerated using the CLI command:
   ```bash
   npm run mocks -- -o <operatorId>
   ```
   This creates JSON files in the `mocks/` directory that can be used in Storybook or for testing.

### Working with the encrypted data

You can work with the encrypted data directly using the `yarn sunshine-csv` script:

```bash
# Encrypt/decrypt observation data
yarn sunshine-csv encrypt observations
yarn sunshine-csv decrypt observations -o decrypted.csv

# Decrypt peer groups data
yarn sunshine-csv decrypt peer-groups

# Parse and output as JSON
yarn sunshine-csv json observations
```

The peer groups CSV is generated from `energy.csv` using DuckDB queries and can be regenerated via:

```bash
yarn data:peer-groups
```

### Integration with the application

The Sunshine pages fetch data server-side in `getServerSideProps`, where:

1. The encrypted data is decrypted and loaded into DuckDB
2. SQL queries retrieve and format the data for the frontend components
3. The data is passed as props to the React components

For components testing in Storybook, the mock files from `mocks/` can be imported to simulate the data flow without needing the decryption key.

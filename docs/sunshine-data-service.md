## Sunshine Data Service

There are two different sources of data, that are abstracted behind
the Sunshine Data Service interface.

Currently, the Sunshine pages rely on mocked data since the real data is not yet ready for production use. The mock data system is designed to protect operator anonymity while still providing realistic data for development and testing.

- SPARQL: Data from Lindas, this is expected to be the production data at
  some point. At the moment, the data is not yet published

- SQL: Mock data but currently more filled in that Lindas.

### Choosing a Data Service

The default data service is for now "sql" since we need it to test
all the flows of the application, with data as close as possible to the
real data.

We want also to be able to test the data from Lindas. To do that, it's
possible to switch data service by loading the `/api/sunshineDataService?serviceKey=sparql` page. You should see a JSON message of success.

Then, when you navigate in Sunshine pages, a debug message indicates
that you are currently viewing data through a data service which is not
the default.

To return back to the SQL data service, visit `/api/sunshineDataService?serviceKey=sql`.

### How the SQL Sunshine Data Service works ?

The data from the SQL Sunshine Data Service is based on real CSV files provided by Elcom. For privacy and security reasons, these CSV files are encrypted in the repository and can only be accessed by decrypting them with the correct password (`PREVIEW_PASSWORD` environment variable).

Key aspects of the mocked data system:

1. **Data sources**: The original data is stored as encrypted CSV files in the repository:

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
yarn sunshine-csv encrypt -i "Sunshine 2025 28.05.2025"
yarn sunshine-csv decrypt -i "Sunshine 2025 28.05.2025"

# Decrypt peer groups data
yarn sunshine-csv decrypt peer-groups
```

The peer groups CSV is generated from `energy.csv` using DuckDB queries and can be regenerated via:

```bash
yarn data:peer-groups
```

### Integration with the application

The Sunshine pages fetch data server-side in `getServerSideProps`, where:

1. The encrypted data is decrypted and loaded into DuckDB
2. SQL queries retrieve and format the data for the front-end components
3. The data is passed as props to the React components

For components testing in Storybook, the mock files from `mocks/` can be imported to simulate the data flow without needing the decryption key.

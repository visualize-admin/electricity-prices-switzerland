-- Used to generate the peer groups CSV file
-- This script reads a CSV file containing energy data and outputs distinct peer groups
-- in a new CSV file.
-- The energy.csv needs to be decrypted before running this script.
-- Use `yarn sunshine-csv decrypt -i energy` to decrypt the file.

-- Load CSV file
CREATE OR REPLACE TABLE energy AS SELECT * FROM read_csv_auto('src/sunshine-data/energy.csv');

-- Select distinct values and output as JSON
COPY (
    SELECT DISTINCT 
        "Network Operator ID" AS network_operator_id, 
        "Settlement density" AS settlement_density, 
        "Energy density" AS energy_density
    FROM energy
    ORDER BY 
        network_operator_id, 
        settlement_density, 
        energy_density
) TO "src/sunshine-data/peer-groups.csv"


-- DuckDB setup script for Sunshine data
-- This script initializes tables and views for the Sunshine data

-- Drop existing tables and views if they exist
DROP TABLE IF EXISTS sunshine_2024;
DROP TABLE IF EXISTS sunshine_2025;
DROP TABLE IF EXISTS peer_groups;
DROP VIEW IF EXISTS sunshine_all;

-- Create tables from CSV files
CREATE TABLE sunshine_2024 AS 
SELECT * FROM read_csv_auto('src/sunshine-data/Sunshine 2024 28.05.2025.csv');

CREATE TABLE sunshine_2025 AS 
SELECT * FROM read_csv_auto('src/sunshine-data/Sunshine 2025 28.05.2025.csv');

CREATE TABLE peer_groups AS 
SELECT * FROM read_csv_auto('src/sunshine-data/peer-groups.csv');

-- Create a view that combines data from both years with clean column names
CREATE VIEW sunshine_all AS
SELECT 
    CAST(SunPartnerID AS INTEGER) AS partner_id,
    SunUID AS uid,
    SunName AS name,
    CAST(SunPeriode AS INTEGER) AS period,
    SunFrankenRegel AS franc_rule,
    SunInfoJaNein AS info_yes_no,
    CAST(SunInfoTageimVoraus AS INTEGER) AS info_days_in_advance,
    SunNetzkostenNE5 AS network_costs_ne5,
    SunNetzkostenNE6 AS network_costs_ne6,
    SunNetzkostenNE7 AS network_costs_ne7,
    SunRechtzeitig AS timely,
    SunSAIDItotal AS saidi_total,
    SunSAIDIungeplant AS saidi_unplanned,
    SunSAIFItotal AS saifi_total,
    SunSAIFIungeplant AS saifi_unplanned,
    SunTarifEC2 AS tariff_ec2,
    SunTarifEC3 AS tariff_ec3,
    SunTarifEC4 AS tariff_ec4,
    SunTarifEC6 AS tariff_ec6,
    SunTarifEH2 AS tariff_eh2,
    SunTarifEH4 AS tariff_eh4,
    SunTarifEH7 AS tariff_eh7,
    SunTarifNC2 AS tariff_nc2,
    SunTarifNC3 AS tariff_nc3,
    SunTarifNC4 AS tariff_nc4,
    SunTarifNC6 AS tariff_nc6,
    SunTarifNH2 AS tariff_nh2,
    SunTarifNH4 AS tariff_nh4,
    SunTarifNH7 AS tariff_nh7,
    CAST('2024' AS INTEGER) AS year 
FROM sunshine_2024
UNION ALL
SELECT 
    CAST(SunPartnerID AS INTEGER) AS partner_id,
    SunUID AS uid,
    SunName AS name,
    CAST(SunPeriode AS INTEGER) AS period,
    SunFrankenRegel AS franc_rule,
    SunInfoJaNein AS info_yes_no,
    CAST(SunInfoTageimVoraus AS INTEGER) AS info_days_in_advance,
    SunNetzkostenNE5 AS network_costs_ne5,
    SunNetzkostenNE6 AS network_costs_ne6,
    SunNetzkostenNE7 AS network_costs_ne7,
    SunRechtzeitig AS timely,
    SunSAIDItotal AS saidi_total,
    SunSAIDIungeplant AS saidi_unplanned,
    SunSAIFItotal AS saifi_total,
    SunSAIFIungeplant AS saifi_unplanned,
    SunTarifEC2 AS tariff_ec2,
    SunTarifEC3 AS tariff_ec3,
    SunTarifEC4 AS tariff_ec4,
    SunTarifEC6 AS tariff_ec6,
    SunTarifEH2 AS tariff_eh2,
    SunTarifEH4 AS tariff_eh4,
    SunTarifEH7 AS tariff_eh7,
    SunTarifNC2 AS tariff_nc2,
    SunTarifNC3 AS tariff_nc3,
    SunTarifNC4 AS tariff_nc4,
    SunTarifNC6 AS tariff_nc6,
    SunTarifNH2 AS tariff_nh2,
    SunTarifNH4 AS tariff_nh4,
    SunTarifNH7 AS tariff_nh7,
    CAST('2025' AS INTEGER) AS year 
FROM sunshine_2025;


-- Create indexes to improve query performance
CREATE INDEX idx_sunshine_2024_partner_id ON sunshine_2024 (SunPartnerID);
CREATE INDEX idx_sunshine_2025_partner_id ON sunshine_2025 (SunPartnerID);
CREATE INDEX idx_peer_groups_operator_id ON peer_groups (network_operator_id);

-- Create views for specific data subsets
CREATE VIEW operator_data AS
SELECT 
    s.partner_id as operator_id,
    s.uid as operator_uid,
    s.name as operator_name,
    s.period,
    pg.settlement_density,
    pg.energy_density
FROM sunshine_all s
JOIN peer_groups pg ON s.partner_id = pg.network_operator_id;

-- View for network costs
CREATE VIEW network_costs AS
WITH unpivoted_network_costs AS (
    SELECT
        partner_id AS operator_id,
        name AS operator_name,
        period,
        REGEXP_REPLACE(column_name, 'network_costs_ne', 'NE') AS network_level,
        column_value AS cost
    FROM sunshine_all
    UNPIVOT(column_value FOR column_name IN (network_costs_ne5, network_costs_ne6, network_costs_ne7))
    WHERE column_value IS NOT NULL
)
SELECT
    u.operator_id,
    u.operator_name,
    u.period,
    u.network_level,
    u.cost,
    pg.settlement_density,
    pg.energy_density
FROM unpivoted_network_costs u
JOIN peer_groups pg ON u.operator_id = pg.network_operator_id;

-- View for tariffs
CREATE VIEW tariffs AS
WITH unpivoted_tariffs AS (
    SELECT
        partner_id AS operator_id,
        name AS operator_name,
        period,
        UPPER(REGEXP_REPLACE(column_name, 'tariff_', '')) AS category,
        CASE 
            WHEN column_name LIKE 'tariff_e%' THEN 'energy'
            WHEN column_name LIKE 'tariff_n%' THEN 'network'
        END AS tariff_type,
        column_value AS rate
    FROM sunshine_all
    UNPIVOT(column_value FOR column_name IN (
        tariff_ec2, tariff_ec3, tariff_ec4, tariff_ec6,
        tariff_eh2, tariff_eh4, tariff_eh7,
        tariff_nc2, tariff_nc3, tariff_nc4, tariff_nc6,
        tariff_nh2, tariff_nh4, tariff_nh7
    ))
    WHERE column_value IS NOT NULL
)
SELECT
    u.operator_id,
    u.operator_name,
    u.period,
    u.category,
    u.tariff_type,
    u.rate,
    pg.settlement_density,
    pg.energy_density
FROM unpivoted_tariffs u
JOIN peer_groups pg ON u.operator_id = pg.network_operator_id;

-- View for stability metrics
CREATE VIEW stability_metrics AS
SELECT
    o.operator_id,
    o.operator_name,
    o.period,
    s.saidi_total,
    s.saidi_unplanned,
    s.saifi_total,
    s.saifi_unplanned,
    o.settlement_density,
    o.energy_density
FROM operator_data o
JOIN sunshine_all s ON o.operator_id = s.partner_id AND o.period = s.period;

-- View for operational standards
CREATE VIEW operational_standards AS
SELECT
    o.operator_id,
    o.operator_name,
    o.period,
    s.franc_rule,
    s.info_yes_no,
    s.info_days_in_advance,
    s.timely,
    o.settlement_density,
    o.energy_density
FROM operator_data o
JOIN sunshine_all s ON o.operator_id = s.partner_id AND o.period = s.period;

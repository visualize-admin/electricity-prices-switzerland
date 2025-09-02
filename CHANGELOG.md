# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

You can also check the
[release page](https://github.com/visualize-admin/electricity-prices-switzerland/releases)

# Unreleased

- Feat

  - Energy prices details links from details panel passes along the current filter state

- Fix
  - Hover on canton list correctly shows the canton median
  - Hover on canton list draws a canton overlay on the map

# 2.12.2 (2025-09-02)

- Feat

  - Validate and sanitize energy prices query parameters

- Fix
  - Language is persisted when navigating from overview to map page
  - Server side rendering

# 2.12.0 (2025-09-02)

- Style

  - Changed Median Peer Group to correct color and shape
  - Introduced Median Total to line charts

- Feat

  - Introduction of mobile drawer on map

- Fix
  - Do not show error message for "Annual metering rate" without years

# 2.11.5 (2025-08-27)

- Fix
  - Map image can be downloaded

# 2.11.4 (2025-08-27)

- Feat
  - Hide "Grid surcharge" from Price Distribution Histogram & Canton Comparison in details page

# 2.11.3 (2025-08-26)

- Feat

  - Smaller font sizes for combobox and multi-combobox
  - Button and IconButton sizes

- Fix
  - Active state of sidebar links for sunshine sidebar items

# 2.11.1 (2025-08-26)

- `CURRENT_PERIOD` is 2026

# 2.11.0 (2025-08-26)

- Fix
  - `PUBLIC_URL` can be configured at runtime

# 2.10.0 (2025-08-26)

- Feat

  - Added OG tags to the app
  - Added custom tooltip to all button groups

- Style
  - Support for meteringrate and annualmeteringcost predicates
    - Annual metering cost is shown on the map (CHF/year)
    - Metering rate is derived from annual metering cost and shown in Rp./kWh to be consistent with other price components. It is displayed in the operator details page.
  - Support for operator coverage ratio: The coverage ratio is used to filter out observations with a coverage ratio inferior to 25% and used to compute a weighted mean when a municipality has multiple operators.
  - Improved the styling of the info banner fixed alignment
  -
- Fix

  - Minor UI styling issues
  - Added custom tooltip to all button groups

# 2.9.0

- Feat

  - Map: Add zoom in/out buttons
  - Map: Boolean legend for "Service Quality" and "Compliance" sunshine tabs

- Fix

  - Improved Ratio view on Power Stability Charts

- Maintenance

  - Added Power Stability chart card to storybook
  - Correctly fetch indicator median from SPARQL
  - Made dots on dot chart correct hovering color when multiple operators are selected
  - Data: Correctly fetch indicator median from SPARQL
  - Charts: Made dots on dot chart correct hovering color when multiple operators are selected
  - Map: Search can be used while the details panel is opened

- Maintenance

  - Added dot chart Storybook
  - Dropdown design adjustments
  - Ascending and descending labels are translated when switching languages on the map page

- Feat
  - Anchor details page in order to skip large header

# 2.8.2 - 2025-08-19

- Fix

  - Vulnerability on form-data library

# 2.8.1 - 2025-08-19

- Fix

  - Prevents cache contamination in Apollo Response Cache
  - Disable URQL hydration (due to potentially confusing behavior with build time rendering)

- Feat
  - Default service is SPARQL

# 2.8.0 - 2025-07-16

- Feat

  - Mock data: Add data for years 2022 & 2023
  - Mock data: Add missing values for years 2024 & 2025

- Fix

  - Footer links can be updated through Accent

# 2.7.0 - 2025-07-15

- Feat

  - Map Page: Network costs is the default Sunshine indicator shown
  - Sunshine Details: Overview filter state is backed by URL, reloading the page keeps the filters
  - Overview: SAIDI & SAIFI charts correctly display

- Fix

  - Map Page: Zoom in/out animation works again

- Chore

  - Ability to set flags at runtime without rebuilding

# 2.6.2 - 2025-07-10

- Features

  - Sync locales from Accent

# 2.6.1 - 2025-07-10

- Fix

  - Download documents: Can download documents again

# 2.6.0 - 2025-07-10

- Features

  - Costs and Tariffs: Use Combobox instead of ButtonGroup for network level
  - Map Page: Same hover style on Energy Prices vs Sunshine Map
  - Map Page: Scroll is disabled on map unless user holds ctrl or cmd key
  - Map Page: Lower min zoom and larger max zoom
  - Map Detail Panel: Peer group median yearly data is shown in details panel
  - Network Costs: Yearly peer group medians are shown
  - Sunshine Overview: Only data for current operator is fetched
  - Sunshine Overview: Peer group median yearly data is shown
  - Sunshine Detail Pages: Invert comparison card & peer group card

- Fix

  - Charts: Tooltip legend symbol does not get squished
  - Map Page: Shadow for tooltip
  - Map Detail Panel: "viewBy.progress" no longer appears in "View By" select

# 2.5.0 - 2025-07-09

- Features

  - Sunshine Map Page: Added peer group filtering functionality
  - Sunshine Map Page: Enhanced map legend with indicator-specific titles, formatting, and info slugs
  - Sunshine Map Page: Implemented server-side median retrieval using database-stored values
  - Sunshine Map Details Panel: Add "Show all Sunshine Indicators" button in map details panel

- Refactors

  - Domain: Split domain data file to improve code organization

- Fix

  - Map Details Panel: Tab indicator correctly selected when switching between electricity & sunshine tabs
  - Details Page: Show more/less button in on municipalities list does not trigger layout change
  - App Banner: Header title is correctly translated
  - SAIFI/SAIDI Detail Page: Added tooltip to "Overall" & "Ratio"
  - Sunshine Map Parameters: Border of search field is correct
  - Sunshine Map Parameters: Show 2025 in year
  - Sunshine Overview: Prevent Network selector to be squished

- Dev

  - Progress Overtime Chart: Add stories

# 2.4.0 - 2025-07-07

- Features

  - Added Overview Details Page
  - Add Operational Standards Page
  - Add links to Sunshine Map to Home page
  - Add Operational Standards indicators to map page
  - Ability to switch behind Lindas or Mocked data (see Readme "Sunshine Data Service" for more information)

- Enhancements

  - Add Query state to details pages
  - Add ability to debug info dialog slugs (via flag\_\_debugInfoDialog)

- Fixes

  - Fix some of the info dialogs used

# 2.3.1 - 2025-06-26

- Fixes

  - Add missing translations

# 2.3.0 - 2025-06-25

- Features

  - Click on operator on Sunshine map brings details panel and zooms in the operator
  - Click Details button from details panel while showing a Sunshine indicator brings to the correct sunshine page
  - The details panel for the sunshine map shows the correct chart for the selected indicator

- Enhancements

  - Added sortable filters to Power Stability Chart
  - Added average annotations indicator to Power Stability Chart

- Maintenance

  - Added AA (Afar) language and script for populating it with msgid - this allows for finding msgid within the app, this is a temporary solution

# 2.2.0 - 2025-06-20

- Features

  - Operator list is showing in the map page when on sunshine indicators
  - Added story for map tooltip
  - Use same map tooltip as energy for sunshine map
  - Hover on operator list for sunshine indicators highlights operators on map
  - Sunshine map has better styling and is closer to the current prices map
  - Added Latest Year indicator to map details panel mini line chart
  - Added support for visualizing Dynamic Tariffs, data support to come in the future

- Fixes

  - Unify the way we handle different metrics in charts

- Maintenance

  - Added Screenshot testing to all sunshine details pages and sub categories

# 2.1.0 - 2025-06-19

- Features

  - Added stacked horizontal charts for power stability to the sunshine charts
  - Added Error States & enhanced existing hint styles
  - Added new Select All or MultiCombobox variant integrated into sunshine pages
  - Connected all Functionalities to all charts across all the sunshine pages
  - Added Missing Select Fields to costs and tariffs pages

- Storybook

  - Added stacked horizontal chart to storybook
  - SAIDI / SAIFI indicators can be shown on the map (behind "sunshine" flag)
  - Added Error States to storybook
  - Network costs, energy tariffs, and net tariffs can be shown on the map (behind "sunshine" flag)

- Fixes

  - Changes to Docker image to be able to use duckdb (alpine based to debian based)
  - Correct fetching of power stability metrics through graphql queries

- Maintenance
  - Updated tpo-deepl see README.md for details `https://www.npmjs.com/package/tpo-deepl`

# 2.0.0 - 2025-06-11

- Features

  - GraphQL API: Add new queries to get sunshine data
  - Added Sunshine Cards to the homepage (flagged)
  - Added Sunshine pages Power (with mock data, flagged, missing charts)
  - Load mocked data through duckdb in Sunshine pages, see README
  - Load data through urql in sunshine pages, urql client cache is primed by the server
  - Added Scatterplot Chart to sunshine charts
  - Ability to change network level on costs and tariffs > network costs page.

- Fixes
  - Fixed map layout issues on mobile
  - Dropdown adjustments
  - Fixed bar chart colors
  - Fixed accordion in info dialog
  - Fixed loading on image download
  - Added tooltip shadows
- Storybook
  - Add new map to show sunshine data for operators
  - Operator map has no overlap for operators
  - Add new Scatterplot Chart
- Styles
  - Update Design System to match the Bund new CI system
  - Improved map animations / transitions
- Maintenance
  - Added Sentry
  - Split Static checks and e2e tests
  - Improved Storybook screenshotting to avoid blank screenshots
  - Changed default language to english
  - Initialized all sunshine translation strings to accent
  - Updated tpo-deepl see README.md for details `https://www.npmjs.com/package/tpo-deepl`

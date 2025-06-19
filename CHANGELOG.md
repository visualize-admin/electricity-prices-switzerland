# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

You can also check the
[release page](https://github.com/visualize-admin/electricity-prices-switzerland/releases)

# Unreleased

- Features

  - Operator list is showing in the map page when on sunshine indicators
  - Added story for map tooltip
  - Use same map tooltip as energy for sunshine map
  - Hover on operator list for sunshine indicators highlights operators on map
  - Sunshine map has better styling and is closer to the current prices map

# 2.1.0

- Features

  - Added stacked horizontal charts for power stability to the sunshine charts
  - Added Error States & enhanced existing hint styles
  - Added new Select All or MultiCombobox variant integrated into sunshine pages

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

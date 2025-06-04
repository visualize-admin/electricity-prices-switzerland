# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

You can also check the
[release page](https://github.com/visualize-admin/electricity-prices-switzerland/releases)

# Unreleased

- Features

  - GraphQL API: Add new queries to get sunshine data
  - Added Sunshine Cards to the homepage (flagged)

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
- Styles
  - Update Design System to match the Bund new CI system
- Maintenance
  - Added Sentry
  - Split Static checks and e2e tests
  - Improved Storybook screenshotting to avoid blank screenshots
  - Changed default language to english
  - Initialized all sunshine translation strings to accent

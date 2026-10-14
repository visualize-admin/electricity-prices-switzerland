# Git Hooks

Optional pre-push checks catch problems before CI does, for example locale files that are out of date, which block the Docker image publish on release.

## Checks

Defined in [`lefthook.yml`](../lefthook.yml) and run in parallel before each push:

- `lint`: `pnpm run lint`
- `knip`: unused files, exports and dependencies
- `types`: type check with `tsgo`
- `locales`: runs `pnpm locales:extract` and fails if `src/locales` changes. Only runs when the pushed commits touch `src/**/*.{ts,tsx}`. On failure, commit the regenerated `.po` files and push again.

## Setup

Hooks are opt-in. `pnpm install` does not install them, because pnpm only runs install scripts for the packages listed in `pnpm-workspace.yaml`.

```bash
pnpm lefthook install    # enable
pnpm lefthook uninstall  # disable
```

Any `pnpm lefthook` command, `run` included, also installs the hooks. An existing `.git/hooks/pre-push` is kept as `pre-push.old`.

## Usage

- Run the checks without pushing: `pnpm lefthook run pre-push --all-files` (`--all-files` makes the `locales` check run even without pushed changes)
- Skip the hooks for one push: `git push --no-verify`
- Skip some checks for one push: `LEFTHOOK_EXCLUDE=knip,types git push`
- Personal overrides go in an uncommitted `lefthook-local.yml` (see the [lefthook configuration docs](https://lefthook.dev/configuration/))

Hooks only run with `git push`. `jj git push` does not run git hooks.

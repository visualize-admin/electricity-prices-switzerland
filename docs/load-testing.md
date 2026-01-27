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
pnpm run e2e:k6:har
```

You can also generate an HAR from a different environment than ref by
using the ELCOM_ENV env variable.

```bash
ELCOM_ENV=abn pnpm run e2e:k6:har
```

The command will open a browser and will navigate through various pages.
After the test, an HAR will be generated in the root directory.

2. Import the HAR file into K6

```
pnpm e2e:k6:update
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

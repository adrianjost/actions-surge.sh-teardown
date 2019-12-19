# Surge.sh Teardown - GitHub Action

An GitHub Action to TearDown surge.sh projects that match a regex

## Inputs

### `regex` - String

**Required** The regex to match the `surge list` line.

**Example regex:**

- `[2-9] months ago` to teardown all projects that have not been touched in the last 2-9 months.

**Example lines:**

- `1576772346647 docs.406.nuxt.schul-cloud.surge.sh      8 minutes ago   surge   surge.sh   Standard`
- `1576695082855 docs.391.nuxt.schul-cloud.surge.sh      22 hours ago    surge   surge.sh   Standard`
- `1576612447133 docs.409.nuxt.schul-cloud.surge.sh      2 days ago      surge   surge.sh   Standard`
- `1559388376652 docs.191.nuxt.schul-cloud.surge.sh      7 months ago    surge   surge.sh   Standard`

run `surge list` to list all your currently active projects

### `dryrun` - Boolean

If set to true, no changes will be made to your surge account.
Instead the teardown command will be logged to the console.

### ENVs

#### `SURGE_LOGIN`

The env variable `SURGE_LOGIN` must be defined. This is usually your surge.sh email.

#### `SURGE_TOKEN`

The env variable `SURGE_TOKEN` must be defined.
You can get your token by running `npx surge token` in your command line.

## Example usage

```yml
uses: adrianjost/actions-surge.sh-teardown
with:
  regex: '[2-9]+ months ago'
env:
  SURGE_LOGIN: ${{ secrets.SURGE_LOGIN }}
  SURGE_TOKEN: ${{ secrets.SURGE_TOKEN }}
```

```yml
name: Surge Teardown
on:
  schedule:
    # * is a special character in YAML so you have to quote this string
    # run every month
    - cron: "0 0 1 * *"
jobs:
  surge-teardown:
    runs-on: ubuntu-latest
    steps:
      - name: teardown
        uses: adrianjost/actions-surge.sh-teardown
        with:
          # teardown projects older than 2 months
          regex: '[2-9]+ months ago'
        env:
          SURGE_LOGIN: ${{ secrets.SURGE_LOGIN }}
          SURGE_TOKEN: ${{ secrets.SURGE_TOKEN }}
```

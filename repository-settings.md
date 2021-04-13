All repositories in `asyncapi` organizations should be similar in structure, settings, and restrictions. Follow these guidelines to adjust settings of a new repository created in one of these organizations.

## Adjust repository options

Under the repository name, choose the **Settings** tab. The **Options** view opens as the default one in the left menu.

1. Scroll down to the **Features** section and clear these options:
    - Wikis
    - Projects

Make sure **Sponsorships** option is selected and `open_collective: asyncapi` is provided.

2. Go to the **Merge button** section and clear these options:
    - Allow merge commits
    - Allow rebase merging

Leave only the **Allow squash merging** option selected. This option combines all commits into one before merging the changes into the `master` branch.

3. Make sure option **Automatically delete head branches** is selected


## SonarCloud scans

Each repository must be integrated with https://sonarcloud.io/organizations/asyncapi/projects for automated quality and security scans.

## Add basic GitHub Actions configurations

Create `.github/workflows` directory and the following configurations:

* Handling of stale issues and PRs take from [here](https://github.com/asyncapi/.github/blob/master/.github/workflows/stale-issues-prs.yml)
* Welcome message for first-time contributors take from [here](https://github.com/asyncapi/.github/blob/master/.github/workflows/welcome-first-time-contrib.yml)
* Automerge workflow take from [here](https://github.com/asyncapi/.github/blob/master/.github/workflows/automerge.yml)
* Sentiment analysis workflow take from [here](https://github.com/asyncapi/.github/blob/master/.github/workflows/sentiment-analysis.yml)
* Automated bump of the npm package in its dependent project take from [here](https://github.com/asyncapi/parser-js/blob/master/.github/workflows/bump.yml)
* Release workflow that should be inspired by [this](https://github.com/asyncapi/parser-js/blob/master/.github/workflows/release.yml)
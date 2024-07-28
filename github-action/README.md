# GitHub Action for Generator
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-5-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

This action generates whatever you want using your AsyncAPI document. It uses [AsyncAPI Generator](https://github.com/asyncapi/generator/).

## Inputs

### `template`

Template for the generator. Official templates are listed here https://github.com/asyncapi/generator#list-of-official-generator-templates. You can pass template as npm package, url to git repository, link to tar file or local template.

**Default** points to `@asyncapi/markdown-template@0.10.0` template.

> We recommend to always specify the version of the template to not encounter any issues with the action in case of release of the template that is not compatible with given version of the generator.

### `filepath`

Location of the AsyncAPI document.

**Default** expects `asyncapi.yml` in the root of the working directory.

### `parameters`

The template that you use might support and even require specific parameters to be passed to the template for the generation.

### `output`

Directory where to put the generated files.

**Default** points to `output` directory in the working directory.

## Example usage

### Basic

In case all defaults are fine for you, just add such step:

```yaml
- name: Generating Markdown from my AsyncAPI document
  uses: docker://asyncapi/github-action-for-generator:2.0.0
```

### Using all possible inputs

In case you do not want to use defaults, you for example want to use different template:

```yaml
- name: Generating HTML from my AsyncAPI document
  uses: docker://asyncapi/github-action-for-generator:2.0.0
  with:
    template: '@asyncapi/html-template@0.15.4'  #In case of template from npm, because of @ it must be in quotes
    filepath: docs/api/my-asyncapi.yml
    parameters: baseHref=/test-experiment/ sidebarOrganization=byTags #space separated list of key/values
    output: generated-html
```

### Example workflow with publishing generated HTML to GitHub Pages

In case you want to validate your asyncapi file first, and also send generated HTML to GitHub Pages this is how full workflow could look like:

```yaml
name: AsyncAPI documents processing

on:
  push:
    branches: [ master ]

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
    #"standard step" where repo needs to be checked-out first
    - name: Checkout repo
      uses: actions/checkout@v2
      
    #Using another action for AsyncAPI for validation
    - name: Validating AsyncAPI document
      uses: WaleedAshraf/asyncapi-github-action@v0.0.9
      with:
        filepath: docs/api/my-asyncapi.yml
      
    #In case you do not want to use defaults, you for example want to use different template
    - name: Generating HTML from my AsyncAPI document
      uses: docker://asyncapi/github-action-for-generator:2.0.0
      with:
        template: '@asyncapi/html-template@0.9.0'  #In case of template from npm, because of @ it must be in quotes
        filepath: docs/api/my-asyncapi.yml
        parameters: baseHref=/test-experiment/ sidebarOrganization=byTags #space separated list of key/values
        output: generated-html
      
    #Using another action that takes generated HTML and pushes it to GH Pages
    - name: Deploy GH page
      uses: JamesIves/github-pages-deploy-action@3.4.2
      with:
        ACCESS_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        BRANCH: gh-pages
        FOLDER: generated-html
```

## Troubleshooting

You can enable more log information in GitHub Action by adding `ACTIONS_STEP_DEBUG` secret to repository where you want to use this action. Set the value of this secret to `true` and you''ll notice more debug logs from this action.
## Contributors

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://www.brainfart.dev/"><img src="https://avatars.githubusercontent.com/u/6995927?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Lukasz Gornicki</b></sub></a><br /><a href="https://github.com/asyncapi/github-action-for-generator/commits?author=derberg" title="Code">💻</a> <a href="#maintenance-derberg" title="Maintenance">🚧</a> <a href="#infra-derberg" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="https://github.com/asyncapi/github-action-for-generator/pulls?q=is%3Apr+reviewed-by%3Aderberg" title="Reviewed Pull Requests">👀</a></td>
    <td align="center"><a href="https://github.com/magicmatatjahu"><img src="https://avatars.githubusercontent.com/u/20404945?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Maciej Urbańczyk</b></sub></a><br /><a href="https://github.com/asyncapi/github-action-for-generator/pulls?q=is%3Apr+reviewed-by%3Amagicmatatjahu" title="Reviewed Pull Requests">👀</a></td>
    <td align="center"><a href="https://www.victormartingarcia.com"><img src="https://avatars.githubusercontent.com/u/659832?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Victor</b></sub></a><br /><a href="https://github.com/asyncapi/github-action-for-generator/commits?author=victormartingarcia" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/HUTCHHUTCHHUTCH"><img src="https://avatars.githubusercontent.com/u/55915170?v=4?s=100" width="100px;" alt=""/><br /><sub><b>HUTCHHUTCHHUTCH</b></sub></a><br /><a href="#infra-HUTCHHUTCHHUTCH" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a></td>
    <td align="center"><a href="https://github.com/pioneer2k"><img src="https://avatars.githubusercontent.com/u/32297829?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Thomas Heyer</b></sub></a><br /><a href="#infra-pioneer2k" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!

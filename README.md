[![AsyncAPI CLI](./assets/logo.png)](https://www.asyncapi.com/tools/cli)

CLI to work with your AsyncAPI files. Currently under development, we are working to bring more features. 

[![GitHub license](https://img.shields.io/github/license/asyncapi/cli)](https://github.com/asyncapi/cli/blob/master/LICENSE)
[![PR testing - if Node project](https://github.com/asyncapi/cli/actions/workflows/if-nodejs-pr-testing.yml/badge.svg)](https://github.com/asyncapi/cli/actions/workflows/if-nodejs-pr-testing.yml)
[![npm](https://img.shields.io/npm/dw/@asyncapi/cli)](https://www.npmjs.com/package/@asyncapi/cli)

## Table of contents

<!-- toc -->

- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
  * [Set up development environment](#set-up-development-environment)
  * [Command Structure and Patterns](#command-structure-and-patterns)
- [Contributors](#contributors)

<!-- tocstop -->

## Installation
Learn how to install the AsyncAPI CLI by following the instructions in the [installation guide](/docs/installation.md). 

## Usage
The [usage guide](/docs/usage.md) provides information about different ways to use the CLI.


## Contributing

Read [CONTRIBUTING](https://github.com/asyncapi/.github/blob/master/CONTRIBUTING.md) guide.

### Set up development environment

Read [DEVELOPMENT.md](/DEVELOPMENT.md) file for development setup.

Additional steps:

- Run `npm run test` to make sure everything is properly set up
- Run `npm run build` and then `bin/run` to try new CLI locally

The UX developed for the CLI should comply with the [Command Line Interface Guideline](https://clig.dev/)

### Command Structure and Patterns

We are following `verb + noun` and `namespace + noun + [verb]` pattern for making our commands and arguments. For example `asyncapi validate <spec-file-path>` and `asyncapi config context add <context-name> <spec-file-path>`.

## Contributors

Thanks go to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/jotamusik"><img src="https://avatars.githubusercontent.com/u/14940638?v=4?s=100" width="100px;" alt="Jorge Aguiar Martín"/><br /><sub><b>Jorge Aguiar Martín</b></sub></a><br /><a href="https://github.com/asyncapi/cli/commits?author=jotamusik" title="Code">💻</a> <a href="#ideas-jotamusik" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/asyncapi/cli/commits?author=jotamusik" title="Tests">⚠️</a> <a href="https://github.com/asyncapi/cli/commits?author=jotamusik" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://www.brainfart.dev/"><img src="https://avatars.githubusercontent.com/u/6995927?v=4?s=100" width="100px;" alt="Lukasz Gornicki"/><br /><sub><b>Lukasz Gornicki</b></sub></a><br /><a href="#ideas-derberg" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/asyncapi/cli/commits?author=derberg" title="Code">💻</a> <a href="https://github.com/asyncapi/cli/pulls?q=is%3Apr+reviewed-by%3Aderberg" title="Reviewed Pull Requests">👀</a> <a href="#maintenance-derberg" title="Maintenance">🚧</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://souvik.vercel.app/"><img src="https://avatars.githubusercontent.com/u/41781438?v=4?s=100" width="100px;" alt="souvik"/><br /><sub><b>souvik</b></sub></a><br /><a href="https://github.com/asyncapi/cli/commits?author=Souvikns" title="Code">💻</a> <a href="#ideas-Souvikns" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/asyncapi/cli/commits?author=Souvikns" title="Tests">⚠️</a> <a href="https://github.com/asyncapi/cli/pulls?q=is%3Apr+reviewed-by%3ASouvikns" title="Reviewed Pull Requests">👀</a> <a href="#maintenance-Souvikns" title="Maintenance">🚧</a> <a href="https://github.com/asyncapi/cli/commits?author=Souvikns" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://boyney.io/"><img src="https://avatars.githubusercontent.com/u/3268013?v=4?s=100" width="100px;" alt="David Boyne"/><br /><sub><b>David Boyne</b></sub></a><br /><a href="https://github.com/asyncapi/cli/commits?author=boyney123" title="Code">💻</a> <a href="#ideas-boyney123" title="Ideas, Planning, & Feedback">🤔</a> <a href="#maintenance-boyney123" title="Maintenance">🚧</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://www.fmvilas.com/"><img src="https://avatars.githubusercontent.com/u/242119?v=4?s=100" width="100px;" alt="Fran Méndez"/><br /><sub><b>Fran Méndez</b></sub></a><br /><a href="https://github.com/asyncapi/cli/commits?author=fmvilas" title="Code">💻</a> <a href="#ideas-fmvilas" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/asyncapi/cli/pulls?q=is%3Apr+reviewed-by%3Afmvilas" title="Reviewed Pull Requests">👀</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/magicmatatjahu"><img src="https://avatars.githubusercontent.com/u/20404945?v=4?s=100" width="100px;" alt="Maciej Urbańczyk"/><br /><sub><b>Maciej Urbańczyk</b></sub></a><br /><a href="https://github.com/asyncapi/cli/pulls?q=is%3Apr+reviewed-by%3Amagicmatatjahu" title="Reviewed Pull Requests">👀</a> <a href="#maintenance-magicmatatjahu" title="Maintenance">🚧</a> <a href="#ideas-magicmatatjahu" title="Ideas, Planning, & Feedback">🤔</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://aayushsahu.com/"><img src="https://avatars.githubusercontent.com/u/54525741?v=4?s=100" width="100px;" alt="Aayush Kumar Sahu"/><br /><sub><b>Aayush Kumar Sahu</b></sub></a><br /><a href="https://github.com/asyncapi/cli/commits?author=aayushmau5" title="Code">💻</a> <a href="https://github.com/asyncapi/cli/commits?author=aayushmau5" title="Tests">⚠️</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/mihirterna"><img src="https://avatars.githubusercontent.com/u/31316452?v=4?s=100" width="100px;" alt="Mihir Kulkarni"/><br /><sub><b>Mihir Kulkarni</b></sub></a><br /><a href="https://github.com/asyncapi/cli/commits?author=mihirterna" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://imabp.github.io/resume/"><img src="https://avatars.githubusercontent.com/u/53480076?v=4?s=100" width="100px;" alt="Abir"/><br /><sub><b>Abir</b></sub></a><br /><a href="https://github.com/asyncapi/cli/commits?author=imabp" title="Tests">⚠️</a> <a href="https://github.com/asyncapi/cli/commits?author=imabp" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/peter-rr"><img src="https://avatars.githubusercontent.com/u/81691177?v=4?s=100" width="100px;" alt="Peter Ramos"/><br /><sub><b>Peter Ramos</b></sub></a><br /><a href="https://github.com/asyncapi/cli/commits?author=peter-rr" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://samridhi-98.github.io/Portfolio"><img src="https://avatars.githubusercontent.com/u/54466041?v=4?s=100" width="100px;" alt="Samriddhi"/><br /><sub><b>Samriddhi</b></sub></a><br /><a href="https://github.com/asyncapi/cli/commits?author=Samridhi-98" title="Tests">⚠️</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://linktr.ee/KharabePranay"><img src="https://avatars.githubusercontent.com/u/68046838?v=4?s=100" width="100px;" alt="Pranay Kharabe"/><br /><sub><b>Pranay Kharabe</b></sub></a><br /><a href="https://github.com/asyncapi/cli/commits?author=pranay202" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://d-m-oladele.netlify.app/"><img src="https://avatars.githubusercontent.com/u/98895460?v=4?s=100" width="100px;" alt="Damilola Oladele"/><br /><sub><b>Damilola Oladele</b></sub></a><br /><a href="https://github.com/asyncapi/cli/commits?author=activus-d" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/prayutsu"><img src="https://avatars.githubusercontent.com/u/54636525?v=4?s=100" width="100px;" alt="Abhay Garg"/><br /><sub><b>Abhay Garg</b></sub></a><br /><a href="https://github.com/asyncapi/cli/commits?author=prayutsu" title="Code">💻</a> <a href="https://github.com/asyncapi/cli/commits?author=prayutsu" title="Tests">⚠️</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/sambhavgupta0705"><img src="https://avatars.githubusercontent.com/u/81870866?v=4?s=100" width="100px;" alt="Sambhav Gupta"/><br /><sub><b>Sambhav Gupta</b></sub></a><br /><a href="https://github.com/asyncapi/cli/commits?author=sambhavgupta0705" title="Code">💻</a> <a href="https://github.com/asyncapi/cli/commits?author=sambhavgupta0705" title="Tests">⚠️</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/CyberHippo"><img src="https://avatars.githubusercontent.com/u/18269437?v=4?s=100" width="100px;" alt="Hippolyte Vergnol"/><br /><sub><b>Hippolyte Vergnol</b></sub></a><br /><a href="https://github.com/asyncapi/cli/commits?author=CyberHippo" title="Code">💻</a> <a href="#infra-CyberHippo" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://www.jentevets.com"><img src="https://avatars.githubusercontent.com/u/22449126?v=4?s=100" width="100px;" alt="Jente Vets"/><br /><sub><b>Jente Vets</b></sub></a><br /><a href="https://github.com/asyncapi/cli/commits?author=Vetsoo" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/kaushik-rishi"><img src="https://avatars.githubusercontent.com/u/52498617?v=4?s=100" width="100px;" alt="Rishi"/><br /><sub><b>Rishi</b></sub></a><br /><a href="https://github.com/asyncapi/cli/commits?author=kaushik-rishi" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://ashishpadhy.live"><img src="https://avatars.githubusercontent.com/u/100484401?v=4?s=100" width="100px;" alt="Ashish Padhy"/><br /><sub><b>Ashish Padhy</b></sub></a><br /><a href="https://github.com/asyncapi/cli/commits?author=Shurtu-gal" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/meetagrawal09"><img src="https://avatars.githubusercontent.com/u/73902874?v=4?s=100" width="100px;" alt="Meet Agrawal"/><br /><sub><b>Meet Agrawal</b></sub></a><br /><a href="#infra-meetagrawal09" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://www.chinmayyy.tech"><img src="https://avatars.githubusercontent.com/u/112387862?v=4?s=100" width="100px;" alt="Chinmay Shewale"/><br /><sub><b>Chinmay Shewale</b></sub></a><br /><a href="https://github.com/asyncapi/cli/commits?author=chinma-yyy" title="Code">💻</a> <a href="https://github.com/asyncapi/cli/commits?author=chinma-yyy" title="Tests">⚠️</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/mhmohona"><img src="https://avatars.githubusercontent.com/u/14244685?v=4?s=100" width="100px;" alt="Mahfuza Humayra Mohona"/><br /><sub><b>Mahfuza Humayra Mohona</b></sub></a><br /><a href="https://github.com/asyncapi/cli/commits?author=mhmohona" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/GreenRover"><img src="https://avatars.githubusercontent.com/u/512850?v=4?s=100" width="100px;" alt="Heiko Henning"/><br /><sub><b>Heiko Henning</b></sub></a><br /><a href="https://github.com/asyncapi/cli/commits?author=GreenRover" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://www.linkedin.com/in/aayush-saini-0a25931b1/"><img src="https://avatars.githubusercontent.com/u/60972989?v=4?s=100" width="100px;" alt="Zack_Aayush"/><br /><sub><b>Zack_Aayush</b></sub></a><br /><a href="https://github.com/asyncapi/cli/commits?author=AayushSaini101" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/ayushnau"><img src="https://avatars.githubusercontent.com/u/78146753?v=4?s=100" width="100px;" alt="Ayush Nautiyal"/><br /><sub><b>Ayush Nautiyal</b></sub></a><br /><a href="https://github.com/asyncapi/cli/commits?author=ayushnau" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/AnishKacham"><img src="https://avatars.githubusercontent.com/u/79566582?v=4?s=100" width="100px;" alt="AnishKacham"/><br /><sub><b>AnishKacham</b></sub></a><br /><a href="https://github.com/asyncapi/cli/commits?author=Anish Kacham" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/aeworxet"><img src="https://avatars.githubusercontent.com/u/16149591?v=4?s=100" width="100px;" alt="Viacheslav Turovskyi"/><br /><sub><b>Viacheslav Turovskyi</b></sub></a><br /><a href="https://github.com/asyncapi/cli/commits?author=aeworxet" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/amanbedi1"><img src="https://avatars.githubusercontent.com/u/82234871?v=4?s=100" width="100px;" alt="Amanpreet Singh Bedi "/><br /><sub><b>Amanpreet Singh Bedi </b></sub></a><br /><a href="https://github.com/asyncapi/cli/commits?author=amanbedi1" title="Code">💻</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/ron-debajyoti"><img src="https://avatars.githubusercontent.com/u/22571664?v=4?s=100" width="100px;" alt="Debajyoti Halder"/><br /><sub><b>Debajyoti Halder</b></sub></a><br /><a href="https://github.com/asyncapi/cli/commits?author=ron-debajyoti" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Savio629"><img src="https://avatars.githubusercontent.com/u/91362589?v=4?s=100" width="100px;" alt="Savio Dias"/><br /><sub><b>Savio Dias</b></sub></a><br /><a href="https://github.com/asyncapi/cli/commits?author=Savio629" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/jonaslagoni"><img src="https://avatars.githubusercontent.com/u/13396189?v=4?s=100" width="100px;" alt="Jonas Lagoni"/><br /><sub><b>Jonas Lagoni</b></sub></a><br /><a href="https://github.com/asyncapi/cli/commits?author=jonaslagoni" title="Code">💻</a> <a href="#ideas-jonaslagoni" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/asyncapi/cli/pulls?q=is%3Apr+reviewed-by%3Ajonaslagoni" title="Reviewed Pull Requests">👀</a> <a href="https://github.com/asyncapi/cli/commits?author=jonaslagoni" title="Tests">⚠️</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/KhudaDad414"><img src="https://avatars.githubusercontent.com/u/32505158?v=4?s=100" width="100px;" alt="Khuda Dad Nomani"/><br /><sub><b>Khuda Dad Nomani</b></sub></a><br /><a href="https://github.com/asyncapi/cli/commits?author=KhudaDad414" title="Code">💻</a> <a href="https://github.com/asyncapi/cli/commits?author=KhudaDad414" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/smoya"><img src="https://avatars.githubusercontent.com/u/1083296?v=4?s=100" width="100px;" alt="Sergio Moya "/><br /><sub><b>Sergio Moya </b></sub></a><br /><a href="https://github.com/asyncapi/cli/commits?author=smoya" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Vishal2002"><img src="https://avatars.githubusercontent.com/u/35897449?v=4?s=100" width="100px;" alt="Vishal Sharma"/><br /><sub><b>Vishal Sharma</b></sub></a><br /><a href="https://github.com/asyncapi/cli/commits?author=Vishal2002" title="Code">💻</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!

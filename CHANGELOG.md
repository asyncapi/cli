# @asyncapi/cli

## 3.4.1

### Patch Changes

- e2a3583: fix: made studio start on different port if one is already in use

  - 43a8cb8: fix: made studio start on differnt port if one is already in use

  Signed-off-by: Tushar Anand <tusharannand@gmail.com>

  - ce4b061: Merge remote-tracking branch 'remote/master' into fix-studio-multiple-instance
  - 122812a: chore: new approach for port allocation done

  Signed-off-by: Tushar Anand <tusharannand@gmail.com>

  - 5946001: fix: removed comment and fix linting errors

  Signed-off-by: Tushar Anand <tusharannand@gmail.com>

## 3.4.0

### Minor Changes

- 6b00166: feat: asyncapi release for alpine distros

  - 54ba750: feat: asyncapi on alpine distros
  - 44d72c3: fix: rename the scripts to use rename instead of tarballs

## 3.3.0

### Minor Changes

- c944268: feat: refactor CLI to be service based and initial migration of server-api

  - ac95777: feat: refactor cli to be service based and migrate server-api

  Signed-off-by: Shurtu-gal <ashishpadhy1729@gmail.com>

  - 6b925f4: chore: fix diff test

  Signed-off-by: Shurtu-gal <ashishpadhy1729@gmail.com>

  - cfe6e8d: feat: add generator controller

  Signed-off-by: Shurtu-gal <ashishpadhy1729@gmail.com>

  - b2d7bcc: chore: don't need to install everytime

  Signed-off-by: Shurtu-gal <ashishpadhy1729@gmail.com>

  - dd71d22: Merge remote-tracking branch 'origin/master' into refactor
  - 1fd1216: fix: linting

  Signed-off-by: Ashish Padhy <ashishpadhy1729@gmail.com>

  - 6bd3e73: chore: run prettier

  Signed-off-by: Ashish Padhy <ashishpadhy1729@gmail.com>

  - ca3fdee: chore: run linter

  Signed-off-by: Ashish Padhy <ashishpadhy1729@gmail.com>

  - 1d03d79: chore: quick startup of server-api

  Signed-off-by: Shurtu-gal <ashishpadhy1729@gmail.com>

  - 13729bb: chore: rename to apps

  Signed-off-by: Ashish Padhy <ashishpadhy1729@gmail.com>

  - cdd2a43: chore: rename npm commands

  Signed-off-by: Ashish Padhy <ashishpadhy1729@gmail.com>

  - 90aca02: Merge remote-tracking branch 'remote/master' into refactor

## 3.2.0

### Minor Changes

- 0754d1d: feat: add new feature to supress the warnings

  - ab94c15: Add a new flag that is --x-suppress-warnings to supress the warning in the validate command
  - 55819cd: Allow to pass multiple warnings to supress and add check to verify the warning is correct or not
  - 885fc71: Update src/core/parser.ts

  Co-authored-by: Souvik De <souvikde.ns@gmail.com>

  - 16b22de: Update src/core/flags/validate.flags.ts

  Co-authored-by: Souvik De <souvikde.ns@gmail.com>

  - de1caad: Add another flag to supressallwarnings and update test case

## 3.1.1

### Patch Changes

- 152c272: feat: made the start studio command interactive along with addition of…

  - 0e8e3c1: feat: made the start studio command inteactive along with addition of a flag to disable prompt.

## 3.1.0

### Minor Changes

- d17aa54: feat: new command `asyncapi start preview` has been added

## 3.0.1

### Patch Changes

- 1b62a66: - Fixes script detection issue in version 3.0.0
  - Fixes testing by testing the github action with local CLI

## 3.0.0

### Major Changes

- b6f8b82: feat: add autocomplete feature in cli

## 2.17.0

### Minor Changes

- f0268d4: Remove `--renderer` flag and make `React` as the de-facto renderer, deprecating `Nunjucks`

## 2.16.10

### Patch Changes

- e11fe05: fix: Wrong Error message in -h command #1725

## 2.16.9

### Patch Changes

- 819b585: [Fix]: Json file supported in asyncapi new file command
- 830fe82: Fix studio not opening in CLI studio command
- 830fe82: fix: studio command not working

## 2.16.8

### Patch Changes

- 460c99a: feat: use next.js version of studio
- 460c99a: Upgrade studio to latest and allow use of next server

## 2.16.7

### Patch Changes

- 6ca17b3: fix: update packages to latest stable version

## 2.16.6

### Patch Changes

- 82b441f: fix: resolve error in AsyncAPI optimize

## 2.16.5

### Patch Changes

- f873423: docs: update docs regarding asyncapi new command
- 2deeb36: fix: print in cli asyncapi generate models without -o flag

## 2.16.4

### Patch Changes

- 67d7e8f: fix: proxy implementation for optimize validate and convert fixed

## 2.16.3

### Patch Changes

- cec8081: feat: added Proxy support for the generate commands.

## 2.16.2

### Patch Changes

- 755339a: feat: change the implementation of new command

## 2.16.1

### Patch Changes

- 3ab019f: chore(deps): bump jsonpath-plus and @stoplight/spectral-core
- 07514e6: implemented new UI/UX improvements in config command
- a774ae2: fix: starting of studio fixed when using example with new file

## 2.16.0

### Minor Changes

- a37e124: Deprecate the --file flag in `start studio` command

## 2.15.0

### Minor Changes

- dcfb8c7: fix: Remove unused package lodash.template

## 2.14.1

### Patch Changes

- 08afb45: Prepare github action for release
- da64c63: ci: bump artifact actions to v4

## 2.14.0

### Minor Changes

- 6839c8f: - Changed docker build to a source code based build
  - Changed name of github action to avoid clash
  - Fixed Docker and Release Pipeline

## 2.13.1

### Patch Changes

- 8ae33c4: Handle AsyncAPI v3 in diff command

## 2.13.0

### Minor Changes

- a76b0fb: Add github-action to monorepo and set up changesets

### Patch Changes

- 81b925e: Updated README with Development.md file

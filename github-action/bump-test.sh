#!/bin/bash

version=$(cat package.json | jq -r '.version');
action=$(cat action.yml);
regex='docker:\/\/asyncapi\/github-action-for-cli:([0-9.]+)'

[[ $action =~ $regex ]]

action_version=${BASH_REMATCH[1]};

echo "Action version: $action_version";
echo "Package version: $version";

if [[ $action_version > $version ]]; then
  echo "Action version is greater than package version"; 
else \
  echo "Action version has not been bumped. Please bump the action version to the semantically correct version after $version"; \
  exit 1; \
fi
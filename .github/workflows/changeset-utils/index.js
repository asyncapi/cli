const path = require('path');
const { readPackageUp } = require('read-package-up');

// @todo
// Check if maintainer can modify the head

const getFormattedCommits = async (pullRequest, github) => {
  const commitOpts = github.rest.pulls.listCommits.endpoint.merge({
    owner: pullRequest.base.repo.owner.login,
    repo: pullRequest.base.repo.name,
    pull_number: pullRequest.number,
  });

  const commits = await github.paginate(commitOpts);

  // Filter merge commits and commits by asyncapi-bot
  const filteredCommits = commits.filter((commit) => {
    return !commit.commit.message.startsWith('Merge pull request') && !commit.commit.message.startsWith('Merge branch') && !commit.commit.author.name.startsWith('asyncapi-bot') && !commit.commit.author.name.startsWith('dependabot[bot]');
  });

  return filteredCommits.map((commit) => {
    return {
      commit_sha: commit.sha.slice(0, 7), // first 7 characters of the commit sha is enough to identify the commit
      commit_message: commit.commit.message,
    };
  });
}

const getReleasedPackages = async (pullRequest, github) => {
  const files = await github.paginate(github.rest.pulls.listFiles.endpoint.merge({
    owner: pullRequest.base.repo.owner.login,
    repo: pullRequest.base.repo.name,
    pull_number: pullRequest.number,
  }));

  const releasedPackages = [];
  const ignoredFiles = ['yarn.lock', 'package-lock.json', 'pnpm-lock.yaml'];
  for (const file of files) {
    if (!ignoredFiles.includes(file.filename)) {
      const cwd = path.resolve(path.dirname(file.filename));
      const { packageJson } = await readPackageUp(cwd);
      if (!releasedPackages.includes(packageJson.name)) {
        releasedPackages.push(packageJson.name);
      }
    } 
  }

  console.debug('Filenames', files.map((file) => file.filename));
  return releasedPackages;
}

const getReleaseNotes = async (pullRequest, github) => {
  const commits = await getFormattedCommits(pullRequest, github);
  /**
   * Release notes are generated from the commits.
   * Format:
   * - title
   * - commit_sha: commit_message (Array of commits)
   */
  const releaseNotes = pullRequest.title + '\n\n' + commits.map((commit) => {
    return `- ${commit.commit_sha}: ${commit.commit_message}`;
  }).join('\n');

  return releaseNotes;
}

const getChangesetContents = async (pullRequest, github) => {
  const title = pullRequest.title;
  const releaseType = title.split(':')[0];
  let releaseVersion = 'patch';
  switch (releaseType) {
    case 'fix':
      releaseVersion = 'patch';
    case 'feat':
      releaseVersion = 'minor';
    case 'fix!':
      releaseVersion = 'major';
    case 'feat!':
      releaseVersion = 'major';
    default:
      releaseVersion = 'patch';
  }

  const releaseNotes = await getReleaseNotes(pullRequest, github);
  const releasedPackages = await getReleasedPackages(pullRequest, github);

  const changesetContents = releasedPackages.map((pkg) => {
    return `---\n'${pkg}': ${releaseVersion}\n`;
  }).join('\n') + `---\n\n${releaseNotes}\n\n`

  return changesetContents;
};

/**
 * This function checks if a comment has already been created by the workflow.
 * If not, it creates a comment with the changeset.
 * If it is already created, it updates the comment with the new changeset.
 */
const commentWorkflow = async (pullRequest, github, changesetContents) => {
  const body = `#### Changeset has been generated for this PR as part of auto-changeset workflow.\n\n<details><summary>Please review the changeset before merging the PR.</summary>\n\n\`\`\`\n${changesetContents}\`\`\`\n\n</details>\n\n[If you are a maintainer or the author of the PR, you can change the changeset by clicking here](https://github.com/${pullRequest.head.repo.full_name}/edit/${pullRequest.head.ref}/.changeset/${pullRequest.number}.md)\n\n> [!TIP] If you don't want auto-changeset to run on this PR, you can add the label \`skip-changeset\` to the PR.`

  const comments = await github.rest.issues.listComments({
    owner: pullRequest.base.repo.owner.login,
    repo: pullRequest.base.repo.name,
    issue_number: pullRequest.number,
  });

  const comment = comments.data.find((comment) => comment.body.includes('Changeset has been generated for this PR as part of auto-changeset workflow.'));
  if (comment) {
    await github.rest.issues.updateComment({
      owner: pullRequest.base.repo.owner.login,
      repo: pullRequest.base.repo.name,
      comment_id: comment.id,
      body: body,
    });
  } else {
    await github.rest.issues.createComment({
      owner: pullRequest.base.repo.owner.login,
      repo: pullRequest.base.repo.name,
      issue_number: pullRequest.number,
      body: body,
      user: 'asyncapi-bot',
    });
  }
}

module.exports = {
  getChangesetContents,
  commentWorkflow,
};
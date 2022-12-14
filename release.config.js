module.exports = {
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/github',
    '@semantic-release/release-notes-generator',
    '@semantic-release/changelog',
    '@semantic-release/npm',
    '@semantic-release/git',
  ],
  branches: ['main'],
};

Everyone is welcome to contribute to Kaoto. 

We have a Kanban board with good first issues in https://github.com/orgs/KaotoIO/projects/4

There are many ways to contribute to Kaoto:

## Issues

### Submit a new issue

If you have a bug or a suggestion for a new feature, you can create new issues.
Always **use one of the templates available** and answer as many of the questions as you can.

If you are **submitting a bug**, provide a simple step by step explanation of how to reproduce it and what is the expected outcome.

If you are **submitting a feature**, be ready to follow up and contribute with its development. Features that are proposed but don't have
funds or developers ready to implement it may be closed due to not enough interest raised. If you can't fund or implement it yourself and 
you want the feature implemented, you must look for a way to find resources to implement it.

### Clarifying bugs

You can also contribute by looking for open bugs and test corner cases to add more information to help developers.

### Implementing bug fixes or features

Feel free to work on any of the open issues. Add a comment to it saying that you want to work on it and deliver regular updates on the 
status of the development.

If you can no longer work on an issue, please, let us know as soon as possible so someone else can work on it.

See pull request section.

## Pull Requests

If you are reviewing pull requests, please use the [conventional comments](https://conventionalcomments.org/) standard to do so. 
Comments that don't follow this standard may be ignored.

There are a few things to consider when sending a pull request merge:

 * Small commits. We prefer small commits because they are easier to review
 * All commits must pass tests: Each commit should have consistency on its own and don't break any functionality
 * All jobs/checks must be green: This includes test coverage, code smells, security issues,... 
 * Be descriptive on the PR text about what the changes are. Better to have duplicated explanation than no explanation at all. Provide examples.
 * Add screenshots and videos of what your PR is doing. Especially if you are adding a new feature.
 * High test coverage: Your code must be covered by unit and e2e tests. If for some reason your PR can't or shouldn't, be very clear why. The tests must be included in the same PR.

### How your commits messages should look like

**All your commits should follow the [conventional commits standard](https://www.conventionalcommits.org/).**

The Conventional Commits specification is a lightweight convention on top of commit messages. 
It provides an easy set of rules for creating an explicit commit history; which makes it easier to write automated tools on top of. 
This convention dovetails with SemVer, by describing the features, fixes, and breaking changes made in commit messages.

The commit message should be structured as follows:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

The commit contains the following structural elements, to communicate intent to the consumers of your library:

* fix: a commit of the type fix patches a bug in your codebase (this correlates with PATCH in Semantic Versioning).
* feat: a commit of the type feat introduces a new feature to the codebase (this correlates with MINOR in Semantic Versioning).
* BREAKING CHANGE: a commit that has a footer BREAKING CHANGE:, or appends a ! after the type/scope, introduces a breaking API change 
(correlating with MAJOR in Semantic Versioning). A BREAKING CHANGE can be part of commits of any type.
* types other than fix: and feat: are allowed, like build:, chore:, ci:, docs:, style:, refactor:, perf:, test:, and others.
* footers other than BREAKING CHANGE: `description` may be provided and follow a convention similar to git trailer format.

Additional types are not mandated by the Conventional Commits specification, and have no implicit effect in Semantic Versioning 
(unless they include a BREAKING CHANGE). A scope may be provided to a commit’s type, to provide additional contextual information and 
is contained within parenthesis, e.g., `feat(parser): add ability to parse arrays`.

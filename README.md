![Jyv](http://jyv.s3-website-us-east-1.amazonaws.com/jyv-logo.png)

[![Build Status](https://travis-ci.com/GUSCRAWFORD/jyv.svg?branch=master)](https://travis-ci.com/GUSCRAWFORD/jyv)
[![Maintainability](https://api.codeclimate.com/v1/badges/4ed8f46f4aa08e1ee410/maintainability)](https://codeclimate.com/github/GUSCRAWFORD/jyv/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/4ed8f46f4aa08e1ee410/test_coverage)](https://codeclimate.com/github/GUSCRAWFORD/jyv/test_coverage)

# Out-of-the-box Generic Repo and Pre-configured Middleware for NodeJS / Express

## Common Usage

# Developer Setup

## First Setup

1. `yarn install`
   1. Installs sub-project dependencies
   2. Builds sub-projects
2. If you wish to use integrated code-coverage reporting with [Mocha Sidebar](https://marketplace.visualstudio.com/items?itemName=maty.vscode-mocha-sidebar) on OSX:
   1. `cd test && yarn fix-mocha-sidebar-coverage` will add the [needed execute permissions](https://github.com/maty21/mocha-sidebar/issues/167)
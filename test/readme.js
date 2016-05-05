'use strict';
var path = require('path');
var assert = require('yeoman-assert');
var helpers = require('yeoman-generator').test;

describe('node:readme', function () {
  before(function (done) {
    helpers.run(path.join(__dirname, '../generators/readme'))
      .withOptions({
        name: 'my-project',
        description: 'a cool project',
        githubAccount: 'yeoman',
        authorName: 'Yeoman',
        authorUrl: 'http://yeoman.io',
        coveralls: true
      })
      .on('ready', function (gen) {
        gen.fs.writeJSON(gen.destinationPath('package.json'), {
          license: 'MIT'
        });
      })
      .on('end', done);
  });

  it('creates and fill contents in README.md', function () {
    assert.file('README.md');
    assert.fileContent('README.md', '> a cool project');
    assert.fileContent('README.md', 'MIT © [Yeoman](http://yeoman.io)');
  });
});

describe('node:readme --content', function () {
  before(function (done) {
    helpers.run(path.join(__dirname, '../generators/readme'))
      .withOptions({
        name: 'my-project',
        description: 'a cool project',
        githubAccount: 'yeoman',
        authorName: 'Yeoman',
        authorUrl: 'http://yeoman.io',
        coveralls: true,
        content: 'My custom content'
      })
      .on('ready', function (gen) {
        gen.fs.writeJSON(gen.destinationPath('package.json'), {
          license: 'MIT'
        });
      })
      .on('end', done);
  });

  it('fill custom contents in README.md', function () {
    assert.file('README.md');
    assert.fileContent('README.md', 'MIT © [Yeoman](http://yeoman.io)');
  });
});

describe('node:readme --no-coveralls', function () {
  before(function (done) {
    helpers.run(path.join(__dirname, '../generators/readme'))
      .withOptions({
        name: 'my-project',
        description: 'a cool project',
        githubAccount: 'yeoman',
        authorName: 'Yeoman',
        authorUrl: 'http://yeoman.io',
        coveralls: false
      })
      .on('ready', function (gen) {
        gen.fs.writeJSON(gen.destinationPath('package.json'), {
          license: 'MIT'
        });
      })
      .on('end', done);
  });

  it('does not include coveralls badge README.md', function () {
    assert.noFileContent('README.md', 'coveralls');
  });
});

describe('node:readme --generate-into', function () {
  before(function (done) {
    helpers.run(path.join(__dirname, '../generators/readme'))
      .withOptions({
        name: 'my-project',
        description: 'a cool project',
        githubAccount: 'yeoman',
        authorName: 'Yeoman',
        authorUrl: 'http://yeoman.io',
        coveralls: true,
        generateInto: 'other/'
      })
      .on('ready', function (gen) {
        gen.fs.writeJSON(gen.destinationPath('other/package.json'), {
          license: 'MIT'
        });
      })
      .on('end', done);
  });

  it('creates and fill contents in README.md', function () {
    assert.file('other/README.md');
    assert.fileContent('other/README.md', '> a cool project');
    assert.fileContent('other/README.md', 'MIT © [Yeoman](http://yeoman.io)');
  });
});

describe('node:readme --content and --generate-into', function () {
  before(function (done) {
    helpers.run(path.join(__dirname, '../generators/readme'))
      .withOptions({
        name: 'my-project',
        description: 'a cool project',
        githubAccount: 'yeoman',
        authorName: 'Yeoman',
        authorUrl: 'http://yeoman.io',
        coveralls: true,
        content: 'My custom content',
        generateInto: 'other/'
      })
      .on('ready', function (gen) {
        gen.fs.writeJSON(gen.destinationPath('other/package.json'), {
          license: 'MIT'
        });
      })
      .on('end', done);
  });

  it('fill custom contents in README.md', function () {
    assert.file('other/README.md');
    assert.fileContent('other/README.md', 'MIT © [Yeoman](http://yeoman.io)');
  });
});

describe('node:readme --no-coveralls and --generate-into', function () {
  before(function (done) {
    helpers.run(path.join(__dirname, '../generators/readme'))
      .withOptions({
        name: 'my-project',
        description: 'a cool project',
        githubAccount: 'yeoman',
        authorName: 'Yeoman',
        authorUrl: 'http://yeoman.io',
        coveralls: false,
        generateInto: 'other/'
      })
      .on('ready', function (gen) {
        gen.fs.writeJSON(gen.destinationPath('other/package.json'), {
          license: 'MIT'
        });
      })
      .on('end', done);
  });

  it('does not include coveralls badge README.md', function () {
    assert.noFileContent('other/README.md', 'coveralls');
  });
});

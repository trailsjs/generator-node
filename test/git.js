'use strict';
var path = require('path');
var assert = require('yeoman-assert');
var helpers = require('yeoman-generator').test;

describe('node:git', function () {
  before(function (done) {
    helpers.run(path.join(__dirname, '../generators/git'))
      .withOptions({
        repositoryPath: 'yeoman/generator-node'
      })
      .on('end', done);
  });

  it('creates .gitignore', function () {
    assert.file('.gitignore');
  });

  it('initialize git repository', function () {
    assert.file('.git');
  });
});

describe('node:git', function () {
  before(function (done) {
    helpers.run(path.join(__dirname, '../generators/git'))
      .withOptions({
        repositoryPath: 'yeoman/generator-node',
        generateInto: 'other/'
      })
      .on('end', done);
  });

  it('creates .gitignore with generate-into option', function () {
    assert.file('other/.gitignore');
  });


});

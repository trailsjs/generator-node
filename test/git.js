'use strict';
var path = require('path');
var assert = require('yeoman-assert');
var helpers = require('yeoman-test');

describe('node:git', function () {
  before(function () {
    return helpers.run(path.join(__dirname, '../generators/git'))
      .withOptions({
        repositoryPath: 'yeoman/generator-node'
      })
      .toPromise();
  });

  it('creates .gitignore', function () {
    assert.file('.gitignore');
  });

  it('initialize git repository', function () {
    assert.file('.git');
  });
});

describe('node:git', function () {
  before(function () {
    return helpers.run(path.join(__dirname, '../generators/git'))
      .withOptions({
        repositoryPath: 'yeoman/generator-node',
        generateInto: 'other/'
      })
      .toPromise();
  });

  it('creates .gitignore with generate-into option', function () {
    assert.file('other/.gitignore');
  });


});

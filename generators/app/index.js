'use strict';
var _ = require('lodash');
var extend = _.merge;
var generators = require('yeoman-generator');
var parseAuthor = require('parse-author');
var githubUsername = require('github-username');
var path = require('path');
var askName = require('inquirer-npm-name');

module.exports = generators.Base.extend({
  constructor: function () {
    generators.Base.apply(this, arguments);

    this.option('travis', {
      type: Boolean,
      required: false,
      defaults: true,
      desc: 'Include travis config'
    });

    this.option('boilerplate', {
      type: Boolean,
      required: false,
      defaults: true,
      desc: 'Include boilerplate files'
    });

    this.option('babel', {
      type: Boolean,
      required: false,
      desc: 'Compile ES2015 using Babel'
    });

    this.option('cli', {
      type: Boolean,
      required: false,
      defaults: false,
      desc: 'Add a CLI'
    });

    this.option('coveralls', {
      type: Boolean,
      required: false,
      desc: 'Include coveralls config'
    });

    this.option('gulp', {
      type: Boolean,
      required: false,
      defaults: true,
      desc: 'Include or not a gulpfile.js'
    });

    this.option('license', {
      type: Boolean,
      required: false,
      defaults: true,
      desc: 'Include a license'
    });

    this.option('name', {
      type: String,
      required: false,
      desc: 'Project name'
    });

    this.option('githubAccount', {
      type: String,
      required: false,
      desc: 'GitHub username or organization'
    });

    this.option('projectRoot', {
      type: String,
      required: false,
      defaults: 'lib',
      desc: 'Relative path to the project code root'
    });
  },

  initializing: function () {
    this.pkg = this.fs.readJSON(this.destinationPath('package.json'), {});

    // Pre set the default props from the information we have at this point
    this.props = {
      name: this.pkg.name,
      description: this.pkg.description,
      version: this.pkg.version,
      homepage: this.pkg.homepage,
      babel: Boolean(this.options.babel)
    };

    if (_.isObject(this.pkg.author)) {
      this.props.authorName = this.pkg.author.name;
      this.props.authorEmail = this.pkg.author.email;
      this.props.authorUrl = this.pkg.author.url;
    } else if (_.isString(this.pkg.author)) {
      var info = parseAuthor(this.pkg.author);
      this.props.authorName = info.name;
      this.props.authorEmail = info.email;
      this.props.authorUrl = info.url;
    }
  },

  prompting: {
    askForModuleName: function () {
      if (this.pkg.name || this.options.name) {
        this.props.name = this.pkg.name || _.kebabCase(this.options.name);
        return;
      }

      return askName({
        name: 'name',
        message: 'Module Name',
        default: path.basename(process.cwd()),
        filter: _.kebabCase,
        validate: function (str) {
          return str.length > 0;
        }
      }, this).then(function (answer) {
        this.props.name = answer.name;
      }.bind(this));
    },

    askFor: function () {
      var prompts = [{
        name: 'description',
        message: 'Description',
        when: !this.props.description
      }, {
        name: 'homepage',
        message: 'Project homepage url',
        when: !this.props.homepage
      }, {
        name: 'authorName',
        message: 'Author\'s Name',
        when: !this.props.authorName,
        default: this.user.git.name(),
        store: true
      }, {
        name: 'authorEmail',
        message: 'Author\'s Email',
        when: !this.props.authorEmail,
        default: this.user.git.email(),
        store: true
      }, {
        name: 'authorUrl',
        message: 'Author\'s Homepage',
        when: !this.props.authorUrl,
        store: true
      }, {
        name: 'keywords',
        message: 'Package keywords (comma to split)',
        when: !this.pkg.keywords,
        filter: function (words) {
          return words.split(/\s*,\s*/g);
        }
      }, {
        name: 'babel',
        type: 'confirm',
        message: 'Use es2015 (precompiled with Babel)',
        when: this.options.babel === undefined
      }, {
        name: 'includeCoveralls',
        type: 'confirm',
        message: 'Send coverage reports to coveralls',
        when: this.options.coveralls === undefined
      }];

      return this.prompt(prompts).then(function (props) {
        this.props = extend(this.props, props);
        _.merge(this.options.subgenerators, {
          node: this.props
        })
      }.bind(this));
    },

    askForGithubAccount: function () {
      if (this.options.githubAccount) {
        this.props.githubAccount = this.options.githubAccount;
        return;
      }

      return githubUsername(this.props.authorEmail)
        .then(function (username) {
          return username;
        }, function () {
          return '';
        })
        .then(function (username) {
          return this.prompt({
            name: 'githubAccount',
            message: 'GitHub username or organization',
            default: username
          }).then(function (prompt) {
            this.props.githubAccount = prompt.githubAccount;
          }.bind(this));
        }.bind(this));
    }
  },

  writing: function () {
    // Re-read the content at this point because a composed generator might modify it.
    var currentPkg = this.fs.readJSON(this.destinationPath('package.json'), {});

    var pkg = extend({
      name: _.kebabCase(this.props.name),
      version: '0.0.0',
      description: this.props.description || 'A new Trails.js Application',
      homepage: this.props.homepage || 'http://trailsjs.io',
      author: {
        name: this.props.authorName || 'Trails',
        email: this.props.authorEmail || 'hello@trailsjs.io',
        url: this.props.authorUrl || 'https://github.com/trailsjs'
      },
      main: this.props.babel ? 'dist/index.js' : path.join(
        this.options.projectRoot,
        'index.js'
      ).replace(/\\/g, '/'),
      keywords: []
    }, currentPkg);

    // Combine the keywords
    if (this.props.keywords) {
      pkg.keywords = _.uniq(this.props.keywords.concat(pkg.keywords));
    }

    // Let's extend package.json so we're not overwriting user previous fields
    this.fs.writeJSON(this.destinationPath('package.json'), pkg);
  },

  default: function () {
    if (this.options.travis) {
      this.composeWith('travis', {}, {
        local: require.resolve('generator-travis/generators/app')
      });
    }

    this.composeWith('node:editorconfig', {}, {
      local: require.resolve('../editorconfig')
    });

    if (this.options.eslint !== false) {
      this.composeWith('node:eslint', {
        options: {
          es2015: this.props.babel
        }
      }, {
        local: require.resolve('../eslint')
      });
    }

    this.composeWith('node:git', {
      options: {
        name: this.props.name,
        githubAccount: this.props.githubAccount
      }
    }, {
      local: require.resolve('../git')
    });

    if (this.options.gulp) {
      this.composeWith('node:gulp', {
        options: {
          coveralls: this.props.includeCoveralls,
          babel: this.props.babel,
          projectRoot: this.options.projectRoot,
          cli: this.options.cli
        }
      }, {
        local: require.resolve('../gulp')
      });
    }

    if (this.options.boilerplate) {
      this.composeWith('node:boilerplate', {
        options: {
          name: this.props.name,
          babel: this.props.babel
        }
      }, {
        local: require.resolve('../boilerplate')
      });
    }

    if (this.options.cli) {
      this.composeWith('node:cli', {
        options: {
          babel: this.props.babel
        }
      }, {
        local: require.resolve('../cli')
      });
    }

    if (this.options.license && !this.pkg.license) {
      this.composeWith('license', {
        options: {
          name: this.props.authorName,
          email: this.props.authorEmail,
          website: this.props.authorUrl
        }
      }, {
        local: require.resolve('generator-license/app')
      });
    }
  },

  installing: function () {
    this.npmInstall();
  }
});

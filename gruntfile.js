'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({

    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      gruntfile: {
        src: 'gruntfile.js'
      },
      lib: {
        src: ['lib/**/*.js'],
      },
      test: {
        src: ['test/**/*.js'],
      },
    },

    simplemocha: {
      options: {
        timeout: 5000,
        slow: 5000,
        ignoreLeaks: false,
        ui: 'bdd',
        reporter: 'spec',
        path: 'test'
      },
      test: {
        src: '<%= jshint.test.src %>'
      },
    },

    watch: {
      gruntfile: {
        files: '<%= jshint.gruntfile.src %>',
        tasks: ['jshint:gruntfile'],
      },
      lib: {
        files: ['<%= jshint.lib.src %>'],
        tasks: ['jshint:lib','test'],
      },
      test: {
        files: ['<%= jshint.test.src %>'],
        tasks: ['jshint:test', 'test'],
      },
    },

  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-simple-mocha');

  grunt.registerTask('test', ['jshint', 'simplemocha:test']);
  grunt.registerTask('default', ['test']);

};

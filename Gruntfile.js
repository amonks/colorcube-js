module.exports = function(grunt) {
  grunt.initConfig({

    'clean': {
      src: ["dist"]
    },

    'babel': {
      options: {
        sourceMap: true
      },
      dist: {
        files: {
          'dist/colorcube.js': 'src/colorcube.js'
        }
      }
    },

    'uglify': {
      js: {
        options: {
          sourceMap: true,
          sourceMapIncludeSources: true,
          sourceMapIn: 'dist/colorcube.js.map', // input sourcemap from a previous compilation
          banner: '/* ' + grunt.file.read('LICENSE.md') + ' */'
        },
        files: {
          'dist/colorcube.min.js': 'dist/colorcube.js',
          // 'dist/colorcube.es6.min.js': 'dist/colorcube.es6.js'
        }
      }
    },

  });


  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-babel');


  grunt.registerTask('cleanup', [
    'clean',
  ]);

  grunt.registerTask('build', [
    'cleanup',
    'babel',
    'uglify:js',
  ]);
  grunt.registerTask('default', [
    'build'
  ]);
};

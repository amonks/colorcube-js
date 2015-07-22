module.exports = function(grunt) {
  grunt.initConfig({

    'clean': {
      src: ["dist"]
    },

    'concat': {
      js: {
        src: ['src/canvasimage.js', 'src/colorcube.js', 'src/cubecell.js', 'src/localmaximum.js'],
        dest: 'dist/colorcube.es6.js',
      },
    },

    'babel': {
      options: {
        sourceMap: true
      },
      dist: {
        files: {
          'dist/colorcube.js': 'dist/colorcube.es6.js'
        }
      }
    },

    'uglify': {
      js: {
        options: {
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
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-babel');


  grunt.registerTask('cleanup', [
    'clean',
  ]);

  grunt.registerTask('build', [
    'cleanup',
    'concat:js',
    'babel',
    'uglify:js',
  ]);
  grunt.registerTask('default', [
    'build'
  ]);
};

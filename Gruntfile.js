module.exports = function(grunt) {

    // TODO: platforms shouldn't be hardcoded here
    var platforms = ['win64'];

    // Build up array of destinations for Twister deamon files
    var destinations = {files: []};
    platforms.forEach(function (platform) {
        destinations.files.push({
                expand: true,
                src: ['./twister-data/**'],
                dest: './builds/Twisting/' + platform + '/'
        });
    });

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        nodewebkit: {
            options: {
                platforms: platforms,
                buildDir: './builds'
            },
            src: ['./src/**/*', '!./src/twister-data/**/*', '!./src/*.exe', '!./src/*.pak', '!./src/*.dll']
        },
        copy: {
            twister: destinations
        },
        less: {
            development: {
                files: {
                    "./src/app/styles/style.css": "./src/app/styles/main.less"
                }
            }
        },
        auto_install: {
            subdir: {
                options: {
                    cwd: 'src',
                    stdout: true,
                    stderr: true,
                    failOnError: true,
                }
            }
        },
    });

    grunt.loadNpmTasks('grunt-node-webkit-builder');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-auto-install');

    grunt.registerTask('build', ['less', 'nodewebkit', 'copy:twister']);
    grunt.registerTask('compile', ['less']);
    grunt.registerTask('postinstall', ['auto_install']);
};

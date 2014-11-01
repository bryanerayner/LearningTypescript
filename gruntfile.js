module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        ts:{
            angularDemo: {
                src: 'src/scripts/graphTraversalDemo/angularDemo/demo.ts',
                out: 'src/scripts/graphTraversalDemo/angularDemo/demo.js',
                watch: 'src/scripts/graphTraversalDemo'
            },
            graph:{
                src: 'src/scripts/graphTraversalDemo/Graph.ts',
                out: 'src/scripts/graphTraversalDemo/Graph.js',
                watch: 'src/scripts/graphTraversalDemo'
            }
        },
        watch: {
            files: ['src/scripts'],
            tasks: ['ts']
        }
    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-ts');


    grunt.registerTask('default', ['ts', 'watch']);

};

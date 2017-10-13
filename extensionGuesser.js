#!/usr/bin/env node
'use strict';
var fs = require('fs');
var path = require('path');
var yargs = require('yargs');

function parseArguments(args) {
    var argv = yargs
        .usage('Usage: $0 -i inputPath')
        .example('$0 -i path/to/folder')
        .help('h')
        .alias('h', 'help')
        .options({
            'input': {
                alias: 'i',
                describe: 'input=PATH',
                normalize: true,
                type: 'string'
            }
        }).parse(args);

    var inputPath = argv.i;
    var outputPath = argv.o;

    if (!inputPath) {
        yargs.showHelp();
        return;
    }

    return {
        inputPath: inputPath
    };
}


function examineFile(inputPath, inputFile) {
    var fileContents = fs.readFileSync(path.join(inputPath, inputFile));
    var len = fileContents.length;
    var encoding = 'utf8';
    var targetExtension;
    var partial = fileContents.slice(0, 10);

    if (len > 10) {
        // FF D8 FF E0
        if (partial[0] === 0xFF && partial[1] === 0xD8 && partial[2] === 0xFF /*&& partial[3] === 0xE0*/) {
            targetExtension = 'jpg';
        } else if (partial.toString(encoding, 6, 10) === 'Exif') {
            targetExtension = 'jpg';
        } else if (partial.toString(encoding, 6, 10) === 'JFIF') {
            targetExtension = 'jpg';
        } else if (partial.toString(encoding, 1, 4) === 'PNG') {
            targetExtension = 'png';
        } else if (partial.toString(encoding, 0, 4) === 'GIF8') {
            targetExtension = 'gif';
        } else if (partial.toString(encoding, 0, 5) === '<?xml') {
            targetExtension = 'xml';
        } else {
            //debugger;
        }

        if (targetExtension) {
            var newName = inputFile.substring(0, 16) + '.' + targetExtension;
            console.log('Rename to ' + newName);
            fs.renameSync(path.join(inputPath, inputFile), path.join(inputPath, newName));
        }
    } else if (len > 0) {
        console.log('File too short.');
    } else {
        console.log('File is empty.');
    }
}

function main() {
    var args = process.argv;
    args = args.slice(2, args.length);
    var options = parseArguments(args);

    if (!options) {
        return;
    }

    var inputPath = options.inputPath;

    var files = fs.readdirSync(inputPath);
    files.forEach(function(file) {
        if (file.indexOf('.') === -1) {
            console.log(file);
            examineFile(inputPath, file);
        }
    });

    console.log('Done!');
}

main();

"use strict";

const [,,cmd] = process.argv;
const args = process.argv.splice(3);

exports.command = cmd;
exports.getArgument = function getArgument(name){
    const formatedName = `--${name}`;
    const index = args.indexOf(formatedName);
    if(index >= 0){
        if(index+1 < args.length){
            const nextValue = args[index+1];
            if(!nextValue.startsWith('--')){
                return nextValue;
            }
        }
        return true;
    }
    return false;
}
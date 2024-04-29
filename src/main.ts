import Parser from "./frontend/parser";
import { createGlobalEnv } from "./runtime/environment";
import { evaluate } from "./runtime/interpreter";
import { readFileSync } from 'fs';

const args = process.argv;
args.shift(); args.shift();

const file = args.shift();
if (file) {
    run(file);
} else {
    repl();
}

async function run(filename: string) {
    const parser = new Parser();
    const env = createGlobalEnv();

    const input = readFileSync(filename, 'utf-8') + "\nfinishExit()";
    const program = parser.produceAST(input);

    try {
        evaluate(program, env);
    } catch(err) {
        if (err == "Cannot resolve 'finishExit' as it does not exist.") process.exit(1);
        
        console.log(err)
    }
}

async function repl() {
    const readLine = await import('readline/promises');

    const parser = new Parser();
    const env = createGlobalEnv();

    const rl = readLine.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    console.log("\nRepl v1.0");

    while (true) {
        const input = await rl.question("> ");

        if (!input || input.includes("exit")) {
            process.exit(1);
        }

        const program = parser.produceAST(input);

        try {
            const result = evaluate(program, env);
            console.log(result);
        } catch(err) {
            console.log(err);
        }
    }
}
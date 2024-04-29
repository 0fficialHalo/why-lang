// deno-lint-ignore-file no-unused-vars
import { RuntimeVal, NumberVal, MK_NULL, InternalVal, StringVal } from "./values";
import { AssignmentExpr, BinaryExpr, CallExpr, FuncDeclaration, Identifier, NumericLiteral, ObjectLiteral, Program, Stmt, StringLiteral, VarDeclaration } from "../frontend/ast";
import Environment from "./environment";
import { eval_identifier, eval_binary_expr, eval_assignment, eval_object_expr, eval_call_expr } from "./eval/expressions";
import { eval_func_declaration, eval_program, eval_var_declaration } from "./eval/statements";

export function evaluate(astNode: Stmt, env: Environment): RuntimeVal {
    switch (astNode.kind) {
        case "NumericLiteral":
            return { 
                value: (astNode as NumericLiteral).value, 
                type: "number" 
            } as NumberVal;

        case "StringLiteral":
            return {
                value: (astNode as StringLiteral).value,
                type: "string",
            } as StringVal
        
        case "Identifier":
            return eval_identifier(astNode as Identifier, env);

        case "ObjectLiteral":
            return eval_object_expr(astNode as ObjectLiteral, env);

        case "CallExpr":
            return eval_call_expr(astNode as CallExpr, env);

        case "AssignmentExpr":
            return eval_assignment(astNode as AssignmentExpr, env);

        case "BinaryExpr":
            return eval_binary_expr(astNode as BinaryExpr, env);

        case "Program":
            return eval_program(astNode as Program, env);

        case "VarDeclaration":
            return eval_var_declaration(astNode as VarDeclaration, env);

        case "FuncDeclaration":
            return eval_func_declaration(astNode as FuncDeclaration, env);

        default:
            console.error("This AST Node has not yet been setup for interpretation.", astNode);
            process.exit(0);
    }
}
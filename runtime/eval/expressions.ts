import { AssignmentExpr, BinaryExpr, CallExpr, Identifier, ObjectLiteral } from "../../frontend/ast.ts";
import Environment from "../environment.ts";
import { evaluate } from "../interpreter.ts";
import { NumberVal, RuntimeVal, MK_NULL, ObjectVal, InternalVal, FunctionValue, MK_NUMBER, MK_BOOL } from "../values.ts";

function eval_numeric_binary_expr(lhs: NumberVal, rhs: NumberVal, operator: string): RuntimeVal {
    switch (operator) {
        case "+":
            return MK_NUMBER(lhs.value + rhs.value);
        case "-":
            return MK_NUMBER(lhs.value - rhs.value);;
        case "*":
            return MK_NUMBER(lhs.value * rhs.value);
        case "/":
            return MK_NUMBER(lhs.value / rhs.value);
        case "%":
            return MK_NUMBER(lhs.value % rhs.value);
        case ">":
            return MK_BOOL(lhs.value > rhs.value);
        case ">=":
            return MK_BOOL(lhs.value >= rhs.value);
        case "<":
            return MK_BOOL(lhs.value < rhs.value);
        case "<=":
            return MK_BOOL(lhs.value <= rhs.value);
        case "==":
            return MK_BOOL(lhs.value == rhs.value);
        case "!=":
            return MK_BOOL(lhs.value != rhs.value);
        
        default:
            throw "Unknown operator method provided"
    }
}

export function eval_binary_expr(binop: BinaryExpr, env: Environment): RuntimeVal {
    const lhs = evaluate(binop.left, env);
    const rhs = evaluate(binop.right, env);

    if (lhs.type == "number" && rhs.type == "number") {
        return eval_numeric_binary_expr(lhs as NumberVal, rhs as NumberVal, binop.operator);
    } else {
        return MK_NULL();
    }
}

export function eval_identifier(ident: Identifier, env: Environment): RuntimeVal {
    const val = env.lookupVar(ident.symbol);
    return val;
}

export function eval_assignment(node: AssignmentExpr, env: Environment): RuntimeVal {
    if (node.assigne.kind != "Identifier")
        throw `Invalid assignment expression ${JSON.stringify(node.assigne)}`

    const varName = (node.assigne as Identifier).symbol
    return env.assignVar(varName, evaluate(node.value, env));
}

export function eval_object_expr(obj: ObjectLiteral, env: Environment): RuntimeVal {
    const object = { type: "object", properties: new Map() } as ObjectVal;

    for (const { key, value } of obj.properties) {
        const runtimeVal = (value == undefined) ? env.lookupVar(key) : evaluate(value, env);

        object.properties.set(key, runtimeVal)
    }

    return object
}

export function eval_call_expr(expr: CallExpr, env: Environment): RuntimeVal {
    const args = expr.args.map((arg) => evaluate(arg, env));
    const fn = evaluate(expr.caller, env);

    if (fn.type == "internal") {
        const result = (fn as InternalVal).call(args, env);
        return result
    } 
    else if (fn.type == "function") {
        const func = fn as FunctionValue;
        const scope = new Environment(func.declarationEnv);

        for (let i = 0; i < func.parameters.length; i++) {
            const varName = func.parameters[i];
            scope.declareVar(varName, args[i], false);
        }

        let result: RuntimeVal = MK_NULL();
        for (const stmt of func.body) {
            result = evaluate(stmt, scope);
        }

        return result;
    }
    
    throw `Cannot call value that is not a function: ` + JSON.stringify(fn);

}
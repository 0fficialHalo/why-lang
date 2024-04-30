import { Stmt } from "../frontend/ast";
import Environment from "./environment";

export type ValueTypes = "null" | "number" | "boolean" | "object" | "internal" | "function" | "return" | "string" | "array";

export interface RuntimeVal {
    type: ValueTypes;
}

export interface NullVal extends RuntimeVal {
    type: "null";
    value: null;
}

export interface NumberVal extends RuntimeVal {
    type: "number";
    value: number;
}

export interface StringVal extends RuntimeVal {
    type: "string";
    value: string;
}

export interface BooleanVal extends RuntimeVal {
    type: "boolean";
    value: boolean;
}

export interface ArrayVal extends RuntimeVal {
    type: "array";
    values: RuntimeVal[];
}

export interface ObjectVal extends RuntimeVal {
    type: "object";
    properties: Map<string, RuntimeVal>;
}

export type FunctionCall = (args: RuntimeVal[], env: Environment) => RuntimeVal;
export interface InternalVal extends RuntimeVal {
    type: "internal";
    call: FunctionCall;
}

export interface FunctionValue extends RuntimeVal {
    type: "function";
    name: string;
    parameters: string[];
    declarationEnv: Environment;
    body: Stmt[];
}

export function MK_NUMBER(n = 0) {
    return{ type: "number", value: n } as NumberVal;
}

export function MK_NULL() {
    return{ type: "null", value: null } as NullVal;
}

export function MK_BOOL(b = true) {
    return{ type: "boolean", value: b } as BooleanVal;
}

export function MK_STRING(s = "") {
    return{ type: "string", value: s } as StringVal;
}

export function MK_INTERNAL(call: FunctionCall) {
    return{ type: "internal", call } as InternalVal;;
}
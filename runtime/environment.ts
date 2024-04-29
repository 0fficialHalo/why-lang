import { MK_BOOL, MK_INTERNAL, MK_NULL, MK_NUMBER, RuntimeVal } from "./values.ts";

export function createGlobalEnv() {
    const env = new Environment;
    // Default Global Variables

    env.declareVar("true", MK_BOOL(true), true);
    env.declareVar("false", MK_BOOL(false), true);
    env.declareVar("null", MK_NULL(), true);

    // Default Interanl Methods
    env.declareVar("print", MK_INTERNAL((args, _scope) => {
        console.log(...args);

        return MK_NULL();
    }), true)

    function timeFunc(_args: RuntimeVal[], _env: Environment) {
        return MK_NUMBER(Date.now())
    }

    env.declareVar("time", MK_INTERNAL(timeFunc), true)

    return env
}

export default class Environment {
    private parent?: Environment;
    private variables: Map<string, RuntimeVal>
    private constants: Set<string>;

    constructor(parentEnv?: Environment) {
        this.parent = parentEnv;
        this.variables = new Map();
        this.constants = new Set();
    }

    public declareVar(varName: string, value: RuntimeVal, constant: boolean): RuntimeVal {
        if (this.variables.has(varName)) {
            throw `Cannot declare variable '${varName}'. As it is already defined.`;
        }

        
        this.variables.set(varName, value);
        if (constant) 
            this.constants.add(varName)

        return value;
    }

    public assignVar(varName: string, value: RuntimeVal): RuntimeVal {
        const env = this.resolve(varName);
        if (env.constants.has(varName))
            throw `Cannot assign value to constant ${varName}`

        env.variables.set(varName, value);
        return value
    }

    public lookupVar(varName: string): RuntimeVal {
        const env = this.resolve(varName);
        return env.variables.get(varName) as RuntimeVal;
    }

    public resolve(varName: string): Environment {
        if (this.variables.has(varName))
            return this;

        if (this.parent == undefined)
            throw `Cannot resolve '${varName}' as it does not exist.`

        return this.parent.resolve(varName);
    }
}
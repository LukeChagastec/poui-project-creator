import typescriptEslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import noOnlyTests from "eslint-plugin-no-only-tests";

export default [{
    files: ["**/*.ts"],
}, {
    plugins: {
        "@typescript-eslint": typescriptEslint,
        "no-only-tests": noOnlyTests,
    },

    languageOptions: {
        parser: tsParser,
        ecmaVersion: 2022,
        sourceType: "module",
    },

    rules: {
        // "@typescript-eslint/naming-convention": ["warn", {
        //     selector: ["import"],
        //     format: ["camelCase", "PascalCase"],
        // }],

        curly: "warn",
        eqeqeq: "warn",
        "no-throw-literal": "warn",
        semi: "warn",
        "no-only-tests/no-only-tests": "error",
    },
}];

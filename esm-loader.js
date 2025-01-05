import path from "node:path";

export const resolve = (specifier, context, nextResolve) => {
  /**
   * Handle relative specifiers
   */
    if (specifier.startsWith("./") || specifier.startsWith("../")) {
      if (
        !(
          specifier.endsWith(".js") ||
          specifier.endsWith(".mjs") ||
          specifier.endsWith(".cjs")
        )
      ) {
        if (specifier.endsWith("/")) {
          const newSpecifier = specifier + "index.js";
          return nextResolve(newSpecifier, context);
        }
        const newSpecifier = specifier + ".js";
        return nextResolve(newSpecifier, context);
      }
    }

    /**
     * Handle custom specifiers
     */
    if (specifier.startsWith('@')) {
      if (specifier === '@web') {
        return nextResolve('file:///' + path.resolve(import.meta.dirname, "./dist/web/index.js"), context);
      } else if (specifier === '@utils') {
        return nextResolve('file:///' + path.resolve(import.meta.dirname, "./dist/utils/index.js"), context);
      } else if (specifier === '@pwn') {
        return nextResolve('file:///' + path.resolve(import.meta.dirname, "./dist/pwn/index.js"), context);
      } else {
        return nextResolve(specifier, context);
      }
    }
    return nextResolve(specifier, context);
  };
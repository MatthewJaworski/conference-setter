export interface PackageJson {
  name: string;
  version: string;
}

/**
 * The package.json is imported from outside the src directory, therefore it needs to be imported dynamically.
 * If it's imported statically (using regular `import`), the build will not have a main.js in the root of the dist folder.
 */
export function importPackageJson(): PackageJson {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('../../../package.json') as PackageJson;
}

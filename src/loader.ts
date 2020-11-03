import path from 'path';
import minimatch from 'minimatch';
import FunctionalAPI from './typings.d';

const ignorePaths = [
  '**/node_modules/**',
  '**/.git/**',
];

/**
 * resolve functions path
 * @param src - app src path.
 * @param route - function route.
 * @return Resolved path or null. */
function resolveFunctions(
  src: string,
  route: string,
): string | null {
  let functionPath = null;
  try {
    functionPath = require.resolve(path.join(src, route));
  } catch (err) { }
  return functionPath;
}

/**
 * get target function
 * @param src - app src path.
 * @param urlPath - function url path.
 * @return target's function or null. */
export function getTargetFunction(
  src: string,
  urlPath: string,
): FunctionalAPI.Function {
  const [route, target = 'default'] = urlPath.split(':');

  const functionPath = resolveFunctions(src, route);
  if (functionPath === null || ignorePaths.some(pattern => minimatch(functionPath, pattern))) {
    throw `function not found: '${route}'`;
  }

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const functionModule = require(functionPath);

  const targetFunction = target
    .split('.')
    .reduce((code, targetPart) => {
      if (typeof code === 'undefined') return code;
      return code?.[targetPart];
    }, functionModule);

  if (typeof targetFunction !== 'function') {
    throw `function '${route}' ${target}() is not defined`;
  }

  return targetFunction;
}

export function joinPaths(paths: string[]): string {
  if (!paths || paths.length === 0) {
    return '';
  }

  let joinedPath = paths[0];

  for (let i = 1; i < paths.length; i++) {
    // Объединяем пути
    joinedPath = `${joinedPath}/${paths[i]}`;
  }

  return joinedPath;
}

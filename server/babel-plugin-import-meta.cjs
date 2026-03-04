// Plugin local de Babel para transformar import.meta.url en entornos CommonJS (Jest).
// Cuando babel-jest transforma archivos ESM a CJS, import.meta.url queda sin traducir
// y Node.js lanza: SyntaxError: Cannot use 'import.meta' outside a module
//
// Este plugin convierte:
//   import.meta.url
// en su equivalente CommonJS:
//   require('url').pathToFileURL(__filename).toString()
//
// Requiere que @babel/plugin-syntax-import-meta esté instalado (ya está como dep transitiva).
// El archivo debe tener extensión .cjs porque package.json tiene "type": "module".

'use strict';

module.exports = function (babel) {
  const { types: t } = babel;

  return {
    name: 'transform-import-meta-url',
    visitor: {
      MetaProperty(nodePath) {
        const { node, parent, parentPath } = nodePath;

        // Solo manejar import.meta (no otros meta-properties futuros)
        if (node.meta.name !== 'import' || node.property.name !== 'meta') {
          return;
        }

        // Solo transformar cuando se accede a import.meta.url
        if (
          t.isMemberExpression(parent) &&
          !parent.computed &&
          t.isIdentifier(parent.property, { name: 'url' })
        ) {
          // Reemplazar import.meta.url por:
          // require('url').pathToFileURL(__filename).toString()
          parentPath.replaceWith(
            t.callExpression(
              t.memberExpression(
                t.callExpression(
                  t.memberExpression(
                    t.callExpression(t.identifier('require'), [t.stringLiteral('url')]),
                    t.identifier('pathToFileURL')
                  ),
                  [t.identifier('__filename')]
                ),
                t.identifier('toString')
              ),
              []
            )
          );
        }
      },
    },
  };
};

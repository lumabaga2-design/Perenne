const pkg = require('./package.json');

describe('Pruebas de configuración en package.json', () => {
  
  test('El proyecto debe tener un nombre y versión definidos', () => {
    expect(pkg.name).toBeDefined();
    expect(pkg.version).toBeDefined();
  });

  test('El script de test debe estar configurado para usar jest', () => {
    expect(pkg.scripts.test).toBe('jest');
  });

  test('Debe tener jest instalado en devDependencies', () => {
    expect(pkg.devDependencies).toHaveProperty('jest');
  });
});

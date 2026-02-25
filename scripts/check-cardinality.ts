import { SearchParameterRegistry } from '../packages/fhir-persistence/src/registry/search-parameter-registry.js';
import { readFileSync } from 'fs';

const reg = new SearchParameterRegistry();
const sp = JSON.parse(readFileSync('spec/fhir/r4/search-parameters.json', 'utf8'));
reg.indexBundle(sp);

console.log('=== Reference cardinality check ===');
for (const rt of ['Account', 'Contract', 'Provenance']) {
  const params = reg.getForResource(rt);
  for (const impl of params) {
    if (impl.code === 'patient' || impl.code === 'subject') {
      console.log(`${rt}.${impl.code}: columnType=${impl.columnType}, array=${impl.array}, expr="${impl.expression}"`);
    }
  }
}

console.log('\n=== Observation combo-value-quantity ===');
const obsParams = reg.getForResource('Observation');
for (const impl of obsParams) {
  if (impl.code === 'combo-value-quantity') {
    console.log(`Observation.${impl.code}: columnType=${impl.columnType}, array=${impl.array}, expr="${impl.expression}"`);
  }
}

console.log('\n=== Conformance version check ===');
for (const rt of ['ActivityDefinition', 'CapabilityStatement', 'CodeSystem', 'ValueSet', 'StructureDefinition']) {
  const params = reg.getForResource(rt);
  const versionParam = params.find((p: any) => p.code === 'version');
  if (versionParam) {
    console.log(`${rt}.version: columnType=${versionParam.columnType}, array=${versionParam.array}, strategy=${versionParam.strategy}`);
  } else {
    console.log(`${rt}.version: NOT FOUND`);
  }
}

console.log('\n=== Date type check ===');
for (const rt of ['Patient', 'Person', 'RelatedPerson']) {
  const params = reg.getForResource(rt);
  const bd = params.find((p: any) => p.code === 'birthdate');
  if (bd) {
    console.log(`${rt}.birthdate: columnType=${bd.columnType}, type=${bd.type}`);
  }
}

import { runAllSotho25TrappedPlayerTests } from './morabaraba.test';

const result = runAllSotho25TrappedPlayerTests();
for (const line of result.results) {
  console.log(line);
}
console.log(`\n${result.passed}/${result.total} tests passed`);
if (result.passed !== result.total) {
  process.exit(1);
}

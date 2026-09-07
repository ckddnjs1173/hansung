import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateBilling, roundDown, roundUp } from './payroll-engine.mjs';

test('Excel ROUNDUP/ROUNDDOWN의 십원 단위 규칙을 재현한다', () => {
  assert.equal(roundUp(12341, -1), 12350);
  assert.equal(roundDown(12349, -1), 12340);
});

test('실제 청구서 구조대로 공급가와 부가세를 계산한다', () => {
  const result = calculateBilling({ basePay:2300000, mealAllowance:200000, fixedOvertime:0, otherPay:0, incentive:0, standardDays:20, workedDays:20, overtimeHours:0, holidayHours:0, nightHours:0, extraBilling:0, deduction:0 }, { health:0.03595, longTermCare:0.1314, industrialAccident:0.009, employment:0.0115, wageClaim:0.0006, businessTax:0.005, disabilityFixed:66860, profit:0.047 });
  assert.equal(result.vat, Math.trunc(result.supplyAmount * 0.1));
  assert.equal(result.totalAmount, result.supplyAmount + result.vat);
});

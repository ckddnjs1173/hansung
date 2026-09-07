export function roundUp(value, digits = 0) {
  const unit = 10 ** -digits;
  return Math.ceil(value / unit) * unit;
}

export function roundDown(value, digits = 0) {
  const unit = 10 ** -digits;
  return Math.floor(value / unit) * unit;
}

export function calculateBilling(input, rates) {
  const ordinaryHourly = roundUp((input.basePay + input.mealAllowance) / 209, -1);
  const baseCurrent = Math.round((input.workedDays / input.standardDays) * input.basePay);
  const mealCurrent = Math.round((input.workedDays / input.standardDays) * input.mealAllowance);
  const overtimePremium = ordinaryHourly * 1.5 * input.overtimeHours;
  const holidayPremium = ordinaryHourly * 1.5 * input.holidayHours;
  const nightPremium = ordinaryHourly * 0.5 * input.nightHours;
  const payrollTotal = baseCurrent + mealCurrent + input.fixedOvertime + input.otherPay + overtimePremium + holidayPremium + nightPremium;
  const insuranceBase = Math.max(0, payrollTotal + input.incentive - Math.min(mealCurrent, 200000));
  const health = roundDown(insuranceBase * rates.health, -1);
  const longTermCare = roundDown(health * rates.longTermCare, -1);
  const industrialAccident = roundDown(insuranceBase * rates.industrialAccident, -1);
  const employment = roundDown(insuranceBase * rates.employment, -1);
  const wageClaim = roundDown(insuranceBase * rates.wageClaim, -1);
  const businessTax = roundDown(insuranceBase * rates.businessTax, -1);
  const disability = input.workedDays >= 16 ? rates.disabilityFixed : 0;
  const indirectTotal = health + longTermCare + industrialAccident + employment + wageClaim + businessTax + disability;
  const welfareCost = Math.round((input.workedDays / input.standardDays) * 10000);
  const profit = roundUp((baseCurrent + mealCurrent + input.fixedOvertime) * rates.profit, -1);
  const supplyAmount = roundDown(payrollTotal + indirectTotal + welfareCost + profit + input.extraBilling - input.deduction, -1);
  const vat = Math.trunc(supplyAmount * 0.1);
  return { ordinaryHourly, baseCurrent, mealCurrent, overtimePremium, holidayPremium, nightPremium, payrollTotal, health, longTermCare, industrialAccident, employment, wageClaim, businessTax, disability, indirectTotal, welfareCost, profit, supplyAmount, vat, totalAmount: supplyAmount + vat };
}

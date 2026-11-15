(() => {
  const calculator = document.getElementById('identity-calculator');
  if (!calculator) return;

  const province = calculator.querySelector('[data-province]');
  const birth = calculator.querySelector('[data-birth]');
  const timestamp = calculator.querySelector('[data-timestamp]');
  const result = calculator.querySelector('[data-result]');
  const baseDate = Date.UTC(1900, 0, 1);
  const maxDays = 36 ** 4 - 1;

  calculator.querySelector('[data-generate]').addEventListener('click', () => {
    result.removeAttribute('data-valid');
    if (!province.value) {
      result.textContent = '请选择省级登记地区。';
      return;
    }
    const days = (birth.valueAsNumber - baseDate) / 86400000;
    if (!birth.validity.valid || !Number.isInteger(days) || days < 0 || days > maxDays) {
      result.textContent = '请输入有效的出生日期。';
      return;
    }
    const input = timestamp.value.trim();
    const time = input ? Number(input) : Date.now();
    if ((input && !/^-?[0-9]+$/.test(input)) || !Number.isSafeInteger(time)) {
      result.textContent = '请输入有效的 Unix 毫秒时间戳。';
      return;
    }

    const dateCode = days.toString(36).toUpperCase().padStart(4, '0');
    const birthNumber = Number(birth.value.replace(/-/g, ''));
    const serial = ((birthNumber + time % 10000) % 10000 + 10000) % 10000;
    const random = new Uint8Array(1);
    do {
      crypto.getRandomValues(random);
    } while (random[0] >= 252);
    const suffix = (random[0] % 36).toString(36).toUpperCase();
    result.textContent = province.value + dateCode + String(serial).padStart(4, '0') + suffix;
    result.setAttribute('data-valid', '');
  });
})();

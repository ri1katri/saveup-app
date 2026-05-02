export const calculateProgress = (mainSavings, microSavings, targetAreaM2, totalPriceRub) => {
  // Защита от ошибок, если данные еще не загрузились
  if (!targetAreaM2 || !totalPriceRub) return null;

  const totalAreaCm2 = targetAreaM2 * 10000;
  const pricePerCm2 = totalPriceRub / totalAreaCm2;
  
  const totalSaved = mainSavings + microSavings;
  const purchasedCm2 = totalSaved / pricePerCm2;
  const purchasedM2 = purchasedCm2 / 10000;
  
  return {
    totalSaved,
    purchasedCm2: Math.floor(purchasedCm2),
    purchasedM2: purchasedM2.toFixed(4),
    percentComplete: ((totalSaved / totalPriceRub) * 100).toFixed(2),
    targetAreaM2,
    totalPriceRub
  };
};
export function doSomethingWithProbability(chance) {
    const probability = chance;
    const randomValue = Math.random();
      
    if (randomValue < probability) {
      return true;
    } else {
      return false;
    }
  }

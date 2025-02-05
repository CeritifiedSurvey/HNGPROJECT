const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5050;

app.use(cors());

// Utility function: Check if a number is an Armstrong number.
function isArmstrong(num) {
  // Convert to string and remove any minus sign or decimal point.
  const digits = Math.abs(num).toString().replace('.', '').split('').map(Number);
  const power = digits.length;
  const sum = digits.reduce((acc, digit) => acc + Math.pow(digit, power), 0);
  return Math.abs(num) === sum;
}

// Utility function: Check if a number is prime.
function isPrime(num) {
  // Negative numbers, 0, and 1 are not prime.
  if (num <= 1 || !Number.isInteger(num)) return false;
  const absNum = Math.abs(num);
  for (let i = 2, limit = Math.sqrt(absNum); i <= limit; i++) {
    if (absNum % i === 0) return false;
  }
  return true;
}

// Retrieve a fun fact about the number with a timeout of 5000ms.
async function getFunFact(num) {
  try {
    const response = await axios.get(`http://numbersapi.com/${num}/math`, { timeout: 5000 });
    return response.data;
  } catch (error) {
    // If there is an error (timeout or otherwise), return a default message.
    return "No fun fact available.";
  }
}

app.get("/api/classify-number", async (req, res) => {
  let { number } = req.query;
  
  // Parse the number using parseFloat to allow negative and floating values.
  const parsedNumber = parseFloat(number);
  if (isNaN(parsedNumber)) {
    return res.status(400).json({ number, error: true });
  }
  
  // Determine properties.
  const properties = [];
  if (isArmstrong(parsedNumber)) properties.push("armstrong");
  properties.push(parsedNumber % 2 === 0 ? "even" : "odd");

  // Calculate the sum of digits (ignoring the minus sign and decimal point).
  const digitSum = Math.abs(parsedNumber)
    .toString()
    .replace('.', '')
    .split('')
    .reduce((sum, digit) => sum + parseInt(digit), 0);
    
  // Get fun fact with timeout.
  const funFact = await getFunFact(parsedNumber);
  
  // Build the response object.
  const result = {
    number: parsedNumber,
    is_prime: isPrime(parsedNumber),
    is_perfect: [6, 28, 496, 8128, 33550336].includes(Math.abs(parsedNumber)), // Example perfect numbers check.
    properties,
    digit_sum: digitSum,
    fun_fact: funFact
  };

  res.status(200).json(result);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

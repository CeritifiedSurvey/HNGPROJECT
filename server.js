const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5050;

app.use(cors());

// Utility: Check if a number is an Armstrong number.
// This function works for integers. For non-integer values, it won't be Armstrong.
function isArmstrong(num) {
  // Armstrong numbers are only defined for non-negative integers.
  if (!Number.isInteger(num) || num < 0) return false;
  const strNum = num.toString();
  const digits = strNum.split('').map(Number);
  const power = digits.length;
  const sum = digits.reduce((acc, digit) => acc + Math.pow(digit, power), 0);
  return num === sum;
}

// Utility: Check if a number is prime (only for positive integers > 1).
function isPrime(num) {
  if (num <= 1 || !Number.isInteger(num)) return false;
  for (let i = 2, limit = Math.sqrt(num); i <= limit; i++) {
    if (num % i === 0) return false;
  }
  return true;
}

// Retrieve a fun fact about the number with a timeout to avoid long delays.
async function getFunFact(num) {
  try {
    const response = await axios.get(`http://numbersapi.com/${num}/math`, { timeout: 5000 });
    return response.data;
  } catch (error) {
    return "No fun fact available.";
  }
}

app.get("/api/classify-number", async (req, res) => {
  const { number } = req.query;
  
  // Parse the number using parseFloat to support negative and floating-point values.
  const parsedNumber = parseFloat(number);
  
  // Check if the input is a valid number; if not, return 400.
  if (isNaN(parsedNumber)) {
    return res.status(400).json({ number, error: true });
  }
  
  // Build the properties array: include "armstrong" if applicable, and always add "odd" or "even".
  const properties = [];
  // Only check for Armstrong if the number is a non-negative integer.
  if (isArmstrong(Math.abs(parsedNumber))) {
    properties.push("armstrong");
  }
  properties.push(parsedNumber % 2 === 0 ? "even" : "odd");

  // Calculate the sum of digits (ignore '-' and '.').
  const digitSum = Math.abs(parsedNumber)
    .toString()
    .replace('.', '')
    .split('')
    .reduce((sum, digit) => sum + parseInt(digit, 10), 0);

  // Retrieve a fun fact (with timeout protection).
  const funFact = await getFunFact(parsedNumber);

  const result = {
    number: parsedNumber,
    is_prime: isPrime(parsedNumber),
    is_perfect: [6, 28, 496, 8128, 33550336].includes(Math.abs(parsedNumber)),
    properties, // Only "armstrong" (if applicable) and "odd" or "even"
    digit_sum: digitSum,
    fun_fact: funFact
  };

  res.status(200).json(result);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5050;

app.use(cors());

// Utility: Checks if a number is an Armstrong number.
function isArmstrong(num) {
  // Use the absolute value and treat the number as a string
  const strNum = Math.abs(num).toString().replace('.', ''); // remove decimal if any
  const digits = strNum.split('').map(Number);
  const power = digits.length;
  const sum = digits.reduce((acc, digit) => acc + Math.pow(digit, power), 0);
  return Math.abs(num) === sum;
}

// Utility: Check if a number is prime (only for positive integers > 1)
function isPrime(num) {
  if (num <= 1 || !Number.isInteger(num)) return false;
  const absNum = Math.abs(num);
  for (let i = 2, limit = Math.sqrt(absNum); i <= limit; i++) {
    if (absNum % i === 0) return false;
  }
  return true;
}

// Retrieve a fun fact with a timeout to prevent long wait times.
async function getFunFact(num) {
  try {
    const response = await axios.get(`http://numbersapi.com/${num}/math`, { timeout: 5000 });
    return response.data;
  } catch (error) {
    return "No fun fact available.";
  }
}

app.get("/api/classify-number", async (req, res) => {
  let { number } = req.query;
  
  // Use parseFloat to allow negative and floating point values.
  const parsedNumber = parseFloat(number);
  
  // Check if parsedNumber is a valid number.
  if (isNaN(parsedNumber)) {
    return res.status(400).json({ number, error: true });
  }
  
  // Build the properties array with only "armstrong" (if true) and "odd"/"even".
  const properties = [];
  if (isArmstrong(parsedNumber)) properties.push("armstrong");
  // Always add either "odd" or "even".
  properties.push(parsedNumber % 2 === 0 ? "even" : "odd");

  // Calculate digit sum (ignoring '-' and '.').
  const digitSum = Math.abs(parsedNumber)
    .toString()
    .replace('.', '')
    .split('')
    .reduce((sum, digit) => sum + parseInt(digit), 0);

  // Retrieve fun fact (with timeout).
  const funFact = await getFunFact(parsedNumber);
  
  const result = {
    number: parsedNumber,
    is_prime: isPrime(parsedNumber),
    is_perfect: [6, 28, 496, 8128, 33550336].includes(Math.abs(parsedNumber)), // Basic perfect number check.
    properties,  // Contains only "armstrong" (if applicable) and "odd" or "even"
    digit_sum: digitSum,
    fun_fact: funFact
  };

  res.status(200).json(result);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

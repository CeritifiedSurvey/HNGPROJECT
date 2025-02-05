const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5050;


app.use(cors());

function isArmstrong(num) {
    let sum = 0, temp = num, digits = num.toString().length;
    while (temp > 0) {
        let digit = temp % 10;
        sum += Math.pow(digit, digits);
        temp = Math.floor(temp / 10);
    }
    return sum === num;
}

function isPrime(num) {
    if (num < 2) return false;
    for (let i = 2; i <= Math.sqrt(num); i++) {
        if (num % i === 0) return false;
    }
    return true;
}

async function getFunFact(num) {
    try {
        const response = await axios.get(`http://numbersapi.com/${num}/math`);
        return response.data;
    } catch (error) {
        return "No fun fact available.";
    }
}

app.get("/api/classify-number", async (req, res) => {
    let { number } = req.query;

    if (!number || isNaN(number)) {
        return res.status(400).json({ number, error: true });
    }

    number = parseInt(number);
    const properties = [];
    if (isArmstrong(number)) properties.push("armstrong");
    properties.push(number % 2 === 0 ? "even" : "odd");

    const result = {
        number,
        is_prime: isPrime(number),
        is_perfect: [6, 28, 496, 8128, 33550336].includes(number),
        properties,
        digit_sum: number.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0),
        fun_fact: await getFunFact(number),
    };

    res.json(result);
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

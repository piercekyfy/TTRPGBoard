import 'dotenv/config';
import express from 'express';

const app = express();

app.listen(process.env.PORT, () => {
    console.log(`Running at: http://localhost:${process.env.PORT}`);
})

app.get('/', (req, res) => {
    res.send("heyoooooo");
})
console.log("hey");
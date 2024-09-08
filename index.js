import express, { json }  from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import mongoose, { Mongoose } from "mongoose";


const Port = process.env.PORT || 8080;

const app = express();

dotenv.config();


const ItemSchema = new mongoose.Schema({
    name: String,
    desc: String,
    quantity: Number
});

const Item = mongoose.model("Item", ItemSchema);

const connect = () => {
    try {
        mongoose.connect(process.env.MONGOOSE, {useNewUrlParser: true, useUnifiedTopology: true});
        console.log("Succesfully connected to database!")
    } catch (err) {
        console.log("Unable to connect to database", err.message);
    }
}

mongoose.connection.on("Disconnected", ()=>{
    console.log("Disconnected!");
});


mongoose.connection.on("Cconnected", ()=>{
    console.log("Connected!");
});

// Middlewares

app.use(express.json());
app.use(cors());
app.use(cookieParser());


// End Points

// CREATE Product
app.post("/items", async (req, res)=> {
    try {
        const newItem = new Item(req.body);
        const savedItem = await newItem.save();
        if(!savedItem) return res.status(404).json(JSON.stringify(savedItem));
        res.status(201).json(JSON.stringify(savedItem));
    } catch (err) {
        res.status(500).json(JSON.stringify({error: err.message}));
    }
});


// Get All Items

app.get("/items", async (req, res)=> {
    try {
        const items = await Item.find();
        if(!items) return res.status(404).json(JSON.stringify({message: "No item was found!"}));
        res.status(200).json(JSON.stringify({items}));
    } catch (err) {
        res.status(500).json(JSON.stringify({error: err.message}))
    }
});


// Get Item By ID

app.get("/items/:id", async (req, res)=> {
    try {
        const item = await Item.findOne(req.params.id);
        if(!item) return res.status(404).json(JSON.stringify({message: "Item not found!"}));
        res.status(200).json(JSON.stringify(item));
    } catch (err) {
        res.status(500).json(JSON.stringify({error: err.message}));
    }
});


// Update Item

app.put("/item/:id", async (req, res)=> {
    try {
        const item = await Item.findByIdAndUpdate(req.params.id, req.body, {new: true, useValidators: true});
        if(!item) return res.status(404).json(JSON.stringify({message: "Item not found!"}));
        res.status(200).json(JSON.stringify(item));
    } catch (err) {
        if (err.name === "ValidationError") {
            return res.status(400).json({ error: err.message }); // Bad Request for validation errors
        }
        res.status(500).json(JSON.stringify({error: err.message}));
    }
});

// Delete Item

app.delete("/item/:id",  async (req, res)=> {
    try {
        const item = await Item.findByIdAndDelete(req.params.id);
        if(!item) return res.status(404).json(JSON.stringify({message: "Item not found!"}));
        res.status(200).json(JSON.stringify({message: "Item was deleted successfully"}));
        
    } catch (err) {
        res.status(500).json(JSON.stringify({error: err.message}));
    }
});


app.listen(Port, ()=> {
    connect();
    console.log(`Server is connected on Port: ${Port}`);
});
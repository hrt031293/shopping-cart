let mongoose = require("mongoose");
let Schema = require("mongoose").Schema;

var cartSchema = new Schema({
    name: {
        type:String,
        required: true,
        trim: true
    },
    price: {
        type:Number,
        reuired: true
    },
    quantity: {
        type:Number,
        reuired: true
    },
    userId: {
        type: mongoose.Schema.ObjectId,
        required: true
    }
})

var cartModel = mongoose.model("cart", cartSchema);

module.exports = cartModel;
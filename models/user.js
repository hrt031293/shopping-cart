let mongoose = require("mongoose");
let Schema = require("mongoose").Schema;

var userSchema = new Schema({
    name: {
        type:String,
        required: true
    },
    email: {
        type: String,
        reuired: true
    }
})

var UserModel = mongoose.model("user", userSchema);

module.exports = UserModel;
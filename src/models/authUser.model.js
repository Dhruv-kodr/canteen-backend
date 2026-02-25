const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        required:true,
        unique:true,
        type:String
    },
    password:{
        type:String,
        required: function() {
            return !this.googleId;
        }
    },
    role:{
        type:String,
        enum:['admin','user'],
        default:'user'
    },
    googleId:{
        type:String,
        default:null
    }
},{timestamps:true}
)

const userModel = mongoose.model('user',userSchema)

module.exports=userModel;
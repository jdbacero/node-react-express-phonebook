const mongoose = require('mongoose')
const url = process.env.MONGODB_URI

console.log('Connecting to ', url)
mongoose.connect(url)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.log('Error connecting to MongoDB:', err))

const phonebookSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'You must provide a name.']
    },
    number: {
        type: String,
        required: true,
        minLength: [8, 'Phone number must be at least 8 numbers.'],
        validate: {
            validator(v) {
                return /\d{2,3}-\d{7,8}/gm.test(v)
            },
            message: props => `${props.value} is not a valid phone number.`
        }
    }
})

phonebookSchema.set('toJSON', {
    transform(document, returnedObject) {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

module.exports = mongoose.model('Person', phonebookSchema)
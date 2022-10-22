const mongoose = require('mongoose')

if (process.argv.length < 3) {
    console.log('Please provide the password as an argument: node mongo.js <password>')
    process.exit(1)
}

const password = process.argv[2]
const url = `mongodb+srv://fullstackopen:${password}@cluster0.guzvqaq.mongodb.net/phonebookApp?retryWrites=true&w=majority`
const phonebookSchema = new mongoose.Schema({
    name: String,
    number: String
})
const Person = mongoose.model('Person', phonebookSchema)
const newPerson = new Person({
    name: process.argv[3],
    number: process.argv[4]
})


mongoose.connect(url)
    .then(() => {
        if (process.argv.length === 3) {
            console.log('Phonebook:')
            Person.find({})
                .then(response => {
                    response.forEach(response => {
                        console.log(`${response.name} ${response.number}`)
                    })
                })
                .then(() => {
                    return mongoose.connection.close()
                })
        } else {
            newPerson.save()
                .then(() => {
                    console.log(`Added ${newPerson.name} number ${newPerson.number} to phonebook.`)
                    return mongoose.connection.close()
                })
        }
    })
    .catch(err => {
        console.log(err)
    })
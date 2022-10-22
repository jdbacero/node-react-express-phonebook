require('dotenv').config()
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const Person = require('./models/person')

// const requestLogger = (request, response, next) => {
//     console.log('Method:', request.method)
//     console.log('Path:  ', request.path)
//     console.log('Body:  ', request.body)
//     console.log('---')
//     next()
// }

const app = express()
app.use(express.json())
app.use(cors())
// app.use(requestLogger)
app.use(morgan('tiny'))
app.use(express.static('build'))

// let persons = [
//     {
//         "id": 1,
//         "name": "Arto Hellas",
//         "number": "040-123456"
//     },
//     {
//         "id": 2,
//         "name": "Ada Lovelace",
//         "number": "39-44-5323523"
//     },
//     {
//         "id": 3,
//         "name": "Dan Abramov",
//         "number": "12-43-234345"
//     },
//     {
//         "id": 4,
//         "name": "Mary Poppendieck",
//         "number": "39-23-6423122"
//     }
// ]

app.get('/api/persons', (request, response) => {
    Person.find({})
        .then(people => response.json(people))
})

app.get('/info', (request, response, next) => {
    Person.countDocuments({}, (error, total) => {
        response.send(`<p>Phonebook has info for ${total} people</p>
        <p>${new Date()}</p>`)
    }).catch(err => next(err))
})

app.get('/api/persons/:id', (request, response, next) => {
    // const id = Number(request.params.id)
    // const person = persons.find(person => person.id === id)
    // if (person) response.json(person)
    // else response.status(404).end()

    Person.findById(request.params.id)
        .then(note => { response.json(note) })
        .catch(err => next(err))
})

app.delete('/api/persons/:id', (request, response, next) => {
    // const id = Number(request.params.id)
    // persons = persons.filter(person => person.id !== id)
    // response.status(204).end()

    Person.findByIdAndDelete(request.params.id)
        .then(deletedPerson => {
            if (deletedPerson) response.status(204).end()
            else response.status(410).end()
        })
        .catch(err => next(err))
})

app.put('/api/persons/:id', (request, response, next) => {
    const { name, number } = request.body
    Person.findByIdAndUpdate(request.params.id, { name, number }, { new: true, runValidators: true, context: 'query' })
        .then(updatedPerson => response.json(updatedPerson))
        .catch(err => next(err))
})

app.post('/api/persons', (request, response, next) => {
    const body = request.body
    console.log(body.name)
    if (!body.name || !body.number) {
        return response.status(400).json({
            error: "Person must have name and number."
        })
    }

    // if (!isUnique(body.name, body.number)) {
    //     return response.status(400).json({
    //         error: "Name and number must be unique."
    //     })
    // }

    Person.findOne({ name: body.name })
        .then(result => {
            if (result) response.status(403).json({ error: "Name already exists." })
            else {
                const person = new Person({
                    name: body.name,
                    number: body.number,
                })

                person.save()
                    .then(savedPerson => {
                        response.json(savedPerson)
                    })
                    .catch(err => next(err))
            }
        })


    // persons = persons.concat(person)
    // console.log(person)
    // response.json(persons)
})

app.post('/test', (request, response) => {
    console.log('test')
    const body = request.body
    console.log(body)
    isUnique({ name: body.name, number: body.number })
})

const generateRandomId = (min, max) => {
    // const maxId = Math.max(...persons.map(person => person.id))
    // return maxId + 1
    return Math.floor(Math.random() * (max - min) + min)
}

const isUnique = (name, number) => {
    // Promise.all([Person.find({ name: name }), Person.find({ number: number })])
    //     .then(results => {
    //         // if(results[])
    //         console.log(results)
    //     })
    //     .catch(err => {
    //         console.log("Error:", err)
    //     })
    // const isName = persons.find(person => person.name == name)
    // if (isName) return false
    // const isNumber = persons.find(person => person.number == number)
    // if (isNumber) return false
    // return true
}

const errorHandler = (error, request, response, next) => {
    console.log('---')
    console.error(error.message)
    console.log('---')
    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    }

    next(error)
}

app.use(errorHandler)

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const PORT = 3001
app.listen(PORT)
console.log(`Server running on port ${PORT}`)

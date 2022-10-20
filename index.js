const express = require('express')
const cors = require('cors')
const morgan = require('morgan')


const requestLogger = (request, response, next) => {
    console.log('Method:', request.method)
    console.log('Path:  ', request.path)
    console.log('Body:  ', request.body)
    console.log('---')
    next()
}

const app = express()
app.use(express.json())
app.use(cors())
// app.use(requestLogger)
app.use(morgan('tiny'))
app.use(express.static('build'))

let persons = [
    {
        "id": 1,
        "name": "Arto Hellas",
        "number": "040-123456"
    },
    {
        "id": 2,
        "name": "Ada Lovelace",
        "number": "39-44-5323523"
    },
    {
        "id": 3,
        "name": "Dan Abramov",
        "number": "12-43-234345"
    },
    {
        "id": 4,
        "name": "Mary Poppendieck",
        "number": "39-23-6423122"
    }
]

app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.get('/info', (request, response) => {
    const numberOfPersons = persons.length
    response.send(`<p>Phonebook has info for ${numberOfPersons} people</p>
    <p>${new Date()}</p>`)
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)
    if (person) response.json(person)
    else response.status(404).end()
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)
    response.status(204).end()
})

app.post('/api/persons', (request, response) => {
    const body = request.body
    console.log(body.name)
    if (!body.name || !body.number) {
        return response.status(400).json({
            error: "Person must have name and number."
        })
    }

    if (!isUnique(body.name, body.number)) {
        return response.status(400).json({
            error: "Name and number must be unique."
        })
    }

    const person = {
        name: body.name,
        number: body.number,
        id: generateRandomId(1, 20000000001)
    }
    persons = persons.concat(person)
    console.log(person)
    response.json(persons)
})

const generateRandomId = (min, max) => {
    // const maxId = Math.max(...persons.map(person => person.id))
    // return maxId + 1
    return Math.floor(Math.random() * (max - min) + min)
}

const isUnique = (name, number) => {
    const isName = persons.find(person => person.name == name)
    if (isName) return false
    const isNumber = persons.find(person => person.number == number)
    if (isNumber) return false
    return true
}

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const PORT = 3001
app.listen(PORT)
console.log(`Server running on port ${PORT}`)

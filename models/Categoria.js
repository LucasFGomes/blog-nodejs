const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const Categoria = new Schema({
    nome: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true
    },
    data: {
        type: Date,
        default: Date.now()
    }
});

mongoose.model('categorias', Categoria);

/*
Outra maneira de definir o model no mongodb

mongoose.model('categorias', {
    nome: { type: String },
    slug: { type: String },
    data: { type: Date, default: Date.now() }
});
*/

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
require('../models/Categoria');
const Categoria = mongoose.model('categorias');
require('../models/Postagem');
const Postagem = mongoose.model('postagens');
const { eAdmin } = require('../helpers/eAdmin');

//Tela inicial
router.get('/', eAdmin, (req, res) => {
    res.render('admin/index');
});

//Rotas das categorias

//Formulário de cadastro de categorias
router.get('/categorias/add', eAdmin, (req, res) => {
    res.render('admin/addcategorias');
});

//Cadastro de categorias
router.post('/categorias/nova', eAdmin, (req, res) => {

    let erros = validacaoCategoria(req);

    if (erros.length > 0) {
        res.render('admin/addcategorias', { erros: erros });
    } else {
        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        }

        new Categoria(novaCategoria).save().then(() => {
            req.flash('success_msg', 'Categoria salva com sucesso!');
            res.redirect('/admin/categorias');
            console.log('Categoria salva com sucesso!');
        }).catch((erro) => {
            req.flash('error_msg', 'Houve um erro ao salvar a categoria!');
            console.log('Erro ao salvar a categoria: ' + erro);
            res.redirect('/admin');
        });
    }
});

//Listagem de categorias
router.get('/categorias', eAdmin, (req, res) => {

    Categoria.find().then((categorias) => {
        res.render('admin/categorias', { categorias: categorias });
    }).catch((erro) => {
        req.flash('error_msg', 'Houve um erro ao listar as categorias!');
        console.log('Erro ao listar as categorias: ' + erro);
        res.redirect('/admin');
    });
});

//Formulário de editação de categorias
router.get('/categorias/edit/:id', eAdmin, (req, res) => {
    Categoria.findOne({ _id: req.params.id }).then((categoria) => {
        res.render('admin/editcategorias', { categoria: categoria });
    }).catch((erro) => {
        req.flash('error_msg', 'Esta categoria não existe!');
        console.log('Erro ao editar a categoria: ' + erro);
        res.redirect('/admin/categorias');
    });
});

//Editar categorias
router.post('/categorias/edit', eAdmin, (req, res) => {

    let erros = validacaoCategoria(req);

    if (erros.length > 0) {
        res.render('admin/editcategorias', { erros: erros });
    } else {
        Categoria.findOne({ _id: req.body.id }).then((categoria) => {

            categoria.nome = req.body.nome;
            categoria.slug = req.body.slug;

            categoria.save().then(() => {
                req.flash('success_msg', 'Categoria editada com sucesso!');
                res.redirect('/admin/categorias');
            }).catch((erro) => {
                req.flash('error_msg', 'Houve um erro interno ao salvar');
                res.redirect('/admin/categorias');
            });

        }).catch((erro) => {
            req.flash('error_msg', 'Houve um erro ao editar a categoria');
            res.redirect('/admin/categorias');
        });
    }

});

//Excluir categorias
router.get('/categorias/deletar/:id', eAdmin, (req, res) => {
    Categoria.deleteOne({ _id: req.params.id }).then(() => {
        req.flash('success_msg', 'Categoria deletada com sucesso!');
        console.log('Deletado com sucesso!');
        res.redirect('/admin/categorias');
    }).catch((erro) => {
        req.flash('error_msg', 'Erro ao deletar a categoria');
        res.redirect('/admin/categorias');
    });
});

//Rotas das postagens

//Formulário de cadastro de postagens
router.get('/postagens/add', eAdmin, (req, res) => {
    Categoria.find().then((categorias) => {
        res.render('admin/addpostagem', { categorias: categorias });
    });
});

//Cadastro de postagens
router.post('/postagens/nova', eAdmin, (req, res) => {

    let erros = [];

    if (req.body.categoria == '0') {
        erros.push({ text: 'Categoria inválida, registre uma categoria!' });
    }

    if (erros.length > 0) {
        res.render('admin/addpostagem', { erros: erros });
    } else {

        const novaPostagem = {
            titulo: req.body.titulo,
            slug: req.body.slug,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria
        }

        new Postagem(novaPostagem).save().then(() => {
            req.flash('success_msg', 'Postagem cadastrada com sucesso!');
            res.redirect('/admin/postagens');
        }).catch((erro) => {
            req.flash('error_msg', 'Erro ao cadastrar a postagem!');
            res.redirect('/admin/postagens');
        });

    }
});

//Listagem de postagens
router.get('/postagens', eAdmin, (req, res) => {

    Postagem.find().populate('categoria').sort({ data: 'desc' }).then((postagens) => {
        res.render('admin/postagens', { postagens: postagens });
    }).catch((erro) => {
        req.flash('error_msg', 'Erro ao listar as postagens!');
        res.redirect('/admin');
    });

});

//Formulário para edição de postagens
router.get('/postagens/edit/:id', eAdmin, (req, res) => {

    Postagem.findOne({ _id: req.params.id }).then((postagem) => {
        Categoria.find().then((categorias) => {
            res.render('admin/editpostagem', { postagem: postagem, categorias: categorias });
        });
    });

});

//Editar postagens
router.post('/postagens/edit', eAdmin, (req, res) => {

    Postagem.findOne({ _id: req.body.id }).then((postagem) => {

        let resultado = validacaoEdicaoPostagem(postagem, req);

        if (resultado) {

            postagem.titulo = req.body.titulo
            postagem.slug = req.body.slug
            postagem.descricao = req.body.descricao
            postagem.conteudo = req.body.conteudo
            postagem.categoria = req.body.categoria

            postagem.save().then(() => {
                req.flash('success_msg', 'Postagem editada com sucesso!');
                res.redirect('/admin/postagens');
            })

        } else {
            req.flash('error_msg', 'Você não alterou nada, tente novamente!');
            res.redirect('/admin/postagens');
        }

    }).catch((erro) => {
        req.flash('error_msg', 'Houve um erro ao editar a postagem!');
        res.redirect('/admin/postagens');
    });

});

router.get('/postagens/deletar/:id', eAdmin, (req, res) => {
    Postagem.deleteOne({ _id: req.params.id }).then(() => {
        req.flash('success_msg', 'Postagem deletada com sucesso!');
        console.log('Deletado com sucesso!');
        res.redirect('/admin/postagens');
    }).catch((erro) => {
        req.flash('error_msg', 'Erro ao deletar a postagem');
        res.redirect('/admin/postagens');
    });
});

function validacaoEdicaoPostagem(postagem, req) {
    if (postagem.titulo == req.body.titulo && postagem.slug == req.body.slug &&
        postagem.descricao == req.body.descricao &&
        postagem.conteudo == req.body.conteudo &&
        postagem.categoria == req.body.categoria) {
        return false;
    }
    return true;
}

function validacaoCategoria(req) {

    let erros = [];

    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({ texto: 'Nome inválido!' });
    }

    if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
        erros.push({ texto: 'Slug inválido!' });
    }

    if (req.body.nome.length < 2) {
        erros.push({ texto: 'Nome da categoria é pequeno!' });
    }

    return erros;
}

module.exports = router;
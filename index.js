const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require('bcrypt');
require('dotenv').config(); // Para carregar variáveis de ambiente

const app = express();
const port = process.env.PORT || 3000; // Configuração da porta

app.use(cors());
app.use(express.json());

// Conectando ao MongoDB
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/coroinhasDB";
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("Connected to MongoDB");
}).catch((err) => {
    console.error("Error connecting to MongoDB", err);
});

// Definindo o modelo Coroinha
const coroinhaSchema = new mongoose.Schema({
    nomeCompleto: String,
    nomeResponsavel: String,
    contatoResponsavel: String,
    dataNascimento: {
        type: Date,
        required: true
    },
    disponibilidade: {
        sabado: Boolean,
        domingo: Boolean,
        quartaFeira: Boolean,
        primeiraSextaFeira: Boolean
    }
});

const Coroinha = mongoose.model('Coroinha', coroinhaSchema);

// Função para formatar a data recebida no formato DD/MM/AA para Date
const formatDateString = (dateString) => {
    if (!dateString) return null;
    const dateParts = dateString.split('/');
    const formattedDate = new Date(`20${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`);
    return formattedDate;
};

// Rotas para o modelo Coroinha

// GET para obter todos os coroinhas
app.get("/coroinhas", async (req, res) => {
    try {
        const coroinhas = await Coroinha.find();
        res.json(coroinhas);
    } catch (error) {
        handleErrors(res, error, "Erro ao buscar coroinhas");
    }
});

// GET para obter um coroinha por ID
app.get("/coroinhas/:id", async (req, res) => {
    try {
        const coroinha = await Coroinha.findById(req.params.id);
        if (!coroinha) {
            return res.status(404).send({ message: 'Coroinha não encontrado' });
        }
        res.send(coroinha);
    } catch (error) {
        handleErrors(res, error, "Erro ao buscar coroinha por ID");
    }
});

// POST para adicionar um novo coroinha
app.post("/coroinhas", async (req, res) => {
    try {
        const coroinha = new Coroinha(req.body);
        // Formatar a data de nascimento antes de salvar
        coroinha.dataNascimento = formatDateString(req.body.dataNascimento);
        await coroinha.save();
        res.status(201).send(coroinha);
    } catch (error) {
        handleErrors(res, error, "Erro ao criar coroinha");
    }
});

// PUT para atualizar um coroinha existente por ID
app.put("/coroinhas/:id", async (req, res) => {
    try {
        // Formatar a data recebida antes de atualizar
        req.body.dataNascimento = formatDateString(req.body.dataNascimento);
        const coroinha = await Coroinha.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!coroinha) {
            return res.status(404).send({ message: 'Coroinha não encontrado para atualização' });
        }
        res.send(coroinha);
    } catch (error) {
        handleErrors(res, error, "Erro ao atualizar coroinha por ID");
    }
});

// DELETE para excluir um coroinha por ID
app.delete("/coroinhas/:id", async (req, res) => {
    try {
        const coroinha = await Coroinha.findByIdAndDelete(req.params.id);
        if (!coroinha) {
            return res.status(404).send({ message: 'Coroinha não encontrado para exclusão' });
        }
        res.send({ message: 'Coroinha excluído com sucesso' });
    } catch (error) {
        handleErrors(res, error, "Erro ao excluir coroinha por ID");
    }
});

// Rota de login básica
app.post("/login", async (req, res) => {
    const { username, password } = req.body;

    // Verifica se as credenciais correspondem ao usuário fixo (exemplo para desenvolvimento)
    if (username === 'eduardosmyk' && await bcrypt.compare(password, '$2b$10$zISwDofE3B1HclVGAJxXlO/8LJ2s2g6x42Ak9HE6c2Nvjo8aQyDeG')) {
        // Credenciais corretas, gera um token de autenticação (JWT, por exemplo) e envia para o cliente
        const token = 'token_de_exemplo'; // Aqui você geraria um token de autenticação válido
        res.json({ token }); // Envie o token de volta para o cliente
    } else {
        // Credenciais incorretas, retorna erro
        res.status(401).json({ message: 'Credenciais inválidas' });
    }
});

// Função para tratamento de erros
const handleErrors = (res, error, message) => {
    console.error(`${message}: ${error}`);
    return res.status(500).send({ message: message });
};

// Inicializando o servidor
app.listen(port, () => {
    console.log(`App running on port ${port}`);
});

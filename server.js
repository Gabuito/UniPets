const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');

const app = express();
const port = 3000;

// Configurar o middleware
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('public'));

app.use(cookieParser());

app.use(session({
  secret: 'chave123',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 30 * 60 * 1000 } // 30 minutos
}));

// Configurar o mecanismo de visualização (EJS)
app.set('view engine', 'ejs');

//"Banco de dados" temporario
let interessados = [];
let pets = [];
let adocoes = [];

// Rota de login
app.get('/', (req, res) => {
  res.render('login');
});

app.post('/login', (req, res) => {
  const { usuario, senha } = req.body;

  // Verificar as credenciais do usuário (substitua por lógica real)
  if (usuario === 'admin' && senha === 'admin') {
    req.session.autenticado = true;
    req.session.loginTimestamp = Date.now();
    res.redirect('/menu');
  } else {
    res.send('Usuário ou senha inválidos!');
  }
});

// Rota do menu principal
app.get('/menu', (req, res) => {
  if (!req.session.autenticado) {
    return res.redirect('/');
  }

  const tempoRestante = Math.round((req.session.cookie.maxAge - (Date.now() - req.session.cookie.lastAccessed))/1000);


  res.render('menu', { 
    tempoRestante: tempoRestante,
  });
  });

// Rota para cadastro de interessados
app.get('/interessados/cadastrar', (req, res) => {
  if (!req.session.autenticado) {
    return res.redirect('/');
  }
  res.render('cadastrarInteressado');
});

app.post('/interessados/cadastrar', (req, res) => {
  const { nome, email, telefone } = req.body;
  // Validação básica no lado do servidor
  if (!nome || !email || !telefone) {
    return res.status(400).send('Todos os campos são obrigatórios!');
  }

  interessados.push({ nome, email, telefone });
  res.redirect('/interessados');
});

app.get('/interessados', (req, res) => {
  if (!req.session.autenticado) {
    return res.redirect('/');
  }
  res.render('listarInteressados', { interessados: interessados });
});

// Rota para cadastro de pets
app.get('/pets/cadastrar', (req, res) => {
  if (!req.session.autenticado) {
    return res.redirect('/');
  }
  res.render('cadastrarPet');
});

app.post('/pets/cadastrar', (req, res) => {
  const { nome, raca, idade } = req.body;

  // Validação básica no lado do servidor
  if (!nome || !raca || !idade) {
    return res.status(400).send('Todos os campos são obrigatórios!');
  }

  pets.push({ nome, raca, idade });
  res.redirect('/pets');
});

app.get('/pets', (req, res) => {
  if (!req.session.autenticado) {
    return res.redirect('/');
  }
  res.render('listarPets', { pets: pets });
});


app.put('/pets/remove-pet', (req, res) => {
  const { nome, raca, idade } = req.body;

  const pet = pets.find(pet => pet.id === id);
  if (!pet) {
    return res.status(404).send('Pet não encontrado!');
  }

  pet.nome = nome;
  pet.raca = raca;
  pet.idade = idade;

  pets.pop(pet);
});

// Rota para adoção de pets
app.get('/adotar', (req, res) => {
  if (!req.session.autenticado) {
    return res.redirect('/');
  }
  res.render('adotarPet', { interessados: interessados, pets: pets, adocoes: adocoes });
});

app.post('/adotar', (req, res) => {
  const { interessado, pet } = req.body;

  // Validação básica no lado do servidor
  if (!interessado || !pet) {
    return res.status(400).send('Selecione um interessado e um pet!');
  }

  adocoes.push({ interessado, pet, data: new Date().toLocaleDateString() });
  res.redirect('/adotar');
});

// Rota de logout
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});


// Rota para obter o tempo restante da sessão
app.get('/tempo-restante', (req, res) => {
  if (req.session.loginTimestamp) {
    const tempoDecorrido = Date.now() - req.session.loginTimestamp;
    const tempoRestante = Math.round((req.session.cookie.maxAge - tempoDecorrido) / 1000);
    res.json({ tempoRestante: tempoRestante > 0 ? tempoRestante : 0 }); 
  } else {
    res.json({ tempoRestante: 0 }); 
  }
});


// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
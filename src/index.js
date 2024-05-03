import express from 'express';
import bcrypt from 'bcrypt';

const app = express();

app.use(express.json());

let users = [];
let proxUser = 1;
let message = [];
let proxMsg = 1;

app.post('/', (request, response)=>{
    response.status(200).json({Mensagem: 'Bem vindo à aplicação!'});
});

app.post('/signup', async(request, response)=>{
    const data = request.body

    const nome = data.nome;
    const email = data.email
    const senha = data.senha

    if(!nome){
        response
        .status(404)
        .json({Mensagem: 'Por favor, verifique se passou o nome.'})
        return;
    }
    if(!email){
        response
        .status(400)
        .json({ Mensagem: 'Por favor, verifique se passou o email.'})
        return;
    }
    if(!senha){
        response
        .status(400)
        .json({ Mensagem: 'Por favor, verifique se passou a senha.'})
        return;
    }
    
    const verificarEmail = users.find((user)=> user.email === email)

    if(verificarEmail){
        response.status(400).json({ Mensagem: 'Email já cadastrado, insira outro.'})
        return;
    }

    const senhaCript = await bcrypt.hash(senha, 10)

    let novoUsuario = {
        id: proxUser,
        nome: data.nome,
        email: data.email,
        senha: senhaCript
    }

    users.push(novoUsuario);
    proxUser++;

    response.status(201).json({ Mensagem: `Seja bem vindo, ${nome}! Pessoa usuária registrada com sucesso!`})
})

app.get('/login', async(request, response)=> {
    const data = request.body;

    const email = data.email;
    const senha = data.senha;

    if(!email){
        response.status(404).json({Mensagem: 'Insira um e-mail válido.'})
        return;
    }
    if(!senha){
        response.status(404).json({Mensagem: 'Insira uma senha válida'})
        return;
    }

    const user = users.find((usuarios) => usuarios.email === email);

    if(!user){
        response.status(404).json({Mensagem: 'Email não encontrado no sistema, verifique ou crie uma conta.'})
        return;
    }

    const senhas = await bcrypt.compare(senha, user.senha);

    if(!senhas){
        response.status(404).json({Mensagem: 'Dados inválidos, digite novamente.'})
        return;
    }

    response.status(200).json({Mensagem: `Seja bem vindo, ${user.nome}! Pessoa usuária logada com sucesso!`});
});

app.post('/message', (request, response)=>{
    const data = request.body;

    const email = request.query.email;
    const title = data.title;
    const description = data.description;

    const verificador = users.find(usuario => usuario.email === email);

    if(!verificador){
        response.status(400).json({Mensagem: 'Email não encontrado, verifique ou crie uma conta.'});
        return;
    }

    if(!title){
        response.status(400).json({Mensagem: 'Digite um título válido.'})
        return;
    }
    if(!description){
        response.status(400).json({Mensagem: 'Digite uma descrição válida.'})
        return;
    }

    let newMessage = {
        id: proxMsg,
        email: email,
        title: title,
        description: description
    }

    message.push(newMessage);
    proxMsg++;

    response.status(201).json({Mensagem: `Mensagem criada com sucesso! Título: ${title}`});
});

app.get('/message/:email', (request, response)=>{
    const email = request.params.email;

    const verificador = users.find(usuario => usuario.email === email);

    if(!verificador){
        response.status(404).json({Mensagem: 'Email não encontrado, verifique ou crie uma conta.'});
        return;
    }

    const verificar = message.find(mensagem => mensagem.email === email);

    if(!verificar){
        response.status(400).json({Mensagem: 'Não existe mensagem cadastrada.'});
        return;
    }

    const verificar2 = message.filter(mensagens => mensagens.email === email)

    const dados = verificar2.map((mensagens) => `ID: ${mensagens.id} | Título: ${mensagens.title} | Descrição: ${mensagens.description}`)

    response.status(200).json({message: 'Seja bem-vindo!', data: `${dados}`});
});

app.put('/message/:id', (request, response)=>{
    const data = request.body;

    const id = Number(request.params.id);
    const title = data.title;
    const description = data.description;

    if(!id){
        response.status(400).json({Mensagem: 'Por favor, informe um ID válido da mensagem.'});
        return;
    }

    const idVerificado = message.findIndex(mensagem => mensagem.id === id)

    if(idVerificado === -1){
        response.status(400).json({Mensagem: 'ID não encontrado.'})
        return;
    }
    if(!title){
        response.status(400).json({Mensagem: 'Informe um título válido.'});
        return;
    }
    if(!description){
        response.status(400).json({Mensagem: 'Informe uma descrição válida.'});
        return;
    }    
    
    if(idVerificado !== -1){
        const mensagem = message[idVerificado]
        mensagem.title = title;
        mensagem.description = description;
    }

    response.status(200).json(({Mensagem: `Mensagem atualizada com sucesso! ID: ${id} | Título: ${title} | Descrição: ${description}`}));
});

app.delete('/message/:id', (request, response)=>{
    const id = Number(request.params.id);

    if(!id){
        response.status(400).json({Mensagem: 'Mensagem não encontrada, verifique o identificador em nosso banco.'});
        return;
    }

    const IndexPorID = message.findIndex(mensagem => mensagem.id === id);

    if(IndexPorID === -1){
        response.status(400).json({Mensagem: 'ID não encontrado!'});
        return;
    }else{
        message.splice(IndexPorID, 1)
        response.status(200).json({Mensagem: 'Mensagem apagada com sucesso!'});
    }
})

app.listen(8080, () => console.log('Servidor iniciado'));
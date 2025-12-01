// Script de cadastro
const form = document.querySelector('form');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nome = document.querySelector('input[placeholder="Nome e Sobrenome"]').value;
    const usuario = document.querySelector('input[placeholder="Nome de Usuário"]').value;
    const email = document.querySelector('input[type="email"]').value;
    const senha = document.querySelector('input[placeholder="Senha"]').value;
    const confirmarSenha = document.querySelector('input[placeholder="Confirmar Senha"]').value;

    // Validar se as senhas coincidem
    if (senha !== confirmarSenha) {
        alert('As senhas não coincidem!');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/cadastro', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nome,
                usuario,
                email,
                senha
            })
        });

        const data = await response.json();

        if (data.success) {
            alert('Cadastro realizado com sucesso!');
            // Armazenar dados do usuário no localStorage
            localStorage.setItem('user', JSON.stringify(data.user));
            // Redirecionar para a home
            window.location.href = '../home/index.html';
        } else {
            alert(data.message || 'Erro ao realizar cadastro');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao conectar com o servidor. Certifique-se de que o backend está rodando.');
    }
});

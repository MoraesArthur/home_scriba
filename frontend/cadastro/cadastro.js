// Script de cadastro
const form = document.querySelector('form');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nome = document.querySelector('input[placeholder="Nome e Sobrenome"]').value;
    const usuario = document.querySelector('input[placeholder="Nome de Usuário"]').value;
    const email = document.querySelector('input[placeholder="Email"]').value;
    const senha = document.querySelector('input[placeholder="Senha"]').value;
    const confirmarSenha = document.querySelector('input[placeholder="Confirmar Senha"]').value;

    // Validar se as senhas coincidem
    if (senha !== confirmarSenha) {
        alert('As senhas não coincidem!');
        return;
    }

    try {
        const formData = new FormData();
        formData.append('usuario', usuario);
        formData.append('nome', nome);
        formData.append('email', email);
        formData.append('senha', senha);

        const response = await fetch('http://localhost/scriba/home_scriba/api/cadastro.php', {
            method: 'POST',
            body: formData
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
        alert('Erro ao conectar com o servidor.');
    }
});

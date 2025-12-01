// Script de login
const form = document.querySelector('form');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.querySelector('#email').value;
    const senha = document.querySelector('#password').value;

    try {
        const response = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email,
                senha
            })
        });

        const data = await response.json();

        if (data.success) {
            // Armazenar dados do usuário no localStorage
            localStorage.setItem('user', JSON.stringify(data.user));
            // Redirecionar para a home
            window.location.href = '../home/index.html';
        } else {
            alert(data.message || 'Email ou senha incorretos');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao conectar com o servidor. Certifique-se de que o backend está rodando.');
    }
});

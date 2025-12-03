// Script de login
const form = document.querySelector('form');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const identifier = document.querySelector('#email').value; // pode ser email ou usuário
    const senha = document.querySelector('#password').value;

    try {
        const formData = new FormData();
        formData.append('identifier', identifier);
        formData.append('senha', senha);

        const response = await fetch('http://localhost/scriba/home_scriba/api/login.php', {
            method: 'POST',
            body: formData
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
        alert('Erro ao conectar com o servidor.');
    }
});

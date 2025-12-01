// Script da home
// Verificar se o usuário está logado
const user = JSON.parse(localStorage.getItem('user'));

if (!user) {
    // Se não estiver logado, redireciona para a página inicial
    window.location.href = '../inicial/index.html';
} else {
    // Atualizar informações do usuário na interface
    document.querySelector('.user-name').textContent = user.nome;
    document.querySelector('.user-handle').textContent = `@${user.usuario}`;
}

// Função de logout
const logoutLink = document.querySelector('.logout-link');
logoutLink.addEventListener('click', (e) => {
    e.preventDefault();
    // Remover dados do localStorage
    localStorage.removeItem('user');
    // Redirecionar para a página inicial
    window.location.href = '../inicial/index.html';
});

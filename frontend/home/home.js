<<<<<<< HEAD
// --- 1. LÓGICA DE AUTENTICAÇÃO ---
const user = JSON.parse(localStorage.getItem('user'));
if (!user) {
    // window.location.href = '../inicial/index.html'; 
    console.warn("Usuário não logado.");
}

// --- DADOS SIMULADOS (MOCK DB) ---
let myLibrary = [
    { id: 1, title: "O Senhor dos Anéis", author: "J.R.R. Tolkien", genre: "Fantasia", status: "Lendo", cover: "https://m.media-amazon.com/images/I/91RnryMIcCL._AC_UF1000,1000_QL80_.jpg" },
    { id: 2, title: "Duna", author: "Frank Herbert", genre: "Ficção Científica", status: "Quero Ler", cover: "https://m.media-amazon.com/images/I/81zN5Ed6RPO._AC_UF1000,1000_QL80_.jpg" },
    { id: 3, title: "1984", author: "George Orwell", genre: "Ficção", status: "Lido", cover: "https://m.media-amazon.com/images/I/61t0bwt1sXL._AC_UF1000,1000_QL80_.jpg" }
];

let myGoals = [
    { id: 1, name: "Ler 12 Livros em 2025", target: 12, current: 4 },
    { id: 2, name: "Ler 5.000 Páginas", target: 5000, current: 1250 }
];

// LISTAS agora guardam IDs dos livros
let myLists = [
    { id: 1, name: "Favoritos da Vida", books: [1, 3] },
    { id: 2, name: "Clássicos Sci-Fi", books: [2] },
    { id: 3, name: "Para ler em 2025", books: [] }
];

document.addEventListener('DOMContentLoaded', () => {

    // A. Preencher dados do usuário
    if (user) {
        document.querySelector('.user-name').textContent = user.nome || "Visitante";
        const handle = document.querySelector('.user-handle');
        if(handle) handle.textContent = `@${user.usuario || 'visitante'}`;
        const welcomeTitle = document.querySelector('.user-name-title');
        if(welcomeTitle && user.nome) welcomeTitle.textContent = user.nome.split(' ')[0];
    }

    // B. Logout e Data
    const logoutLink = document.querySelector('.logout-link');
    if (logoutLink) {
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('user');
            window.location.href = '../inicial/index.html';
        });
    }
    const dayElement = document.getElementById('display-day');
    const dateElement = document.getElementById('display-date');
    if (dayElement && dateElement) {
        const days = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
        const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
        const now = new Date();
        dayElement.innerText = days[now.getDay()];
        dateElement.innerHTML = `<i class="fa-regular fa-calendar"></i> ${now.getDate()} de ${months[now.getMonth()]}, ${now.getFullYear()}`;
    }

    // C. Setup de Filtros e Navegação
    setupFilters();

    const navItems = document.querySelectorAll('.nav-item');
    const contentSections = document.querySelectorAll('.content-section');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            const targetId = item.getAttribute('data-target');
            contentSections.forEach(section => {
                section.classList.add('hidden');
                section.classList.remove('active');
            });

            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.remove('hidden');
                setTimeout(() => targetSection.classList.add('active'), 10);

                if (targetId === 'section-books') renderLibrary(); // Renderiza padrão (Todos)
                if (targetId === 'section-goals') renderGoals();
                if (targetId === 'section-lists') renderLists();
            }
        });
    });

    // --- FUNÇÕES DE RENDERIZAÇÃO ---

    // 1. Renderizar Biblioteca (Com Filtro)
    window.renderLibrary = function(filter = 'Todos') {
        const container = document.getElementById('libraryContainer');
        if (!container) return;
        container.innerHTML = '';
        
        // Mapeamento de texto dos botões para status interno do livro
        // Botão "Lidos" -> Status "Lido"
        const statusMap = {
            'Todos': 'Todos',
            'Lendo': 'Lendo',
            'Lidos': 'Lido', // Ajuste importante
            'Quero Ler': 'Quero Ler'
        };

        const targetStatus = statusMap[filter] || filter;

        const filteredBooks = targetStatus === 'Todos' 
            ? myLibrary 
            : myLibrary.filter(book => book.status === targetStatus);

        if (filteredBooks.length === 0) {
            container.innerHTML = '<p style="color:#888; grid-column: 1/-1;">Nenhum livro encontrado nesta categoria.</p>';
            return;
        }

        filteredBooks.forEach(book => {
            const card = document.createElement('div');
            card.className = 'book-list-card';
            card.innerHTML = `
                <img src="${book.cover}" class="list-cover" alt="${book.title}">
                <div class="list-info">
                    <h3 class="list-title">${book.title}</h3>
                    <p class="list-author">${book.author}</p>
                    <div class="list-meta">
                        <span class="badge badge-genre">${book.genre}</span>
                        <span class="badge badge-status">${book.status}</span>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
    }

    // 2. Setup Filtros
    function setupFilters() {
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active de todos
                filterBtns.forEach(b => b.classList.remove('active'));
                // Adiciona active no clicado
                btn.classList.add('active');
                
                // Pega o texto do filtro (Todos, Lendo, etc)
                const filterValue = btn.getAttribute('data-filter') || btn.innerText;
                renderLibrary(filterValue);
            });
        });
    }

    function renderGoals() {
        const container = document.getElementById('goalsContainer');
        if (!container) return;
        container.innerHTML = '';
        
        myGoals.forEach(goal => {
            const percentage = Math.min(100, Math.round((goal.current / goal.target) * 100));
            const card = document.createElement('div');
            card.className = 'goal-card';
            card.innerHTML = `
                <div class="goal-header">
                    <h3 class="goal-title">${goal.name}</h3>
                    <div class="card-actions">
                        <button class="btn-icon edit" onclick="editGoal(${goal.id})"><i class="fa-solid fa-pen"></i></button>
                        <button class="btn-icon delete" onclick="deleteGoal(${goal.id})"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </div>
                <div class="goal-progress-wrapper">
                    <div class="goal-bar-bg">
                        <div class="goal-bar-fill" style="width: ${percentage}%;"></div>
                    </div>
                    <span class="goal-percentage">${percentage}%</span>
                </div>
                <p class="goal-stats">${goal.current} de ${goal.target} concluídos</p>
            `;
            container.appendChild(card);
        });
    }

    function renderLists() {
        const container = document.getElementById('listsContainer');
        if (!container) return;
        container.innerHTML = '';
        
        myLists.forEach(list => {
            const folder = document.createElement('div');
            folder.className = 'folder-card';
            // Clique na pasta abre detalhes, clique nos botões faz ações
            folder.onclick = (e) => {
                // Se não clicou nos botões de ação, abre a lista
                if (!e.target.closest('.folder-actions')) {
                    openListDetails(list.id);
                }
            };

            folder.innerHTML = `
                <div class="folder-actions">
                    <button class="btn-icon edit" onclick="event.stopPropagation(); editList(${list.id})"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn-icon delete" onclick="event.stopPropagation(); deleteList(${list.id})"><i class="fa-solid fa-trash"></i></button>
                </div>
                <div class="folder-icon"><i class="fa-solid fa-folder"></i></div>
                <h3 class="folder-name">${list.name}</h3>
                <p class="folder-count">${list.books.length} livros</p>
            `;
            container.appendChild(folder);
        });
    }

    // --- DETALHES DA LISTA (Adicionar Livro) ---
    let currentListId = null;

    window.openListDetails = function(listId) {
        currentListId = listId;
        const list = myLists.find(l => l.id === listId);
        if(!list) return;

        document.getElementById('listDetailsTitle').innerText = list.name;
        
        // Popula o select de "Adicionar Livro"
        const select = document.getElementById('selectBookToAdd');
        select.innerHTML = '<option value="">Selecione um livro...</option>';
        
        // Apenas livros que NÃO estão na lista
        const availableBooks = myLibrary.filter(book => !list.books.includes(book.id));
        availableBooks.forEach(book => {
            const opt = document.createElement('option');
            opt.value = book.id;
            opt.innerText = book.title;
            select.appendChild(opt);
        });

        renderListDetails(list);
        document.getElementById('listDetailsModalOverlay').classList.remove('hidden');
    }

    function renderListDetails(list) {
        const container = document.getElementById('listContentsContainer');
        container.innerHTML = '';

        if(list.books.length === 0) {
            container.innerHTML = '<p class="empty-list-msg">Esta lista está vazia.</p>';
            return;
        }

        list.books.forEach(bookId => {
            const book = myLibrary.find(b => b.id === bookId);
            if(book) {
                const item = document.createElement('div');
                item.className = 'list-book-item';
                item.innerHTML = `
                    <img src="${book.cover}" class="list-book-cover">
                    <div class="list-book-info">
                        <div class="list-book-title">${book.title}</div>
                        <div class="list-book-author">${book.author}</div>
                    </div>
                `;
                container.appendChild(item);
            }
        });
    }

    // Botão Adicionar Livro na Lista (dentro do modal)
    const btnAddBookToList = document.getElementById('btnAddBookToList');
    if(btnAddBookToList) {
        btnAddBookToList.onclick = function() {
            const select = document.getElementById('selectBookToAdd');
            const bookId = parseInt(select.value);
            
            if(bookId && currentListId) {
                const list = myLists.find(l => l.id === currentListId);
                if(list) {
                    list.books.push(bookId);
                    // Refresh da UI
                    openListDetails(currentListId); // Re-renderiza o modal
                    renderLists(); // Atualiza a contagem na tela principal
                }
            }
        }
    }


    // --- FUNÇÕES GLOBAIS DE AÇÃO ---
    window.deleteGoal = function(id) {
        if(confirm("Excluir meta?")) {
            myGoals = myGoals.filter(g => g.id !== id);
            renderGoals();
        }
    };
    window.deleteList = function(id) {
        if(confirm("Excluir lista?")) {
            myLists = myLists.filter(l => l.id !== id);
            renderLists();
        }
    };
    window.editGoal = function(id) {
        const goal = myGoals.find(g => g.id === id);
        if(goal) {
            document.getElementById('goalId').value = goal.id;
            document.getElementById('goalName').value = goal.name;
            document.getElementById('goalTarget').value = goal.target;
            document.getElementById('goalCurrent').value = goal.current;
            document.getElementById('goalModalTitle').innerText = "Editar Meta";
            document.getElementById('goalModalOverlay').classList.remove('hidden');
        }
    };
    window.editList = function(id) {
        const list = myLists.find(l => l.id === id);
        if(list) {
            document.getElementById('listId').value = list.id;
            document.getElementById('listName').value = list.name;
            document.getElementById('listModalTitle').innerText = "Editar Lista";
            document.getElementById('listModalOverlay').classList.remove('hidden');
        }
    };


    // --- MODAIS ---
    function setupModal(modalId, openBtnId, closeBtnId) {
        const modal = document.getElementById(modalId);
        const openBtn = document.getElementById(openBtnId);
        const closeBtn = document.getElementById(closeBtnId);
        
        if (openBtn && modal) {
            openBtn.addEventListener('click', () => {
                const form = modal.querySelector('form');
                if(form) form.reset();
                const hiddenId = modal.querySelector('input[type="hidden"]');
                if(hiddenId) hiddenId.value = '';

                // Reset Títulos
                const title = modal.querySelector('.modal-header h2');
                if(title) {
                    if(modalId === 'goalModalOverlay') title.innerText = "Nova Meta";
                    if(modalId === 'listModalOverlay') title.innerText = "Nova Lista";
                }
                modal.classList.remove('hidden');
            });
            
            if(closeBtn) closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
            modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.add('hidden'); });
        }
    }

    setupModal('modalOverlay', 'openModalBtn', 'closeModalBtn');
    setupModal('updateModalOverlay', 'btnUpdateProgress', 'closeUpdateModalBtn');
    setupModal('goalModalOverlay', 'btnOpenGoalModal', 'closeGoalModalBtn');
    setupModal('listModalOverlay', 'btnCreateList', 'closeListModalBtn');
    
    // Setup manual para o Modal de Detalhes (pois não tem botão de abrir fixo)
    const listDetailsModal = document.getElementById('listDetailsModalOverlay');
    const closeListDetailsBtn = document.getElementById('closeListDetailsBtn');
    if(closeListDetailsBtn && listDetailsModal) {
        closeListDetailsBtn.onclick = () => listDetailsModal.classList.add('hidden');
        listDetailsModal.onclick = (e) => { if(e.target === listDetailsModal) listDetailsModal.classList.add('hidden'); };
    }


    // --- FORMS SUBMIT ---
    const goalForm = document.getElementById('goalForm');
    if (goalForm) {
        goalForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const id = document.getElementById('goalId').value;
            const name = document.getElementById('goalName').value;
            const target = parseInt(document.getElementById('goalTarget').value);
            const current = parseInt(document.getElementById('goalCurrent').value);

            if (id) {
                const index = myGoals.findIndex(g => g.id == id);
                if (index > -1) myGoals[index] = { id: parseInt(id), name, target, current };
            } else {
                const newId = myGoals.length ? Math.max(...myGoals.map(g => g.id)) + 1 : 1;
                myGoals.push({ id: newId, name, target, current });
            }
            document.getElementById('goalModalOverlay').classList.add('hidden');
            renderGoals();
        });
    }

    const listForm = document.getElementById('listForm');
    if (listForm) {
        listForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const id = document.getElementById('listId').value;
            const name = document.getElementById('listName').value;

            if (id) {
                const index = myLists.findIndex(l => l.id == id);
                if (index > -1) myLists[index].name = name;
            } else {
                const newId = myLists.length ? Math.max(...myLists.map(l => l.id)) + 1 : 1;
                myLists.push({ id: newId, name, books: [] });
            }
            document.getElementById('listModalOverlay').classList.add('hidden');
            renderLists();
        });
    }
    
    // Botões Status
    const statusBtns = document.querySelectorAll('.status-btn');
    statusBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            this.parentElement.querySelectorAll('.status-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Feedback Genérico
    document.querySelectorAll('.modal-form').forEach(form => {
        if(form.id === 'goalForm' || form.id === 'listForm' || form.id === 'formUpdateProgress') return; 

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = form.querySelector('button[type="submit"]');
            const originalText = btn.innerText;
            btn.innerText = "Salvando...";
            setTimeout(() => {
                alert("Salvo com sucesso!");
                document.querySelectorAll('.modal-overlay').forEach(m => m.classList.add('hidden'));
                btn.innerText = originalText;
                form.reset();
            }, 800);
        });
    });
});
=======
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
>>>>>>> f2243554efef8ef984aff5a38bb31e653b3f31b5

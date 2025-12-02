// --- 1. LÓGICA DE AUTENTICAÇÃO ---
const user = JSON.parse(localStorage.getItem('user'));
if (!user) {
    // window.location.href = '../inicial/index.html';
    console.warn("Usuário não logado.");
}

// --- DADOS SIMULADOS (MOCK DB) ---
let myLibrary = [];

let myGoals = [];

// LISTAS agora guardam IDs dos livros
let myLists = [];

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
    updateHomeSection(); // Renderiza a página inicial
    setupSearch(); // Configura a busca

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

                // Limpa o campo de busca ao trocar de aba
                const searchInput = document.querySelector('.search-input');
                if (searchInput && targetId !== 'section-books') {
                    searchInput.value = '';
                }

                if (targetId === 'section-home') updateHomeSection();
                if (targetId === 'section-books') renderLibrary(); // Renderiza padrão (Todos)
                if (targetId === 'section-goals') renderGoals();
                if (targetId === 'section-lists') renderLists();
                if (targetId === 'section-history') renderHistory();
            }
        });
    });

    // --- FUNÇÕES DE RENDERIZAÇÃO ---

    // Atualizar Seção Home
    function updateHomeSection() {
        const homeSection = document.getElementById('section-home');
        if (!homeSection) return;

        if (myLibrary.length === 0) {
            homeSection.innerHTML = `
                <h1 class="welcome-title">Bem-vindo de volta, <span class="user-name-title">${user?.nome?.split(' ')[0] || 'Leitor'}</span>.</h1>
                <div class="empty-state">
                    <i class="fa-solid fa-book-open" style="font-size: 4rem; color: var(--color-accent-gold); margin-bottom: 20px;"></i>
                    <h2>Sua biblioteca está vazia</h2>
                    <p>Comece adicionando seus primeiros livros clicando no botão "Novo Livro" acima.</p>
                </div>
            `;
        } else {
            // Destaque: último livro atualizado, priorizando os com status "Lendo"
            const byUpdatedDesc = [...myLibrary]
                .filter(b => b.lastUpdated)
                .sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));
            const lastReading = byUpdatedDesc.find(b => b.status === 'Lendo') || byUpdatedDesc[0] || myLibrary[myLibrary.length - 1];

            let heroHTML = '';
            if (lastReading) {
                const hasPages = (lastReading.totalPages || 0) > 0;
                const percentage = hasPages ? Math.min(100, Math.round((lastReading.currentPage / lastReading.totalPages) * 100)) : 0;
                heroHTML = `
                    <div class="dashboard-card hero-card" style="margin-bottom: 25px;">
                        <div class="card-content-wrapper">
                            <div class="book-cover-placeholder">
                                <img src="${lastReading.cover}" alt="Capa">
                            </div>
                            <div class="book-details">
                                <span class="status-tag">${lastReading.status === 'Lido' ? 'Concluído' : 'Lendo Atualmente'}</span>
                                <h2 class="book-title">${lastReading.title}</h2>
                                <p class="book-author">${lastReading.author}</p>
                                ${hasPages ? `
                                <div class="reading-progress-container">
                                    <div class="progress-labels">
                                        <span>Progresso</span>
                                        <span>${percentage}%</span>
                                    </div>
                                    <div class="progress-bar-bg">
                                        <div class="progress-bar-fill" style="width: ${percentage}%;"></div>
                                    </div>
                                    <p class="progress-text">Página ${lastReading.currentPage} de ${lastReading.totalPages}</p>
                                </div>` : ''}
                                <button class="continue-btn" onclick="openEditBookModal(${lastReading.id})">${lastReading.status === 'Lido' ? 'Ver detalhes' : 'Continuar leitura'} <i class="fa-solid fa-pen-to-square" style="margin-left: 8px; font-size: 0.8em;"></i></button>
                            </div>
                        </div>
                    </div>
                `;
            }

            // Mostra últimos 4 livros adicionados
            const recentBooks = myLibrary.slice(-4).reverse();
            let cardsHTML = '';
            recentBooks.forEach(book => {
                cardsHTML += `
                    <div class="mini-book-card" style="background-image: url('${book.cover}'); background-size: cover; background-position: center; cursor: pointer;" onclick="openEditBookModal(${book.id})" title="${book.title}"></div>
                `;
            });

            homeSection.innerHTML = `
                <h1 class="welcome-title">Bem-vindo de volta, <span class="user-name-title">${user?.nome?.split(' ')[0] || 'Leitor'}</span>.</h1>
                ${heroHTML}
                <h3 class="section-title" style="font-size: 1.3rem; margin-bottom: 20px; color: var(--color-dark-bg);">Adicionados Recentemente</h3>
                <div class="recent-books-grid">
                    ${cardsHTML}
                </div>
            `;
        }
    }

    // Atualiza contadores dos filtros na aba "Meus Livros"
    function updateFilterCounts() {
        const counts = {
            'Todos': myLibrary.length,
            'Lendo': myLibrary.filter(b => b.status === 'Lendo').length,
            'Lido': myLibrary.filter(b => b.status === 'Lido').length,
            'Quero Ler': myLibrary.filter(b => b.status === 'Quero Ler').length,
        };

        const filtersEl = document.getElementById('libraryFilters');
        if (!filtersEl) return;
        const btns = filtersEl.querySelectorAll('.filter-btn');
        btns.forEach(btn => {
            const key = btn.getAttribute('data-filter') || btn.innerText.trim();
            const baseLabel = key; // mantém o texto original
            const count = counts[key] ?? 0;
            btn.innerHTML = `${baseLabel} <span class="filter-count-badge">${count}</span>`;
        });
    }

    // 1. Renderizar Biblioteca (Com Filtro)
    window.renderLibrary = function(filter = 'Todos') {
        const container = document.getElementById('libraryContainer');
        if (!container) return;
        container.innerHTML = '';
        updateFilterCounts();

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

            // Calcula progresso se tiver páginas
            let progressHTML = '';
            if (book.totalPages > 0) {
                const percentage = Math.min(100, Math.round((book.currentPage / book.totalPages) * 100));
                progressHTML = `
                    <div class="book-progress-mini">
                        <div class="progress-bar-mini-bg">
                            <div class="progress-bar-mini-fill" style="width: ${percentage}%;"></div>
                        </div>
                        <span class="progress-text-mini">${book.currentPage} / ${book.totalPages} páginas (${percentage}%)</span>
                    </div>
                `;
            }

            card.innerHTML = `
                <img src="${book.cover}" class="list-cover" alt="${book.title}">
                <div class="list-info">
                    <h3 class="list-title">${book.title}</h3>
                    <p class="list-author">${book.author}</p>
                    <div class="list-meta">
                        <span class="badge badge-genre">${book.genre}</span>
                        <span class="badge badge-status">${book.status}</span>
                    </div>
                    ${progressHTML}
                </div>
                <button class="btn-icon delete" onclick="event.stopPropagation(); deleteBook(${book.id})" title="Remover livro">
                    <i class="fa-solid fa-trash"></i>
                </button>
            `;

            // Adiciona clique no card para editar
            card.style.cursor = 'pointer';
            card.addEventListener('click', () => openEditBookModal(book.id));

            container.appendChild(card);
        });
        // garante contadores atualizados após render
        updateFilterCounts();
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

                // Pega o termo de busca atual
                const searchInput = document.querySelector('.search-input');
                const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';

                // Se tem busca, usa a função de busca, senão usa a renderização normal
                if (searchTerm) {
                    searchAndRenderLibrary(searchTerm);
                } else {
                    renderLibrary(filterValue);
                }
            });
        });
    }

    // 3. Setup Busca
    function setupSearch() {
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase().trim();

                // Se estiver na aba de livros, filtra
                const booksSection = document.getElementById('section-books');
                if (booksSection && !booksSection.classList.contains('hidden')) {
                    searchAndRenderLibrary(searchTerm);
                }
            });
        }
    }

    // 4. Buscar e Renderizar Biblioteca
    function searchAndRenderLibrary(searchTerm) {
        const container = document.getElementById('libraryContainer');
        if (!container) return;
        container.innerHTML = '';

        // Pega o filtro ativo
        const activeFilter = document.querySelector('.filter-btn.active');
        const filterValue = activeFilter ? (activeFilter.getAttribute('data-filter') || activeFilter.innerText) : 'Todos';

        const statusMap = {
            'Todos': 'Todos',
            'Lendo': 'Lendo',
            'Lidos': 'Lido',
            'Quero Ler': 'Quero Ler'
        };
        const targetStatus = statusMap[filterValue] || filterValue;

        // Filtra por status
        let filteredBooks = targetStatus === 'Todos'
            ? myLibrary
            : myLibrary.filter(book => book.status === targetStatus);

        // Filtra por termo de busca
        if (searchTerm) {
            filteredBooks = filteredBooks.filter(book =>
                book.title.toLowerCase().includes(searchTerm) ||
                book.author.toLowerCase().includes(searchTerm) ||
                book.genre.toLowerCase().includes(searchTerm)
            );
        }

        if (filteredBooks.length === 0) {
            container.innerHTML = '<p style="color:#888; grid-column: 1/-1;">Nenhum livro encontrado.</p>';
            return;
        }

        filteredBooks.forEach(book => {
            const card = document.createElement('div');
            card.className = 'book-list-card';

            let progressHTML = '';
            if (book.totalPages > 0) {
                const percentage = Math.min(100, Math.round((book.currentPage / book.totalPages) * 100));
                progressHTML = `
                    <div class="book-progress-mini">
                        <div class="progress-bar-mini-bg">
                            <div class="progress-bar-mini-fill" style="width: ${percentage}%;"></div>
                        </div>
                        <span class="progress-text-mini">${book.currentPage} / ${book.totalPages} páginas (${percentage}%)</span>
                    </div>
                `;
            }

            card.innerHTML = `
                <img src="${book.cover}" class="list-cover" alt="${book.title}">
                <div class="list-info">
                    <h3 class="list-title">${book.title}</h3>
                    <p class="list-author">${book.author}</p>
                    <div class="list-meta">
                        <span class="badge badge-genre">${book.genre}</span>
                        <span class="badge badge-status">${book.status}</span>
                    </div>
                    ${progressHTML}
                </div>
                <button class="btn-icon delete" onclick="event.stopPropagation(); deleteBook(${book.id})" title="Remover livro">
                    <i class="fa-solid fa-trash"></i>
                </button>
            `;

            card.style.cursor = 'pointer';
            card.addEventListener('click', () => openEditBookModal(book.id));

            container.appendChild(card);
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

    function renderHistory() {
        const historySection = document.getElementById('section-history');
        if (!historySection) return;

        if (myLibrary.length === 0) {
            historySection.innerHTML = `
                <h1 class="welcome-title">Histórico</h1>
                <div class="empty-state">
                    <i class="fa-solid fa-clock-rotate-left" style="font-size: 4rem; color: var(--color-accent-gold); margin-bottom: 20px;"></i>
                    <h2>Nenhum histórico ainda</h2>
                    <p>Quando você atualizar seus livros, eles aparecerão aqui.</p>
                </div>
            `;
            return;
        }

        // Ordena por última atualização (mais recente primeiro)
        const sortedBooks = [...myLibrary]
            .filter(book => book.lastUpdated)
            .sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));

        let historyHTML = '<h1 class="welcome-title">Histórico</h1>';
        historyHTML += '<p class="section-subtitle">Últimos livros atualizados</p>';
        historyHTML += '<div class="library-grid">';

        sortedBooks.forEach(book => {
            const date = new Date(book.lastUpdated);
            const dateStr = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

            let progressHTML = '';
            if (book.totalPages > 0) {
                const percentage = Math.min(100, Math.round((book.currentPage / book.totalPages) * 100));
                progressHTML = `
                    <div class="book-progress-mini">
                        <div class="progress-bar-mini-bg">
                            <div class="progress-bar-mini-fill" style="width: ${percentage}%;"></div>
                        </div>
                        <span class="progress-text-mini">${book.currentPage} / ${book.totalPages} páginas (${percentage}%)</span>
                    </div>
                `;
            }

            historyHTML += `
                <div class="book-list-card" style="cursor: pointer;" onclick="openEditBookModal(${book.id})">
                    <img src="${book.cover}" class="list-cover" alt="${book.title}">
                    <div class="list-info">
                        <h3 class="list-title">${book.title}</h3>
                        <p class="list-author">${book.author}</p>
                        <div class="list-meta">
                            <span class="badge badge-genre">${book.genre}</span>
                            <span class="badge badge-status">${book.status}</span>
                        </div>
                        ${progressHTML}
                        <p style="font-size: 0.75rem; color: #888; margin-top: 8px;"><i class="fa-solid fa-clock"></i> ${dateStr}</p>
                    </div>
                </div>
            `;
        });

        historyHTML += '</div>';
        historySection.innerHTML = historyHTML;
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
                    <button class="btn-icon delete" onclick="removeBookFromList(${list.id}, ${bookId})" title="Remover da lista">
                        <i class="fa-solid fa-trash"></i>
                    </button>
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

    // Remover Livro de uma Lista
    window.removeBookFromList = function(listId, bookId) {
        if(confirm('Remover este livro da lista?')) {
            const list = myLists.find(l => l.id === listId);
            if(list) {
                list.books = list.books.filter(id => id !== bookId);
                // Atualiza a UI
                openListDetails(listId); // Re-renderiza o modal
                renderLists(); // Atualiza a contagem na tela principal
            }
        }
    };

    // Abrir Modal de Edição do Livro
    window.openEditBookModal = function(bookId) {
        const book = myLibrary.find(b => b.id === bookId);
        if (!book) return;

        // Preenche o modal com os dados do livro
        document.querySelector('#updateModalOverlay .update-book-info h3').textContent = book.title;
        document.querySelector('#updateModalOverlay .update-book-info p').textContent =
            book.totalPages > 0 ? `Total de páginas: ${book.totalPages}` : 'Total de páginas não definido';

        const currentPageInput = document.getElementById('inputCurrentPage');
        currentPageInput.value = book.currentPage || 0;
        currentPageInput.max = book.totalPages || 9999;

        // Define o status ativo
        const statusBtnsUpdate = document.querySelectorAll('#updateModalOverlay .status-btn');
        statusBtnsUpdate.forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-status') === book.status ||
                (btn.getAttribute('data-status') === 'Lido' && book.status === 'Lido')) {
                btn.classList.add('active');
            }
        });

        // Guarda o ID do livro sendo editado
        document.getElementById('formUpdateProgress').dataset.bookId = bookId;

        // Abre o modal
        document.getElementById('updateModalOverlay').classList.remove('hidden');
    };

    window.deleteBook = function(id) {
        if(confirm("Tem certeza que deseja excluir este livro?")) {
            myLibrary = myLibrary.filter(b => b.id !== id);
            // Remove o livro de todas as listas
            myLists.forEach(list => {
                list.books = list.books.filter(bookId => bookId !== id);
            });
            updateHomeSection(); // Atualiza a home
            renderLibrary(); // Atualiza a biblioteca
            renderLists(); // Atualiza as listas
            updateFilterCounts();
        }
    };
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
    setupModal('goalModalOverlay', 'btnOpenGoalModal', 'closeGoalModalBtn');
    setupModal('listModalOverlay', 'btnCreateList', 'closeListModalBtn');

    // Setup manual para o Modal de Atualização (não deve resetar formulário)
    const updateModal = document.getElementById('updateModalOverlay');
    const closeUpdateBtn = document.getElementById('closeUpdateModalBtn');
    if (closeUpdateBtn && updateModal) {
        closeUpdateBtn.addEventListener('click', () => updateModal.classList.add('hidden'));
        updateModal.addEventListener('click', (e) => { if (e.target === updateModal) updateModal.classList.add('hidden'); });
    }

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

    // Formulário de Atualizar Progresso
    const updateProgressForm = document.getElementById('formUpdateProgress');
    if (updateProgressForm) {
        updateProgressForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const bookId = parseInt(updateProgressForm.dataset.bookId);
            const book = myLibrary.find(b => b.id === bookId);

            if (book) {
                const newPage = parseInt(document.getElementById('inputCurrentPage').value) || 0;
                const activeStatusBtn = updateProgressForm.querySelector('.status-btn.active');
                const newStatus = activeStatusBtn ? activeStatusBtn.getAttribute('data-status') : book.status;

                book.currentPage = newPage;
                book.status = newStatus;
                book.lastUpdated = new Date().toISOString();

                // Se concluiu, marca as páginas como total
                if (newStatus === 'Lido' && book.totalPages > 0) {
                    book.currentPage = book.totalPages;
                }

                document.getElementById('updateModalOverlay').classList.add('hidden');
                updateHomeSection();
                renderLibrary();
                renderHistory();
                updateFilterCounts();
                alert('Progresso atualizado com sucesso!');
            }
        });
    }

    // Formulário de Adicionar Livro
    const addBookForm = document.querySelector('#modalOverlay form');
    if (addBookForm) {
        addBookForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const title = document.getElementById('inputTitulo').value;
            const author = document.getElementById('inputAutor').value;
            const genre = document.getElementById('inputCategoria').value;
            const totalPages = parseInt(document.getElementById('inputPaginas').value) || 0;
            const cover = document.getElementById('inputCover')?.value || 'https://via.placeholder.com/300x450?text=Sem+Capa';

            // Pega o status do botão ativo (se tiver essa funcionalidade)
            const activeStatusBtn = addBookForm.querySelector('.status-btn.active');
            const status = activeStatusBtn ? activeStatusBtn.getAttribute('data-status') : 'Quero Ler';

            const newId = myLibrary.length ? Math.max(...myLibrary.map(b => b.id)) + 1 : 1;

            myLibrary.push({
                id: newId,
                title: title,
                author: author,
                genre: genre,
                status: status,
                cover: cover,
                totalPages: totalPages,
                currentPage: 0,
                lastUpdated: new Date().toISOString()
            });

            document.getElementById('modalOverlay').classList.add('hidden');
            addBookForm.reset();
            updateHomeSection(); // Atualiza a home
            renderLibrary(); // Atualiza a biblioteca se estiver visível
            alert('Livro adicionado com sucesso!');
        });
    }
});

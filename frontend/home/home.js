// --- 1. LÓGICA DE AUTENTICAÇÃO ---
const user = JSON.parse(localStorage.getItem('user'));
if (!user) {
    window.location.href = '../inicial/index.html';
}

// --- DADOS DA APLICAÇÃO ---
let myLibrary = [];

let myGoals = [];

// LISTAS agora guardam IDs dos livros
let myLists = [];

// Função para carregar livros do banco
async function loadBooksFromDB() {
    if (!user || !user.id) return;

    try {
        const response = await fetch(`http://localhost/scriba/home_scriba/api/livros.php?user_id=${user.id}`);
        const data = await response.json();

        if (data.success && data.livros) {
            myLibrary = data.livros.map(livro => {
                const sanitizedCover = (livro.capa || '').replace(/\\/g, '');
                const defaultCovers = [
                    'http://localhost/scriba/home_scriba/uploads/capa_padrao_1.svg',
                    'http://localhost/scriba/home_scriba/uploads/capa_padrao_2.svg',
                    'http://localhost/scriba/home_scriba/uploads/capa_padrao_3.svg',
                    'http://localhost/scriba/home_scriba/uploads/capa_padrao_4.svg'
                ];
                const deterministicDefault = defaultCovers[(Number(livro.id) - 1) % defaultCovers.length];
                return {
                    id: livro.id,
                    title: livro.titulo,
                    author: livro.autor,
                    genre: livro.genre || '',
                    status: livro.status || 'Quero Ler',
                    cover: sanitizedCover || deterministicDefault,
                    totalPages: livro.paginas || 0,
                    currentPage: livro.current_page || 0,
                    lastUpdated: livro.created_at
                };
            });
        }
    } catch (error) {
        // Silenciosamente falha se não conseguir carregar
    }
}

document.addEventListener('DOMContentLoaded', async () => {

    // Carregar livros do banco
    await loadBooksFromDB();

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

                // Mostrar/ocultar o campo de busca no topo dependendo da aba
                const searchContainer = document.getElementById('headerSearch') || document.querySelector('.search-container');
                const searchInput = document.querySelector('.search-input');
                if (searchContainer) {
                    if (targetId === 'section-books') searchContainer.classList.remove('hidden');
                    else searchContainer.classList.add('hidden');
                }
                // Limpa o campo de busca ao trocar para outra aba
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
                // Fallback de capa se a imagem não carregar
                const defaultCovers = [
                    'http://localhost/scriba/home_scriba/uploads/capa_padrao_1.svg',
                    'http://localhost/scriba/home_scriba/uploads/capa_padrao_2.svg',
                    'http://localhost/scriba/home_scriba/uploads/capa_padrao_3.svg',
                    'http://localhost/scriba/home_scriba/uploads/capa_padrao_4.svg'
                ];
                const safeHeroCover = lastReading.cover || defaultCovers[Math.floor(Math.random() * defaultCovers.length)];
                heroHTML = `
                    <div class="dashboard-card hero-card" style="margin-bottom: 25px;">
                        <div class="card-content-wrapper">
                            <div class="book-cover-placeholder">
                                <img src="${safeHeroCover}" alt="Capa" onerror="this.onerror=null; this.src='http://localhost/scriba/home_scriba/uploads/capa_padrao_1.svg';">
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
            const defaultCovers = [
                'http://localhost/scriba/home_scriba/uploads/capa_padrao_1.svg',
                'http://localhost/scriba/home_scriba/uploads/capa_padrao_2.svg',
                'http://localhost/scriba/home_scriba/uploads/capa_padrao_3.svg',
                'http://localhost/scriba/home_scriba/uploads/capa_padrao_4.svg'
            ];
            recentBooks.forEach(book => {
                const sanitizedCover = (book.cover || '').replace(/\\/g, '');
                const deterministicDefault = defaultCovers[(Number(book.id) - 1) % defaultCovers.length];
                const safeCover = sanitizedCover || deterministicDefault;
                cardsHTML += `
                    <div class="mini-book-card" style="cursor: pointer; position: relative; overflow: hidden; display: block;" onclick="openViewBookModal(${book.id})" title="${book.title}">
                        <img src="${safeCover}" alt="${book.title}" style="width: 100%; height: 100%; object-fit: cover; display: block;" onerror="this.src='http://localhost/scriba/home_scriba/uploads/capa_padrao_1.svg';">
                    </div>
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

            const defaultCovers = [
                'http://localhost/scriba/home_scriba/uploads/capa_padrao_1.svg',
                'http://localhost/scriba/home_scriba/uploads/capa_padrao_2.svg',
                'http://localhost/scriba/home_scriba/uploads/capa_padrao_3.svg',
                'http://localhost/scriba/home_scriba/uploads/capa_padrao_4.svg'
            ];
            const deterministicDefault = defaultCovers[(Number(book.id) - 1) % defaultCovers.length];
            const safeListCover = book.cover || deterministicDefault;
            card.innerHTML = `
                <img src="${safeListCover}" class="list-cover" alt="${book.title}" onerror="this.onerror=null; this.src='http://localhost/scriba/home_scriba/uploads/capa_padrao_1.svg';">
                <div class="list-info">
                    <h3 class="list-title">${book.title}</h3>
                    <p class="list-author">${book.author}</p>
                    <div class="list-meta">
                        ${book.genre ? `<span class="badge badge-genre">${book.genre}</span>` : ''}
                        <span class="badge badge-status">${book.status}</span>
                    </div>
                    ${progressHTML}
                </div>
                <button class="btn-icon edit" onclick="event.stopPropagation(); openEditBookFullModal(${book.id})" title="Editar livro" style="right: 60px;">
                    <i class="fa-solid fa-pen"></i>
                </button>
                <button class="btn-icon delete" onclick="event.stopPropagation(); deleteBook(${book.id})" title="Remover livro">
                    <i class="fa-solid fa-trash"></i>
                </button>
            `;

            // Adiciona clique no card para abrir modal de progresso
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
                        ${book.genre ? `<span class="badge badge-genre">${book.genre}</span>` : ''}
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
                            ${book.genre ? `<span class="badge badge-genre">${book.genre}</span>` : ''}
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

    // Abrir Modal de Visualização do Livro (Somente Leitura)
    window.openViewBookModal = function(bookId) {
        const book = myLibrary.find(b => b.id === bookId);
        if (!book) return;

        const defaultCovers = [
            'http://localhost/scriba/home_scriba/uploads/capa_padrao_1.svg',
            'http://localhost/scriba/home_scriba/uploads/capa_padrao_2.svg',
            'http://localhost/scriba/home_scriba/uploads/capa_padrao_3.svg',
            'http://localhost/scriba/home_scriba/uploads/capa_padrao_4.svg'
        ];
        const sanitizedCover = (book.cover || '').replace(/\\/g, '');
        const deterministicDefault = defaultCovers[(Number(book.id) - 1) % defaultCovers.length];
        const safeCover = sanitizedCover || deterministicDefault;

        const coverImg = document.getElementById('viewBookCover');
        coverImg.src = safeCover;
        coverImg.onerror = function() {
            this.onerror = null;
            this.src = 'http://localhost/scriba/home_scriba/uploads/capa_padrao_1.svg';
        };

        document.getElementById('viewBookTitle').textContent = book.title;
        document.getElementById('viewBookAuthor').textContent = book.author;
        document.getElementById('viewBookPages').textContent = book.totalPages > 0 ? `${book.totalPages} páginas` : 'Não definido';
        document.getElementById('viewBookStatus').textContent = book.status;

        document.getElementById('viewBookModalOverlay').classList.remove('hidden');
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

    window.deleteBook = async function(id) {
        if(confirm("Tem certeza que deseja excluir este livro?")) {
            try {
                const response = await fetch('http://localhost/scriba/home_scriba/api/livros.php', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: `id=${id}`
                });

                const data = await response.json();

                if (data.success) {
                    myLibrary = myLibrary.filter(b => b.id !== id);
                    // Remove o livro de todas as listas
                    myLists.forEach(list => {
                        list.books = list.books.filter(bookId => bookId !== id);
                    });
                    updateHomeSection(); // Atualiza a home
                    renderLibrary(); // Atualiza a biblioteca
                    renderLists(); // Atualiza as listas
                    updateFilterCounts();
                } else {
                    alert('Erro ao deletar livro: ' + data.message);
                }
            } catch (error) {
                alert('Erro ao conectar com o servidor');
            }
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

    // Setup manual para o Modal de Visualização (somente leitura)
    const viewBookModal = document.getElementById('viewBookModalOverlay');
    const closeViewBookBtn = document.getElementById('closeViewBookModalBtn');
    if(closeViewBookBtn && viewBookModal) {
        closeViewBookBtn.addEventListener('click', () => viewBookModal.classList.add('hidden'));
        viewBookModal.addEventListener('click', (e) => { if(e.target === viewBookModal) viewBookModal.classList.add('hidden'); });
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
        updateProgressForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const bookId = parseInt(updateProgressForm.dataset.bookId);
            const book = myLibrary.find(b => b.id === bookId);

            if (book) {
                const newPage = parseInt(document.getElementById('inputCurrentPage').value) || 0;
                const activeStatusBtn = updateProgressForm.querySelector('.status-btn.active');
                let newStatus = activeStatusBtn ? activeStatusBtn.getAttribute('data-status') : book.status;

                // Ajusta status automaticamente com base na página informada:
                // - Se >= totalPages -> 'Lido'
                // - Se > 0 e < totalPages -> 'Lendo'
                // - Se 0 -> mantém 'Quero Ler' (ou status atual)
                if (book.totalPages > 0) {
                    if (newPage >= book.totalPages) {
                        newStatus = 'Lido';
                    } else if (newPage > 0 && newPage < book.totalPages) {
                        newStatus = 'Lendo';
                    } else if (newPage === 0) {
                        // se 0, não forçar mudança — manter o que estava (ex: 'Quero Ler')
                        newStatus = book.status || newStatus;
                    }
                }

                // Se concluiu, marca as páginas como total
                const finalPage = (newStatus === 'Lido' && book.totalPages > 0) ? book.totalPages : newPage;

                // Atualiza no banco
                try {
                    const formData = new FormData();
                    formData.append('id', bookId);
                    formData.append('titulo', book.title);
                    formData.append('autor', book.author);
                    formData.append('genre', book.genre || '');
                    formData.append('paginas', book.totalPages);
                    formData.append('current_page', finalPage);
                    formData.append('status', newStatus);
                    formData.append('capa', book.cover);

                    const response = await fetch('http://localhost/scriba/home_scriba/api/livros.php', {
                        method: 'PUT',
                        body: new URLSearchParams(formData)
                    });

                    const data = await response.json();

                    if (data.success) {
                        book.currentPage = finalPage;
                        book.status = newStatus;
                        book.lastUpdated = new Date().toISOString();

                        document.getElementById('updateModalOverlay').classList.add('hidden');
                        updateHomeSection();
                        renderLibrary();
                        renderHistory();
                        updateFilterCounts();
                        alert('Progresso atualizado com sucesso!');
                    } else {
                        alert('Erro ao atualizar: ' + data.message);
                    }
                } catch (error) {
                    alert('Erro ao conectar com o servidor');
                }
            }
        });
    }

    // Preview de imagem ao selecionar arquivo
    const coverInput = document.getElementById('inputCover');
    const capaPreview = document.getElementById('capaPreview');

    if (coverInput && capaPreview) {
        coverInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    capaPreview.innerHTML = `<img src="${e.target.result}" style="max-width: 150px; max-height: 200px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">`;
                };
                reader.readAsDataURL(file);
            } else {
                capaPreview.innerHTML = '';
            }
        });
    }

    // Formulário de Adicionar Livro
    const addBookForm = document.querySelector('#modalOverlay form');
    if (addBookForm) {
        addBookForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const title = document.getElementById('inputTitulo').value;
            const author = document.getElementById('inputAutor').value;
            const genre = document.getElementById('inputCategoria').value;
            const totalPages = parseInt(document.getElementById('inputPaginas').value) || 0;
            const coverFile = document.getElementById('inputCover')?.files[0];

            // Pega o status do botão ativo (se tiver essa funcionalidade)
            const activeStatusBtn = addBookForm.querySelector('.status-btn.active');
            const status = activeStatusBtn ? activeStatusBtn.getAttribute('data-status') : 'Quero Ler';

            try {
                // Escolhe uma capa padrão de forma sequencial para garantir variedade
                const capasPadrao = [
                    'http://localhost/scriba/home_scriba/uploads/capa_padrao_1.svg',
                    'http://localhost/scriba/home_scriba/uploads/capa_padrao_2.svg',
                    'http://localhost/scriba/home_scriba/uploads/capa_padrao_3.svg',
                    'http://localhost/scriba/home_scriba/uploads/capa_padrao_4.svg'
                ];
                const nextIndex = myLibrary.length % capasPadrao.length;
                let coverUrl = capasPadrao[nextIndex];

                // Se o usuário selecionou uma imagem, faz o upload primeiro
                if (coverFile) {
                    const uploadFormData = new FormData();
                    uploadFormData.append('capa', coverFile);

                    const uploadResponse = await fetch('http://localhost/scriba/home_scriba/api/upload.php', {
                        method: 'POST',
                        body: uploadFormData
                    });

                    const uploadData = await uploadResponse.json();

                    if (uploadData.success) {
                        coverUrl = uploadData.url;
                    } else {
                        alert('Erro ao fazer upload da capa: ' + uploadData.message);
                        return;
                    }
                }

                // Agora adiciona o livro com a URL da capa
                const formData = new FormData();
                formData.append('user_id', user.id);
                formData.append('titulo', title);
                formData.append('autor', author);
                formData.append('genre', genre);
                formData.append('paginas', totalPages);
                // Se o livro já for marcado como 'Lido', define a página atual como o total de páginas
                const currentPageToSend = (status === 'Lido') ? totalPages : 0;
                formData.append('current_page', currentPageToSend);
                formData.append('status', status);
                formData.append('capa', coverUrl);

                const response = await fetch('http://localhost/scriba/home_scriba/api/livros.php', {
                    method: 'POST',
                    body: formData
                });

                const data = await response.json();

                if (data.success) {
                    // Adiciona ao array local também
                    myLibrary.push({
                        id: data.livro.id,
                        title: title,
                        author: author,
                        genre: genre,
                        status: status,
                        cover: coverUrl,
                        totalPages: totalPages,
                        currentPage: currentPageToSend,
                        lastUpdated: new Date().toISOString()
                    });

                    document.getElementById('modalOverlay').classList.add('hidden');
                    addBookForm.reset();
                    if (capaPreview) capaPreview.innerHTML = ''; // Limpa o preview
                    updateHomeSection(); // Atualiza a home
                    renderLibrary(); // Atualiza a biblioteca se estiver visível
                    alert('Livro adicionado com sucesso!');
                } else {
                    alert(data.message || 'Erro ao adicionar livro');
                }
            } catch (error) {
                alert('Erro ao conectar com o servidor');
            }
        });
    }

    // Modal de Edição Completa do Livro
    const closeEditBookModalBtn = document.getElementById('closeEditBookModalBtn');
    const editBookModalOverlay = document.getElementById('editBookModalOverlay');
    const editCoverInput = document.getElementById('editCover');
    const editCapaPreview = document.getElementById('editCapaPreview');

    if (closeEditBookModalBtn) {
        closeEditBookModalBtn.addEventListener('click', () => {
            editBookModalOverlay.classList.add('hidden');
        });
    }

    // Preview de capa ao editar
    if (editCoverInput && editCapaPreview) {
        editCoverInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    editCapaPreview.innerHTML = `<img src="${e.target.result}" style="max-width: 150px; max-height: 200px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">`;
                };
                reader.readAsDataURL(file);
            } else {
                editCapaPreview.innerHTML = '';
            }
        });
    }

    // Função para abrir modal de edição completa
    window.openEditBookFullModal = function(bookId) {
        const book = myLibrary.find(b => b.id === bookId);
        if (!book) return;

        // Define capas padrão e sanitiza a URL da capa atual (remove barras invertidas do JSON)
        const defaultCovers = [
            'http://localhost/scriba/home_scriba/uploads/capa_padrao_1.svg',
            'http://localhost/scriba/home_scriba/uploads/capa_padrao_2.svg',
            'http://localhost/scriba/home_scriba/uploads/capa_padrao_3.svg',
            'http://localhost/scriba/home_scriba/uploads/capa_padrao_4.svg'
        ];
        const sanitizedCover = (book.cover || '').replace(/\\/g, '');
        const deterministicDefault = defaultCovers[(Number(book.id) - 1) % defaultCovers.length];
        const currentCover = sanitizedCover || deterministicDefault;

        document.getElementById('editTitulo').value = book.title;
        document.getElementById('editAutor').value = book.author;
        document.getElementById('editCategoria').value = book.genre || '';
        document.getElementById('editPaginas').value = book.totalPages || '';

        // Mostra capa atual com fallback seguro
        editCapaPreview.innerHTML = `
            <p style="color: #888; font-size: 0.9rem; margin-bottom: 10px;">Capa atual:</p>
            <img src="${currentCover}" onerror="this.onerror=null; this.src='http://localhost/scriba/home_scriba/uploads/capa_padrao_1.svg';" style="max-width: 150px; max-height: 200px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        `;

        document.getElementById('formEditBook').dataset.bookId = bookId;
        editBookModalOverlay.classList.remove('hidden');
    };

    // Submit do formulário de edição
    const formEditBook = document.getElementById('formEditBook');
    if (formEditBook) {
        formEditBook.addEventListener('submit', async (e) => {
            e.preventDefault();

            const bookId = parseInt(formEditBook.dataset.bookId);
            const book = myLibrary.find(b => b.id === bookId);
            if (!book) return;

            const title = document.getElementById('editTitulo').value;
            const author = document.getElementById('editAutor').value;
            const genre = document.getElementById('editCategoria').value;
            const totalPages = parseInt(document.getElementById('editPaginas').value) || 0;
            const coverFile = editCoverInput.files[0];

            try {
                let coverUrl = book.cover; // Mantém a capa atual por padrão

                // Se selecionou nova imagem, faz upload
                if (coverFile) {
                    const uploadFormData = new FormData();
                    uploadFormData.append('capa', coverFile);

                    const uploadResponse = await fetch('http://localhost/scriba/home_scriba/api/upload.php', {
                        method: 'POST',
                        body: uploadFormData
                    });

                    const uploadData = await uploadResponse.json();

                    if (uploadData.success) {
                        coverUrl = uploadData.url;
                    } else {
                        alert('Erro ao fazer upload da capa: ' + uploadData.message);
                        return;
                    }
                }

                // Atualiza o livro na API
                const formData = new FormData();
                formData.append('id', bookId);
                formData.append('titulo', title);
                formData.append('autor', author);
                formData.append('genre', genre);
                formData.append('paginas', totalPages);
                formData.append('current_page', book.currentPage);
                formData.append('status', book.status);
                formData.append('capa', coverUrl);

                const response = await fetch('http://localhost/scriba/home_scriba/api/livros.php', {
                    method: 'PUT',
                    body: new URLSearchParams(formData)
                });

                const data = await response.json();

                if (data.success) {
                    // Atualiza o array local
                    book.title = title;
                    book.author = author;
                    book.genre = genre;
                    book.totalPages = totalPages;
                    book.cover = coverUrl;
                    book.lastUpdated = new Date().toISOString();

                    editBookModalOverlay.classList.add('hidden');
                    formEditBook.reset();
                    editCapaPreview.innerHTML = '';
                    updateHomeSection();
                    renderLibrary();
                    alert('Livro atualizado com sucesso!');
                } else {
                    alert('Erro ao atualizar livro: ' + data.message);
                }
            } catch (error) {
                alert('Erro ao conectar com o servidor');
            }
        });
    }

    // Após definir todas as funções e handlers, renderiza com dados carregados
    updateHomeSection();
    renderLibrary();
});

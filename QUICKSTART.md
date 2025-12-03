# 🚀 Guia Rápido - Scriba

## ⚡ Setup em 5 Minutos

### 1️⃣ Instalar XAMPP
- **Windows**: https://www.apachefriends.org/
- **Linux**: `sudo ./xampp-linux-*-installer.run`

### 2️⃣ Colocar Projeto na Pasta
```bash
# Linux
/opt/lampp/htdocs/scriba/

# Windows
C:\xampp\htdocs\scriba\
```

### 3️⃣ Criar Banco de Dados
Acesse http://localhost/phpmyadmin e execute `database.sql` ou:

```bash
# Linux
/opt/lampp/bin/mysql -u root < database.sql

# Windows
C:\xampp\mysql\bin\mysql.exe -u root < database.sql
```

### 4️⃣ Iniciar Servidores
```bash
# Linux
sudo /opt/lampp/lampp start
# ou
./start.sh

# Windows
Abrir XAMPP Control Panel → Start Apache e MySQL
# ou
start.bat
```

### 5️⃣ Acessar
Abra: http://localhost/scriba/home_scriba/frontend/inicial/index.html

---

## 📋 Checklist Pós-Instalação

- [ ] Apache rodando (porta 80)
- [ ] MySQL rodando (porta 3306)
- [ ] Banco `scriba_db` criado
- [ ] Tabelas `usuarios` e `livros` existem
- [ ] Pasta `uploads` tem permissão de escrita (Linux/macOS)
- [ ] Aplicação abre no navegador

---

## 🔧 Solução Rápida de Problemas

### ❌ "Failed to fetch"
✅ Verifique se Apache está rodando

### ❌ "Table doesn't exist"
✅ Execute o arquivo `database.sql`

### ❌ "Access denied"
✅ Edite `api/db.php` com sua senha do MySQL

### ❌ Upload não funciona (Linux)
✅ `sudo chmod -R 777 uploads`

---

## 📖 Documentação Completa
Veja [README.md](README.md) para instruções detalhadas

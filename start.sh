#!/bin/bash

echo "📚 Scriba - Sistema de Gerenciamento de Biblioteca"
echo "=================================================="
echo ""

# Verificar se o LAMPP está rodando
if [ ! -f /opt/lampp/lampp ]; then
    echo "❌ LAMPP não encontrado em /opt/lampp"
    echo "   Instale o LAMPP ou ajuste o caminho neste script"
    exit 1
fi

# Verificar status do Apache
if pgrep -x "httpd" > /dev/null; then
    echo "✅ Apache já está rodando"
else
    echo "⏳ Iniciando Apache..."
    sudo /opt/lampp/lampp startapache
fi

# Verificar status do MySQL
if pgrep -x "mysqld" > /dev/null; then
    echo "✅ MySQL já está rodando"
else
    echo "⏳ Iniciando MySQL..."
    sudo /opt/lampp/lampp startmysql
fi

echo ""
echo "🌐 Aplicação disponível em:"
echo "   http://localhost/scriba/home_scriba/frontend/inicial/index.html"
echo ""
echo "🗄️  phpMyAdmin:"
echo "   http://localhost/phpmyadmin"
echo ""
echo "💡 Para parar os serviços: sudo /opt/lampp/lampp stop"
echo ""

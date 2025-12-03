// Configuração central da aplicação
const APP_CONFIG = {
    // URL base da aplicação - ALTERE AQUI caso mude o caminho do projeto
    BASE_URL: 'http://localhost/scriba/home_scriba',

    // URLs das APIs
    get API_URL() {
        return `${this.BASE_URL}/api`;
    },

    get UPLOADS_URL() {
        return `${this.BASE_URL}/uploads`;
    },

    // Capas padrão
    get DEFAULT_COVERS() {
        return [
            `${this.UPLOADS_URL}/capa_padrao_1.svg`,
            `${this.UPLOADS_URL}/capa_padrao_2.svg`,
            `${this.UPLOADS_URL}/capa_padrao_3.svg`,
            `${this.UPLOADS_URL}/capa_padrao_4.svg`
        ];
    }
};

FROM node:20-alpine

# Instalar dependências necessárias para o yt-dlp (Python)
RUN apk add --no-cache python3

WORKDIR /app

# Copiar arquivos de dependência
COPY package*.json ./

# Instalar dependências (forçando ignorar o check do python se necessário)
RUN YOUTUBE_DL_SKIP_PYTHON_CHECK=1 npm install --production=false

# Copiar o resto do código
COPY . .

# Fazer o build do TypeScript
RUN npm run build

# Remover devDependencies para limpar a imagem
RUN npm prune --production

# Expor a porta 3001
EXPOSE 3001

# Comando de inicialização
CMD ["npm", "start"]

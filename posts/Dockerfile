# Valime kergkaalulise Node versiooni
FROM node:22-alpine

# Määrame töökausta konteineris
WORKDIR /app

# Kopeerime package failid ja paigaldame sõltuvused
COPY package*.json ./
RUN npm install

# Kopeerime ülejäänud koodi
COPY . .

# Avame teenuse porti
EXPOSE 3000

# Käivitame rakenduse
CMD ["npm", "start"]

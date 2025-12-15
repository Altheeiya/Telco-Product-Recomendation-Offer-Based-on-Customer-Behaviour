# Gunakan base image Node.js
FROM node:18-slim

# Install Python dan Pip
RUN apt-get update && apt-get install -y python3 python3-pip

# Set working directory
WORKDIR /app

# Copy package files dan install dependencies Node
COPY package*.json ./
RUN npm install

# Copy requirements dan install dependencies Python
COPY requirements.txt ./
# --break-system-packages diperlukan untuk environment Debian terbaru
RUN pip3 install -r requirements.txt --break-system-packages

# Copy seluruh kode
COPY . .

# Expose port (sesuai server.js Anda)
EXPOSE 5001

# Jalankan aplikasi
CMD ["npm", "start"]
const express = require('express');
const multer = require('multer');
const fs = require('fs-extra');
const path = require('path');

const app = express();
const PORT = 3000;

// Configurar almacenamiento de archivos con multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage: storage });

//app.set('view engine', 'ejs');

// Middleware para manejar datos JSON y formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos desde la carpeta 'public'
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));

// Ruta para manejar el formulario de contacto
app.post('/submit-form', upload.single('dpi'), (req, res) => {
  const { nombre, email } = req.body;
  const archivoDpi = req.file;

  // Crear objeto con los datos del contacto
  const contacto = {
    nombre,
    email,
    archivoDpi: archivoDpi ? archivoDpi.filename : null,
  };

  // Guardar datos del contacto en un archivo JSON
  fs.readJson('./data/contactos.json')
    .then((data) => {
      data.push(contacto);
      return fs.writeJson('./data/contactos.json', data);
    })
    .catch(() => {
      return fs.writeJson('./data/contactos.json', [contacto]);
    })
    .then(() => {
      res.send('Formulario recibido y datos guardados.');
    })
    .catch((err) => {
      res.status(500).send('Error al guardar los datos.');
      console.error(err);
    });
});

// Ruta para mostrar los archivos subidos
app.get('/archivos', (req, res) => {
  fs.readdir('./uploads', (err, files) => {
    if (err) {
      return res.status(500).send('Error al leer la carpeta de archivos.');
    }

    let html = '<h2>Archivos Subidos</h2><ul>';
    files.forEach((file) => {
      html += `<li><a href="/uploads/${file}" download>${file}</a></li>`;
    });
    html += '</ul>';

    res.send(html);
  });
});

app.get('/imagenes', (req, res) => {
  const dirPath = path.join(__dirname, 'uploads');
  fs.readdir(dirPath, (err, files) => {
    if (err) {
      return res.status(500).send('Error al leer archivos');
    }

    // Filtrar solo archivos de imagen (opcional)
    const imageFiles = files.filter(file => {
      return ['.jpg', '.jpeg', '.png', '.gif'].includes(path.extname(file).toLowerCase());
    });

    res.render('imagenes', { images: imageFiles });
  });
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor iniciado en http://localhost:${PORT}`);
});

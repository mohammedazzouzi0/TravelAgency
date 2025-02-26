const express = require('express');
const mysql = require('mysql');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();

// Middleware for parsing request bodies and serving static files
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Configuration de la connexion MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',  // Vérifiez et mettez à jour votre nom d'utilisateur MySQL
    password: '',  // Vérifiez et mettez à jour votre mot de passe MySQL
    database: 'travel_agency'
});

// Connexion à la base de données
db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('Connecté à la base de données MySQL');
});

// Routes pour servir les fichiers HTML
app.get('/index', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/aboutUs', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'aboutUs.html'));
});

app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'contact.html'));
});

app.get('/booking', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'booking.html'));
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'payment.html'));
});

// Démarrer le serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});


// Route pour booking
app.post('/booking', (req, res) => {
    const { cities, startTrip, adultsNumber, endTrip , children } = req.body;
    const sql = 'INSERT INTO booking (cities, startTrip, adultsNumber, endTrip , children) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [cities, startTrip, adultsNumber, endTrip , children], (err, result) => {
        if (err) throw err;
        if (result.length > 0) {
            res.send('<script>alert("les informations incorrect"); window.history.back();</script>');
        }
        else{
            res.sendFile(path.join(__dirname, 'views', 'payment.html'));
        }
        
    });
});


app.post('/payment', (req, res) => {
    const { name, cc_number, cc_month, cc_year, cc_cvc, save_cc } = req.body;
  
    // Insérez les données dans la base de données
    const query = 'INSERT INTO payment (name, cc_number, cc_month, cc_year, cc_cvc, save_cc) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(query, [name, cc_number, cc_month, cc_year, cc_cvc, save_cc ? 1 : 0], (err, result) => {
      if (err) {
        console.error('Erreur lors de l\'insertion des données:', err);
        res.status(500).send('Erreur du serveur');
        return;
      }
      else{
        res.send('<script>alert("Détails de paiement enregistrés avec succès"); window.history.back();</script>');
      }
      
    });
});

// Route pour gérer les abonnements à la newsletter
app.post('/subscribe', (req, res) => {
    const { email } = req.body;
    const sql = 'INSERT INTO subscriptions (email) VALUES (?)';
    db.query(sql, [email], (err, result) => {
        if (err) throw err;
        res.send('<script>alert("Abonnement réussi"); window.history.back();</script>');
    });
});




// Route pour gérer les soumissions du formulaire de contact
app.post('/contact-submit', (req, res) => {
    const { first_name, last_name, email, mobile_number, message } = req.body;
    const sql = 'INSERT INTO contact_messages (first_name, last_name, email, mobile_number, message) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [first_name, last_name, email, mobile_number, message], (err, result) => {
        if (err) throw err;
        res.send('<script>alert("Data reussi"); window.history.back();</script>');
    });
});

// Route pour gérer les soumissions du formulaire d'inscription
app.post('/submit-signup', (req, res) => {
    const { name, email, password } = req.body;
    const sqlCheckEmail = 'SELECT * FROM users WHERE email = ?';
    db.query(sqlCheckEmail, [email], (err, result) => {
        if (err) {
            console.error('Erreur SQL:', err);
            return res.status(500).send("Une erreur s'est produite lors de l'inscription.");
        }

        if (result.length > 0) {
            
            return res.status(400).send('<script>alert("Désolé, l adresse e-mail que vous avez fournie est déjà associée à un compte existant. Veuillez utiliser une adresse e-mail différente"); window.history.back();</script>');
        } else {
            const sqlInsertUser = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
            db.query(sqlInsertUser, [name, email, password], (err, result) => {
                if (err) {
                    console.error('Erreur SQL:', err);
                    return res.status(500).send("Une erreur s'est produite lors de l'inscription.");
                }
                res.sendFile(path.join(__dirname, 'views', 'login.html'));
            });
        }
    });
});

// Route pour gérer les soumissions du formulaire de connexion
app.post('/submit-login', (req, res) => {
    const { email, password } = req.body;
    const sql = 'SELECT * FROM users WHERE email = ? AND password = ?';
    db.query(sql, [email, password], (err, result) => {
        if (err) throw err;
        if (result.length > 0) {
            res.sendFile(path.join(__dirname, 'views', 'index.html'));
        } else {
            res.send('<script>alert("Adresse e-mail ou mot de passe incorrect"); window.history.back();</script>');
        }
    });
});

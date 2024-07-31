const express = require('express');
const mysql = require('mysql2');
const app = express();

// Create MySQL connection
const connection = mysql.createConnection({
    host: 'db4free.net',
    user: 'hong_database',
    password: 'Pangteckhong2003',
    database: 'hong_database'
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

// Set up view engine
app.set('view engine', 'ejs');

// enable static files
app.use(express.static('public'));

//enable form processing 
app.use(express.urlencoded({ 
    extended: true 
}));

app.get('/', (req, res) => {
    const sql = 'SELECT * FROM products';
    //Fetch data from MySQL
    connection.query( sql, (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.status(500).send('Error retrieving products');
        }
        //Render HTML page with data
        res.render('index', { products: results });
    });
});

app.get('/product/:id', (req, res) => {
    //Extractthe product ID from the request paraneters
    const productId = req.params.id;
    const sql = 'SELECT * FROM products WHERE productId = ?';
    //Fetch data from MySQL from the product ID
    connection.query( sql, [productId], (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.status(500).send('Error retrieving product by ID');
        }
        //Check if any product with the given ID was found
        if (results.length > 0) {
            //Render HTML page with the product data
            res.render('product', { product: results[0] });
        }
        else{
            //If no product with the given ID was found, render a 404 page or hander it accordingly
            res.results(404).send('Product not found');
        }
    });
});

app.get('/allProduct', (req, res) => {
    const sql = 'SELECT * FROM products';
    //Fetch data from MySQL
    connection.query( sql, (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.status(500).send('Error retrieving products');
        }
        //Render HTML page with data
        res.render('allProduct', { products: results });
    });
});

app.get('/addProduct', (req, res) => {
    //res.render('addProduct');
    const sql = 'SELECT * FROM category AS C ORDER BY C.CatId';
    // Fetch data from MySQL
    connection.query(sql, (error, results) => {
        if (error) {
            console.error('Error fecthing data:', error.message);
            return res.status(500).send('Error retrieving categories');
        }
        // Render HTML page with data
        res.render('addProduct', { categories: results });
    });
});

app.post('/addProduct', (req, res) => {
    //Extract product data from the rerquest body
    const { name, descript, brand, color, style, price, image, category } = req.body;
    const sql = 'INSERT INTO products (name, descript, brand, color, style, price, image, catId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    //Insert the new Product into the database
    connection.query( sql, [name, descript, brand, color, style, price, image, category], (error, results) => {
        if (error) {
            //Handle any error that occurs during the database operation
            console.error('Database adding product:', error);
            return res.status(500).send('Error adding product');
        }
        else{
            //Send a succedd response
            res.redirect('/');
        }
    });
});

app.get('/editProduct/:id', (req, res) => {
    const productId = req.params.id;
    const productSql = 'SELECT * FROM products WHERE productId = ?';
    const categorySql = 'SELECT * FROM category ORDER BY catId';

    // Fetch product data
    connection.query(productSql, [productId], (error, productResults) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.status(500).send('Error retrieving product');
        }

        // Fetch category data
        connection.query(categorySql, (categoryError, categoryResults) => {
            if (categoryError) {
                console.error('Database query error:', categoryError.message);
                return res.status(500).send('Error retrieving categories');
            }
            else{
                // Render the editProduct template with both product and category data
                res.render('editProduct', { product: productResults[0], categories: categoryResults });
            }
        });
    });
});


app.post('/editProduct/:id', (req, res) => {
    const productId = req.params.id;
    // Extract product data from the request body
    const { name, descript, brand, color, style, price, image, category } = req.body;
    const sql = 'UPDATE products SET name = ?, descript = ?, brand = ?, color = ?, style = ?, price = ?, image = ?, catId = ? WHERE productId = ?';

    // Update the product in the database
    connection.query(sql, [name, descript, brand, color, style, price, image, category, productId], (error, results) => {
        if (error) {
            // Handle any error that occurs during the database operation
            console.error('Database updating product:', error);
            return res.status(500).send('Error updating product');
        }
        // Send a success response
        res.redirect('/allProduct');
    });
});


app.get('/deleteProduct/:id', (req, res) => {
    const productId = req.params.id;
    const sql = 'DELETE FROM products WHERE productId = ?';
    connection.query(sql, [productId], (error, results) => {
        if (error) {
            console.error('Error deleting product:', error.message);
            return res.status(500).send('Error deleting product');
        }
        res.redirect('/allProduct');
    });
});

app.get('/category/:catId', (req, res) => {
    // Extract the category ID from the request parameters
    const catId = req.params.catId;
    const catDesc = req.params.catDesc;
    const sql = `SELECT p.* FROM products p WHERE p.catId = ?`;
    // Fetch data from MySQL using the category ID
    connection.query(sql, [catId], (error, results) => {
        if (error) {
            console.error('Database query error:', error.message);
            return res.status(500).send('Error retrieving products form the category');
        }
        else{
            // Render HTML page with the products data
            res.render('category', { catId: catDesc, products: results });
        }
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
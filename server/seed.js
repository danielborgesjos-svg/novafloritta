const Database = require('better-sqlite3');
const db = new Database('database.db');

const products = [
  { name: 'Rosa embalada com ferrero', price: 35.99, desc: '', img: 'https://i.imgur.com/9liXyPC.png', cat: 1 },
  { name: 'Rosa embalada', price: 20.00, desc: 'Rosa embalada celofane com laço.', img: 'https://i.imgur.com/te6WJcJ.png', cat: 1 },
  { name: 'Mini buque Mundo amarelo doce', price: 99.99, desc: '(3 girassol 3 ferrero rocher)', img: 'https://i.imgur.com/by2bFNy.png', cat: 4 },
  { name: 'Surpresa cacau show com balão', price: 59.99, desc: '(1 caixa de bombom cacau show ,1 balão coração pequeno)', img: 'https://i.imgur.com/Cm8xQ9I.png', cat: 3 },
  { name: 'Buque primavera', price: 129.99, desc: 'buque astromelia (ver disponibilidade de cores )', img: 'https://i.imgur.com/AB1X1Ym.png', cat: 2 },
  { name: 'Buque mundo amarelo', price: 109.99, desc: '(6 girassol)', img: 'https://i.imgur.com/v3zwnEj.jpeg', cat: 4 },
  { name: 'Buque meu mundo rosa trufado', price: 159.99, desc: '( 6 rosas rosas e 6 trufas cacau show)', img: 'https://i.imgur.com/uJPQ9zy.png', cat: 2 },
  { name: 'Mini buque emoções', price: 89.99, desc: '(3 rosas 🌹  3 ferrero)', img: 'https://i.imgur.com/UHjdKaG.png', cat: 2 },
  { name: 'Buque solitário com chaveiro', price: 39.99, desc: '(1 rosa, 1 chaveiro urso)', img: 'https://i.imgur.com/mJGF6Xu.png', cat: 1 },
  { name: 'Mini buque emoções', price: 69.99, desc: '(3 rosas 🌹)', img: 'https://i.imgur.com/bseaMha.png', cat: 2 },
  { name: 'Cesta de café ☕️', price: 149.99, desc: '', img: 'https://i.imgur.com/bzy7s4M.jpeg', cat: 3 },
  { name: 'Cesta urso e cacau show', price: 99.99, desc: '', img: 'https://i.imgur.com/cj8arae.png', cat: 3 },
  { name: 'Buque solitário mundo amarelo com chaveiro', price: 49.99, desc: '(1 girassol,  1 chaveiro urso)', img: 'https://i.imgur.com/wDk9a6r.png', cat: 4 },
  { name: 'Buque muitas emoções', price: 159.99, desc: '(12 rosas)', img: 'https://i.imgur.com/RYzeANB.png', cat: 2 },
  { name: 'Buque trufado', price: 139.99, desc: '(6 rosas 6 trufas cacau show)', img: 'https://i.imgur.com/ZDHTalN.png', cat: 2 },
  { name: 'Buque mundo azul', price: 189.99, desc: '(12 rosas azuis)', img: 'https://i.imgur.com/gADtbnl.png', cat: 2 },
  { name: 'Buque mundo amarelo doce', price: 129.99, desc: '6 girassol e 6 ferrero', img: 'https://i.imgur.com/Z0qSu63.png', cat: 4 },
  { name: 'Buque emoções doce', price: 139.99, desc: '(6 rosas 🌹 e 6 ferrero rocher)', img: 'https://i.imgur.com/ru3EsDI.jpeg', cat: 2 },
  { name: 'Buque muitas emoções', price: 209.99, desc: '(12 rosas e 12 ferrero)', img: 'https://i.imgur.com/e3AteaP.jpeg', cat: 2 },
  { name: 'Buque emoções', price: 109.99, desc: '(6 rosas)', img: 'https://i.imgur.com/uKGuatT.png', cat: 2 },
  { name: 'Buque emoções com surpresa cacau show', price: 149.99, desc: '( 6 rosas , 1 caixa bombom cacau show)', img: 'https://i.imgur.com/msAzyNt.png', cat: 2 },
  { name: 'Buque meu mundo misto', price: 189.99, desc: '(6 girassol 6 rosas vermelhas)', img: 'https://i.imgur.com/9ChDn2t.png', cat: 2 },
  { name: 'Buque europeu', price: 139.99, desc: '(12 rosas , 8 alstromelia)', img: 'https://i.imgur.com/3hScNxX.png', cat: 2 },
  { name: 'Casal stitch azul e rosa', price: 119.99, desc: '(2 pelúcia 20 cm )', img: 'https://i.imgur.com/u9ZOkey.png', cat: 3 },
  { name: 'Arranjo stitch rosa', price: 109.99, desc: '(3 rosas e pelúcia)', img: 'https://i.imgur.com/HeqwWIk.png', cat: 3 },
  { name: 'Buque solitário', price: 25.99, desc: '(1 rosa)', img: 'https://i.imgur.com/qZsnlFM.png', cat: 1 },
  { name: 'Buque solitário mundo amarelo', price: 29.99, desc: '(1 girassol)', img: 'https://i.imgur.com/nBuWTq2.png', cat: 4 },
  { name: 'Mini buque Mundo amarelo', price: 49.99, desc: '(3 girassol)', img: 'https://i.imgur.com/DuSn2ye.png', cat: 4 },
  { name: 'Buque cheiro de rosas', price: 219.99, desc: '( 6 lírios rosa, 6 rosas cor de rosas )', img: 'https://i.imgur.com/Ldzj7Pd.jpeg', cat: 2 },
  { name: 'Buque stich 3 rosas 🌹', price: 119.99, desc: '', img: 'https://i.imgur.com/ISGmPnG.png', cat: 2 },
  { name: 'Ursinho', price: 49.99, desc: '(20 cm )', img: 'https://i.imgur.com/shMRXUY.png', cat: 3 },
  { name: 'Ursinho stitch azul', price: 69.99, desc: '( pelúcia tam 20 cm )', img: 'https://i.imgur.com/pqosw33.png', cat: 3 },
  { name: 'Cards de chocolate', price: 9.99, desc: '(1 chocolate kitket) chocolate branco ou preto', img: 'https://i.imgur.com/0Jva17Y.png', cat: 3 }
];

db.prepare('DELETE FROM products').run();

const ins = db.prepare('INSERT INTO products (name, price, description, image, category_id, stock) VALUES (?, ?, ?, ?, ?, 50)');

for(const p of products) {
  ins.run(p.name, p.price, p.desc, p.img, p.cat);
}

console.log('Done seeding products!');

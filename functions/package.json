const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');

admin.initializeApp();
const db = admin.firestore();
const app = express();

app.use(express.json());

// --- Middleware: BAN IP ---
// Récupère l'IP réelle (derrière proxy) et bloque si présente dans bannedIPs/{ip}
app.use(async (req, res, next) => {
  const xff = req.headers['x-forwarded-for'];
  const ip = (xff ? xff.split(',')[0].trim() : req.ip);

  try {
    const snap = await db.collection('bannedIPs').doc(ip).get();
    if (snap.exists) {
      const d = snap.data();
      const stillBanned = !d.until || d.until > Date.now();
      if (stillBanned) {
        return res.status(403).json({ error: 'IP_BANNED', reason: d.reason || 'Banni' });
      } else {
        // ban expiré → nettoyage
        await snap.ref.delete();
      }
    }
  } catch (e) {
    console.error('IP check error', e);
    // Choix: on laisse passer en cas d'erreur Firestore pour éviter un outage global.
  }
  next();
});

// --- Endpoint de santé (ping) pour le front ---
// S'il renvoie 403, le front affiche le message de ban.
app.get('/ping', (req, res) => {
  res.json({ ok: true });
});

// (plus tard) tu pourras ajouter d'autres endpoints sensibles ici (uploads, posts, etc.)

exports.api = functions.https.onRequest(app);


try {
    const baileys = require('baileys');
    console.log('Keys:', Object.keys(baileys));
    console.log('makeInMemoryStore type:', typeof baileys.makeInMemoryStore);
} catch (e) {
    console.error(e);
}

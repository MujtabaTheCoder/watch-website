const urls = [
  'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80',
  'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&q=80',
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
  'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&q=80',
  'https://images.unsplash.com/photo-1533139502658-0198f920d8e8?w=800&q=80',
  'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=800&q=80',
];

async function check() {
  for (const u of urls) {
    try {
      const res = await fetch(u, { method: 'HEAD' });
      console.log(`[HTTP ${res.status}] ${u}`);
    } catch (e) {
      console.log(`[ERR] ${u} -> ${e.message}`);
    }
  }
}

check();

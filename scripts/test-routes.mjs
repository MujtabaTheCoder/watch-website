// Test all routes against localhost:3000
const routes = [
  '/',
  '/shop',
  '/watches/vellore-sovereign-chronograph',
  '/cart',
  '/checkout',
  '/about',
  '/policies',
  '/contact',
  '/admin/login',
  '/api/health',
];

async function testAll() {
  console.log('Testing VELLORE Local Server Routes:');
  let allPass = true;

  for (const route of routes) {
    try {
      const res = await fetch(`http://localhost:3000${route}`);
      const text = await res.text();
      const hasVellore = text.includes('VELLORE');
      console.log(`[HTTP ${res.status}] ${route} | Content Length: ${text.length} | Has VELLORE: ${hasVellore}`);
      if (res.status !== 200) allPass = false;
    } catch (err) {
      console.error(`[FAIL] ${route} ->`, err.message);
      allPass = false;
    }
  }

  if (allPass) {
    console.log('\n>>> ALL 10 ROUTES VERIFIED & RESPONDING 200 OK! <<<');
  } else {
    console.log('\n>>> SOME ROUTES RETURNED NON-200 <<<');
  }
}

testAll();

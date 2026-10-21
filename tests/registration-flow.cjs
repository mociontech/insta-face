// Registro, ID y resultado de Insta Face con la base de datos y Evius SIMULADOS (no se manda nada real).
// Requiere la app arriba (npm run dev, puerto 3000) y Playwright global:  PW=$(npm root -g)/playwright node tests/registration-flow.cjs
// Para la pantalla final se usa una página temporal /zz-test-outro (existe solo mientras se corre esta prueba).
const { chromium } = require(process.env.PW);
const fs = require('fs');
const path = require('path');

const env = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8');
const leer = (k) => (env.match(new RegExp(`^${k}=(.*)$`, 'm')) || [])[1]?.trim();
const EVIUS_HOST = new URL(leer('NEXT_PUBLIC_EVIUS_URL')).hostname;
const EXPERIENCE_ID = leer('NEXT_PUBLIC_EVIUS_EXPERIENCE_ID');
const BASE = 'http://localhost:3000';
const OUT = process.env.OUT;

let fallos = 0;
const ok = (c, m) => { console.log(`   ${c ? 'OK ' : 'FALLA'} ${m}`); if (!c) fallos++; };

async function preparar(browser) {
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  const llamadas = [], evius = [], externas = [], errores = [];
  const estado = { jugado: false };
  page.on('pageerror', (e) => errores.push(String(e)));
  const cors = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'content-type': 'application/json' };
  await page.route('**/*', async (r) => {
    const req = r.request(); const u = new URL(req.url());
    if (u.hostname === '127.0.0.1' || u.hostname === 'localhost') return r.continue();
    if (req.method() === 'OPTIONS') return r.fulfill({ status: 204, headers: cors });
    if (u.hostname === EVIUS_HOST) {
      const body = JSON.parse(req.postData() || '{}');
      evius.push({ ruta: u.pathname.split('/').pop(), body, idem: req.headers()['idempotency-key'] });
      return r.fulfill({ status: 200, headers: cors, body: JSON.stringify({ received: 1, processed: 1, failed: 0, errors: [] }) });
    }
    if (u.hostname.endsWith('supabase.co')) {
      const body = req.postData() ? JSON.parse(req.postData()) : null;
      llamadas.push({ metodo: req.method(), ruta: u.pathname.split('/api')[1], query: u.search, body });
      if (u.pathname.endsWith('/registrar')) {
        if (body.correo === 'repetido@test.co') return r.fulfill({ status: 409, headers: cors, body: JSON.stringify({ error: 'correo_duplicado', mensaje: 'Este correo ya está registrado. Usa tu ID con «digitar ID código».' }) });
        return r.fulfill({ status: 201, headers: cors, body: JSON.stringify({ id: '482-917', nombre: body.nombre }) });
      }
      if (u.pathname.includes('/participante/')) {
        if (u.pathname.endsWith('000-000')) return r.fulfill({ status: 404, headers: cors, body: JSON.stringify({ error: 'no_encontrado', mensaje: 'No' }) });
        // Igual que el servidor: el contacto viaja solo mientras la persona no haya completado la experiencia.
        return r.fulfill({ status: 200, headers: cors, body: JSON.stringify(estado.jugado
          ? { id: '482-917', nombre: 'Ana', lienzo: null, jugado: true }
          : { id: '482-917', nombre: 'Ana', lienzo: null, jugado: false, correo: 'Rescatado@Test.co', celular: '3001112233', empresa: 'Empresa Rescatada' }) });
      }
      if (u.pathname.endsWith('/participacion')) return r.fulfill({ status: 200, headers: cors, body: JSON.stringify({ ok: true, guardado: true }) });
    }
    if (!/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)) externas.push(req.url());
    return r.abort();
  });
  return { page, llamadas, evius, externas, errores, estado };
}

const llenar = async (page, c = {}) => {
  const v = { name: 'Ana Pérez', company: 'Mocion QA', phone: '+57 300 123 4567', email: 'ANA@Test.co', ...c };
  for (const [k, val] of Object.entries(v)) await page.fill(`[name=${k}]`, val);
};
const comenzar = (page) => page.getByRole('button', { name: 'Comenzar' }).click();

(async () => {
  const browser = await chromium.launch({ channel: 'chrome' });

  console.log('\n== Registro nuevo → Tu ID único → instrucciones');
  {
    const { page, llamadas, evius, externas, errores } = await preparar(browser);
    await page.goto(BASE + '/'); await page.waitForLoadState('networkidle');
    await page.getByRole('link', { name: 'Iniciar' }).click(); await page.waitForURL(/\/login/);

    await comenzar(page);
    ok((await page.textContent('#registration-error')).includes('nombre'), 'formulario vacío: pide el nombre');
    await llenar(page, { phone: '12345' }); await comenzar(page);
    ok((await page.textContent('#registration-error')).includes('10 digitos'), 'celular corto: pide 10 dígitos');
    await llenar(page, { email: 'repetido@test.co' }); await comenzar(page); await page.waitForTimeout(700);
    ok((await page.textContent('#registration-error')).includes('ya está registrado'), 'correo repetido: aviso del servidor');
    ok(page.url().includes('/login'), '...y se queda en el registro');
    if (OUT) await page.screenshot({ path: `${OUT}/if_registro_error.png` });

    await llenar(page); await comenzar(page); await page.waitForURL(/\/tu-id/);
    const reg = llamadas.find((l) => l.ruta === '/registrar' && l.body.correo === 'ANA@Test.co');
    ok(reg && reg.body.experiencia === 'insta' && reg.body.celular === '3001234567' && reg.body.empresa === 'Mocion QA' && reg.body.nombre === 'Ana Pérez', 'POST /registrar: experiencia insta, celular normalizado a 10 dígitos (sin +57 ni espacios)');
    ok((await page.locator('output.art-id').allTextContents()).join('-') === '482-917', 'Tu ID único muestra el ID del servidor (482-917)');
    if (OUT) await page.screenshot({ path: `${OUT}/if_tu_id.png` });
    ok(evius.length === 1 && evius[0].ruta === 'attendees' && evius[0].body.records[0].email === 'ana@test.co', 'Evius: /attendees con el correo normalizado');
    ok(evius[0].body.records[0].phone === '3001234567' && evius[0].body.records[0].company === 'Mocion QA', 'Evius: celular y empresa');

    await comenzar(page); await page.waitForURL(/\/select/);
    ok(true, 'Comenzar → instrucciones (/select)');
    ok(externas.length === 0, `ninguna otra petición externa (${externas.length})`);
    ok(errores.length === 0, `sin errores de página (${JSON.stringify(errores)})`);
    await page.close();
  }

  console.log('\n== Acceso rápido con un ID');
  {
    const { page, llamadas, evius, estado } = await preparar(browser);
    await page.goto(BASE + '/registro-id'); await page.waitForLoadState('networkidle');
    await page.fill('[name=prefix]', '000'); await page.fill('[name=suffix]', '000'); await comenzar(page); await page.waitForTimeout(600);
    ok((await page.textContent('#registration-error')).includes('No encontramos ese ID'), 'ID inexistente: aviso');
    estado.jugado = true;
    await page.fill('[name=prefix]', '482'); await page.fill('[name=suffix]', '917'); await comenzar(page); await page.waitForURL(/\/ya-registrado/);
    ok(true, 'ID que ya completó la experiencia → pantalla "ya registrado"');
    ok(evius.length === 0, 'ID que ya jugó: no se manda nada a Evius');
    estado.jugado = false;
    await page.goto(BASE + '/registro-id'); await page.waitForLoadState('networkidle');
    await page.fill('[name=prefix]', '482'); await page.fill('[name=suffix]', '917'); await comenzar(page); await page.waitForURL(/\/select/);
    ok(llamadas.some((l) => l.ruta.startsWith('/participante/482-917') && l.query === '?experiencia=insta'), 'GET /participante/:id?experiencia=insta');
    await page.waitForTimeout(800);
    const att = evius.find((e) => e.ruta === 'attendees');
    ok(!!att && att.body.records[0].email === 'rescatado@test.co' && att.body.records[0].phone === '3001112233' && att.body.records[0].company === 'Empresa Rescatada', 'Evius: /attendees con el contacto rescatado de la base (correo normalizado, celular y empresa)');
    ok(evius.every((e) => e.ruta === 'attendees'), 'la participación espera al final (aún no se manda /experiences)');
    await page.close();
  }

  console.log('\n== Pantalla final: 100 puntos a la base y a Evius');
  {
    const { page, llamadas, evius } = await preparar(browser);
    // registrado en este equipo → hay contacto para Evius
    await page.goto(BASE + '/login'); await page.waitForLoadState('networkidle');
    await llenar(page); await comenzar(page); await page.waitForURL(/\/tu-id/);
    await page.evaluate(() => { window.location.assign('/zz-test-outro?id=482-917&mail=ana@test.co'); }); // recarga completa: pierde el contacto en memoria
    await page.waitForURL(/\/outro/); await page.waitForTimeout(1200);
    const sinContacto = llamadas.find((l) => l.ruta === '/participacion');
    ok(sinContacto && sinContacto.body.id === '482-917' && sinContacto.body.experiencia === 'insta' && sinContacto.body.puntaje === 100, 'POST /participacion: id, experiencia insta, puntaje 100');
    ok(!evius.some((e) => e.ruta === 'experiences'), 'tras recargar la página no hay contacto en memoria: no se manda /experiences (el correo no se guarda en disco)');
    await page.close();

    const { page: p2, llamadas: l2, evius: e2 } = await preparar(browser);
    await p2.goto(BASE + '/login'); await p2.waitForLoadState('networkidle');
    await llenar(p2); await comenzar(p2); await p2.waitForURL(/\/tu-id/);
    // navegación interna (sin recargar): conserva el contacto, como en el recorrido real
    await p2.evaluate(() => window.next.router.push('/zz-test-outro?id=482-917&mail=ana@test.co'));
    await p2.waitForURL(/\/outro/); await p2.waitForTimeout(1500);
    const exp = e2.find((e) => e.ruta === 'experiences');
    ok(!!exp && exp.body.experienceId === EXPERIENCE_ID, 'Evius: /experiences con el experienceId de Insta Face');
    ok(!!exp && exp.body.records[0].score === 100 && exp.body.records[0].email === 'ana@test.co' && !!exp.body.records[0].play_timestamp, 'Evius: score 100, correo y play_timestamp');
    ok(!!exp && /^exp:/.test(exp.idem), 'Evius: Idempotency-Key exp:');
    ok(e2[0].ruta === 'attendees', 'Evius: /attendees fue primero');
    ok(l2.filter((l) => l.ruta === '/participacion').length === 1, 'una sola vez /participacion');
    if (OUT) await p2.screenshot({ path: `${OUT}/if_outro.png` });
    await p2.close();
  }

  await browser.close();
  console.log(fallos ? `\n${fallos} verificación(es) fallaron` : '\nTodo OK');
  process.exit(fallos ? 1 : 0);
})();

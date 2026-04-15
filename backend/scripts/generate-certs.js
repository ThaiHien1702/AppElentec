import selfsigned from 'selfsigned';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const certsDir = path.join(__dirname, '../certs');

if (!fs.existsSync(certsDir)) {
    fs.mkdirSync(certsDir, { recursive: true });
}

const keyPath = path.join(certsDir, 'server.key');
const certPath = path.join(certsDir, 'server.crt');

if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
    console.log('Certificates already exist. Skipping generation.');
    process.exit(0);
}

console.log('Generating self-signed certificates...');

const attrs = [{ name: 'commonName', value: 'localhost' }];
const pems = await selfsigned.generate(attrs, {
    algorithm: 'sha256',
    days: 365,
    keySize: 2048,
    extensions: [
        {
            name: 'subjectAltName',
            altNames: [
                { type: 2, value: 'localhost' },
                { type: 7, ip: '127.0.0.1' },
                { type: 7, ip: '0.0.0.0' }
            ]
        }
    ]
});

fs.writeFileSync(keyPath, pems.private);
fs.writeFileSync(certPath, pems.cert);

console.log(`Certificates generated successfully:
- Key: ${keyPath}
- Cert: ${certPath}`);

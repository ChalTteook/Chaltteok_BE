
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const getVersion = async () => {
    try {
        const __dirname = path.dirname(fileURLToPath(import.meta.url));
        const pkgPath = path.join(__dirname, '../../package.json');
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
        return { version: pkg.version };
    } catch (error) {
        console.error('Error reading version:', error);
        throw error;
    }
};

export default {
    getVersion
};

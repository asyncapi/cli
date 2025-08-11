import net from 'net';
import { yellowBright } from 'picocolors';

const MAX_PORT_RETRIES = 5;

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.listen(port, () => {
      server.once('close', () => {
        resolve(true);
      });
      server.close();
    });
    
    server.on('error', () => {
      resolve(false);
    });
  });
}

export async function findAvailablePort(startPort: number, maxRetries: number = MAX_PORT_RETRIES): Promise<number> {
  for (let i = 0; i < maxRetries; i++) {
    const port = startPort + i;
    const available = await isPortAvailable(port);
    
    if (available) {
      if (i > 0) {
        console.log(yellowBright(`Port ${startPort} is busy, using port ${port} instead.`));
      }
      return port;
    }
  }
  
  throw new Error(
    `Ports ${startPort}-${startPort + maxRetries - 1} are all busy. ` +
    'Please specify a different port using the --port flag or free up one of these ports.'
  );
}

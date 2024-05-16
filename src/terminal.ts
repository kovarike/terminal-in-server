import { exec, spawn } from 'child_process';
import * as fs from 'fs';

export function executeCommand(command: string, callback: (error: Error | null, output?: string) => void) {
  const [commandName, ...args] = command.split(' ');
  const outputToFile = args.includes('>');
  const inputFromFile = args.includes('<');
  const outputIndex = args.indexOf('>');
  const inputIndex = args.indexOf('<');

  if (outputToFile && outputIndex !== -1 && outputIndex < args.length - 1) {
    const outputFile = args[outputIndex + 1];
    args.splice(outputIndex, 2);
    const childProcess = spawn(commandName, args);

    const fileStream = fs.createWriteStream(outputFile, { flags: 'a' });
    childProcess.stdout.pipe(fileStream);
    childProcess.stderr.pipe(process.stderr);
    fileStream.on('finish', () => {
      fileStream.close();
      callback(null, 'Comando executado com sucesso.');
    });
  } else if (inputFromFile && inputIndex !== -1 && inputIndex < args.length - 1) {
    const inputFile = args[inputIndex + 1];
    args.splice(inputIndex, 2);
    const fileStream = fs.createReadStream(inputFile);
    const childProcess = spawn(commandName, args);

    let output = '';
    childProcess.stdout.on('data', (data) => {
      output += data.toString();
    });
    childProcess.stdout.on('end', () => {
      callback(null, output);
    });
    childProcess.stderr.pipe(process.stderr);
  } else {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        callback(error);
        return;
      }
      if (stderr) {
        callback(new Error(stderr));
        return;
      }
      callback(null, stdout);
    });
  }
}

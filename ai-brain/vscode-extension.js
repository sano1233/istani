const vscode = require('vscode');
const { exec } = require('child_process');

function activate(context) {
  let disposable = vscode.commands.registerCommand('ai-brain.query', async () => {
    const prompt = await vscode.window.showInputBox({ prompt: 'Ask AI Brain' });
    if (prompt) {
      exec(`node unified.js "${prompt}"`, (err, stdout) => {
        vscode.window.showInformationMessage(stdout);
      });
    }
  });
  context.subscriptions.push(disposable);
}

exports.activate = activate;

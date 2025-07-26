import * as vscode from 'vscode';
import * as dotenv from 'dotenv';
import { Configuration, OpenAIApi } from 'openai';

dotenv.config();

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand('vs-codex.askCodex', async () => {
    const prompt = await vscode.window.showInputBox({ prompt: 'Ask Codex something...' });

    if (!prompt) {
      vscode.window.showInformationMessage('No prompt entered.');
      return;
    }

    const apiKey = process.env.OPENAI_API_KEY;

    console.log('🔑 OPENAI_API_KEY:', apiKey ? '[OK - Loaded]' : '[❌ Missing or undefined]');

    if (!apiKey) {
      vscode.window.showErrorMessage('API key is not loaded from .env');
      return;
    }

    const config = new Configuration({ apiKey });
    const openai = new OpenAIApi(config);

    vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: 'Contacting Codex...',
        cancellable: false,
      },
      async () => {
        try {
          const res = await openai.createChatCompletion({
            model: 'gpt-3.5-turbo', // or 'gpt-4'
            messages: [{ role: 'user', content: prompt }],
          });

          const reply = res.data.choices[0].message?.content || 'No reply received.';
          vscode.window.showInformationMessage(reply);
        } catch (error: any) {
          console.error('❌ Error status:', error?.response?.status);
          console.error('❌ Error message:', error?.response?.data || error.message);

          vscode.window.showErrorMessage(
            `Error: ${error?.response?.status || 'Unknown'} - ${error?.response?.data?.error?.message || error.message}`
          );
        }
      }
    );
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}

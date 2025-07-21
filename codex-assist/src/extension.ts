import * as vscode from 'vscode';
import { Configuration, OpenAIApi } from 'openai';

import * as dotenv from 'dotenv';
dotenv.config();

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand('codex-assist.askCodex', async () => {
    const prompt = await vscode.window.showInputBox({ prompt: 'Ask Codex something...' });

    if (!prompt) {
      vscode.window.showInformationMessage('No prompt entered.');
      return;
    }

    const config = new Configuration({
      apiKey: process.env.OPENAI_API_KEY, // We'll set this in a sec
    });

    const openai = new OpenAIApi(config);

    vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: 'Talking to Codex...',
        cancellable: false,
      },
      async () => {
        try {
          const response = await openai.createChatCompletion({
            model: 'gpt-4',
            messages: [{ role: 'user', content: prompt }],
          });

          const reply = response.data.choices[0].message?.content || 'No reply.';
          vscode.window.showInformationMessage(reply);
        } catch (error: any) {
          vscode.window.showErrorMessage(`Codex failed: ${error.message}`);
        }
      }
    );
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}

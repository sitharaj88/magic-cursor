import * as vscode from 'vscode';
import { CursorTrailController } from './cursor-trail';
import { TypingEffectsController } from './typing-effects';
import { IdleEffectsController } from './idle-effects';

let trailController: CursorTrailController;
let typingController: TypingEffectsController;
let idleController: IdleEffectsController;

export function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "magic-cursor" is now active!');

    trailController = new CursorTrailController();
    context.subscriptions.push(trailController);

    typingController = new TypingEffectsController();
    context.subscriptions.push(typingController);

    idleController = new IdleEffectsController();
    context.subscriptions.push(idleController);

    // Register a test command to ensure it's working
    let disposable = vscode.commands.registerCommand('magic-cursor.helloWorld', () => {
        vscode.window.showInformationMessage('Hello World from Magic Cursor!');
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {
    if (trailController) {
        trailController.dispose();
    }
    if (typingController) {
        typingController.dispose();
    }
    if (idleController) {
        idleController.dispose();
    }
}

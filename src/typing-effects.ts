import * as vscode from 'vscode';
import { MagicCursorConfig } from './config';

export class TypingEffectsController {
    private disposables: vscode.Disposable[] = [];
    private sparkleIndex = 0;

    // Pre-create multiple sparkle decorations for variety
    private sparkles: { emoji: string; color: string }[] = [
        { emoji: '✨', color: '#FFD700' },
        { emoji: '⭐', color: '#FFA500' },
        { emoji: '💫', color: '#FF69B4' },
        { emoji: '🌟', color: '#00FFFF' },
        { emoji: '💥', color: '#FF4500' },
        { emoji: '🔥', color: '#FF6600' },
        { emoji: '💎', color: '#00BFFF' },
        { emoji: '⚡', color: '#FFFF00' },
    ];

    constructor() {
        this.disposables.push(vscode.workspace.onDidChangeTextDocument(e => this.onDidType(e)));
    }

    private onDidType(event: vscode.TextDocumentChangeEvent) {
        if (!MagicCursorConfig.enableParticles) {
            return;
        }

        const editor = vscode.window.activeTextEditor;
        if (!editor || editor.document !== event.document) {
            return;
        }

        if (event.contentChanges.length === 0) {
            return;
        }

        const change = event.contentChanges[0];

        if (change.text.length > 0) {
            // Show sparkle on every keystroke
            this.showSparkle(editor, change.range.start);

            // Also show a glow effect
            this.showGlow(editor, change.range.start, change.text.length);
        }
    }

    private showSparkle(editor: vscode.TextEditor, position: vscode.Position) {
        const sparkle = this.sparkles[this.sparkleIndex % this.sparkles.length];
        this.sparkleIndex++;

        const decoration = vscode.window.createTextEditorDecorationType({
            after: {
                contentText: sparkle.emoji,
                margin: '0 0 0 2px',
                color: sparkle.color
            },
            rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed
        });

        const range = new vscode.Range(position, position);
        editor.setDecorations(decoration, [range]);

        // Fade out
        setTimeout(() => {
            decoration.dispose();
        }, 300);
    }

    private showGlow(editor: vscode.TextEditor, position: vscode.Position, length: number) {
        // Beautiful pulsing glow effect
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'];
        const color = colors[Math.floor(Math.random() * colors.length)];

        const glow = vscode.window.createTextEditorDecorationType({
            backgroundColor: `${color}40`, // 40 = ~25% opacity in hex
            borderRadius: '3px'
        });

        const endPos = position.translate(0, length);
        const range = new vscode.Range(position, endPos);
        editor.setDecorations(glow, [range]);

        setTimeout(() => {
            glow.dispose();
        }, 200);
    }

    dispose() {
        this.disposables.forEach(d => d.dispose());
    }
}

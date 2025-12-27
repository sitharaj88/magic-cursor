import * as vscode from 'vscode';

export class IdleEffectsController {
    private disposables: vscode.Disposable[] = [];
    private idleTimer: NodeJS.Timeout | undefined;
    private animationInterval: NodeJS.Timeout | undefined;
    private isIdle = false;
    private idleDecoration: vscode.TextEditorDecorationType;
    private idleState = 0;

    private readonly idleThresholdMs = 3000; // 3 seconds

    // Cute animated sequence
    private animations = [
        { icon: '😊', color: '#FFD700' },
        { icon: '✨', color: '#FF69B4' },
        { icon: '💭', color: '#87CEEB' },
        { icon: '💤', color: '#9370DB' },
        { icon: '🌙', color: '#4169E1' },
        { icon: '⭐', color: '#FFD700' },
    ];

    constructor() {
        this.idleDecoration = vscode.window.createTextEditorDecorationType({
            after: {
                contentText: '✨',
                margin: '0 0 0 4px',
                color: '#FFD700'
            },
            rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed
        });

        this.disposables.push(
            vscode.window.onDidChangeTextEditorSelection(() => this.resetTimer()),
            vscode.workspace.onDidChangeTextDocument(() => this.resetTimer()),
            vscode.window.onDidChangeActiveTextEditor(() => this.resetTimer())
        );

        this.resetTimer();
    }

    private resetTimer() {
        this.stopIdle();
        if (this.idleTimer) {
            clearTimeout(this.idleTimer);
        }
        this.idleTimer = setTimeout(() => this.startIdle(), this.idleThresholdMs);
    }

    private startIdle() {
        if (this.isIdle) return;
        this.isIdle = true;

        const editor = vscode.window.activeTextEditor;
        if (!editor) return;

        this.runAnimationStep(editor);
        this.animationInterval = setInterval(() => {
            const currentEditor = vscode.window.activeTextEditor;
            if (currentEditor) {
                this.runAnimationStep(currentEditor);
            }
        }, 600); // Faster animation
    }

    private runAnimationStep(editor: vscode.TextEditor) {
        if (!this.isIdle) return;

        const cursor = editor.selection.active;
        const range = new vscode.Range(cursor, cursor);

        const anim = this.animations[this.idleState % this.animations.length];
        this.idleState++;

        this.idleDecoration.dispose();
        this.idleDecoration = vscode.window.createTextEditorDecorationType({
            after: {
                contentText: ` ${anim.icon}`,
                margin: '0 0 0 2px',
                color: anim.color,
                fontWeight: 'bold'
            }
        });

        editor.setDecorations(this.idleDecoration, [range]);
    }

    private stopIdle() {
        this.isIdle = false;
        if (this.animationInterval) {
            clearInterval(this.animationInterval);
            this.animationInterval = undefined;
        }

        const editor = vscode.window.activeTextEditor;
        if (editor) {
            editor.setDecorations(this.idleDecoration, []);
        }
    }

    dispose() {
        this.stopIdle();
        if (this.idleTimer) {
            clearTimeout(this.idleTimer);
        }
        this.idleDecoration.dispose();
        this.disposables.forEach(d => d.dispose());
    }
}

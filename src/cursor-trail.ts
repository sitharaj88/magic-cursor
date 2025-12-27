import * as vscode from 'vscode';
import { MagicCursorConfig } from './config';

interface CursorPos {
    line: number;
    character: number;
    editor: vscode.TextEditor;
}

export class CursorTrailController {
    private disposables: vscode.Disposable[] = [];
    private trailDecorations: vscode.TextEditorDecorationType[] = [];
    private history: CursorPos[] = [];
    private readonly maxHistorySize = MagicCursorConfig.trailLength;

    constructor() {
        this.initializeDecorations();

        this.disposables.push(vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('magicCursor')) {
                this.disposeDecorations();
                this.initializeDecorations();
            }
        }));

        this.disposables.push(vscode.window.onDidChangeTextEditorSelection(e => this.onSelectionChange(e)));
    }

    private initializeDecorations() {
        this.disposeDecorations();

        const style = MagicCursorConfig.cursorStyle;

        for (let i = 0; i < this.maxHistorySize; i++) {
            const progress = i / this.maxHistorySize;
            // Higher base opacity for more visible effect
            const opacity = Math.pow(1 - progress, 1.5) * 0.7;

            let decorationOptions: vscode.DecorationRenderOptions;

            if (style === 'rainbow') {
                // 🌈 Beautiful rainbow trail - cycles through all colors!
                const hue = (i * 30) % 360; // Each position is a different color
                decorationOptions = {
                    backgroundColor: `hsla(${hue}, 85%, 60%, ${opacity})`,
                    borderRadius: '4px',
                    rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed
                };
            } else if (style === 'neon') {
                // 💜💙 Neon purple to cyan gradient
                const hue = 280 - (progress * 100);
                decorationOptions = {
                    backgroundColor: `hsla(${hue}, 100%, 65%, ${opacity})`,
                    border: `1px solid hsla(${hue}, 100%, 75%, ${opacity * 0.8})`,
                    borderRadius: '3px',
                    rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed
                };
            } else if (style === 'aurora') {
                // 💚💙 Northern lights - green to blue
                const hue = 160 - (progress * 60);
                decorationOptions = {
                    backgroundColor: `hsla(${hue}, 70%, 55%, ${opacity})`,
                    borderRadius: '5px',
                    rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed
                };
            } else if (style === 'sunset') {
                // 🧡💛 Warm sunset - orange to pink
                const hue = 20 + (progress * 30);
                decorationOptions = {
                    backgroundColor: `hsla(${hue}, 90%, 55%, ${opacity})`,
                    borderRadius: '4px',
                    rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed
                };
            } else {
                // Default rainbow
                const hue = (i * 30) % 360;
                decorationOptions = {
                    backgroundColor: `hsla(${hue}, 85%, 60%, ${opacity})`,
                    borderRadius: '4px',
                    rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed
                };
            }

            this.trailDecorations.push(vscode.window.createTextEditorDecorationType(decorationOptions));
        }
    }

    private disposeDecorations() {
        this.trailDecorations.forEach(d => d.dispose());
        this.trailDecorations = [];
    }

    private onSelectionChange(event: vscode.TextEditorSelectionChangeEvent) {
        if (!MagicCursorConfig.enableTrails) {
            return;
        }

        const editor = event.textEditor;
        const position = editor.selection.active;

        this.history.unshift({
            line: position.line,
            character: position.character,
            editor: editor
        });

        if (this.history.length > this.maxHistorySize) {
            this.history.pop();
        }

        this.renderTrails(editor);
    }

    private renderTrails(currentEditor: vscode.TextEditor) {
        for (let i = 1; i < this.trailDecorations.length && i < this.history.length; i++) {
            const pos = this.history[i];
            const decorationType = this.trailDecorations[i - 1];

            if (pos.editor !== currentEditor) {
                currentEditor.setDecorations(decorationType, []);
                continue;
            }

            const range = new vscode.Range(pos.line, pos.character, pos.line, pos.character + 1);
            currentEditor.setDecorations(decorationType, [range]);
        }
    }

    dispose() {
        this.disposeDecorations();
        this.disposables.forEach(d => d.dispose());
    }
}

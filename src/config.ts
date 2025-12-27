import * as vscode from 'vscode';

export class MagicCursorConfig {
    static get enableTrails(): boolean {
        return vscode.workspace.getConfiguration('magicCursor').get('enableTrails', true);
    }

    static get enableParticles(): boolean {
        return vscode.workspace.getConfiguration('magicCursor').get('enableParticles', true);
    }

    static get trailLength(): number {
        return 12; // Longer trail for more impressive effect
    }

    static get cursorStyle(): 'rainbow' | 'neon' | 'aurora' | 'sunset' {
        return vscode.workspace.getConfiguration('magicCursor').get('cursorStyle', 'rainbow');
    }
}

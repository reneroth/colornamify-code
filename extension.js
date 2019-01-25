const clipboardy = require('clipboardy');
const colornamify = require('colornamify');
const pigment = require('pigment/basic');
const vscode = require('vscode');

let statusbarItem = null;
let currentColor = null;

function copyCurrentColor() {
	if (currentColor !== null) {
		clipboardy.write(currentColor);
	} else {
		vscode.window.showInformationMessage('No color selected.');
	}
}

function updateSelection() {
	const editor = vscode.window.activeTextEditor;
	let colorData = null;
	let currentSelection = null;
	if (editor.selection.isEmpty) {
		currentSelection = editor.document.getText(editor.document.getWordRangeAtPosition(editor.selection.start));
	} else {
		currentSelection = editor.document.getText(editor.selection);
	}
	if (!currentSelection) {
		currentColor = null;
		statusbarItem.hide();
		return;
	}
	try {
		colorData = new pigment(currentSelection);
	} catch(error) {
		if (/[0-9a-f]{6}|[0-9a-f]{3}/i.test(currentSelection)) {
			try {
				colorData = new pigment('#' + currentSelection);
			} catch(error) {
				currentColor = null;
				statusbarItem.hide();
				return;
			}
		} else {
			currentColor = null;
			statusbarItem.hide();
			return;
		}
	}
	currentColor = colornamify({
		r: colorData.red,
		g: colorData.green,
		b: colorData.blue,
	});
	if (currentColor !== null) {
		statusbarItem.text = 'Color Name: ' + currentColor;
		statusbarItem.show();
	} else {
		statusbarItem.hide();
	}
}

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	statusbarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
	statusbarItem.command = 'colornamify.copy';
	context.subscriptions.push(statusbarItem);
	context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(updateSelection));
	context.subscriptions.push(vscode.window.onDidChangeTextEditorSelection(updateSelection));

	context.subscriptions.push(vscode.commands.registerCommand('colornamify.copy', copyCurrentColor));
}
exports.activate = activate

function deactivate() {}

module.exports = {
	activate,
	deactivate
}

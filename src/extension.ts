import * as path from "path";
import * as vscode from "vscode";
import BOJ from "./BOJ";
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "bojhelper" is now active!');
  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand(
    "bojhelper.test",
    async () => {
      // The code you place here will be executed every time your command is executed
      try {
        const currentlyOpenTabfilePath = vscode.window.activeTextEditor
          ?.document.fileName as string;
        const fileNumber = path.basename(currentlyOpenTabfilePath, ".py");
        const boj = new BOJ(context.extensionPath);
        await boj.load(fileNumber);
        const terminal = vscode.window.createOutputChannel("BOJ");
        const myTextDecorator1 = vscode.window.createTextEditorDecorationType({
          backgroundColor: "red",
        });
        terminal.show(true);
        boj.test(
          currentlyOpenTabfilePath,
          Number.parseInt(fileNumber),
          terminal
        );
        // Display a message box to the user
        console.log("hi");
        vscode.window.showInformationMessage(
          `${currentlyOpenTabfilePath}${fileNumber}`
        );
      } catch (e) {
        vscode.window.showInformationMessage(
          `test error!: ${e} ${context.extensionPath}`
        );
      }
      // Display a message box to the user
      // vscode.window.showInformationMessage(`test error!`);
    }
  );

  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}

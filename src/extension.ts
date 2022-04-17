import { parse } from "path/posix";
import * as vscode from "vscode";
import BOJ from "./BOJ";
import axios from "./customAxios"
import ProblemFile from "./ProblemFile";

export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "bojhelper" is now active!');
  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let webView = vscode.commands.registerCommand("bojhelper.webView",
    async () => {
      const currentlyOpenTabfilePath = vscode.window.activeTextEditor
          ?.document.fileName as string;
      const currentFile = new ProblemFile(currentlyOpenTabfilePath);
      const panel = vscode.window.createWebviewPanel(
        "boj",
        "BOJ WebView",
        vscode.ViewColumn.Beside,
        {},
      );
      panel.webview.html = await currentFile.getWebviewContent();
    } 
  );
  
  let test = vscode.commands.registerCommand(
    "bojhelper.test",
    async () => {
      // The code you place here will be executed every time your command is executed
      const terminal = vscode.window.createOutputChannel("BOJ");
      try {
        const currentlyOpenTabfilePath = vscode.window.activeTextEditor
          ?.document.fileName as string;
        await vscode.window.activeTextEditor?.document.save();
        const currentFile = new ProblemFile(currentlyOpenTabfilePath);
        const boj = new BOJ(context.extensionPath, currentlyOpenTabfilePath, currentFile);
        const testNumber = await boj.prepareTest();
        terminal.show(true);
        terminal.appendLine(`---------${testNumber}번 채점 시작---------`);
        terminal.appendLine(
          `문제링크: https://www.acmicpc.net/problem/${testNumber}`
        );
        boj.test(terminal, () => {
          terminal.appendLine("---------채점 완료---------");
          terminal.appendLine(`결과 창은 1분 뒤에 닫힙니다.`);
          setTimeout(() => {
            terminal.dispose();
          }, 60000);
          vscode.window.showInformationMessage(`${currentlyOpenTabfilePath}`);
        });
        // Display a message box to the user
      } catch (e) {
        vscode.window.showInformationMessage(
          `test error!: ${e} ${context.extensionPath}`
        );
      }

      // Display a message box to the user
      // vscode.window.showInformationMessage(`test error!`);
    }
  );
  context.subscriptions.push(webView);
  context.subscriptions.push(test);
}

// this method is called when your extension is deactivated
export function deactivate() {}

async function getWebviewContent(problemNumber: string): Promise<string> {
  const { data } = await axios.get(
    `https://www.acmicpc.net/problem/${problemNumber}`
  );
  return data.toString();
}
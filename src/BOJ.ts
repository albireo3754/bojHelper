import parse, { HTMLElement } from "node-html-parser";
import axios from "./customAxios";
import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import * as colors from "colors";
import Language from "./Language/Laguage";
import ProblemFile from "./ProblemFile";

// TODO: BOJ 객체의 캐쉬로직을 다 없애야함

export default class BOJ {
  private problemNumber: string;
  private language: Language;

  constructor(private globalUri: string, private testFileURL: string, private file: ProblemFile) {
    const problemName = path.basename(this.testFileURL).split(".");
    this.problemNumber = problemName[0];
    this.language = Language.create(problemName[1]);
  }

  public async prepareTest(): Promise<string> {
    if (
      !this.cacheExist()
    ) {
      const testCases = await this.crawl();
      // TODO: Cache 갱신
      this.saveCache(testCases);
    }
    return this.problemNumber;
  }

  private async crawl() {
    const data = await this.file.getHTML();
    const testCases = parse(data).querySelectorAll(".sampledata");
    return testCases;
  }

  private saveCache(testCases: HTMLElement[]) {
    const problemDirectory = path.join(
      this.globalUri,
      "problem",
      `${this.problemNumber}`
    );
    const answerDirectory = path.join(
      this.globalUri,
      "answer",
      `${this.problemNumber}`
    );
    testCases;
    for (let i = 0; i < testCases.length; i += 2) {
      let problemString = testCases[i].innerText.replace("\r\n", "\n");
      // 끝이 엔터로 끝나지 않으면
      if (!problemString.match(/\t$/)) {
        problemString += `\n`;
      }
      fs.mkdirSync(problemDirectory, {
        recursive: true,
      });
      fs.writeFileSync(path.join(problemDirectory, `${i}.txt`), problemString);
      let answerString = testCases[i + 1].innerText.replace("\r\n", "\n");
      // 끝이 엔터로 끝나지 않으면
      if (!answerString.match(/\t$/)) {
        answerString += `\n`;
      }
      fs.mkdirSync(answerDirectory, {
        recursive: true,
      });
      fs.writeFileSync(path.join(answerDirectory, `${i}.txt`), answerString);
    }
  }

  private cacheExist(): boolean {
    const problemDirectory = path.join(
      this.globalUri,
      "problem",
      `${this.problemNumber}`
    );
    const answerDirectory = path.join(
      this.globalUri,
      "answer",
      `${this.problemNumber}`
    );
    if (fs.existsSync(problemDirectory) && fs.existsSync(answerDirectory)) {
      return true;
    }
    return false;
  }

  public test(channel: vscode.OutputChannel, handler: () => void) {
    const problemDirectory = path.join(
      this.globalUri,
      "problem",
      `${this.problemNumber}`
    );
    const answerDirectory = path.join(
      this.globalUri,
      "answer",
      `${this.problemNumber}`
    );
    const fileLists = fs.readdirSync(problemDirectory);
    for (let i = 0; i < fileLists.length; i++) {
      const processIO = this.language.excuteTerminal(
        this.testFileURL,
        this.problemNumber
      );
      const problemBuffer = fs.readFileSync(
        path.join(problemDirectory, `${i * 2}.txt`)
      );

      const answerBuffer = fs.readFileSync(
        path.join(answerDirectory, `${i * 2}.txt`)
      );
      processIO.stdin.write(problemBuffer);

      processIO.stdout.on("data", (data) => {
        channel.appendLine(`Test Case #${i + 1}`);
        answerBuffer;
        const expectedAnswerString = answerBuffer
          .toString()
          .replace("\r\n", "\n")
          .trim();
        const answerString = data.toString().replace("\r\n", "\n").trim();
        if (expectedAnswerString === answerString) {
          channel.appendLine(`정답`);
        } else {
          channel.appendLine(`땡`);
          channel.appendLine(`실행 결과`);
          channel.appendLine(expectedAnswerString);
          channel.appendLine(`정답`);
          channel.appendLine(answerString);
        }
      });
      processIO.stderr.on("data", (data) => {
        channel.appendLine(`에러`);
        channel.appendLine(`실행 결과`);
        channel.appendLine(data.toString());
        channel.appendLine(`정답`);
        channel.appendLine(answerBuffer.toString());
      });
      if (i === fileLists.length - 1) {
        processIO.stdout.once("end", handler);
      }
    }
  }
}

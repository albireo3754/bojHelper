import axios from "axios";
import parse, { HTMLElement } from "node-html-parser";
import * as fs from "fs";
import * as path from "path";
import * as python from "child_process";
import * as vscode from "vscode";
import * as colors from "colors";
export default class BOJ {
  constructor(private globalUri: string) {}

  async load(problemNumber: string | number) {
    const problemDirectory = path.join(
      this.globalUri,
      "problem",
      `${problemNumber}`
    );
    const answerDirectory = path.join(
      this.globalUri,
      "answer",
      `${problemNumber}`
    );
    if (
      !this.fileExist(problemNumber) ||
      !this.isFileHasSameLength(problemDirectory, answerDirectory)
    ) {
      const testCases = await this.crawl(problemNumber);
      this.save(testCases, problemNumber);
    }
  }

  isFileHasSameLength(
    problemDirectory: string,
    answerDirectory: string
  ): boolean {
    return (
      fs.readdirSync(problemDirectory).length ===
      fs.readdirSync(answerDirectory).length
    );
  }

  async crawl(problemNumber: string | number) {
    const { data } = await axios.get(
      `https://www.acmicpc.net/problem/${problemNumber}`
    );
    const testCases = await parse(data).querySelectorAll(".sampledata");
    return testCases;
  }

  save(testCases: HTMLElement[], problemNumber: string | number) {
    const problemDirectory = path.join(
      this.globalUri,
      "problem",
      `${problemNumber}`
    );
    const answerDirectory = path.join(
      this.globalUri,
      "answer",
      `${problemNumber}`
    );
    for (let i = 0; i < testCases.length; i += 2) {
      let problemString = testCases[i].innerText;
      // 끝이 엔터로 끝나지 않으면
      if (!problemString.match(/\t$/)) {
        problemString += `\n`;
      }
      fs.mkdirSync(problemDirectory, {
        recursive: true,
      });
      fs.writeFileSync(path.join(problemDirectory, `${i}.txt`), problemString);
      let answerString = testCases[i + 1].innerText;
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

  fileExist(problemNumber: string | number): boolean {
    const problemDirectory = path.join(
      this.globalUri,
      "problem",
      `${problemNumber}`
    );
    const answerDirectory = path.join(
      this.globalUri,
      "answer",
      `${problemNumber}`
    );
    if (fs.existsSync(problemDirectory) && fs.existsSync(answerDirectory)) {
      return true;
    }
    return false;
  }

  test(testfile: string, problemNumber: number, channel: vscode.OutputChannel) {
    const problemDirectory = path.join(
      this.globalUri,
      "problem",
      `${problemNumber}`
    );
    const answerDirectory = path.join(
      this.globalUri,
      "answer",
      `${problemNumber}`
    );
    const fileLists = fs.readdirSync(problemDirectory);
    for (let i = 0; i < fileLists.length; i++) {
      const result = python.spawn("python3", [testfile]);
      const problemBuffer = fs.readFileSync(
        path.join(problemDirectory, `${i * 2}.txt`)
      );
      const answerBuffer = fs.readFileSync(
        path.join(answerDirectory, `${i * 2}.txt`)
      );
      console.log("terminal?");
      result.stdin.write(problemBuffer);

      result.stdout.on("data", (data) => {
        // console.log("output data", data);
        channel.appendLine(`Test Case #${i + 1}`);
        if (answerBuffer.toString().trim() === data.toString().trim()) {
          channel.appendLine(`정답`);
        } else {
          channel.appendLine(`땡`);
          channel.appendLine(`실행 결과`);
          channel.appendLine(data.toString());
          channel.appendLine(`정답`);
          channel.appendLine(answerBuffer.toString());
        }
      });
      result.stderr.on("data", (data) => {
        channel.appendLine(`에러`);
        channel.appendLine(`실행 결과`);
        channel.appendLine(data.toString());
        channel.appendLine(`정답`);
        channel.appendLine(answerBuffer.toString());
      });
    }
  }
}

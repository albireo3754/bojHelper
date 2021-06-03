import axios from "axios";
import parse, { HTMLElement } from "node-html-parser";
import * as fs from "fs";
import * as path from "path";
import * as python from "child_process";
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
      fs.mkdirSync(problemDirectory, {
        recursive: true,
      });
      fs.writeFileSync(
        path.join(problemDirectory, `${i}.txt`),
        testCases[i].innerText
      );
      fs.mkdirSync(answerDirectory, {
        recursive: true,
      });
      fs.writeFileSync(
        path.join(answerDirectory, `${i}.txt`),
        testCases[i + 1].innerText
      );
    }
  }

  fileExist(problemNumber: string | number): boolean {
    return false;
  }

  test(problemNumber: number) {
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
      const result = python.spawn("python3", [`src\\${problemNumber}.py`]);
      const buffer = fs.readFileSync(
        path.join(problemDirectory, `${i * 2}.txt`)
      );
      const answerBuffer = fs.readFileSync(
        path.join(answerDirectory, `${i * 2}.txt`)
      );
      result.stdin.write(buffer);
      result.stdout.once("data", (data) => {
        console.log(answerBuffer.toString().trim() === data.toString().trim());
        console.log(data.toString());
        console.log(answerBuffer.toString());
      });
      result.stderr.on("data", (data) => {
        console.log(data.toString());
      });
    }
  }
}

const boj = new BOJ(__dirname);
// (async () => await boj.load(16918))();
boj.test(21771);
